# sikandar-app

Monorepo with `backend-server` (Express/Mongo) and `frontend-app` (Ionic/Angular).

Local run

1. Backend — from repo root:

```bash
cd backend-server
npm install
npm run start
```

2. Frontend — from repo root:

```bash
cd frontend-app
npm install
npm run dev
```

Or run both in separate terminals; `frontend-app` `npm run dev` starts a mock API and `ng serve` concurrently.

CI

A simple GitHub Actions workflow builds the frontend on push and pull requests.
