# Deploy To Vercel + Render

This repo is structured so the frontend can be deployed to Vercel and the backend can run as a Render web service with a persistent disk.

## Frontend on Vercel

Create a Vercel project from this repository and use these settings:

- Root Directory: `frontend`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this environment variable in Vercel:

```bash
VITE_API_BASE_URL=https://your-render-service.onrender.com/api
```

Replace the value with your Render custom domain if you attach one later.

## Backend on Render

This repository includes [render.yaml](</E:/copy-project/render.yaml>) for a Node web service under `backend/`.

If you create the service manually, use these settings:

- Root Directory: `backend`
- Build Command: `npm install && npm run build:render`
- Start Command: `npm run start:render`
- Health Check Path: `/healthz`

Attach a persistent disk and mount it at:

```bash
/var/data
```

Set these environment variables in Render:

```bash
NODE_ENV=production
DATABASE_URL=file:/var/data/dev.db
UPLOADS_DIR=/var/data/uploads
TRUST_PROXY=1
JWT_SECRET=replace-with-a-long-random-secret
```

Set `CORS_ORIGIN` to the Vercel app origins that should be allowed to call the API. For example:

```bash
CORS_ORIGIN=https://your-app.vercel.app,https://www.your-domain.com
```

`PUBLIC_APP_URL` is optional. Set it only if you want uploaded asset URLs to always use a specific public backend origin:

```bash
PUBLIC_APP_URL=https://api.your-domain.com
```

## Local Development

Local development still works with the existing defaults:

- backend uploads default to `backend/public/uploads`
- local SQLite still uses `backend/dev.db` via `DATABASE_URL=file:./dev.db`

## Notes

- `start:render` runs `prisma migrate deploy` before starting the server.
- Uploaded avatars are stored under the Render disk mount path when `UPLOADS_DIR` is set.
- The backend now respects proxy headers when `TRUST_PROXY` is configured.
