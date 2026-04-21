# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

There is no `tsconfig.json` or scripts in `package.json`. The project likely relies on a global TypeScript runner (e.g. `tsx` or `ts-node`). Install dependencies first:

```bash
npm install
```

Generate the Prisma client after any schema changes:

```bash
npx prisma generate
```

Run database migrations:

```bash
npx prisma migrate dev
```

Inspect the database interactively:

```bash
npx prisma studio
```

## Architecture

This is an Express.js + TypeScript backend implementing the [RealWorld](https://realworld-docs.netlify.app/) API spec — a blogging/social platform.

**Stack:** Express · Prisma ORM · SQLite · JWT (via `jsonwebtoken`) · bcryptjs · Zod · Multer

**Entry points:**
- `src/server.ts` — starts the HTTP server, loads `.env` via `dotenv/config` as the very first import
- `src/app.ts` — creates the Express app, registers all routes and middleware

### Module pattern

Every feature lives under `src/modules/<name>/` and follows a strict 4-layer pattern:

```
route.ts       → endpoint definitions + middleware wiring
controller.ts  → parse/validate HTTP input, call service, format response
service.ts     → business logic and error handling
repository.ts  → Prisma queries only, returns shaped data
```

Supporting files per module: `*.type.ts` (TypeScript interfaces), `*.validator.ts` (Zod schemas).

### Request flow

```
HTTP → route → [auth middleware] → controller → service → repository → Prisma → SQLite
```

### Authentication

- Token format: `Authorization: Token <jwt>` (not Bearer — RealWorld spec)
- JWT payload contains `userId` and `username`, expires in 7 days
- Two auth middleware variants: `authenticate()` (required) and `optionalAuthenticate()` (guest-friendly)
- The Express `Request` type is extended in `src/modules/type/express.d.ts` to carry `req.user`

### Database

- SQLite file at `prisma/dev.db`; path controlled by `DATABASE_URL` in `.env`
- Prisma singleton in `src/config/db.ts` — always import `prisma` from there, never instantiate `PrismaClient` directly
- Cascading deletes are set on `Comment`, `ArticleTag`, and `Favorite` when an `Article` is deleted

### Key conventions

- Article slugs are generated as `title-timestamp` and must be unique
- File uploads (avatars) land in `public/uploads/`; served at `/uploads/*`; PNG/JPG only, 2 MB max
- All validation uses Zod `safeParse()` — check `.success` before using `.data`
- Error responses follow RealWorld format: `{ errors: { body: ["..."] } }` (see `src/modules/utils/response.ts`)
- Pagination uses `limit` (default 20, max 100) and `offset` (default 0) query params (see `src/modules/utils/pagination.ts`)

### Environment variables

| Variable | Default | Purpose |
|---|---|---|
| `DATABASE_URL` | `file:./prisma/dev.db` | Prisma connection string |
| `JWT_SECRET` | *(must be set)* | JWT signing secret |
| `PORT` | `3000` | HTTP listen port |
