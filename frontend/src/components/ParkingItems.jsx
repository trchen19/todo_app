import { useState } from "react";

export default function ParkingItems({ todo, onAdd, onDelete }) {
  const [draft, setDraft] = useState("");
  const items = todo.parking_items ?? [];

  function submit(e) {
    e.preventDefault();
    const description = draft.trim();
    if (!description) return;
    setDraft("");
    onAdd(todo, description);
  }

  return (
    <div className="parking">
      {items.length > 0 && (
        <ul className="parking__list">
          {items.map((item) => (
            <li key={item.id} className="parking__item">
              <span>{item.description}</span>
              <button
                className="parking__remove"
                onClick={() => onDelete(todo, item.id)}
                aria-label={`Unpark: ${item.description}`}
              >
                &#10005;
              </button>
            </li>
          ))}
        </ul>
      )}

      <form className="parking__form" onSubmit={submit}>
        <input
          className="parking__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="What's in the way?"
          aria-label={`Park a thought on ${todo.title}`}
        />
        <button className="parking__add" type="submit">
          Park
        </button>
      </form>
    </div>
  );
}
