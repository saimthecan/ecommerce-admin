# app/crud/stats.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.product import Product


async def get_overview_stats(db: AsyncSession) -> dict:
    # Aktif kullanıcı sayısı
    users_q = await db.execute(
        select(func.count()).select_from(User).where(User.is_active.is_(True))
    )
    active_users = users_q.scalar_one() or 0

    # Aktif ürün sayısı
    products_q = await db.execute(
        select(func.count()).select_from(Product).where(Product.is_active.is_(True))
    )
    active_products = products_q.scalar_one() or 0

    # Şimdilik sipariş ve ciro yok => 0
    return {
        "total_revenue": 0.0,
        "total_orders": 0,
        "active_users": active_users,
        "active_products": active_products,
    }