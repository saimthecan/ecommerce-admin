"""CRUD operations for ProductVariant and ProductImage models."""
from uuid import UUID
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.variant import ProductVariant, ProductImage
from app.schemas.variant import VariantCreate, VariantUpdate, ImageCreate


# ───────────────── ProductVariant ─────────────────

async def get_variants_by_product(
    db: AsyncSession,
    product_id: UUID,
) -> Sequence[ProductVariant]:
    """Get all variants for a product."""
    stmt = (
        select(ProductVariant)
        .where(ProductVariant.product_id == product_id)
        .order_by(ProductVariant.created_at)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_variant(db: AsyncSession, variant_id: UUID) -> ProductVariant | None:
    return await db.get(ProductVariant, variant_id)


async def create_variant(db: AsyncSession, data: VariantCreate) -> ProductVariant:
    obj = ProductVariant(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_variant(
    db: AsyncSession,
    db_obj: ProductVariant,
    data: VariantUpdate,
) -> ProductVariant:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_variant(db: AsyncSession, db_obj: ProductVariant) -> None:
    await db.delete(db_obj)
    await db.commit()


# ───────────────── ProductImage ─────────────────

async def get_images_by_product(
    db: AsyncSession,
    product_id: UUID,
) -> Sequence[ProductImage]:
    """Get all images for a product."""
    stmt = (
        select(ProductImage)
        .where(ProductImage.product_id == product_id)
        .order_by(ProductImage.sort_order)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_images_by_variant(
    db: AsyncSession,
    variant_id: UUID,
) -> Sequence[ProductImage]:
    """Get all images for a variant."""
    stmt = (
        select(ProductImage)
        .where(ProductImage.variant_id == variant_id)
        .order_by(ProductImage.sort_order)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_image(db: AsyncSession, image_id: UUID) -> ProductImage | None:
    return await db.get(ProductImage, image_id)


async def create_image(db: AsyncSession, data: ImageCreate) -> ProductImage:
    obj = ProductImage(**data.model_dump())
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def delete_image(db: AsyncSession, db_obj: ProductImage) -> None:
    await db.delete(db_obj)
    await db.commit()
