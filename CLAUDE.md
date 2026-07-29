# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Todo app for learning FastAPI (backend) and React (frontend). Storage is SQLite via SQLAlchemy. Todos carry a workflow status and an Eisenhower-matrix priority, and each todo owns a list of "parking items" (parked thoughts/blockers).

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```
Interactive API docs at `http://localhost:8000/docs`.

**Run uvicorn from inside `backend/`, not the repo root.** The backend modules import each other as top-level modules (`import models`, `from database import ...`), and `DATABASE_URL` is the relative path `sqlite:///./test.db`. Starting from elsewhere breaks imports and/or creates a second database file.

### Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build
npm run lint    # eslint
```

Both servers must be running simultaneously for the app to work.

There is no test suite or test runner in either half of the project.

## Architecture

### Backend (`backend/`)
Five modules, layered:

- `database.py` — engine, `SessionLocal`, the declarative `Base`, and the `get_db()` dependency (yields a session per request via context manager).
- `todo_statuses.py` — `TodoStatus` and `EisenhowerStatus`, both `str, Enum`. Single source of truth: `models.py` uses them for column defaults, `schemas.py` uses them for request/response validation. Stored in SQLite as plain strings (`.value`), not as a SQL enum type.
- `models.py` — SQLAlchemy 2.0 `Mapped[...]` models. `Todo` ↔ `ParkingItem` is one-to-many with `cascade="all, delete-orphan"`, so deleting a todo deletes its parking items.
- `schemas.py` — Pydantic models. `TodoBase` is shared by `TodoCreate` and `TodoResponse`; `TodoUpdate` is a separate all-optional model. `TodoResponse` sets `from_attributes=True` and embeds `parking_items`.
- `main.py` — all routes, no service layer. Each handler queries with `db.execute(select(...))`, raises 404 itself, then commits and refreshes.

Schema is created by `Base.metadata.create_all(bind=engine)` at import time in `main.py`. **There are no migrations** — after changing a model, delete `backend/test.db` and restart so the table is recreated. The root `.gitignore` excludes `/backend/*.db`, so local database files stay untracked.

CORS allows only `http://localhost:5173`.

### Frontend (`frontend/src/`)
An Eisenhower quadrant board. A card's quadrant **is** its `eisenhower_status`; dragging between quadrants re-prioritises it and dragging within one reorders it. Drag-and-drop is `@hello-pangea/dnd`.

- `api.js` — every endpoint behind one `request()` helper that throws on non-2xx and returns `null` for 204. Components never call `fetch` directly.
- `constants.js` — `QUADRANTS` (the single source for grid slot, `droppableId`, and labels) plus `STATUS_LABELS` / `STATUS_CLASSES`, which must stay in sync with `todo_statuses.py`.
- `App.jsx` — owns all state and handlers; composes `AddTodoForm` + `Board`. No other component holds server state.
- `components/` — `Board` (`DragDropContext` + grid), `Quadrant` (one `Droppable`), `TodoCard` (one `Draggable`), `StatusSelect`, `ParkingItems`, `AddTodoForm`.

Mutations update local state directly rather than re-fetching. Drags apply **optimistically** and reconcile against the response, falling back to a full re-fetch on failure — without that the card visibly snaps back mid-request.

`todos` is kept sorted by `(position, id)`, so each quadrant's list is a plain `filter` and the drag index lines up with what is on screen.

`App.css` holds the app styles, scoped under `.app`, which also sets `color-scheme: light` — `index.css` declares `light dark`, and without the override the OS dark theme restyles the native form controls inside the light card. `index.css` is the entry stylesheet loaded by `main.jsx`.

## API Contract

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/todos` | — | `Todo[]`, ordered by `(position, id)` |
| POST | `/todos` | `{ title, status?, eisenhower_status?, notes? }` | `Todo` (201), appended at the end |
| PATCH | `/todos/reorder` | `{ eisenhower_status, ordered_ids }` | reordered `Todo[]` |
| PATCH | `/todos/{id}` | any subset of `{ title?, status?, eisenhower_status?, notes? }` | updated `Todo` |
| DELETE | `/todos/{id}` | — | 204 |
| GET | `/todos/{id}/parking_items` | — | `ParkingItem[]` |
| POST | `/todos/{id}/parking_items` | `{ description }` | `ParkingItem` (201) |
| PUT | `/parking_items/{id}` | `{ description }` | updated `ParkingItem` |
| DELETE | `/parking_items/{id}` | — | 204 |

`Todo` responses include `id`, `title`, `status`, `eisenhower_status`, `position`, `notes`, `created_date`, and a nested `parking_items` array.

**`PATCH /todos/reorder` must stay declared above `PATCH /todos/{todo_id}` in `main.py`.** FastAPI matches routes in declaration order, so if the parameterised route comes first it tries to parse `"reorder"` as an `int` and returns 422. One request handles both an in-quadrant reorder and a cross-quadrant move: every id in `ordered_ids` is assigned `eisenhower_status`, and its index becomes its `position`. The source quadrant is left with gaps in its positions, which is harmless — only relative order matters.

`position` is on `TodoResponse` but deliberately **not** on `TodoBase`, which `TodoCreate` shares — clients should not set rank at creation.

## Known Issues

The frontend now matches the API contract, but the following are open:

- **`PATCH /todos/{id}` returns 500 on an explicit `null`** for a non-nullable column — `{"status": null}` raises `IntegrityError: NOT NULL constraint failed`. `TodoUpdate` types these as `TodoStatus | None` (with `None` doubling as the "not provided" sentinel for `exclude_unset=True`), so a literal `null` validates and reaches `update_todo`'s blind `setattr` loop. The same class of bug was fixed on POST by dropping `| None` from `TodoBase`, but that fix does not transfer here without breaking partial updates. The UI cannot trigger it — the status dropdown only emits valid enum values.
- **`created_date` is frozen at import time.** `models.py:20` and `:34` pass `default=datetime.now(UTC)` instead of a callable, so every row created during one server run shares a single timestamp. Needs `default=lambda: datetime.now(UTC)`.

## Frontend Scope

The UI covers `title`, `status`, `eisenhower_status` (by position on the board), and parking items. Two gaps remain: **`notes` has no UI**, and `PUT /parking_items/{id}` is unused — parked thoughts can be added and deleted but not edited.

Touch and pointer drag are deliberately out of scope; the board is mouse-driven.

## Design

Quiet earth palette — olive and beige — chosen for a focus environment. All four quadrants share one field colour deliberately; an earlier proposal tinted them by priority and was rejected. Structure comes from the hairline axis rails and labels, not from colour.

The three status badge colours (`#374151`/`#d1d5db`, `#9a3412`/`#fed7aa`, `#166534`/`#bbf7d0`) are fixed and should not be re-themed. The `.status-select option` rule is load-bearing: without it the open dropdown inherits the badge's dark background and tints every option with the current status's colour.

Type character comes from tracking, case, and scale rather than a display face, so no webfont dependency is needed.
