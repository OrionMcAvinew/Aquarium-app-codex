# ReefOps

ReefOps is a full-stack aquarium/fish management platform in a pnpm monorepo:
- **API:** NestJS + Prisma + PostgreSQL + Redis + BullMQ + Socket.IO
- **Web:** Next.js + TypeScript + Tailwind + React Query provider
- **Infra:** Docker Compose, CI, tests, seed/demo mode, local mailbox/uploads simulation

---

## 1) Prerequisites

Install locally:
- Docker + Docker Compose
- Node.js 20+ (required, see section 1.1)
- pnpm 9+

Optional (if you use Make targets):
- GNU Make

---

## 1.1) Required runtime versions (important)

ReefOps requires:
- **Node.js 20+**
- **pnpm 9+**

If you see:
`ERROR: This version of pnpm requires at least Node.js v18.12 (current v16.x)`
then upgrade Node first, then enable pnpm via Corepack:

```bash
nvm install 20
nvm use 20
corepack enable
corepack prepare pnpm@9.15.0 --activate
pnpm -v
```

Alternative with fnm:

```bash
fnm install 20
fnm use 20
corepack enable
corepack prepare pnpm@9.15.0 --activate
```

## 2) Fastest way to launch everything

### Option A (easiest)
```bash
make run
```

`make run` does first-time setup automatically (copies `.env` files if missing, installs deps) and then starts Docker Compose (`postgres`, `redis`, `api`, `web`).

### Option B (manual)
```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm i
pnpm dev
```

---

## 3) First-time startup (exact sequence)

From repository root:

```bash
make run
```

That single command will:
1. create `.env`, `apps/api/.env`, and `apps/web/.env` from templates (if missing),
2. install dependencies with `pnpm i`,
3. start the full stack with Docker Compose.

Then verify:

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/metrics
```

Open in browser:
- Web app: http://localhost:3000
- Swagger UI: http://localhost:3001/docs

---

## 4) Demo mode credentials

Use this seeded login:
- Email: `owner@reefops.local`
- Password: `ChangeMe123!`

Seed includes:
- Demo org and owner membership
- Demo tank (`demo-tank`) + livestock timeline
- 30 fish + 20 coral + 10 invert species profiles
- Water test history, task templates, dosing data

---

## 5) Daily development commands

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

or:

```bash
make lint
make test
make build
make e2e
```

Simple lifecycle commands:

```bash
make start      # start stack
make stop       # stop stack
make restart    # restart stack
make status     # show running services
make logs       # follow logs
make doctor     # show local tool versions
make help       # print all quick commands
```

---

## 6) Key API endpoints

Auth:
- `POST /v1/auth/register`
- `POST /v1/auth/login`
- `POST /v1/auth/refresh`
- `POST /v1/auth/forgot-password`
- `POST /v1/auth/reset-password`

Organizations/RBAC:
- `GET /v1/orgs`
- `POST /v1/orgs`
- `POST /v1/orgs/:orgId/members`

Reef operations:
- `GET /v1/tanks`
- `POST /v1/tanks`
- `POST /v1/tanks/:tankId/livestock`
- `GET /v1/tanks/:tankId/timeline`
- `POST /v1/tanks/:tankId/water-tests`
- `POST /v1/tanks/:tankId/water-tests/import`
- `GET /v1/tanks/:tankId/weekly-plan`
- `POST /v1/tasks/complete`
- `POST /v1/tanks/:tankId/dosing-plans`
- `GET /v1/tanks/:tankId/dosing-summary`
- `GET /v1/tanks/:tankId/stocking-risk`
- `POST /v1/alerts/evaluate`
- `POST /v1/suggestions`

Operational:
- `GET /v1/audit`
- `GET /v1/notifications/preferences`
- `POST /v1/notifications/preferences`
- `POST /v1/uploads/photo`
- `POST /v1/orgs/:orgId/invites` (writes mailbox files)
- `POST /v1/invites/accept`
- `GET /v1/species`
- `GET /v1/tanks/:tankId/compatibility-report`

Realtime + jobs:
- Socket.IO namespace: `/telemetry`
- Events: `telemetry`, `telemetry-alert`
- BullMQ repeatable telemetry job stores simulated equipment readings in Postgres every 4 seconds

---

## 7) Security and behavior notes

- Passwords are hashed with `argon2`.
- Access + refresh JWT flow implemented.
- Refresh token rotation is persisted in DB (hashed + revocation).
- Request validation uses Nest `ValidationPipe` with whitelist/non-whitelisted rejection.
- Role enforcement is present via guard/decorator workflow.
- Correlation IDs are attached via middleware (`x-correlation-id`).
- Throttling is enabled.

---

## 8) Troubleshooting

### `pnpm` install fails behind proxy/network policy
If your environment blocks registry access:
- run in a network-enabled environment, then:
  - `pnpm i`
  - `pnpm dev`
  - `pnpm lint && pnpm test && pnpm test:e2e`

### App starts but DB tables are missing
Use API container startup logs; Prisma generate/migrate/seed are part of API startup command in Dockerfile.


### `pnpm i` says `Invalid package.json`
Most often this is one of these:
- You're running from the wrong folder (not repo root).
- Your local branch has unresolved merge markers (`<<<<<<<`, `=======`, `>>>>>>>`) in `package.json` or another JSON file.
- Node/pnpm mismatch cached old lock metadata.

Quick checks:
```bash
pwd
node -v
pnpm -v
rg -n "^(<<<<<<<|=======|>>>>>>>)" package.json apps/**/package.json
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('root package.json ok')"
```

### Merge conflict question: current, incoming, or both?
Short answer: **usually neither blindly**.
- Use **both** only after manually merging line-by-line and removing conflict markers.
- For `package.json` and lockfiles, prefer the version that preserves all required scripts/dependencies, then run install and tests.
- If unsure in this repo, keep the simplified DX commands (`make run`, `make start`, `make stop`) and runtime constraints (`Node 20+`, `pnpm 9+`).

Safe conflict workflow:
```bash
git status
# open conflicted files and resolve manually
rg -n "^(<<<<<<<|=======|>>>>>>>)" .
git add <resolved-files>
git commit
```

### Mail/invite verification
Check generated files under `./mailbox`.

### Upload verification
Uploaded files are stored under `./uploads`.

---

## 9) Repository layout

- `apps/api` — NestJS backend
- `apps/web` — Next.js frontend
- `packages/shared` — shared contracts/types
- `packages/ui` — shared UI helper utilities
- `docs` — architecture, ADRs, implementation plan
