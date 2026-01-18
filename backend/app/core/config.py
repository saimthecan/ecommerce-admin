from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    PROJECT_NAME: str = "Ecommerce Admin API"
    API_V1_PREFIX: str = "/api/v1"

    # CORS
    CORS_ORIGINS: Optional[str] = None
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    @model_validator(mode="after")
    def build_cors_origins(self):
        if self.CORS_ORIGINS:
            origins = [
                item.strip()
                for item in self.CORS_ORIGINS.split(",")
                if item.strip()
            ]
            if origins:
                object.__setattr__(
                    self,
                    "BACKEND_CORS_ORIGINS",
                    origins,
                )
        return self

    # Security
    SECRET_KEY: str = "super-secret-key-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALGORITHM: str = "HS256"

    # Database – Supabase bağlantısı
    DATABASE_URL: str

settings = Settings()
