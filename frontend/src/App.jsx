import { useState, useEffect } from "react";
import "./App.css";

const API = "http://localhost:8000";

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

  // PUT /todos/:id — toggle completed
  async function toggleTodo(todo) {
    const res = await fetch(`${API}/todos/${todo.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });
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
          <li key={todo.id} className={todo.completed ? "completed" : ""}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo)}
            />
            <span>{todo.title}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
