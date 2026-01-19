"""Routes for Inventory management - Admin only."""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_admin
from app.crud.inventory import (
    get_inventory_movements,
    get_low_stock_products,
    get_low_stock_variants,
    adjust_product_stock,
    adjust_variant_stock,
)
from app.schemas.inventory import InventoryMovementOut
from app.schemas.product import ProductOut
from app.schemas.variant import VariantOut

router = APIRouter()


@router.get("/movements", response_model=List[InventoryMovementOut])
async def list_inventory_movements(
    skip: int = 0,
    limit: int = 50,
    product_id: UUID | None = None,
    variant_id: UUID | None = None,
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Get inventory movement history."""
    movements = await get_inventory_movements(
        db,
        skip=skip,
        limit=limit,
        product_id=product_id,
        variant_id=variant_id,
    )
    return movements


@router.get("/low-stock")
async def get_low_stock_items(
    threshold: int = Query(10, ge=0),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Get products and variants with stock below threshold."""
    products = await get_low_stock_products(db, threshold)
    variants = await get_low_stock_variants(db, threshold)
    
    return {
        "products": [ProductOut.model_validate(p) for p in products],
        "variants": [VariantOut.model_validate(v) for v in variants],
        "threshold": threshold,
    }


@router.post("/adjust/product/{product_id}", response_model=InventoryMovementOut)
async def adjust_product_stock_endpoint(
    product_id: UUID,
    change: int = Query(..., description="Stock değişimi (+ veya -)"),
    reason: str = Query(..., description="Değişiklik sebebi"),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Manually adjust product stock."""
    try:
        movement = await adjust_product_stock(db, product_id, change, reason)
        return movement
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/adjust/variant/{variant_id}", response_model=InventoryMovementOut)
async def adjust_variant_stock_endpoint(
    variant_id: UUID,
    change: int = Query(..., description="Stock değişimi (+ veya -)"),
    reason: str = Query(..., description="Değişiklik sebebi"),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Manually adjust variant stock."""
    try:
        movement = await adjust_variant_stock(db, variant_id, change, reason)
        return movement
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
