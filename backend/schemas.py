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
    status: TodoStatus
    eisenhower_status: EisenhowerStatus
    notes: str | None = Field(default=None, min_length=1)


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    status: TodoStatus | None = Field(default=None)
    eisenhower_status: EisenhowerStatus | None = Field(default=None)
    notes: str | None = Field(default=None, min_length=1)


class TodoResponse(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    parking_items: list[ParkingItemResponse]
    created_date: datetime
