from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Ecommerce Admin API"
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173"]
    
    

    # Security
    SECRET_KEY: str = "super-secret-key-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # Database – Supabase bağlantısı
    DATABASE_URL: str

    class Config:
        env_file = ".env"


settings = Settings()