# app/crud/stats.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.product import Product
from app.models.order import Order


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

    # Toplam sipariş sayısı
    orders_q = await db.execute(select(func.count()).select_from(Order))
    total_orders = orders_q.scalar_one() or 0

    # İptal edilenler hariç toplam ciro
    revenue_q = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .select_from(Order)
        .where(Order.status != "cancelled")
    )
    total_revenue = float(revenue_q.scalar_one() or 0)

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "active_users": active_users,
        "active_products": active_products,
    }
