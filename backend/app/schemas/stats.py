# app/schemas/stats.py
from pydantic import BaseModel


class OverviewStats(BaseModel):
    total_revenue: float
    total_orders: int
    active_users: int
    active_products: int
    orders_by_status: dict[str, int]
