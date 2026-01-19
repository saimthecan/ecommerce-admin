from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_admin, get_current_active_user
from app.crud.product import (
    get_product,
    get_products,
    get_active_products,
    create_product,
    update_product,
    delete_product,
)
from app.schemas.product import ProductOut, ProductCreate, ProductUpdate
from app.models.product import Product as ProductModel

router = APIRouter()


@router.get("/", response_model=List[ProductOut])
async def list_products(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),  # Tüm auth'lu kullanıcılar görebilir.
):
    if current_user.is_superuser:
        products = await get_products(db, skip=skip, limit=limit)
    else:
        products = await get_active_products(db, skip=skip, limit=limit)
    return products


@router.post("/", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
async def create_product_endpoint(
    product_in: ProductCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user: ProductModel = Depends(get_current_active_admin),
):
    product = await create_product(db, product_in)
    return product


@router.get("/{product_id}", response_model=ProductOut)
async def get_product_by_id(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),  # Tüm auth'lu kullanıcılar görebilir.
):
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    if not current_user.is_superuser and not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.put("/{product_id}", response_model=ProductOut)
async def update_product_endpoint(
    product_id: UUID,
    product_in: ProductUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user: ProductModel = Depends(get_current_active_admin),
):
    db_product = await get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    updated = await update_product(db, db_product, product_in)
    return updated


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product_endpoint(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user: ProductModel = Depends(get_current_active_admin),
):
    db_product = await get_product(db, product_id)
    if not db_product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    await delete_product(db, db_product)
    return None
