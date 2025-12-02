import asyncio

from sqlalchemy import select

from app.db.base import Base
from app.db.session import engine, async_session_maker
from app.models.user import User
from app.core.security import get_password_hash


async def init_db():
    # 1) Tabloları oluştur (users dahil)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # 2) İlk admin kullanıcısını ekle (yoksa)
    async with async_session_maker() as session:
        admin_email = "admin@example.com"
        admin_password = "admin123"  # istersen değiştir

        result = await session.execute(
            select(User).where(User.email == admin_email)
        )
        user = result.scalar_one_or_none()

        if user:
            print("Admin user already exists:", admin_email)
            return

        new_user = User(
            email=admin_email,
            full_name="Admin User",
            hashed_password=get_password_hash(admin_password),
            is_active=True,
            is_superuser=True,
        )
        session.add(new_user)
        await session.commit()
        print("Admin user created:", admin_email)


if __name__ == "__main__":
    asyncio.run(init_db())
