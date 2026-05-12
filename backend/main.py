from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Models ---

class TodoCreate(BaseModel):
    title: str


class TodoUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class Todo(BaseModel):
    id: int
    title: str
    completed: bool


# --- In-memory store ---

todos: list[Todo] = []
next_id = 1


# --- Routes ---

@app.get("/todos", response_model=list[Todo])
def list_todos():
    return todos


@app.post("/todos", response_model=Todo, status_code=201)
def create_todo(body: TodoCreate):
    global next_id
    todo = Todo(id=next_id, title=body.title, completed=False)
    todos.append(todo)
    next_id += 1
    return todo


@app.put("/todos/{todo_id}", response_model=Todo)
def update_todo(todo_id: int, body: TodoUpdate):
    for todo in todos:
        if todo.id == todo_id:
            if body.title is not None:
                todo.title = body.title
            if body.completed is not None:
                todo.completed = body.completed
            return todo
    raise HTTPException(status_code=404, detail="Todo not found")


@app.delete("/todos/{todo_id}", status_code=204)
def delete_todo(todo_id: int):
    for i, todo in enumerate(todos):
        if todo.id == todo_id:
            todos.pop(i)
            return
    raise HTTPException(status_code=404, detail="Todo not found")
