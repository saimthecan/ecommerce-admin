from datetime import datetime
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.models.variant import ProductVariant
from app.models.inventory import InventoryMovement, OrderEvent
from app.schemas.order import OrderCreate, OrderUpdateStatus


async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 50):
    stmt = (
        select(Order)
        .options(selectinload(Order.items), selectinload(Order.events))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()


async def get_orders_by_user(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 50):
    """Non-admin kullanıcı için sadece kendi siparişlerini getir."""
    stmt = (
        select(Order)
        .where(Order.user_id == user_id)
        .options(selectinload(Order.items), selectinload(Order.events))
        .order_by(Order.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().unique().all()


async def get_order(db: AsyncSession, order_id: UUID):
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items), selectinload(Order.events))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_order(
    db: AsyncSession,
    data: OrderCreate,
    enforce_active: bool = True,
    actor_id: UUID | None = None,
) -> Order:
    """
    items içindeki product_id'leri product tablosundan bulur,
    product.price'i unit_price olarak kullanır, line_total ve total_amount hesaplar.
    Varyant varsa fiyat/stock varyanttan okunur.
    """
    if not data.items:
        raise ValueError("Sipariş için en az bir ürün gerekli.")

    total_amount = Decimal("0")
    order_items: list[OrderItem] = []
    movements: list[InventoryMovement] = []

    for item in data.items:
        stmt = select(Product).where(Product.id == item.product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()

        if not product:
            raise ValueError(f"Ürün bulunamadı: {item.product_id}")
        if enforce_active and not product.is_active:
            raise ValueError("Ürün aktif değil.")

        variant = None
        if item.variant_id:
            variant = await db.get(ProductVariant, item.variant_id)
            if not variant:
                raise ValueError(f"Varyant bulunamadı: {item.variant_id}")
            if variant.product_id != product.id:
                raise ValueError("Varyant ürünle eşleşmiyor.")
            if enforce_active and not variant.is_active:
                raise ValueError("Varyant aktif değil.")

        unit_price = Decimal(
            variant.price_override
            if variant and variant.price_override is not None
            else product.price
        )
        quantity = item.quantity
        if quantity <= 0:
            raise ValueError("Miktar 0'dan büyük olmalı.")

        available_stock = variant.stock if variant else product.stock
        if available_stock < quantity:
            raise ValueError("Yetersiz stok.")

        line_total = unit_price * quantity
        total_amount += line_total

        if variant:
            variant.stock -= quantity
        else:
            product.stock -= quantity

        order_items.append(
            OrderItem(
                product_id=product.id,
                variant_id=variant.id if variant else None,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

        movements.append(
            InventoryMovement(
                product_id=product.id,
                variant_id=variant.id if variant else None,
                change=-quantity,
                reason="order",
            )
        )

    order = Order(
        user_id=data.user_id,
        status=data.status,
        total_amount=total_amount,
        shipping_address_id=data.shipping_address_id,
    )
    db.add(order)
    await db.flush()  # order.id oluşsun

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    for mv in movements:
        mv.ref_order_id = order.id
        db.add(mv)

    db.add(
        OrderEvent(
            order_id=order.id,
            type="created",
            description="Sipariş oluşturuldu.",
            actor_id=actor_id,
        )
    )

    await db.commit()
    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items), selectinload(Order.events))
    )
    return result.scalar_one()


async def update_order_status(
    db: AsyncSession,
    db_obj: Order,
    data: OrderUpdateStatus,
    actor_id: UUID | None = None,
) -> Order:
    previous_status = db_obj.status
    db_obj.status = data.status

    if data.tracking_number is not None:
        db_obj.tracking_number = data.tracking_number
    if data.carrier is not None:
        db_obj.carrier = data.carrier

    if data.status == "shipped" and db_obj.shipped_at is None:
        db_obj.shipped_at = datetime.utcnow()
    if data.status == "delivered" and db_obj.delivered_at is None:
        db_obj.delivered_at = datetime.utcnow()

    if previous_status != data.status:
        db.add(
            OrderEvent(
                order_id=db_obj.id,
                type=data.status,
                description=f"Durum güncellendi: {previous_status} -> {data.status}.",
                actor_id=actor_id,
            )
        )

    await db.commit()
    result = await db.execute(
        select(Order)
        .where(Order.id == db_obj.id)
        .options(selectinload(Order.items), selectinload(Order.events))
    )
    return result.scalar_one()
