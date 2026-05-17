# --------------------------------------------------
# Variables
# --------------------------------------------------
DOCKER_COMPOSE := docker compose
APP_CONTAINER := frontend
DB_CONTAINER := ningiahub-db




# --------------------------------------------------
# Docker
# --------------------------------------------------
build: ## Build les images Docker
	$(DOCKER_COMPOSE) build

rebuild: ## Rebuild complet sans cache
	$(DOCKER_COMPOSE) build --no-cache

up: ## Démarre les conteneurs
	$(DOCKER_COMPOSE) up -d

down: ## Stoppe et supprime les conteneurs
	$(DOCKER_COMPOSE) down --remove-orphans

stop: ## Stoppe les conteneurs
	$(DOCKER_COMPOSE) stop

restart: ## Redémarre les conteneurs
	$(DOCKER_COMPOSE) restart

ps: ## Affiche l'état des conteneurs
	$(DOCKER_COMPOSE) ps

logs: ## Affiche tous les logs
	$(DOCKER_COMPOSE) logs -f

logs-api: ## Affiche les logs de l'API
	$(DOCKER_COMPOSE) logs -f $(APP_CONTAINER)

logs-db: ## Affiche les logs de PostgreSQL
	docker logs -f $(DB_CONTAINER)
