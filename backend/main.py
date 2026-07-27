from typing import Annotated

import models
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    ParkingItemCreate,
    ParkingItemResponse,
    ParkingItemUpdate,
    TodoCreate,
    TodoResponse,
    TodoUpdate,
)
from sqlalchemy import select
from sqlalchemy.orm import Session

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Routes ---
@app.get("/todos", response_model=list[TodoResponse])
def list_todos(db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Todo))
    todos = result.scalars().all()
    return todos


@app.post("/todos", response_model=TodoResponse, status_code=status.HTTP_201_CREATED)
def create_todo(todo_data: TodoCreate, db: Annotated[Session, Depends(get_db)]):

    todo = models.Todo(
        title=todo_data.title,
        status=todo_data.status,
        eisenhower_status=todo_data.eisenhower_status,
        notes=todo_data.notes,
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.patch("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(
    todo_id: int, todo_data: TodoUpdate, db: Annotated[Session, Depends(get_db)]
):
    result = db.execute(select(models.Todo).where(models.Todo.id == todo_id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )

    # Note: Doesn't filter out null statuses which would cause an error when committing to db.
    # Update schema allows nulls in status fields, but db model specifies status columns nullable = False

    update_data = todo_data.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(todo, field, value)

    db.commit()
    db.refresh(todo)
    return todo


@app.delete("/todos/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_todo(todo_id: int, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Todo).where(models.Todo.id == todo_id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )
    db.delete(todo)
    db.commit()


@app.get("/todos/{todo_id}/parking_items", response_model=list[ParkingItemResponse])
def get_todo_parking_items(todo_id: int, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(select(models.Todo).where(models.Todo.id == todo_id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )

    return todo.parking_items


@app.post(
    "/todos/{todo_id}/parking_items",
    response_model=ParkingItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_parking_item(
    todo_id: int,
    parking_item_data: ParkingItemCreate,
    db: Annotated[Session, Depends(get_db)],
):
    result = db.execute(select(models.Todo).where(models.Todo.id == todo_id))
    todo = result.scalars().first()

    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )

    parking_item = models.ParkingItem(
        description=parking_item_data.description, todo_id=todo.id
    )

    db.add(parking_item)
    db.commit()
    db.refresh(parking_item)
    return parking_item


@app.put(
    "/parking_items/{parking_item_id}",
    response_model=ParkingItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def update_parking_item(
    parking_item_id: int,
    parking_item_data: ParkingItemUpdate,
    db: Annotated[Session, Depends(get_db)],
):
    result = db.execute(
        select(models.ParkingItem).where(models.ParkingItem.id == parking_item_id)
    )
    parking_item = result.scalars().first()

    if not parking_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Parking item not found"
        )

    parking_item.description = parking_item_data.description

    db.commit()
    db.refresh(parking_item)
    return parking_item


@app.delete("/parking_items/{parking_item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_parking_item(parking_item_id: int, db: Annotated[Session, Depends(get_db)]):
    result = db.execute(
        select(models.ParkingItem).where(models.ParkingItem.id == parking_item_id)
    )
    parking_item = result.scalars().first()

    if not parking_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Todo not found"
        )

    db.delete(parking_item)
    db.commit()
