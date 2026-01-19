# app/crud/stats.py
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.product import Product
from app.models.order import Order


ORDER_STATUSES = ["pending", "paid", "cancelled", "shipped", "delivered"]
REVENUE_STATUSES = ["paid", "shipped", "delivered"]


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

    # Sipariş durumlarına göre adetler
    status_counts = {status: 0 for status in ORDER_STATUSES}
    status_q = await db.execute(
        select(Order.status, func.count(Order.id)).group_by(Order.status)
    )
    for status, count in status_q.all():
        if status in status_counts:
            status_counts[status] = count

    # Ciro: sadece paid/shipped/delivered
    revenue_q = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .select_from(Order)
        .where(Order.status.in_(REVENUE_STATUSES))
    )
    total_revenue = float(revenue_q.scalar_one() or 0)

    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "active_users": active_users,
        "active_products": active_products,
        "orders_by_status": status_counts,
    }
