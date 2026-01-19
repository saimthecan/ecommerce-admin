"""InventoryMovement and OrderEvent models."""
import uuid
from datetime import datetime

from sqlalchemy import Column, String, ForeignKey, DateTime, Integer, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class InventoryMovement(Base):
    """Tracks stock changes for products and variants."""
    __tablename__ = "inventory_movements"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    product_id = Column(
        UUID(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    variant_id = Column(
        UUID(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    change = Column(Integer, nullable=False)  # Positive for additions, negative for removals
    reason = Column(String(100), nullable=False)  # "order", "return", "adjustment", "initial"
    ref_order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
    )
    notes = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="inventory_movements")
    variant = relationship("ProductVariant", back_populates="inventory_movements")
    order = relationship("Order", back_populates="inventory_movements")


class OrderEvent(Base):
    """Timeline events for order status changes."""
    __tablename__ = "order_events"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    order_id = Column(
        UUID(as_uuid=True),
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    type = Column(String(50), nullable=False)  # created, paid, shipped, delivered, cancelled, refunded
    description = Column(Text, nullable=True)
    actor_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    order = relationship("Order", back_populates="events")
    actor = relationship("User")
