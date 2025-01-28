# Étape 1 : Utilisation d'une image Node.js officielle
FROM node:18-bullseye

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js
RUN npm install && npm install node-fetch

# Étape 2 : Télécharger PocketBase
RUN apt-get update && apt-get install -y curl unzip && \
    if [ "$(uname -m)" = "aarch64" ] || [ "$(uname -m)" = "arm64" ]; then \
        curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.7/pocketbase_0.16.7_linux_arm64.zip; \
    else \
        curl -L -o pocketbase.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.7/pocketbase_0.16.7_linux_amd64.zip; \
    fi && \
    unzip pocketbase.zip && \
    rm pocketbase.zip && \
    chmod +x pocketbase

# Étape 3 : Copier le reste des fichiers dans le conteneur
COPY . .

# Étape 4 : Exposer les ports pour le serveur Express et PocketBase
EXPOSE 8090 3000

# Étape 5 : Commande pour exécuter PocketBase et le serveur Node.js
CMD ["sh", "-c", "./pocketbase serve --http=0.0.0.0:8090 & node src/server.js"]