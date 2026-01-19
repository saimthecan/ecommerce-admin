from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate


async def get_product(db: AsyncSession, product_id: UUID) -> Product | None:
    return await db.get(Product, product_id)


async def get_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Sequence[Product]:
    stmt = select(Product).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_active_products(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Sequence[Product]:
    stmt = (
        select(Product)
        .where(Product.is_active.is_(True))
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()


async def create_product(db: AsyncSession, product_in: ProductCreate) -> Product:
    obj = Product(
        name=product_in.name,
        description=product_in.description,
        price=product_in.price,
        stock=product_in.stock,
        is_active=product_in.is_active,
        category_id=product_in.category_id,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_product(
    db: AsyncSession,
    db_obj: Product,
    product_in: ProductUpdate,
) -> Product:
    data = product_in.model_dump(exclude_unset=True)

    for field, value in data.items():
        setattr(db_obj, field, value)

    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_product(db: AsyncSession, db_obj: Product) -> None:
    await db.delete(db_obj)
    await db.commit()
