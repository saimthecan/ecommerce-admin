from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import (
    get_db_session,
    get_current_active_user,
    get_current_active_admin,  # 👈 yeni
)
from app.crud.user import (
    get_user,
    get_users,
    create_user,
    update_user,
    delete_user,
)
from app.models.user import User as UserModel
from app.schemas.user import UserOut, UserCreate, UserUpdate

router = APIRouter()


@router.get("/", response_model=List[UserOut])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_admin),  # 👈 admin şart
):
    users = await get_users(db, skip=skip, limit=limit)
    return users


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user_endpoint(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_admin),  # 👈 admin
):
    user = await create_user(db, user_in)
    return user


# herkes kendi profilini görebilsin
@router.get("/me", response_model=UserOut)
async def read_own_profile(
    current_user: UserModel = Depends(get_current_active_user),
):
    return current_user


@router.get("/{user_id}", response_model=UserOut)
async def get_user_by_id(
    user_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_admin),  # 👈 admin
):
    user = await get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.put("/{user_id}", response_model=UserOut)
async def update_user_endpoint(
    user_id: UUID,
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_admin),  # 👈 admin
):
    db_user = await get_user(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    updated = await update_user(db, db_user, user_in)
    return updated


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_endpoint(
    user_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_admin),  # 👈 admin
):
    db_user = await get_user(db, user_id)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    await delete_user(db, db_user)
    return None