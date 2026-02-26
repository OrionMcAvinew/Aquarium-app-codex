FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json
COPY packages/ui/package.json packages/ui/package.json
RUN corepack enable && pnpm i --filter @reefops/web... --filter @reefops/shared... --filter @reefops/ui...
COPY . .
WORKDIR /app/apps/web
CMD ["pnpm", "dev"]
