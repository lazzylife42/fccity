# FC City - Site Web et Boutique

Application web pour le FC City comprenant un site web informatif et une boutique en ligne pour commander des articles du club.

## Structure du projet

- `public/` - Fichiers statiques (HTML, CSS, JS, images)
- `server.js` - Serveur Express pour gérer l'API et servir les fichiers statiques
- `Dockerfile` - Configuration pour créer l'image Docker
- `docker-compose.yml` - Configuration pour orchestrer les conteneurs Docker
- `pb_data/` - Données PocketBase (structure conservée, comptes exclus)
- `pb_migrations/` - Migrations PocketBase

## Dépendances

- **Express** - Framework web pour Node.js
- **PocketBase** - Base de données et backend pour stocker les produits et gérer l'administration
- **Nodemailer** - Pour l'envoi d'emails de confirmation
- **SendGrid** - Service d'envoi d'emails
- **Cloudflare Tunnel** - Pour exposer l'application sur Internet sans ouvrir de ports (optionnel)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-nom/fccity.git
cd fccity
```

### 2. Configurer les variables d'environnement

Créez un fichier `.env` en copiant `exemple.env` :

```bash
cp exemple.env .env
```

Modifiez le fichier `.env` pour configurer vos propres variables :
- `SENDGRID_API_KEY` : Votre clé API SendGrid pour l'envoi d'emails
- `STORE_EMAIL` : Email qui recevra les notifications de commande
- `POCKETBASE_URL` : URL de votre instance PocketBase (mettre l'IP du serveur)
- `CLOUDFLARE_TUNNEL_TOKEN` : Token Cloudflare Tunnel si vous souhaitez exposer votre site (optionnel)

### 3. Lancer l'application avec Docker

```bash
docker-compose up -d
```

L'application sera accessible à :
- Site web : http://localhost:3000
- Admin PocketBase : http://localhost:8090/_/

## Première configuration

La base de données est pré-structurée avec la collection 'articles' prête à l'emploi, mais vous devrez créer votre propre compte administrateur:

1. Démarrez l'application avec `docker-compose up -d`
2. Accédez à http://localhost:8090/_/
3. Suivez les instructions pour créer un compte administrateur
4. Une fois connecté, vous pourrez immédiatement gérer les produits dans la collection 'articles'

## Ajout de produits

1. Connectez-vous à l'admin PocketBase : http://localhost:8090/_/
2. Sélectionnez la collection "articles"
3. Cliquez sur "New record"
4. Remplissez les détails du produit :
   - Nom, prix, catégorie
   - Image du produit
   - Pour les tailles, utilisez un tableau JSON : `["S", "M", "L", "XL"]`
5. Cliquez sur "Create"

## Modification du site

Les fichiers du site sont dans le dossier `public/` :
- `public/index.html` - Page d'accueil
- `public/html/boutique.html` - Page de la boutique
- `public/html/leclub.html` - Page d'information sur le club
- `public/css/styles.css` - Styles CSS
- `public/img/` - Images du site

Après modification des fichiers, aucun redémarrage n'est nécessaire car les fichiers statiques sont montés en volume.

## Fonctionnement technique

### PocketBase
- Sert de base de données et d'API pour les produits de la boutique
- Gère l'authentification administrateur
- Stocke les images des produits

### Express
- Gère les requêtes API pour la boutique
- Agit comme proxy pour les images de PocketBase
- Traite les soumissions de commandes

### SendGrid
- Utilisé pour envoyer des emails de confirmation aux clients
- Envoie également des notifications au magasin pour les nouvelles commandes

### Cloudflare Tunnel (optionnel)
- Permet l'accès externe à l'application sans exposer de ports
- Fournit une couche de sécurité supplémentaire
- Permet d'obtenir un certificat SSL automatiquement

## Déploiement sur un VPS

Pour déployer sur un VPS, suivez ces étapes:

1. Installez Docker et Docker Compose:
   ```bash
   sudo apt update
   sudo apt install -y docker.io docker-compose
   ```

2. Clonez le dépôt et configurez comme indiqué ci-dessus

3. Configurez votre fichier `.env` avec l'IP publique de votre VPS:
   ```
   POCKETBASE_URL=http://votre-ip-vps:8090
   ```

4. Lancez l'application:
   ```bash
   docker-compose up -d
   ```

5. Si vous utilisez Cloudflare Tunnel, configurez les routes dans l'interface Cloudflare

## Mise à jour de l'application

Pour mettre à jour l'application:

```bash
git pull
docker-compose down
docker-compose up -d --build
```

## Problèmes courants

- **Les images ne s'affichent pas** : Vérifiez que `POCKETBASE_URL` pointe vers la bonne adresse
- **Les emails ne sont pas envoyés** : Vérifiez votre clé API SendGrid et les paramètres d'envoi
- **Erreur de connexion à PocketBase** : Assurez-vous que les volumes sont correctement montés
- **Le site est accessible localement mais pas à distance** : Vérifiez la configuration du pare-feu et de Cloudflare Tunnel

## Sauvegarde

Pour sauvegarder les données de l'application:

```bash
# Arrêtez les conteneurs
docker-compose down

# Sauvegardez les données PocketBase
tar -czvf pb_data_backup.tar.gz pb_data/

# Redémarrez les conteneurs
docker-compose up -d
```

## Sécurité

- Les variables d'environnement sensibles sont stockées dans le fichier `.env` qui est exclu du dépôt Git
- Le compte administrateur PocketBase est créé manuellement lors de la première utilisation
- Cloudflare Tunnel fournit un accès sécurisé sans ouvrir de ports directement
