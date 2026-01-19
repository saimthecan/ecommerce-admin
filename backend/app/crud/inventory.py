"""CRUD operations for Inventory and OrderEvent models."""
from uuid import UUID
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory import InventoryMovement, OrderEvent
from app.models.product import Product
from app.models.variant import ProductVariant
from app.schemas.inventory import InventoryMovementCreate, OrderEventCreate


# ───────────────── InventoryMovement ─────────────────

async def create_inventory_movement(
    db: AsyncSession,
    data: InventoryMovementCreate,
) -> InventoryMovement:
    """Create an inventory movement record."""
    obj = InventoryMovement(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def get_inventory_movements(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    product_id: UUID | None = None,
    variant_id: UUID | None = None,
) -> Sequence[InventoryMovement]:
    """Get inventory movements with optional filters."""
    stmt = select(InventoryMovement).order_by(InventoryMovement.created_at.desc())
    
    if product_id:
        stmt = stmt.where(InventoryMovement.product_id == product_id)
    if variant_id:
        stmt = stmt.where(InventoryMovement.variant_id == variant_id)
    
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_low_stock_products(
    db: AsyncSession,
    threshold: int = 10,
) -> Sequence[Product]:
    """Get products with stock below threshold."""
    stmt = select(Product).where(Product.stock <= threshold, Product.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_low_stock_variants(
    db: AsyncSession,
    threshold: int = 10,
) -> Sequence[ProductVariant]:
    """Get variants with stock below threshold."""
    stmt = select(ProductVariant).where(ProductVariant.stock <= threshold, ProductVariant.is_active == True)
    result = await db.execute(stmt)
    return result.scalars().all()


async def adjust_product_stock(
    db: AsyncSession,
    product_id: UUID,
    change: int,
    reason: str,
    ref_order_id: UUID | None = None,
) -> InventoryMovement:
    """Adjust product stock and create movement record."""
    product = await db.get(Product, product_id)
    if not product:
        raise ValueError(f"Product not found: {product_id}")
    
    product.stock += change
    
    movement = InventoryMovement(
        product_id=product_id,
        change=change,
        reason=reason,
        ref_order_id=ref_order_id,
    )
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    return movement


async def adjust_variant_stock(
    db: AsyncSession,
    variant_id: UUID,
    change: int,
    reason: str,
    ref_order_id: UUID | None = None,
) -> InventoryMovement:
    """Adjust variant stock and create movement record."""
    variant = await db.get(ProductVariant, variant_id)
    if not variant:
        raise ValueError(f"Variant not found: {variant_id}")
    
    variant.stock += change
    
    movement = InventoryMovement(
        variant_id=variant_id,
        product_id=variant.product_id,
        change=change,
        reason=reason,
        ref_order_id=ref_order_id,
    )
    db.add(movement)
    await db.commit()
    await db.refresh(movement)
    return movement


# ───────────────── OrderEvent (Timeline) ─────────────────

async def create_order_event(
    db: AsyncSession,
    order_id: UUID,
    event_type: str,
    description: str | None = None,
    actor_id: UUID | None = None,
) -> OrderEvent:
    """Create an order timeline event."""
    obj = OrderEvent(
        order_id=order_id,
        type=event_type,
        description=description,
        actor_id=actor_id,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def get_order_events(
    db: AsyncSession,
    order_id: UUID,
) -> Sequence[OrderEvent]:
    """Get all events for an order."""
    stmt = (
        select(OrderEvent)
        .where(OrderEvent.order_id == order_id)
        .order_by(OrderEvent.created_at.asc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
