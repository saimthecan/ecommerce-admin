"""Routes for Address management."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_user
from app.crud.address import (
    get_addresses_by_user,
    get_all_addresses,
    get_address,
    create_address,
    update_address,
    delete_address,
)
from app.schemas.address import AddressOut, AddressCreate, AddressUpdate
from app.models.user import User as UserModel

router = APIRouter()


@router.get("/", response_model=List[AddressOut])
async def list_addresses(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Get addresses. Admin sees all, user sees own."""
    if current_user.is_superuser:
        return await get_all_addresses(db)
    return await get_addresses_by_user(db, current_user.id)


@router.post("/", response_model=AddressOut, status_code=status.HTTP_201_CREATED)
async def create_address_endpoint(
    body: AddressCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    """Create a new address for current user."""
    return await create_address(db, current_user.id, body)


@router.get("/{address_id}", response_model=AddressOut)
async def get_address_endpoint(
    address_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    addr = await get_address(db, address_id)
    if not addr:
        raise HTTPException(status_code=404, detail="Adres bulunamadı.")
    
    if not current_user.is_superuser and addr.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu adrese erişim yetkiniz yok.")
    
    return addr


@router.put("/{address_id}", response_model=AddressOut)
async def update_address_endpoint(
    address_id: UUID,
    body: AddressUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    addr = await get_address(db, address_id)
    if not addr:
        raise HTTPException(status_code=404, detail="Adres bulunamadı.")
    
    if not current_user.is_superuser and addr.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu adresi güncelleme yetkiniz yok.")
    
    return await update_address(db, addr, body)


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address_endpoint(
    address_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    addr = await get_address(db, address_id)
    if not addr:
        raise HTTPException(status_code=404, detail="Adres bulunamadı.")
    
    if not current_user.is_superuser and addr.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu adresi silme yetkiniz yok.")
    
    await delete_address(db, addr)
    return None
