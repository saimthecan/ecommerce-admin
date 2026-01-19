"""CRUD operations for Address model."""
from uuid import UUID
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate


async def get_addresses_by_user(
    db: AsyncSession,
    user_id: UUID,
) -> Sequence[Address]:
    """Get all addresses for a user."""
    stmt = select(Address).where(Address.user_id == user_id).order_by(Address.created_at.desc())
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_all_addresses(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 50,
) -> Sequence[Address]:
    """Admin: get all addresses."""
    stmt = select(Address).offset(skip).limit(limit)
    result = await db.execute(stmt)
    return result.scalars().all()


async def get_address(db: AsyncSession, address_id: UUID) -> Address | None:
    return await db.get(Address, address_id)


async def create_address(db: AsyncSession, user_id: UUID, data: AddressCreate) -> Address:
    obj = Address(
        user_id=user_id,
        **data.model_dump(),
    )
    db.add(obj)
    await db.commit()
    await db.refresh(obj)
    return obj


async def update_address(
    db: AsyncSession,
    db_obj: Address,
    data: AddressUpdate,
) -> Address:
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj


async def delete_address(db: AsyncSession, db_obj: Address) -> None:
    await db.delete(db_obj)
    await db.commit()
