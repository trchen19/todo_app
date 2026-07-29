from __future__ import annotations

from datetime import UTC, datetime

from database import Base
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship


class Todo(Base):
    __tablename__ = "todos"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String[200], nullable=False)
    status: Mapped[str] = mapped_column(String[30], nullable=False)
    eisenhower_status: Mapped[str] = mapped_column(String[30], nullable=False)
    notes: Mapped[str | None] = mapped_column(nullable=True, default=None)

    # Rank within an Eisenhower quadrant. Set by PATCH /todos/reorder; ties are
    # broken by id so rows predating this column still sort predictably.
    position: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    created_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(UTC), nullable=False
    )

    parking_items: Mapped[list[ParkingItem]] = relationship(
        back_populates="parent_task", cascade="all, delete-orphan"
    )


class ParkingItem(Base):
    __tablename__ = "parking_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    created_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(UTC), nullable=False
    )
    todo_id: Mapped[int] = mapped_column(
        ForeignKey("todos.id"), nullable=False, index=True
    )

    parent_task: Mapped[Todo] = relationship(back_populates="parking_items")
