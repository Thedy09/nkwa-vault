# AGENTS.md

## Cursor Cloud specific instructions

Nkwa V is an npm-workspaces monorepo with three parts: `frontend` (React 18 / CRA), `backend`
(Express 5 + Prisma + PostgreSQL, also acts as a Web3 relayer), and `contracts` (a Vyper smart
contract). Standard scripts live in the root, `backend/`, and `frontend/` `package.json` files
(`npm run dev`, `dev:backend`, `dev:frontend`, `build`, etc.) — read those instead of memorizing commands.

### Services and how to run
- Backend API: `cd backend && npm run dev` (nodemon, port 4000). Health: `GET http://localhost:4000/health`.
- Frontend: `cd frontend && BROWSER=none npm start` (CRA dev server, port 3000; talks to the API at
  `http://localhost:4000` by default via `REACT_APP_API_URL`).
- Root `npm run dev` runs both concurrently.

### Non-obvious caveats
- **PostgreSQL is required but is NOT auto-started on boot.** Start it each session with
  `sudo pg_ctlcluster 16 main start` before running the backend. The dev DB/role already exist in the
  snapshot: role `nkwa_user` / password `nkwa_secure_2024`, database `nkwa_vault`.
- **`backend/.env` is gitignored** (not in the repo) but persists in the VM snapshot. If it is ever
  missing, recreate it with at least `DATABASE_URL="postgresql://nkwa_user:nkwa_secure_2024@localhost:5432/nkwa_vault?schema=public"`,
  `JWT_SECRET`, `PORT=4000`, `FRONTEND_URL=http://localhost:3000`, `REDIS_ENABLED=false`. See `backend/env.example`.
- **Apply DB migrations after Postgres is up:** `cd backend && npx prisma migrate deploy`
  (migrations are committed under `backend/prisma/migrations`). `prisma generate` already runs via root
  `postinstall`.
- **Web3 (EVM), IPFS, and Redis run in "demo mode"** when their env vars are unset — the startup logs
  print `mode démo` / `Redis désactivé` warnings. This is expected locally and is NOT a failure; the app
  is fully usable (auth, content, virtual museum) without them. A true on-chain certification end-to-end
  test additionally needs `EVM_RPC_URL` + `EVM_RELAYER_PRIVATE_KEY` + a deployed `EVM_REGISTRY_CONTRACT`
  and an IPFS provider.
- Auth is DB-backed when `DATABASE_URL` is reachable; it silently falls back to an in-memory demo store
  otherwise. Seeded/default accounts: `admin@acv.africa`/`admin123` (created on backend startup) and demo
  `demo@nkwa.africa`/`demo123`.

### Lint / test gotchas (pre-existing repo state)
- `backend` lint is broken: `npm run lint` fails with "ESLint couldn't find a configuration file"
  (no `.eslintrc` in `backend/`). `frontend` lint works (`cd frontend && npm run lint`, warnings only).
- `backend` test script fails on config collision (both `jest.config.js` and a `jest` key in
  `package.json`). Run backend tests with an explicit config: `cd backend && npx jest --config jest.config.js`.
- Many backend and frontend tests currently fail on their own (stale mocks / outdated assertions vs. the
  live components and hardcoded museum data) — these are pre-existing and unrelated to environment setup.
  The test harnesses themselves run fine.
