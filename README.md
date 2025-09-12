# 🏆 Nkwa Vault

**Plateforme de préservation du patrimoine culturel africain**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/your-username/nkwa-vault)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-production--ready-brightgreen.svg)]()

## 🌟 Aperçu

Nkwa Vault est une plateforme web innovante dédiée à la préservation, la documentation et la transmission du patrimoine culturel africain. Elle combine technologies modernes et traditions ancestrales pour créer une expérience immersive et éducative.

## ✨ Fonctionnalités

### 🎯 Pour les Utilisateurs
- **🏛️ Musée Virtuel** - Explorez une collection riche d'objets culturels africains
- **🧩 Jeu de Devinettes** - Découvrez la culture à travers des énigmes interactives
- **📝 Contribution** - Partagez vos connaissances culturelles
- **🌍 Multilingue** - Support français et anglais avec détection automatique
- **📱 PWA** - Application web progressive pour mobile et desktop

### 👑 Pour les Administrateurs
- **🔧 Modération** - Gestion complète du contenu
- **👥 Gestion Utilisateurs** - Administration des comptes
- **📊 Statistiques** - Tableaux de bord détaillés
- **✅ Validation** - Système de validation du contenu

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 16+ 
- MongoDB (local ou Atlas)
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone https://github.com/your-username/nkwa-vault.git
cd nkwa-vault

# Installer les dépendances
cd backend && npm install
cd ../frontend && npm install

# Configuration
cp backend/.env.example backend/.env
# Éditer backend/.env avec vos configurations

# Démarrage
cd backend && npm start
cd frontend && npm start
```

### Démarrage Rapide (Script)

```bash
# Utiliser le script de démarrage
./start-production.sh
```

## 🏗️ Architecture

```
nkwa-vault/
├── frontend/          # Interface React
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages de l'application
│   │   ├── contexts/      # Contextes React
│   │   └── styles/        # Styles CSS
│   └── public/            # Assets statiques
├── backend/           # API Node.js/Express
│   ├── src/
│   │   ├── models/        # Modèles Mongoose
│   │   ├── routes/        # Routes API
│   │   ├── middleware/    # Middleware
│   │   └── config/        # Configuration
│   └── logs/              # Logs d'application
└── scripts/           # Scripts de déploiement
    ├── deploy.sh          # Déploiement
    ├── monitor.sh         # Surveillance
    └── stop.sh           # Arrêt
```

## 🛠️ Technologies

### Frontend
- **React 18** - Interface utilisateur
- **Framer Motion** - Animations fluides
- **Axios** - Requêtes HTTP
- **React Context** - Gestion d'état
- **PWA** - Application web progressive

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données
- **Mongoose** - ODM pour MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe

### Déploiement
- **Vercel** - Frontend
- **Heroku** - Backend
- **MongoDB Atlas** - Base de données cloud
- **Docker** - Containerisation

## 📖 API Documentation

### Authentification
```http
POST /auth/register    # Inscription
POST /auth/login       # Connexion
GET  /auth/me          # Profil utilisateur
POST /auth/logout      # Déconnexion
```

### Devinettes
```http
GET  /riddles          # Liste des devinettes
POST /riddles          # Créer une devinette
GET  /riddles/featured # Devinettes en vedette
GET  /riddles/popular  # Devinettes populaires
```

### Musée
```http
GET  /museum           # Objets culturels
POST /upload           # Upload de contenu
GET  /cultural-items   # API des objets
```

## 🔧 Configuration

### Variables d'Environnement

```env
# Base de données
MONGODB_URI=mongodb://localhost:27017/nkwa-vault

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# API
PORT=4000
NODE_ENV=production
FRONTEND_URL=http://localhost:3000
```

## 🧪 Tests

```bash
# Tests automatisés
./test-simple.sh

# Tests manuels
npm run test
```

## 🚀 Déploiement

### Vercel (Frontend)
```bash
cd frontend
vercel --prod
```

### Heroku (Backend)
```bash
git push heroku main
```

### Docker
```bash
docker build -t nkwa-vault .
docker run -p 3000:3000 -p 4000:4000 nkwa-vault
```

## 👥 Comptes par Défaut

- **Administrateur** : `admin@acv.africa` / `admin123`
- **Utilisateurs** : Inscription libre

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👨‍💻 Auteur

**Votre Nom**
- GitHub: [@your-username](https://github.com/your-username)
- Email: your.email@example.com

## 🙏 Remerciements

- Communauté africaine pour le partage culturel
- Développeurs open source
- Contributeurs du projet

## 📞 Support

- **Documentation** : [Wiki du projet](https://github.com/your-username/nkwa-vault/wiki)
- **Issues** : [GitHub Issues](https://github.com/your-username/nkwa-vault/issues)
- **Email** : support@nkwa-vault.africa

## 🎯 Roadmap

- [ ] **Mobile App** (React Native)
- [ ] **Blockchain** intégration complète
- [ ] **IA** pour la traduction automatique
- [ ] **AR/VR** pour l'expérience immersive
- [ ] **API** publique pour les développeurs

---

**🏆 Nkwa Vault - Préserver le patrimoine africain pour les générations futures**

[![Made with ❤️ in Africa](https://img.shields.io/badge/Made%20with%20❤️%20in-Africa-orange.svg)]()