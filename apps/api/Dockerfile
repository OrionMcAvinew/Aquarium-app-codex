FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-workspace.yaml ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN corepack enable && pnpm i --filter @reefops/api... --filter @reefops/shared...
COPY . .
WORKDIR /app/apps/api
CMD ["sh", "-c", "pnpm prisma:generate && pnpm prisma:migrate && pnpm prisma:seed || true && pnpm dev"]
