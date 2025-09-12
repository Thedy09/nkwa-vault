# Scripts ACV - African Culture Vault

Ce dossier contient les scripts utilitaires pour gérer le projet African Culture Vault.

## 📋 Scripts disponibles

### 🚀 `deploy.sh` - Déploiement complet
Déploie et démarre tous les services de l'application.

```bash
./scripts/deploy.sh [environment]
```

**Paramètres:**
- `environment` (optionnel): `development` (par défaut) ou `production`

**Fonctionnalités:**
- ✅ Vérification des prérequis (Node.js, npm)
- 📦 Installation des dépendances
- 🏗️ Build du frontend
- 🧪 Tests des services
- 🚀 Démarrage du backend et frontend
- 📊 Affichage des informations de déploiement

### 🛑 `stop.sh` - Arrêt des services
Arrête tous les services en cours d'exécution.

```bash
./scripts/stop.sh
```

**Fonctionnalités:**
- 🛑 Arrêt des processus via PIDs sauvegardés
- 🔍 Recherche et arrêt des processus Node.js liés au projet
- 🔌 Libération des ports 3000 et 4000
- 🗑️ Nettoyage des fichiers temporaires

### 🧪 `testServices.js` - Tests des services
Teste tous les services backend (Hedera, IPFS, MongoDB).

```bash
node backend/scripts/testServices.js
```

**Fonctionnalités:**
- 🚀 Test des services Hedera (NFT, HCS)
- 🌐 Test des services IPFS
- 🗄️ Test de la connexion MongoDB
- 📊 Rapport détaillé des tests

### 🎨 `createToken.js` - Création de token NFT
Crée un token NFT pour le patrimoine culturel.

```bash
node backend/scripts/createToken.js
```

**Fonctionnalités:**
- 🎨 Création d'un token NFT "ACV Heritage"
- ✅ Validation des variables d'environnement
- 📝 Logs détaillés du processus

### 🚀 `start.js` - Démarrage du serveur
Démarre le serveur backend avec validation de la configuration.

```bash
node backend/scripts/start.js
```

**Fonctionnalités:**
- ✅ Vérification des variables d'environnement requises
- 📋 Affichage de la configuration
- 🚀 Démarrage du serveur avec gestion d'erreurs

## 🔧 Configuration requise

### Variables d'environnement (.env)
```env
# Configuration du serveur
PORT=4000
NODE_ENV=development

# Base de données
MONGODB_URI=mongodb://localhost:27017/african-culture-vault

# JWT
JWT_SECRET=your-secret-key

# CORS
FRONTEND_URL=http://localhost:3000

# Hedera (Mode démo)
HEDERA_OPERATOR_ID=demo-operator-id
HEDERA_OPERATOR_KEY=demo-operator-key
HEDERA_NETWORK=testnet

# IPFS (Mode démo)
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_KEY=demo-api-key
IPFS_API_SECRET=demo-api-secret

# Cloudinary (Mode démo)
CLOUDINARY_CLOUD_NAME=demo-cloud
CLOUDINARY_API_KEY=demo-api-key
CLOUDINARY_API_SECRET=demo-api-secret
```

## 📱 Utilisation rapide

### Démarrage complet
```bash
# Déployer l'application
./scripts/deploy.sh

# Accéder à l'application
# Frontend: http://localhost:3000
# Backend: http://localhost:4000
```

### Arrêt
```bash
# Arrêter tous les services
./scripts/stop.sh
```

### Tests
```bash
# Tester les services
node backend/scripts/testServices.js

# Créer un token NFT
node backend/scripts/createToken.js
```

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Vérifier les ports utilisés
lsof -i :3000
lsof -i :4000

# Arrêter les processus
./scripts/stop.sh
```

### Erreurs de dépendances
```bash
# Réinstaller les dépendances
cd backend && npm install
cd frontend && npm install
```

### Problèmes de base de données
```bash
# Tester la connexion
node backend/scripts/testServices.js
```

## 📊 Monitoring

### Vérifier le statut
```bash
# Backend
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000
```

### Logs
```bash
# Backend (si démarré manuellement)
cd backend && node src/server.js

# Frontend (si démarré manuellement)
cd frontend && npm start
```

## 🔄 Mise à jour

```bash
# Arrêter les services
./scripts/stop.sh

# Mettre à jour le code
git pull

# Redéployer
./scripts/deploy.sh
```

---

**Note:** Tous les scripts sont conçus pour fonctionner en mode démo par défaut. Pour la production, configurez les vraies clés API dans le fichier `.env`.


