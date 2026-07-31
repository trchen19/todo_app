const API = "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    ...options,
  });

  if (!res.ok) {
    throw new Error(`${options.method ?? "GET"} ${path} failed (${res.status})`);
  }

  return res.status === 204 ? null : res.json();
}

export const listTodos = () => request("/todos");

export const createTodo = (newtask) =>
  request("/todos", { method: "POST", body: JSON.stringify(newtask) });

export const updateTodo = (id, patch) =>
  request(`/todos/${id}`, { method: "PATCH", body: JSON.stringify(patch) });

export const deleteTodo = (id) => request(`/todos/${id}`, { method: "DELETE" });

// One call covers both a reorder inside a quadrant and a move between quadrants:
// every listed id is assigned `eisenhowerStatus`, and its index becomes its rank.
export const reorderTodos = (eisenhowerStatus, orderedIds) =>
  request("/todos/reorder", {
    method: "PATCH",
    body: JSON.stringify({
      eisenhower_status: eisenhowerStatus,
      ordered_ids: orderedIds,
    }),
  });

export const createParkingItem = (todoId, description) =>
  request(`/todos/${todoId}/parking_items`, {
    method: "POST",
    body: JSON.stringify({ description }),
  });

export const deleteParkingItem = (id) =>
  request(`/parking_items/${id}`, { method: "DELETE" });
