# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start dev server (Vite HMR)
npm run build      # Type-check (tsc -b) then bundle for production
npm run lint       # ESLint static analysis
npm run preview    # Preview production build locally
```

## Environment

Copy or create `.env` with:
```
VITE_API_BASE_URL=http://localhost:3000/api
```
Without this file, the app falls back to `https://api.realworld.show/api`.

## Architecture

This is a **RealWorld-spec blogging platform** (Conduit) built with React 19, TypeScript, Vite, React Router 7, and Zustand.

### Layer responsibilities

| Layer | Path | Purpose |
|---|---|---|
| API client | `src/api/client.ts` | Axios instance — adds `Authorization: Token …` header via request interceptor, clears token on 401 |
| API modules | `src/api/*.ts` | One file per domain (auth, article, comment, profile, tag) |
| Auth store | `src/store/authStore.ts` | Single Zustand store; holds `user`, `isAuthenticated`, `isLoading`. Call `initAuth()` on app boot. |
| Feature hooks | `src/features/*/` | Custom hooks that call API modules and own their local state (loading, error, data) |
| Pages | `src/pages/` | Thin components — compose feature hooks + shared components |
| Components | `src/components/` | Reusable UI split into `article/`, `comment/`, `common/`, `user/` |
| Types | `src/types/` | Shared TypeScript types; no logic |
| Utils | `src/utils/` | `constants.ts` (API_BASE_URL, TOKEN_KEY), `storage.ts` (localStorage token helpers), `error.ts` |

### Routing

Defined in `src/router/index.tsx`. Three route categories:
- **Public**: `/`, `/article/:slug`, `/profile/:username`
- **Guest-only** (`<GuestRoute>`): `/login`, `/register` — redirects authenticated users away
- **Protected** (`<ProtectedRoute>`): `/editor`, `/editor/:slug`, `/settings` — redirects unauthenticated users to login

### State management pattern

Only authentication lives in global Zustand state. Everything else (articles, comments, profiles) is fetched and managed inside feature-level custom hooks in `src/features/`. There is no Redux, React Query, or SWR.

### TypeScript

Strict mode is on (`noUnusedLocals`, `noUnusedParameters`). ESLint uses the flat config format (ESLint 9+) targeting `.ts`/`.tsx` files only.
