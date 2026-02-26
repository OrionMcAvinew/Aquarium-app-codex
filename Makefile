.PHONY: help run start stop restart status logs setup init doctor dev up down ps lint test build e2e

help:
	@echo "ReefOps quick commands"
	@echo "  make run      - one command first-time setup + start"
	@echo "  make start    - start app stack (docker compose)"
	@echo "  make stop     - stop app stack"
	@echo "  make restart  - restart app stack"
	@echo "  make status   - show running services"
	@echo "  make logs     - follow service logs"
	@echo "  make doctor   - show node/pnpm/docker versions"
	@echo "  make lint | test | build | e2e"

run: setup start

setup:
	@[ -f .env ] || cp .env.example .env
	@[ -f apps/api/.env ] || cp apps/api/.env.example apps/api/.env
	@[ -f apps/web/.env ] || cp apps/web/.env.example apps/web/.env
	pnpm i

init: setup

start:
	docker compose up --build

dev: start
.PHONY: dev up down logs ps lint test build e2e

dev:
	docker compose up --build

up:
	docker compose up -d --build

stop:
	docker compose down

down: stop

restart: stop up

status:
	docker compose ps

ps: status

logs:
	docker compose logs -f --tail=150

doctor:
	@echo "Node: $$(node -v 2>/dev/null || echo 'not installed')"
	@echo "pnpm: $$(pnpm -v 2>/dev/null || echo 'not installed')"
	@echo "docker: $$(docker --version 2>/dev/null || echo 'not installed')"
	@echo "docker compose: $$(docker compose version 2>/dev/null || echo 'not installed')"
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
