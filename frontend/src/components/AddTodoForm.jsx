import { useState } from "react";

export default function AddTodoForm({ onAdd }) {
  const [input, setInput] = useState("");

  function submit(e) {
    e.preventDefault();
    const title = input.trim();
    if (!title) return;
    setInput("");
    onAdd(title);
  }

  return (
    <form className="add-form" onSubmit={submit}>
      <input
        className="add-form__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="What needs doing?"
        aria-label="New task"
      />
      <button className="add-form__button" type="submit">
        Add
      </button>
    </form>
  );
}
