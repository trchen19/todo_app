from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TodoBase(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    # status: status.TodoStatus
    parking: str | None
    notes: str | None


class TodoCreate(TodoBase):
    pass


class TodoUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    # status: status.TodoStatus | None
    parking: str | None
    notes: str | None


class TodoResponse(TodoBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_date: datetime
