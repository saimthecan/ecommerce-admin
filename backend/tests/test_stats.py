"""Tests for stats/overview endpoint."""
import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.core.security import get_password_hash


@pytest.mark.asyncio
async def test_stats_overview_requires_auth(client: AsyncClient):
    """Test that stats overview requires authentication."""
    response = await client.get("/api/v1/stats/overview")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_stats_overview_returns_data(
    client: AsyncClient,
    db_session: AsyncSession,
):
    """Test stats overview returns proper structure."""
    # Create admin user
    admin = User(
        email="admin_test@example.com",
        hashed_password=get_password_hash("admin123"),
        full_name="Admin User",
        is_active=True,
        is_superuser=True,
    )
    db_session.add(admin)
    await db_session.commit()
    
    # Login as admin
    login_response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "admin_test@example.com",
            "password": "admin123",
        },
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    
    # Get stats
    response = await client.get(
        "/api/v1/stats/overview",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    
    # Verify structure
    assert "total_revenue" in data or "totalRevenue" in data
    assert "total_orders" in data or "totalOrders" in data
