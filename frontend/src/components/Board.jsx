import { DragDropContext } from "@hello-pangea/dnd";
import { QUADRANTS } from "../constants";
import Quadrant from "./Quadrant";

export default function Board({ todos, onDragEnd, ...handlers }) {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        <span className="board__axis board__axis--x board__axis--xl">Urgent</span>
        <span className="board__axis board__axis--x board__axis--xr">
          Not urgent
        </span>
        <span className="board__axis board__axis--y board__axis--yt">
          Important
        </span>
        <span className="board__axis board__axis--y board__axis--yb">
          Not important
        </span>

        {QUADRANTS.map((quadrant) => (
          <Quadrant
            key={quadrant.key}
            quadrant={quadrant}
            todos={todos.filter((t) => t.eisenhower_status === quadrant.key)}
            {...handlers}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
