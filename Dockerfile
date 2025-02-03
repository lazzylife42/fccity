# Étape 1 : Utilisation d'une image Node.js officielle
FROM node:18-bullseye

# Définir le répertoire de travail
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances Node.js (optionnel lors du build, peut être retiré si vous installez au démarrage)
RUN npm install && npm install node-fetch

# Étape 2 : Télécharger et installer PocketBase pour Linux AMD64
RUN apt-get update && apt-get install -y curl unzip && \
    curl -L -o pocketbase_linux.zip https://github.com/pocketbase/pocketbase/releases/download/v0.16.7/pocketbase_0.16.7_linux_amd64.zip && \
    unzip pocketbase_linux.zip && \
    chmod +x ./pocketbase && \
    rm pocketbase_linux.zip

# Étape 3 : Copier le reste des fichiers dans le conteneur
COPY . .

# Étape 4 : Exposer les ports pour le serveur Express et PocketBase
EXPOSE 8090 3000

# Étape 5 : Commande pour installer les packages et exécuter PocketBase et le serveur Node.js
CMD ["sh", "-c", "npm install && ./pocketbase serve --http=0.0.0.0:8090 & node src/server.js"]
