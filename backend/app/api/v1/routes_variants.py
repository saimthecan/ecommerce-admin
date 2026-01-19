"""Routes for Product Variants management - Admin only."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_admin, get_current_active_user
from app.crud.variant import (
    get_variants_by_product,
    get_variant,
    create_variant,
    update_variant,
    delete_variant,
    get_images_by_product,
    get_images_by_variant,
)
from app.crud.product import get_product
from app.schemas.variant import VariantOut, VariantCreate, VariantUpdate, ImageOut

router = APIRouter()


# ───────────────── Variants ─────────────────

@router.get("/products/{product_id}/variants", response_model=List[VariantOut])
async def list_product_variants(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),
):
    """Get all variants for a product."""
    product = await get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    return await get_variants_by_product(db, product_id)


@router.post("/variants", response_model=VariantOut, status_code=status.HTTP_201_CREATED)
async def create_variant_endpoint(
    body: VariantCreate,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Create a new product variant."""
    product = await get_product(db, body.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Ürün bulunamadı.")
    return await create_variant(db, body)


@router.get("/variants/{variant_id}", response_model=VariantOut)
async def get_variant_endpoint(
    variant_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),
):
    variant = await get_variant(db, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Varyant bulunamadı.")
    return variant


@router.put("/variants/{variant_id}", response_model=VariantOut)
async def update_variant_endpoint(
    variant_id: UUID,
    body: VariantUpdate,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    variant = await get_variant(db, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Varyant bulunamadı.")
    return await update_variant(db, variant, body)


@router.delete("/variants/{variant_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_variant_endpoint(
    variant_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    variant = await get_variant(db, variant_id)
    if not variant:
        raise HTTPException(status_code=404, detail="Varyant bulunamadı.")
    await delete_variant(db, variant)
    return None


# ───────────────── Images ─────────────────

@router.get("/products/{product_id}/images", response_model=List[ImageOut])
async def list_product_images(
    product_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),
):
    """Get all images for a product."""
    return await get_images_by_product(db, product_id)


@router.get("/variants/{variant_id}/images", response_model=List[ImageOut])
async def list_variant_images(
    variant_id: UUID,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_user),
):
    """Get all images for a variant."""
    return await get_images_by_variant(db, variant_id)
