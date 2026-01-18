import uuid

from sqlalchemy import (
    Column,
    String,
    DateTime,
    Boolean,
    Integer,
    ForeignKey,
    Numeric,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.db.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )

    name = Column(String(255), nullable=False, index=True)
    description = Column(String(1000), nullable=True)

    # Fiyatı para tipi gibi tutmak için Numeric kullanıyoruz
    price = Column(Numeric(10, 2), nullable=False, default=0)

    # Stok adedi
    stock = Column(Integer, nullable=False, default=0)

    # Ürün satışta mı?
    is_active = Column(Boolean, nullable=False, default=True)

    # Kategori ilişkisi (opsiyonel)
    category_id = Column(
        UUID(as_uuid=True),
        ForeignKey("categories.id", ondelete="SET NULL"),
        nullable=True,
    )

    category = relationship("Category", backref="products")

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