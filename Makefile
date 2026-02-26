.PHONY: dev up down logs ps lint test build e2e

dev:
	docker compose up --build

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f --tail=150

ps:
	docker compose ps

lint:
	pnpm lint

test:
	pnpm test

build:
	pnpm build

e2e:
	pnpm --filter @reefops/web test:e2e
