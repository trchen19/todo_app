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
Single-component React app (`App.jsx`). All state (`todos`, `input`) lives in `App` via `useState`; data is fetched on mount via `useEffect`. Each mutation calls the API then updates local state directly — no re-fetch.

`App.css` holds the app styles. `index.css` is the entry stylesheet loaded by `main.jsx`.

## API Contract

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/todos` | — | `Todo[]` |
| POST | `/todos` | `{ title, status?, eisenhower_status?, notes? }` | `Todo` (201) |
| PATCH | `/todos/{id}` | any subset of `{ title?, status?, eisenhower_status?, notes? }` | updated `Todo` |
| DELETE | `/todos/{id}` | — | 204 |
| GET | `/todos/{id}/parking_items` | — | `ParkingItem[]` |
| POST | `/todos/{id}/parking_items` | `{ description }` | `ParkingItem` (201) |
| PUT | `/parking_items/{id}` | `{ description }` | updated `ParkingItem` |
| DELETE | `/parking_items/{id}` | — | 204 |

`Todo` responses include `id`, `title`, `status`, `eisenhower_status`, `notes`, `created_date`, and a nested `parking_items` array.

## Known Issues

The frontend now matches the API contract, but the following are open:

- **`PATCH /todos/{id}` returns 500 on an explicit `null`** for a non-nullable column — `{"status": null}` raises `IntegrityError: NOT NULL constraint failed`. `TodoUpdate` types these as `TodoStatus | None` (with `None` doubling as the "not provided" sentinel for `exclude_unset=True`), so a literal `null` validates and reaches `update_todo`'s blind `setattr` loop. The same class of bug was fixed on POST by dropping `| None` from `TodoBase`, but that fix does not transfer here without breaking partial updates. The UI cannot trigger it — the status dropdown only emits valid enum values.
- **`created_date` is frozen at import time.** `models.py:20` and `:34` pass `default=datetime.now(UTC)` instead of a callable, so every row created during one server run shares a single timestamp. Needs `default=lambda: datetime.now(UTC)`.

## Frontend Scope

`App.jsx` deliberately surfaces only `title` and `status` (a three-way dropdown wired to `PATCH`). `eisenhower_status` and `notes` are set by server-side defaults with no UI, and the four `parking_items` endpoints have no UI at all — they are reachable only via `/docs` or direct HTTP. `STATUS_LABELS` in `App.jsx` maps the enum values to display strings and must stay in sync with `todo_statuses.py`.
