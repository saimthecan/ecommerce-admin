# app/api/v1/routes_stats.py
"""Routes for Stats and Reports - Overview, Sales Trends, Top Products."""
from datetime import date, datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.api.deps import get_db_session, get_current_active_user, get_current_active_admin
from app.schemas.stats import OverviewStats
from app.crud.stats import get_overview_stats
from app.models.order import Order, OrderItem
from app.models.product import Product

router = APIRouter()


# ───────────────── Response Models ─────────────────

class SalesDataPoint(BaseModel):
    date: str
    revenue: float
    order_count: int


class TopProduct(BaseModel):
    product_id: str
    product_name: str
    total_revenue: float
    total_quantity: int


# ───────────────── Endpoints ─────────────────

@router.get("/overview", response_model=OverviewStats)
async def get_overview(
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_active_user),
) -> OverviewStats:
    data = await get_overview_stats(db)
    return OverviewStats(**data)


@router.get("/sales", response_model=List[SalesDataPoint])
async def get_sales_trend(
    start_date: date = Query(..., description="Başlangıç tarihi (YYYY-MM-DD)"),
    end_date: date = Query(..., description="Bitiş tarihi (YYYY-MM-DD)"),
    group_by: str = Query("day", pattern="^(day|week|month)$"),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Get sales trend data grouped by day, week, or month."""
    # Build date format based on grouping
    if group_by == "day":
        date_format = func.date(Order.created_at)
    elif group_by == "week":
        date_format = func.date_trunc("week", Order.created_at)
    else:  # month
        date_format = func.date_trunc("month", Order.created_at)
    
    stmt = (
        select(
            date_format.label("date_group"),
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            func.count(Order.id).label("order_count"),
        )
        .where(
            Order.created_at >= datetime.combine(start_date, datetime.min.time()),
            Order.created_at <= datetime.combine(end_date, datetime.max.time()),
            Order.status.notin_(["cancelled", "refunded"]),
        )
        .group_by("date_group")
        .order_by("date_group")
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    return [
        SalesDataPoint(
            date=str(row.date_group)[:10],
            revenue=float(row.revenue or 0),
            order_count=row.order_count or 0,
        )
        for row in rows
    ]


@router.get("/top-products", response_model=List[TopProduct])
async def get_top_products(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncSession = Depends(get_db_session),
    current_user = Depends(get_current_active_admin),
):
    """Get top selling products by revenue."""
    stmt = (
        select(
            Product.id,
            Product.name,
            func.coalesce(func.sum(OrderItem.line_total), 0).label("total_revenue"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_quantity"),
        )
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.status.notin_(["cancelled", "refunded"]))
    )
    
    if start_date:
        stmt = stmt.where(Order.created_at >= datetime.combine(start_date, datetime.min.time()))
    if end_date:
        stmt = stmt.where(Order.created_at <= datetime.combine(end_date, datetime.max.time()))
    
    stmt = (
        stmt
        .group_by(Product.id, Product.name)
        .order_by(func.sum(OrderItem.line_total).desc())
        .limit(limit)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    return [
        TopProduct(
            product_id=str(row.id),
            product_name=row.name,
            total_revenue=float(row.total_revenue or 0),
            total_quantity=int(row.total_quantity or 0),
        )
        for row in rows
    ]