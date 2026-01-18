from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_user
from app.crud.order import (
    get_orders,
    get_order,
    create_order,
    update_order_status,
)
from app.models.user import User as UserModel
from app.schemas.order import OrderOut, OrderCreate, OrderUpdateStatus

router = APIRouter()


def ensure_admin(user: UserModel):
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekir.",
        )


@router.get("/", response_model=List[OrderOut])
async def list_orders(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    # Şimdilik sadece admin listeleyebilsin
    ensure_admin(current_user)
    orders = await get_orders(db, skip=skip, limit=limit)
    return orders


@router.get("/{order_id}", response_model=OrderOut)
async def get_order_by_id(
    order_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)
    order = await get_order(db, order_id)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı.",
        )
    return order


@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
async def create_order_endpoint(
    body: OrderCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)

    # user_id gönderilmemişse, mevcut kullanıcıyı ata (opsiyonel tercih)
    if body.user_id is None:
        body.user_id = current_user.id

    try:
        order = await create_order(db, body)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        ) from e

    return order


@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status_endpoint(
    order_id: UUID,
    body: OrderUpdateStatus,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)
    db_obj = await get_order(db, order_id)
    if not db_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sipariş bulunamadı.",
        )

    updated = await update_order_status(db, db_obj, body)
    return updated