# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack Todo app for learning FastAPI (backend) and React (frontend). The backend uses an in-memory list for storage — there is no database.

## Commands

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # runs on http://localhost:8000
```
Interactive API docs available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev    # runs on http://localhost:5173
npm run build
```

Both servers must be running simultaneously for the app to work.

## Architecture

### Backend (`backend/main.py`)
Single-file FastAPI app. All state lives in a module-level `todos: list[Todo]` and `next_id: int`. Three Pydantic models handle I/O:
- `TodoCreate` — request body for POST
- `TodoUpdate` — partial request body for PUT (all fields optional)
- `Todo` — full response shape

CORS is configured to allow only `http://localhost:5173`.

### Frontend (`frontend/src/`)
Single-component React app (`App.jsx`). All state (`todos`, `input`) lives in `App` via `useState`. Data is fetched on mount via `useEffect`. Each API mutation (add, toggle, delete) updates the server then updates local state directly — no re-fetch.

`App.css` contains all styles. `index.css` contains Vite's base/reset styles.

## API Contract

| Method | Path | Body | Description |
|--------|------|------|-------------|
| GET | `/todos` | — | Returns `Todo[]` |
| POST | `/todos` | `{ title: string }` | Returns `Todo` (201) |
| PUT | `/todos/{id}` | `{ title?, completed? }` | Returns updated `Todo` |
| DELETE | `/todos/{id}` | — | 204 No Content |
