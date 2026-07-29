import { useCallback, useEffect, useState } from "react";
import * as api from "./api";
import AddTodoForm from "./components/AddTodoForm";
import Board from "./components/Board";
import "./App.css";

// Positions are only meaningful within a quadrant, but sorting globally by
// (position, id) keeps each quadrant's filtered order correct, and id breaks ties
// for rows that share a position.
const byRank = (a, b) => a.position - b.position || a.id - b.id;

export default function App() {
  const [todos, setTodos] = useState([]);
  const [error, setError] = useState(null);

  const refetch = useCallback(
    () =>
      api
        .listTodos()
        .then((data) => {
          setTodos([...data].sort(byRank));
          setError(null);
        })
        .catch((e) => setError(e.message)),
    [],
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  async function addTodo(title) {
    try {
      const created = await api.createTodo(title);
      setTodos((prev) => [...prev, created].sort(byRank));
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeStatus(todo, status) {
    try {
      const updated = await api.updateTodo(todo.id, { status });
      setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeTodo(id) {
    try {
      await api.deleteTodo(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  async function addParking(todo, description) {
    try {
      const item = await api.createParkingItem(todo.id, description);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? { ...t, parking_items: [...(t.parking_items ?? []), item] }
            : t,
        ),
      );
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeParking(todo, itemId) {
    try {
      await api.deleteParkingItem(itemId);
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id
            ? {
                ...t,
                parking_items: (t.parking_items ?? []).filter(
                  (i) => i.id !== itemId,
                ),
              }
            : t,
        ),
      );
    } catch (e) {
      setError(e.message);
    }
  }

  function onDragEnd({ source, destination, draggableId }) {
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const id = Number(draggableId);
    const orderedIds = todos
      .filter((t) => t.eisenhower_status === destination.droppableId && t.id !== id)
      .map((t) => t.id);
    orderedIds.splice(destination.index, 0, id);

    // Apply optimistically — without this the card visibly snaps back to its old
    // slot while the request is in flight.
    setTodos((prev) =>
      prev
        .map((t) => {
          const rank = orderedIds.indexOf(t.id);
          return rank === -1
            ? t
            : {
                ...t,
                eisenhower_status: destination.droppableId,
                position: rank,
              };
        })
        .sort(byRank),
    );

    api
      .reorderTodos(destination.droppableId, orderedIds)
      .then((updated) => {
        const authoritative = new Map(updated.map((t) => [t.id, t]));
        setTodos((prev) =>
          prev.map((t) => authoritative.get(t.id) ?? t).sort(byRank),
        );
      })
      .catch((e) => {
        setError(e.message);
        refetch();
      });
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Triage</h1>
        <AddTodoForm onAdd={addTodo} />
      </header>

      {error && (
        <div className="app__error" role="alert">
          <span>{error}</span>
          <button className="app__error-dismiss" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <Board
        todos={todos}
        onDragEnd={onDragEnd}
        onStatusChange={changeStatus}
        onDelete={removeTodo}
        onAddParking={addParking}
        onDeleteParking={removeParking}
      />

      {todos.length === 0 && !error && (
        <p className="app__empty">
          Nothing on the board. Add a task above — it starts in Do now, and you can
          drag it wherever it belongs.
        </p>
      )}
    </div>
  );
}
