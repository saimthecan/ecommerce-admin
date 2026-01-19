from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderUpdateStatus


async def get_orders(db: AsyncSession, skip: int = 0, limit: int = 50):
    stmt = (
        select(Order)
        .options(selectinload(Order.items))
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
        .options(selectinload(Order.items))
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
        .options(selectinload(Order.items))
    )
    result = await db.execute(stmt)
    return result.scalar_one_or_none()


async def create_order(
    db: AsyncSession,
    data: OrderCreate,
    enforce_active: bool = True,
) -> Order:
    """
    items içindeki product_id'leri product tablosundan bulur,
    product.price'i unit_price olarak kullanır, line_total ve total_amount hesaplar.
    """
    if not data.items:
        raise ValueError("Sipariş için en az bir ürün gerekli.")

    # Ürünleri tek tek çekip hesap yapalım.
    total_amount = Decimal("0")
    order_items: list[OrderItem] = []

    for item in data.items:
        stmt = select(Product).where(Product.id == item.product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()

        if not product:
            raise ValueError(f"Ürün bulunamadı: {item.product_id}")
        if enforce_active and not product.is_active:
            raise ValueError("Ürün aktif değil.")

        unit_price = Decimal(product.price)  # Numeric -> Decimal
        quantity = item.quantity
        if quantity <= 0:
            raise ValueError("Miktar 0'dan büyük olmalı.")

        line_total = unit_price * quantity
        total_amount += line_total

        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order = Order(
        user_id=data.user_id,
        status=data.status,
        total_amount=total_amount,
    )
    db.add(order)
    await db.flush()  # order.id oluşsun

    for oi in order_items:
        oi.order_id = order.id
        db.add(oi)

    await db.commit()
    result = await db.execute(
        select(Order)
        .where(Order.id == order.id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one()


async def update_order_status(
    db: AsyncSession,
    db_obj: Order,
    data: OrderUpdateStatus,
) -> Order:
    db_obj.status = data.status
    await db.commit()
    await db.refresh(db_obj)
    return db_obj
