import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:8000";

const STATUS_LABELS = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const STATUS_CLASSES = {
  NOT_STARTED: "status-not-started",
  IN_PROGRESS: "status-in-progress",
  COMPLETED: "status-completed",
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  // Fetch all todos when the component mounts
  useEffect(() => {
    fetch(`${API}/todos`)
      .then((res) => res.json())
      .then((data) => setTodos(data));
  }, []);

  // POST /todos
  async function addTodo(e) {

    e.preventDefault();
    if (!input.trim()) return;

    const res = await fetch(`${API}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input }),
    });
    const newTodo = await res.json();
    setTodos([...todos, newTodo]);
    setInput("");
  }

  // PATCH /todos/:id — change status
  async function updateStatus(todo, status) {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;
    const updated = await res.json();
    setTodos(todos.map((t) => (t.id === updated.id ? updated : t)));
  }

  // DELETE /todos/:id
  async function deleteTodo(id) {
    await fetch(`${API}/todos/${id}`, { method: "DELETE" });
    setTodos(todos.filter((t) => t.id !== id));
  }

  return (
    <div className="container">
      <h1>Todo App</h1>

      <form onSubmit={addTodo} className="add-form">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
        />
        <button type="submit">Add</button>
      </form>

      <ul className="todo-list">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className={todo.status === "COMPLETED" ? "completed" : ""}
          >
            <select
              className={`status-select ${STATUS_CLASSES[todo.status] ?? ""}`}
              value={todo.status}
              onChange={(e) => updateStatus(todo, e.target.value)}
            >
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <span>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
