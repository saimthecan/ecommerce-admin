from fastapi import APIRouter

from app.api.v1.routes_root import router as root_router
from app.api.v1.routes_auth import router as auth_router
from app.api.v1.routes_users import router as users_router
from app.api.v1.routes_products import router as products_router
from app.api.v1.routes_stats import router as stats_router
from app.api.v1.routes_categories import router as categories_router

api_router = APIRouter()

api_router.include_router(root_router, tags=["root"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(stats_router, prefix="/stats", tags=["stats"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])