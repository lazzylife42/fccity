# Configuration
IMAGE_NAME = fc-city-image
CONTAINER_NAME = fc-city-container
APP_PORT = 3000
ADMIN_PORT = 8090
DOCKER = docker

# Couleurs pour les messages
GREEN = \033[0;32m
RED = \033[0;31m
YELLOW = \033[0;33m
NC = \033[0m  # No Color

# Construire l'image Docker
build:
	@echo "$(GREEN)Building Docker image...$(NC)"
	@$(DOCKER) build -t $(IMAGE_NAME) .

# Lancer le conteneur
up:
	@echo "$(GREEN)Starting container...$(NC)"
	@if [ "$$($(DOCKER) ps -q -f name=$(CONTAINER_NAME))" ]; then \
		echo "$(YELLOW)Container already running$(NC)"; \
	else \
		$(DOCKER) run -d --name $(CONTAINER_NAME) \
			-p $(APP_PORT):$(APP_PORT) \
			-p $(ADMIN_PORT):$(ADMIN_PORT) \
			$(IMAGE_NAME) && \
		echo "$(GREEN)Container started successfully on ports $(APP_PORT) and $(ADMIN_PORT)$(NC)"; \
	fi

# Arrêter et supprimer le conteneur
down:
	@echo "$(YELLOW)Stopping and removing container...$(NC)"
	@$(DOCKER) stop $(CONTAINER_NAME) 2>/dev/null || true
	@$(DOCKER) rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "$(GREEN)Container stopped and removed$(NC)"

# Nettoyer complètement le système Docker
nuke:
	@echo "$(RED)Cleaning up Docker system...$(NC)"
	@$(DOCKER) stop $(CONTAINER_NAME) 2>/dev/null || true
	@$(DOCKER) rm $(CONTAINER_NAME) 2>/dev/null || true
	@echo "$(YELLOW)Waiting for resources to be released...$(NC)"
	@sleep 2
	@$(DOCKER) rmi $(IMAGE_NAME) 2>/dev/null || true
	@$(DOCKER) system prune -a -f --volumes
	@echo "$(GREEN)Docker system cleaned$(NC)"

# Reconstruction complète
re: down build up

# Afficher les logs du conteneur
logs:
	@echo "$(YELLOW)Showing container logs...$(NC)"
	@$(DOCKER) logs -f $(CONTAINER_NAME)

# Vérifier l'état du conteneur
status:
	@echo "$(YELLOW)Container status:$(NC)"
	@$(DOCKER) ps -a | grep $(CONTAINER_NAME) || echo "$(RED)Container not found$(NC)"

# Afficher l'aide
help:
	@echo "$(YELLOW)Available commands:$(NC)"
	@echo "  make build    - Build Docker image"
	@echo "  make up       - Start container"
	@echo "  make down     - Stop and remove container"
	@echo "  make re       - Rebuild and restart container"
	@echo "  make nuke     - Clean up Docker system"
	@echo "  make logs     - Show container logs"
	@echo "  make status   - Show container status"

.PHONY: build up down nuke re logs status help
