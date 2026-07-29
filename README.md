# Eisenhower Todo Workspace 

## Overview

Personal app for organizing daily tasks using the Eisenhower Matrix organization system and for learning FastAPI and ReactJS. (WIP) 

## Setting Up

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload   # http://localhost:8000
```
Interactive API docs at `http://localhost:8000/docs`.

**Run uvicorn from inside `backend/`, not the repo root.** Currently uses SQLite storage and creates a new db on startup if one isn't already available. Defaults to `sqlite:///./test.db`. 

### Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:5173
npm run build
npm run lint    # eslint
```
