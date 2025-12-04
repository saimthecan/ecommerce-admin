from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_user
from app.crud.category import (
    get_categories,
    get_category,
    create_category,
    update_category,
    delete_category,
)
from app.schemas.category import CategoryOut, CategoryCreate, CategoryUpdate
from app.models.user import User as UserModel

router = APIRouter()


def ensure_admin(user: UserModel):
    if not user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu işlem için admin yetkisi gerekir.",
        )


@router.get("/", response_model=List[CategoryOut])
async def list_categories(
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    categories = await get_categories(db)
    return categories


@router.post("/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category_endpoint(
    body: CategoryCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)
    return await create_category(db, body)


@router.put("/{category_id}", response_model=CategoryOut)
async def update_category_endpoint(
    category_id: str,
    body: CategoryUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)

    db_obj = await get_category(db, category_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı.")

    return await update_category(db, db_obj, body)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_endpoint(
    category_id: str,
    db: AsyncSession = Depends(get_db_session),
    current_user: UserModel = Depends(get_current_active_user),
):
    ensure_admin(current_user)

    db_obj = await get_category(db, category_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Kategori bulunamadı.")

    await delete_category(db, db_obj)
    return None