from fastapi import APIRouter

from app.api.v1.routes_root import router as root_router
from app.api.v1.routes_auth import router as auth_router
from app.api.v1.routes_users import router as users_router
from app.api.v1.routes_products import router as products_router
from app.api.v1.routes_stats import router as stats_router
from app.api.v1.routes_categories import router as categories_router
from app.api.v1.routes_orders import router as orders_router
from app.api.v1.routes_addresses import router as addresses_router
from app.api.v1.routes_inventory import router as inventory_router
from app.api.v1.routes_variants import router as variants_router
from app.api.v1.routes_payments import router as payments_router
from app.api.v1.routes_images import router as images_router

api_router = APIRouter()

api_router.include_router(root_router, tags=["root"])
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(products_router, prefix="/products", tags=["products"])
api_router.include_router(stats_router, prefix="/stats", tags=["stats"])
api_router.include_router(categories_router, prefix="/categories", tags=["categories"])
api_router.include_router(orders_router, prefix="/orders", tags=["orders"])
api_router.include_router(addresses_router, prefix="/addresses", tags=["addresses"])
api_router.include_router(inventory_router, prefix="/inventory", tags=["inventory"])
api_router.include_router(variants_router, prefix="", tags=["variants"])  # Contains /products/{id}/variants and /variants paths
api_router.include_router(payments_router, prefix="/payments", tags=["payments"])
api_router.include_router(images_router, prefix="/images", tags=["images"])