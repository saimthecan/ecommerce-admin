from uuid import uuid4

from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.sqlite import BLOB
from sqlalchemy.sql import func

from app.db.base import Base


class Category(Base):
    __tablename__ = "categories"

    # SQLite'ta UUID için BLOB ya da TEXT kullanabiliriz.
    # User modelinde ne kullandıysan aynısını tercih et.
    id = Column(
        String(36),  # SQLite için pratik çözüm: UUID'i string olarak tutuyoruz
        primary_key=True,
        default=lambda: str(uuid4()),
        index=True,
    )

    name = Column(String(255), nullable=False, unique=True, index=True)
    description = Column(String(500), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )