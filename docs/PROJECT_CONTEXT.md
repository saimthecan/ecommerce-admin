# Project Context

## Overview
- Repo has two apps: `frontend/` (Vite + React + TypeScript) and `backend/` (FastAPI).
- This is not a monorepo tool setup (no pnpm/turbo/nx/lerna/yarn workspace configs).

## Structure
- `frontend/` Vite app, React UI, Redux Toolkit, React Router.
- `backend/` FastAPI app with SQLAlchemy, auth, and versioned API routes.

## Backend runtime and config
- Default dev server runs on port 8000 (Uvicorn default).
- Env config is read from `backend/.env` via `backend/app/core/config.py`.
- API prefix is `API_V1_PREFIX` in `backend/app/core/config.py` (default `/api/v1`).
- CORS is enabled in `backend/app/main.py`, using `BACKEND_CORS_ORIGINS` from `backend/app/core/config.py`.

## Frontend API base URL
- API base URL is hardcoded in `frontend/src/api/client.ts`:
  - `http://127.0.0.1:8000/api/v1`
- If you change backend host/port or API prefix, update this file (or introduce an env-based config).

## Auth and security
- Auth routes live in `backend/app/api/v1/routes_auth.py`.
- JWT creation/verification is in `backend/app/core/security.py`.
- Secret and token settings live in `backend/app/core/config.py`.
