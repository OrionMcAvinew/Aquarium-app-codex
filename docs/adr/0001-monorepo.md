# ADR 0001: Monorepo with pnpm workspaces
- Status: Accepted
- Context: Shared contracts and fast local development.
- Decision: Use pnpm workspace with apps/api, apps/web, packages/shared, packages/ui.
- Consequences: Simpler code sharing and unified CI; requires workspace-aware tooling.
