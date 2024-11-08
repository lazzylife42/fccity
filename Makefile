# Nom de l'image et du conteneur
IMAGE_NAME=fc-city-image
CONTAINER_NAME=fc-city-container

# Port configurable (par défaut 3000)
PORT=3000
ADMIN_PORT=8090

# Commande pour Docker
DOCKER=docker

# Construire l'image Docker
build:
	$(DOCKER) build -t $(IMAGE_NAME) .

# Lancer le conteneur avec vérification des ports
up:
	if lsof -i :$(PORT); then \
            echo "Port $(PORT) already in use. Please use a different port."; \
        elif lsof -i :$(ADMIN_PORT); then \
            echo "Port $(ADMIN_PORT) already in use. Please use a different port."; \
        else \
            $(DOCKER) run -d --name $(CONTAINER_NAME) -p $(PORT):3000 -p $(ADMIN_PORT):8090 $(IMAGE_NAME); \
        fi

# Arrêter et supprimer le conteneur
down:
	$(DOCKER) stop $(CONTAINER_NAME) && $(DOCKER) rm $(CONTAINER_NAME)

# Supprimer l'image, conteneur et nettoyer le système avec délai pour libérer les ressources
nuke:
	$(DOCKER) stop $(CONTAINER_NAME) || true && $(DOCKER) rm $(CONTAINER_NAME) || true
	sleep 2
	$(DOCKER) rmi $(IMAGE_NAME) || true
	$(DOCKER) system prune -a -f --volumes

re: down build up

# Voir les logs du conteneur
logs:
	$(DOCKER) logs -f $(CONTAINER_NAME)

# Vérifier l'état du conteneur
status:
	$(DOCKER) ps -a | grep $(CONTAINER_NAME)

.PHONY: build up down nuke logs status
