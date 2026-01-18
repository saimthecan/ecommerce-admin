from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.models.category import Category
from app.schemas.category import CategoryCreate, CategoryUpdate


async def get_categories(db: AsyncSession):
    result = await db.execute(
        select(Category).order_by(Category.created_at.desc())
    )
    return result.scalars().all()


async def get_category(db: AsyncSession, category_id: UUID):
    result = await db.execute(
        select(Category).where(Category.id == category_id)
    )
    return result.scalar_one_or_none()


async def create_category(db: AsyncSession, data: CategoryCreate):
    obj = Category(
        name=data.name,
        description=data.description,
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_category(db: AsyncSession, db_obj: Category, data: CategoryUpdate):
    if data.name is not None:
        db_obj.name = data.name
    if data.description is not None:
        db_obj.description = data.description

    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_category(db: AsyncSession, db_obj: Category):
    await db.delete(db_obj)
    await db.commit()