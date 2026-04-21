# Copy Project

A full-stack RealWorld/Conduit-style blogging platform.

## Stack

- Frontend: React 19, TypeScript, Vite, React Router 7, Zustand
- Backend: Express, TypeScript, Prisma, SQLite, JWT, Zod, Multer

## Project structure

- `frontend/`: web app
- `backend/`: API server and Prisma schema
- `backend/prisma/`: SQLite schema, migrations, local database files

## Prerequisites

- Node.js 22+
- npm

## Environment

Create local environment files from the examples:

```bash
copy backend\.env.example backend\.env
copy frontend\.env.example frontend\.env
```

Required backend variables:

- `JWT_SECRET`: required, no fallback is used
- `DATABASE_URL`: SQLite connection string, e.g. `file:./dev.db`
- `PORT`: optional, defaults to `3000`, must be an integer between `1` and `65535`
- `NODE_ENV`: optional, defaults to `development`, must be one of `development`, `test`, or `production`
- `LOG_LEVEL`: optional, one of `debug`, `info`, `warn`, `error`
- `RATE_LIMIT_WINDOW_MS`: optional, request limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: optional, max requests per window for protected endpoints
- `CORS_ORIGIN`: optional, `*` or a comma-separated list of allowed frontend origins
- `TRUST_PROXY`: optional, set to `1` or `true` when running behind Render, Railway, Caddy, or another reverse proxy
- `PUBLIC_APP_URL`: optional, forces uploaded asset URLs to use a specific public backend origin
- `UPLOADS_DIR`: optional, defaults to `backend/public/uploads` for local development

Frontend variables:

- `VITE_API_BASE_URL`: API base URL, usually `http://localhost:3000/api`

## Install

Dependencies are already present in this workspace, but on a clean checkout run:

```bash
npm install
cd backend && npm install
cd ..\frontend && npm install
```

## Run locally

Start the backend:

```bash
npm run dev:backend
```

Start the frontend in a second terminal:

```bash
npm run dev:frontend
```

## Operations

- `GET /healthz`: process health
- `GET /readyz`: database readiness check
- Request logging is structured JSON and includes `requestId`
- Auth and upload endpoints have lightweight in-memory rate limiting

## CI and containers

- GitHub Actions CI is defined in [.github/workflows/ci.yml](</E:/copy-project/.github/workflows/ci.yml>)
- Dockerfiles are provided for [backend/Dockerfile](</E:/copy-project/backend/Dockerfile>) and [frontend/Dockerfile](</E:/copy-project/frontend/Dockerfile>)
- A local container deployment is provided in [docker-compose.yml](</E:/copy-project/docker-compose.yml>)
- A Render blueprint for the backend is provided in [render.yaml](</E:/copy-project/render.yaml>)
- A Vercel + Render deployment guide is provided in [DEPLOY_VERCEL_RENDER.md](</E:/copy-project/DEPLOY_VERCEL_RENDER.md>)

## Test

Run backend integration tests:

```bash
npm test
```

The test suite uses a separate SQLite file under `backend/test/test.db` and resets data between tests.

## Backend API coverage

The current test suite covers the main user flows:

- register and login
- current user fetch and update
- article create, update, list, favorite, unfavorite, delete
- comment create, list, delete
- follow, unfollow, personalized feed

## Notes

- Uploaded avatars are served from `backend/public/uploads/` by default and can be moved with `UPLOADS_DIR`
- SQLite runtime files and uploads are ignored via `.gitignore`
- The frontend fallback to the public RealWorld API should not be relied on for local development
