.PHONY: up down logs build setup

# ─── Variáveis ───────────────────────────────────────────────────────────────
COMPOSE = docker compose

# ─── Targets ─────────────────────────────────────────────────────────────────

## Sobe todos os serviços em background
up:
	$(COMPOSE) up -d

## Para e remove os containers (mantém volumes)
down:
	$(COMPOSE) down

## Exibe logs em tempo real (todos os serviços)
logs:
	$(COMPOSE) logs -f

## Faz o build da imagem da aplicação sem usar cache
build:
	$(COMPOSE) build --no-cache

## Instala dependências, gera tipos Nuxt e sobe o ambiente usando o Docker
setup:
	$(COMPOSE) build
	$(COMPOSE) up -d
