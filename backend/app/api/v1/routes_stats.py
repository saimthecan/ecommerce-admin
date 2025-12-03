# app/api/v1/routes_stats.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db_session, get_current_active_user
from app.schemas.stats import OverviewStats
from app.crud.stats import get_overview_stats

router = APIRouter()


@router.get("/overview", response_model=OverviewStats)
async def get_overview(
    db: AsyncSession = Depends(get_db_session),
    current_user=Depends(get_current_active_user),  # auth zorunlu
) -> OverviewStats:
    data = await get_overview_stats(db)
    return OverviewStats(**data)