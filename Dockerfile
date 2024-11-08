# Étape 1 : Utilisation d'une image Node.js officielle
FROM node:18

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js et ajouter node-fetch
RUN npm install && npm install node-fetch

# Étape 2 : Télécharger PocketBase en fonction de la plateforme
# Récupère l'architecture de l'OS et télécharge la version appropriée de PocketBase
RUN apt-get update && apt-get install -y curl && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then \
        curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.7/pocketbase_0.16.7_linux_amd64.zip; \
    else \
        echo "Architecture non supportée" && exit 1; \
    fi && \
    unzip pocketbase.zip && \
    rm pocketbase.zip && \
    chmod +x pocketbase

# Étape 3 : Copier le reste des fichiers dans le conteneur
COPY . .

# Étape 4 : Exposer les ports pour le serveur Express et PocketBase
EXPOSE 8090 3000

# Étape 5 : Commande pour exécuter à la fois PocketBase et le serveur Node.js
CMD ["sh", "-c", "./pocketbase serve --http=0.0.0.0:8090 & node src/server.js"]
