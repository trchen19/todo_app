# Eisenhower Todo Workspace: 

## Overview

Personal app for organizing daily tasks using the Eisenhower Matrix organization system and for learning FastAPI and ReactJS. Currenlty a WIP. 

## Setting Up

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
