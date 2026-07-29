from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field
from todo_statuses import EisenhowerStatus, TodoStatus


class ParkingItemBase(BaseModel):
    description: str = Field(min_length=1)


class ParkingItemCreate(ParkingItemBase):
    pass


class ParkingItemUpdate(BaseModel):
    description: str | None = Field(default=None, min_length=1)


class ParkingItemResponse(ParkingItemBase):
    id: int
    created_date: datetime


class TodoBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    status: TodoStatus = Field(default=TodoStatus.NOT_STARTED)
    eisenhower_status: EisenhowerStatus = Field(
        default=EisenhowerStatus.URGENT_IMPORTANT
    )
    notes: str | None = Field(default=None, min_length=1)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    status: TodoStatus | None = Field(default=None)
    eisenhower_status: EisenhowerStatus | None = Field(default=None)
    notes: str | None = Field(default=None, min_length=1)


class TodoReorder(BaseModel):
    """Target quadrant plus its ids in their new order. One request covers both a
    same-quadrant reorder and a move between quadrants."""

    eisenhower_status: EisenhowerStatus
    ordered_ids: list[int]


class TodoResponse(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    position: int
    parking_items: list[ParkingItemResponse]
    created_date: datetime
