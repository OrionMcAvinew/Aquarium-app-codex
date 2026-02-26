# ReefOps Implementation Plan

## Architecture Plan
- Monorepo with `apps/api`, `apps/web`, `packages/shared`, `packages/ui`, and docs.
- API architecture using NestJS controllers/services and Prisma data access.
- Shared contracts in `@reefops/shared` for frontend/backend type interoperability.
- Redis/BullMQ integration hook, telemetry websocket gateway, and idempotent-friendly services.
- Next.js operational UI with dashboard, forms, and observability pages.

## Milestones
- [x] Baseline tooling + CI + Docker orchestration.
- [x] Auth + refresh rotation + org/member role workflow.
- [x] Tank/livestock CRUD + timeline + photos.
- [x] Water tests + import + alerts + scoring/risk flow.
- [x] Tasks + dosing + telemetry + realtime.
- [x] Notifications + preferences + invites + audit listing.
- [x] Web pages for dashboards and operational domains.

## Remaining production hardening
- [ ] Replace role header mock with true JWT claims/guards per request context.
- [ ] Add Prisma migration files and integration test profile using dedicated DB lifecycle.
- [ ] Wire React Query mutations/forms end-to-end for all pages.
- [ ] Add comprehensive policy tests for every endpoint authorization branch.
