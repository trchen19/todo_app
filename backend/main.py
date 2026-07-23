from typing import Annotated

import models
from database import Base, engine, get_db
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from schemas import TodoCreate, TodoResponse, TodoUpdate
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
        status="Not_started",
        eisen_status="urgent_important",
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo


@app.put("/todos/{todo_id}", response_model=TodoResponse)
def update_todo(todo_id: int, body: TodoUpdate):
    pass
    # for todo in todos:
    #     if todo.id == todo_id:
    #         if body.title is not None:
    #             todo.title = body.title
    #         if body.completed is not None:
    #             todo.completed = body.completed
    #         return todo
    # raise HTTPException(status_code=404, detail="Todo not found")


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
