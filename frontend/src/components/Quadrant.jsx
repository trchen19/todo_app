import { Droppable } from "@hello-pangea/dnd";
import TodoCard from "./TodoCard";

export default function Quadrant({ quadrant, todos, onAddTodo, ...handlers }) {
  return (
    <section className={`quadrant quadrant--${quadrant.slot}`}>
      <header className="quadrant__head">
        <span className="quadrant__action">{quadrant.action}</span>
        {/* Only shown at the mobile breakpoint, where the axis rails are hidden. */}
        <span className="quadrant__axes">{quadrant.axes}</span>
        <button 
              className="quadrant__add" 
              onClick={() => onAddTodo("Placeholder", quadrant.key)}
              aria-label={`Add ${quadrant.axes}`}
              >
            &#43;
        </button>
      </header>

      <Droppable droppableId={quadrant.key}>
        {(provided, snapshot) => (
          <ul
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`quadrant__cards ${snapshot.isDraggingOver ? "is-over" : ""}`}
          >
            {todos.map((todo, index) => (
              <TodoCard key={todo.id} todo={todo} index={index} {...handlers} />
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </section>
  );
}
