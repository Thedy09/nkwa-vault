# 🏆 Nkwa Vault - Version Production

**Plateforme de préservation du patrimoine culturel africain**

## 🚀 Démarrage Rapide

### 1. Installation des Dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configuration de la Base de Données

#### Option A: MongoDB Local
```bash
# Ubuntu/Debian
sudo apt install mongodb

# Démarrer MongoDB
sudo systemctl start mongodb
```

#### Option B: MongoDB Atlas (Recommandé)
1. Créez un compte sur [MongoDB Atlas](https://cloud.mongodb.com/)
2. Créez un cluster gratuit
3. Obtenez votre URI de connexion
4. Configurez le fichier `backend/.env`

### 3. Configuration

Créez le fichier `backend/.env` :

```env
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/nkwa-vault
# ou pour MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nkwa-vault

# Configuration JWT
JWT_SECRET=votre-cle-secrete-jwt-super-securisee
JWT_EXPIRES_IN=7d

# Configuration API
PORT=4000
NODE_ENV=production

# Configuration Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Démarrage

#### Méthode Simple
```bash
./start-production.sh
```

#### Méthode Manuelle
```bash
# Terminal 1 - Backend
cd backend
node src/server.js

# Terminal 2 - Frontend
cd frontend
npm start
```

## 🧪 Test de l'Application

```bash
# Tester l'inscription et l'utilisation
node test-user-registration.js
```

## 👥 Comptes par Défaut

- **Administrateur :** `admin@acv.africa` / `admin123`
- **Utilisateurs :** Inscription libre via l'interface

## 🌟 Fonctionnalités

### ✅ Pour les Utilisateurs
- **Inscription/Connexion** sécurisée
- **Exploration** du musée culturel
- **Jeu de devinettes** interactif
- **Contribution** de contenu culturel
- **Support multilingue** (FR/EN)

### ✅ Pour les Administrateurs
- **Modération** du contenu
- **Gestion** des utilisateurs
- **Statistiques** détaillées
- **Système de validation**

### ✅ Fonctionnalités Techniques
- **Base de données** MongoDB
- **Authentification** JWT
- **API REST** complète
- **Interface responsive**
- **PWA** (Progressive Web App)
- **Animations** Framer Motion

## 🏗️ Architecture

```
frontend/          # Interface React
├── src/
│   ├── components/    # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── contexts/      # Contextes React (Auth, Translation)
│   └── styles/        # Styles CSS

backend/           # API Node.js/Express
├── src/
│   ├── models/        # Modèles Mongoose
│   ├── routes/        # Routes API
│   ├── middleware/    # Middleware personnalisé
│   └── config/        # Configuration

scripts/           # Scripts de déploiement
├── deploy.sh         # Déploiement
├── monitor.sh        # Surveillance
└── stop.sh          # Arrêt
```

## 🔧 Configuration Avancée

### Variables d'Environnement

| Variable | Description | Défaut |
|----------|-------------|---------|
| `MONGODB_URI` | URI de connexion MongoDB | `mongodb://localhost:27017/nkwa-vault` |
| `JWT_SECRET` | Clé secrète JWT | `your-super-secret-jwt-key-here` |
| `JWT_EXPIRES_IN` | Durée de validité JWT | `7d` |
| `PORT` | Port du serveur | `4000` |
| `NODE_ENV` | Environnement | `production` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:3000` |

### Services Optionnels

- **Cloudinary** : Gestion des médias
- **IPFS** : Stockage décentralisé
- **Hedera** : Blockchain pour l'immutabilité

## 🚀 Déploiement

### Vercel (Frontend)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
cd frontend
vercel --prod
```

### Heroku (Backend)
```bash
# Installer Heroku CLI
# Créer une app
heroku create nkwa-vault-api

# Déployer
git push heroku main
```

### Docker
```bash
# Construire l'image
docker build -t nkwa-vault .

# Démarrer le conteneur
docker run -p 3000:3000 -p 4000:4000 nkwa-vault
```

## 📊 Monitoring

```bash
# Surveiller l'application
./scripts/monitor.sh

# Vérifier les logs
tail -f backend/logs/app.log
```

## 🔒 Sécurité

- **Authentification** JWT sécurisée
- **Validation** des données d'entrée
- **Rate limiting** sur les API
- **CORS** configuré
- **Helmet** pour les headers de sécurité

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de connexion MongoDB**
   - Vérifiez que MongoDB est démarré
   - Vérifiez l'URI dans `.env`

2. **Erreur CORS**
   - Vérifiez `FRONTEND_URL` dans `.env`
   - Redémarrez le backend

3. **Erreur d'authentification**
   - Vérifiez `JWT_SECRET` dans `.env`
   - Redémarrez le backend

### Logs

```bash
# Backend
cd backend && node src/server.js

# Frontend
cd frontend && npm start
```

## 📞 Support

- **Documentation** : Voir les fichiers README dans chaque dossier
- **Issues** : Créer une issue sur GitHub
- **Email** : support@nkwa-vault.africa

## 🎯 Roadmap

- [ ] **Mobile App** (React Native)
- [ ] **Blockchain** intégration complète
- [ ] **IA** pour la traduction automatique
- [ ] **AR/VR** pour l'expérience immersive
- [ ] **API** publique pour les développeurs

---

**🏆 Nkwa Vault - Préserver le patrimoine africain pour les générations futures**
