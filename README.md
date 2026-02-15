# 🌍 Nkwa V - Plateforme Web3 pour le Patrimoine Culturel Africain

[![Deploy on Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Thedy09/nkwa-vault)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Web3](https://img.shields.io/badge/Web3-Enabled-blue)](https://web3.foundation/)

> **Préservez, partagez et certifiez le patrimoine culturel africain sur la blockchain**

Nkwa V est une plateforme révolutionnaire qui utilise la technologie Web3 pour préserver, partager et certifier le patrimoine culturel africain. Accessible à tous, avec ou sans wallet crypto.

## ✨ **Fonctionnalités Principales**

### 🌐 **Web3 Central (Pilier Fondamental)**
- **Certification Blockchain** : Tous les contenus sont certifiés sur une blockchain EVM
- **Stockage Décentralisé** : IPFS pour un stockage immuable et résistant à la censure
- **Contrat Vyper** : Registre culturel on-chain pour l'authenticité
- **Relayer Gasless** : publication accessible sans wallet crypto
- **Accès Hybride** : expérience Web2 simple + preuve Web3

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
- **Réseaux EVM** (Base, Arbitrum, Ethereum compatibles)
- **Vyper** pour les contrats intelligents
- **IPFS** pour le stockage décentralisé
- **IPFS RPC** (endpoint custom ou Infura)
- **Relayer backend** pour les transactions transparentes (gasless UX)

## 📦 **Installation**

### **Prérequis**
- Node.js 18+
- PostgreSQL 13+
- Redis (optionnel)
- RPC EVM + clé relayer (pour Web3)
- Provider IPFS (endpoint RPC ou credentials Infura)

### **Installation Locale**

```bash
# Cloner le repository
git clone https://github.com/Thedy09/nkwa-vault.git
cd nkwa-vault

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

### **1. Blockchain EVM + Contrat Vyper**
```bash
# Dans backend/.env
EVM_RPC_URL=https://sepolia.base.org
EVM_CHAIN_ID=84532
EVM_NETWORK=base-sepolia
EVM_EXPLORER_URL=https://sepolia.basescan.org
EVM_RELAYER_PRIVATE_KEY=votre_cle_relayer
EVM_REGISTRY_CONTRACT=0xVotreContratVyper
```

### **2. IPFS**
```bash
# Dans backend/.env
# Option 1: endpoint RPC Kubo compatible
IPFS_API_URL=https://ipfs.my-provider.example
IPFS_API_TOKEN=...

# Option 2: Infura IPFS
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
```

### **3. Base de Données**
```bash
# Dans backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/nkwa_vault"
```

## 🌐 **URLs de Déploiement**

- **Production** : https://nkwa-vault.vercel.app
- **API Documentation** : https://nkwa-vault.vercel.app/api-docs
- **Dashboard Web3** : https://nkwa-vault.vercel.app (ouvrir le menu puis section Web3)

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
- **Écosystème EVM** pour la blockchain
- **Vyper** pour les smart contracts orientés sécurité
- **IPFS** pour le stockage décentralisé

## 📞 **Support**

- **Documentation** : [Wiki du projet](https://github.com/Thedy09/nkwa-vault/wiki)
- **Issues** : [GitHub Issues](https://github.com/Thedy09/nkwa-vault/issues)
- **Discussions** : [GitHub Discussions](https://github.com/Thedy09/nkwa-vault/discussions)
- **Email** : support@nkwav.com


---

**🎯 Mission** : Préserver le patrimoine culturel africain pour les générations futures grâce à la technologie Web3.

**🌍 Vision** : Créer une bibliothèque numérique décentralisée accessible à tous, partout dans le monde.

**💡 Innovation** : Web3 + Culture + Accessibilité = Avenir du patrimoine culturel
