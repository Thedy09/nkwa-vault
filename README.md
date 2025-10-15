# 🌍 Nkwa V - Plateforme Web3 pour le Patrimoine Culturel Africain

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/votre-username/nkwa-vault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web3](https://img.shields.io/badge/Web3-Enabled-blue)](https://web3.foundation/)

> **Préservez, partagez et certifiez le patrimoine culturel africain sur la blockchain**

Nkwa V est une plateforme révolutionnaire qui utilise la technologie Web3 pour préserver, partager et certifier le patrimoine culturel africain. Accessible à tous, avec ou sans wallet crypto.

## ✨ **Fonctionnalités Principales**

### 🌐 **Web3 Central (Pilier Fondamental)**
- **Certification Blockchain** : Tous les contenus sont certifiés sur Hedera Hashgraph
- **Stockage Décentralisé** : IPFS pour un stockage immuable et résistant à la censure
- **NFT Culturels** : Création de NFT pour les contenus premium
- **Tokens NKWA** : Système de récompenses pour les contributeurs
- **Accès Hybride** : 100% Web3 mais accessible sans wallet crypto

### 📚 **Contenus Culturels**
- **Contes & Littérature** : Collecte automatique depuis African Storybook, Wikisource
- **Musique Traditionnelle** : Smithsonian Folkways, Internet Archive
- **Arts Visuels** : Met Museum Open Access, Wikimedia Commons
- **Patrimoine Immatériel** : UNESCO, collections éducatives

### 🎯 **Fonctionnalités Avancées**
- **Collecte Automatique** : Scraping intelligent de sources libres
- **Multilingue** : Support de 20+ langues africaines
- **Recherche Avancée** : IA pour la découverte de contenus
- **Communauté** : Système de contributions et récompenses
- **Modération** : Validation communautaire des contenus

## 🚀 **Technologies Utilisées**

### **Frontend**
- **React 18** avec Hooks modernes
- **Framer Motion** pour les animations
- **Lucide React** pour les icônes
- **Axios** pour les requêtes API
- **CSS-in-JS** avec styled-jsx

### **Backend**
- **Node.js** avec Express.js
- **Prisma ORM** avec PostgreSQL
- **JWT** pour l'authentification
- **Redis** pour le cache
- **Winston** pour les logs
- **Swagger** pour la documentation API

### **Web3 & Blockchain**
- **Hedera Hashgraph** pour la certification
- **IPFS** pour le stockage décentralisé
- **Web3.Storage** pour l'interface IPFS
- **NFT** pour les contenus premium
- **Smart Contracts** pour les récompenses

## 📦 **Installation**

### **Prérequis**
- Node.js 18+
- PostgreSQL 13+
- Redis (optionnel)
- Compte Hedera (pour Web3)
- Token IPFS (pour le stockage)

### **Installation Locale**

```bash
# Cloner le repository
git clone https://github.com/votre-username/nkwa-v.git
cd nkwa-v

# Installer les dépendances
npm install

# Configuration de la base de données
cd backend
npx prisma generate
npx prisma migrate deploy

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos clés

# Démarrer l'application
npm run dev
```

### **Déploiement Vercel**

```bash
# Déploiement automatique
./deploy-vercel.sh

# Ou manuellement
vercel --prod
```

## ⚙️ **Configuration Web3**

### **1. Hedera Hashgraph**
```bash
# Dans backend/.env
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=votre_cle_privee
HEDERA_NETWORK=testnet
```

### **2. IPFS (Web3.Storage)**
```bash
# Dans backend/.env
IPFS_API_URL=https://api.web3.storage
IPFS_API_TOKEN=votre_token_web3_storage
```

### **3. Base de Données**
```bash
# Dans backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/nkwa_vault"
```

## 🌐 **URLs de Déploiement**

- **Production** : https://nkwa-v-4ghsao6sr-thedys-projects.vercel.app
- **API Documentation** : https://nkwa-v-4ghsao6sr-thedys-projects.vercel.app/api-docs
- **Dashboard Web3** : https://nkwa-v-4ghsao6sr-thedys-projects.vercel.app/web3-dashboard

## 📖 **Guide d'Utilisation**

### **Pour les Utilisateurs**
1. **Accès Email** : Créez un compte avec votre email
2. **Accès Web3** : Connectez votre wallet pour les fonctionnalités avancées
3. **Navigation** : Explorez les contenus culturels
4. **Contribution** : Partagez vos propres contenus

### **Pour les Développeurs**
1. **API REST** : Documentation complète disponible
2. **Web3 Integration** : SDK pour l'intégration blockchain
3. **Collecte de Contenus** : API pour le scraping automatique
4. **Monitoring** : Logs et métriques en temps réel

## 🤝 **Contribution**

Nous accueillons les contributions ! Voici comment participer :

1. **Fork** le projet
2. **Créer** une branche feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add some AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. **Ouvrir** une Pull Request

### **Types de Contributions**
- 🐛 **Bug fixes**
- ✨ **Nouvelles fonctionnalités**
- 📚 **Documentation**
- 🎨 **Améliorations UI/UX**
- 🌐 **Traductions**
- 🔧 **Optimisations**

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 **Remerciements**

- **African Storybook** pour les contes
- **Smithsonian Folkways** pour la musique
- **Met Museum** pour les arts visuels
- **UNESCO** pour le patrimoine immatériel
- **Hedera Hashgraph** pour la blockchain
- **IPFS** pour le stockage décentralisé

## 📞 **Support**

- **Documentation** : [Wiki du projet](https://github.com/votre-username/nkwa-v/wiki)
- **Issues** : [GitHub Issues](https://github.com/votre-username/nkwa-v/issues)
- **Discussions** : [GitHub Discussions](https://github.com/votre-username/nkwa-v/discussions)
- **Email** : support@nkwav.com


---

**🎯 Mission** : Préserver le patrimoine culturel africain pour les générations futures grâce à la technologie Web3.

**🌍 Vision** : Créer une bibliothèque numérique décentralisée accessible à tous, partout dans le monde.

**💡 Innovation** : Web3 + Culture + Accessibilité = Avenir du patrimoine culturel