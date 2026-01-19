"""ProductVariant and ProductImage models."""
import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import Column, String, ForeignKey, DateTime, Numeric, Integer, Boolean, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class ProductVariant(Base):
    __tablename__ = "product_variants"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sku = Column(String(100), nullable=True, unique=True)
    name = Column(String(200), nullable=False)  # e.g., "Red / Large"
    attributes = Column(JSON, default=dict)  # {"color": "Red", "size": "Large"}
    price_override = Column(Numeric(12, 2), nullable=True)  # Override product price
    stock = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="variants")
    images = relationship("ProductImage", back_populates="variant", cascade="all, delete-orphan")
    inventory_movements = relationship("InventoryMovement", back_populates="variant")


class ProductImage(Base):
    __tablename__ = "product_images"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    variant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    url = Column(String(500), nullable=False)
    alt_text = Column(String(255), nullable=True)
    is_primary = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="images")
    variant = relationship("ProductVariant", back_populates="images")
