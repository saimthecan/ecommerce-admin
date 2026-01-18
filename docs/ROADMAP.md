# Roadmap

## Backend
### Done
- FastAPI app skeleton with versioned routes (`backend/app/api/v1`).
- Auth endpoints and JWT utilities.
- Database models/schemas/crud layers are in place.

### Doing
- Verify runtime config and secrets handling in `.env`.

### Todo
- Add automated tests and a consistent test runner.
- Add linting/formatting tooling for Python (ruff/black/isort).
- Document database setup and migrations (if any).

## Frontend
### Done
- Vite + React + TypeScript baseline with routes and layout shells.
- Redux store and feature slices for core domains.
- API client with auth token injection.

### Doing
- Align frontend API base URL with env-based config.

### Todo
- Add linting rules beyond template defaults if needed.
- Add UI tests (component or e2e) and a test runner.
- Document data flow per feature (auth, products, categories, orders).
