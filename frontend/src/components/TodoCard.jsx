import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import StatusSelect from "./StatusSelect";
import ParkingItems from "./ParkingItems";

export default function TodoCard({
  todo,
  index,
  onStatusChange,
  onDelete,
  onAddParking,
  onDeleteParking,
}) {
  const [open, setOpen] = useState(false);
  const parked = todo.parking_items ?? [];

  return (
    // draggableId must be a string — hello-pangea rejects numeric ids.
    <Draggable draggableId={String(todo.id)} index={index}>
      {(provided, snapshot) => (
        <li
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={[
            "card",
            todo.status === "COMPLETED" ? "card--done" : "",
            snapshot.isDragging ? "card--dragging" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <div className="card__top">
            <span className="card__title">{todo.title}</span>
            <button
              className="card__delete"
              onClick={() => onDelete(todo.id)}
              aria-label={`Delete ${todo.title}`}
            >
              &#10005;
            </button>
          </div>

          <div className="card__meta">
            <StatusSelect todo={todo} onChange={onStatusChange} />
            <button
              className="card__parking-toggle"
              onClick={() => setOpen((isOpen) => !isOpen)}
              aria-expanded={open}
            >
              {parked.length > 0 ? `${parked.length} parked` : "Park a thought"}
            </button>
          </div>

          {open && (
            <ParkingItems
              todo={todo}
              onAdd={onAddParking}
              onDelete={onDeleteParking}
            />
          )}
        </li>
      )}
    </Draggable>
  );
}
