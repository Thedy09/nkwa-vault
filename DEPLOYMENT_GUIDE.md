# 🚀 Guide de Déploiement - Nkwa Vault

## ✅ Déploiement Réussi !

**URL de production :** https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app

## 📋 Prochaines Étapes

### 1. Configuration des Variables d'Environnement

Allez sur [Vercel Dashboard](https://vercel.com/thedys-projects/nkwa-vault) et configurez les variables suivantes :

#### Variables Web3 (OBLIGATOIRES)
```bash
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
```

#### Variables Base de données
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

#### Variables Optionnelles
```bash
# Redis (pour le cache)
REDIS_URL=redis://host:6379

# Cloudinary (pour l'upload d'images)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Web3.Storage (pour IPFS)
WEB3_STORAGE_TOKEN=your_web3_storage_token

# CORS
CORS_ORIGIN=https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app
```

### 2. Configuration de la Base de Données

#### Option 1 : Neon (Recommandé - PostgreSQL gratuit)
1. Allez sur [neon.tech](https://neon.tech)
2. Créez un compte gratuit
3. Créez une nouvelle base de données
4. Copiez l'URL de connexion
5. Ajoutez-la comme `DATABASE_URL` dans Vercel

#### Option 2 : Supabase (PostgreSQL + plus)
1. Allez sur [supabase.com](https://supabase.com)
2. Créez un projet
3. Allez dans Settings > Database
4. Copiez l'URL de connexion
5. Ajoutez-la comme `DATABASE_URL` dans Vercel

### 3. Configuration Web3

#### Hedera Hashgraph (Testnet)
1. Allez sur [portal.hedera.com](https://portal.hedera.com)
2. Créez un compte testnet gratuit
3. Obtenez votre Account ID et Private Key
4. Ajoutez-les dans Vercel

#### IPFS (Web3.Storage)
1. Allez sur [web3.storage](https://web3.storage)
2. Créez un compte
3. Générez un token API
4. Ajoutez-le comme `WEB3_STORAGE_TOKEN` dans Vercel

### 4. Migration de la Base de Données

Une fois la base de données configurée, exécutez les migrations :

```bash
# En local (pour tester)
cd backend
npx prisma migrate deploy

# Ou via Vercel CLI
vercel env pull .env.local
npx prisma migrate deploy
```

### 5. Test de l'Application

1. **Frontend** : https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app
2. **API** : https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app/api
3. **Documentation API** : https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app/api-docs

### 6. Fonctionnalités Disponibles

#### 🌍 Mode Invité (Sans Wallet)
- Navigation complète de la plateforme
- Consultation des collections
- Participation aux devinettes
- Upload de contenus culturels

#### 🔗 Mode Web3 (Avec Wallet)
- Toutes les fonctionnalités du mode invité
- Certification blockchain des contenus
- Création de NFTs culturels
- Système de récompenses en tokens NKWA
- Dashboard Web3 avec collecte de contenus

#### 📚 Collecte de Contenus
- **African Storybook** : Contes africains (CC BY)
- **Met Museum** : Œuvres d'art (CC0)
- **Internet Archive** : Musique traditionnelle (Public Domain)
- **Wikimedia Commons** : Images culturelles (CC0/CC-BY)
- **UNESCO** : Patrimoine immatériel

### 7. Monitoring et Logs

- **Vercel Dashboard** : https://vercel.com/thedys-projects/nkwa-vault
- **Logs en temps réel** : `vercel logs nkwa-vault-7lgf5z31l-thedys-projects.vercel.app`
- **Métriques** : https://nkwa-vault-7lgf5z31l-thedys-projects.vercel.app/api/metrics

### 8. Commandes Utiles

```bash
# Voir les logs
vercel logs nkwa-vault-7lgf5z31l-thedys-projects.vercel.app

# Redéployer
vercel --prod

# Voir les variables d'environnement
vercel env ls

# Ajouter une variable d'environnement
vercel env add HEDERA_ACCOUNT_ID

# Tester l'API localement
vercel dev
```

## 🎯 Résumé

✅ **Déploiement réussi** sur Vercel  
✅ **Frontend** construit et déployé  
✅ **Backend** configuré et prêt  
⏳ **Variables d'environnement** à configurer  
⏳ **Base de données** à configurer  
⏳ **Web3** à configurer  

Une fois les variables d'environnement configurées, Nkwa Vault sera pleinement fonctionnel ! 🌍✨
