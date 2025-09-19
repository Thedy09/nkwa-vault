# 🌐 Guide de Configuration Web3 - Nkwa Vault

## 📋 **Configuration Requise**

### 1. **Hedera Hashgraph** (OBLIGATOIRE)
Pour la certification blockchain et les NFT :

#### Étape 1 : Créer un compte Hedera
1. Allez sur [Hedera Portal](https://portal.hedera.com/)
2. Créez un compte et notez :
   - **Account ID** (ex: `0.0.123456`)
   - **Private Key** (clé privée)

#### Étape 2 : Obtenir des HBAR
- Achetez des HBAR sur des exchanges (Binance, Coinbase, etc.)
- Transférez vers votre compte Hedera
- **Minimum requis** : 10-20 HBAR pour les tests

#### Étape 3 : Configurer les variables
```bash
# Dans backend/.env
HEDERA_ACCOUNT_ID=0.0.123456  # Votre Account ID
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...  # Votre clé privée
HEDERA_NETWORK=testnet  # ou mainnet pour la production
```

### 2. **IPFS** (OBLIGATOIRE)
Pour le stockage décentralisé :

#### Option A : Web3.Storage (Recommandé)
1. Allez sur [Web3.Storage](https://web3.storage/)
2. Créez un compte
3. Générez un token API
4. Configurez :
```bash
# Dans backend/.env
IPFS_API_URL=https://api.web3.storage
IPFS_API_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Votre token
```

#### Option B : Pinata
1. Allez sur [Pinata](https://pinata.cloud/)
2. Créez un compte
3. Générez une API Key
4. Configurez :
```bash
# Dans backend/.env
IPFS_API_URL=https://api.pinata.cloud
IPFS_API_TOKEN=pk_...  # Votre API Key
```

### 3. **Cloudinary** (Optionnel)
Pour l'optimisation des médias :
1. Allez sur [Cloudinary](https://cloudinary.com/)
2. Créez un compte gratuit
3. Configurez :
```bash
# Dans backend/.env
CLOUDINARY_CLOUD_NAME=votre-cloud-name
CLOUDINARY_API_KEY=votre-api-key
CLOUDINARY_API_SECRET=votre-api-secret
```

## 🚀 **Démarrage de l'Application**

### 1. **Backend**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

### 2. **Frontend**
```bash
cd frontend
npm install
npm start
```

### 3. **Accès**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:4000
- **Documentation API** : http://localhost:4000/api-docs

## 🔧 **Fonctionnalités Web3**

### ✅ **Fonctionnalités Actives**
- ✅ Certification blockchain des contenus
- ✅ Stockage décentralisé IPFS
- ✅ Système de récompenses (NKWA tokens)
- ✅ NFT pour les contenus premium
- ✅ Collecte automatique de contenus culturels
- ✅ Accès hybride (avec/sans wallet crypto)

### 🎯 **Prochaines Étapes**
1. **Configuration Web3** : Suivez le guide ci-dessus
2. **Test des fonctionnalités** : Naviguez sur l'application
3. **Collecte de contenus** : Utilisez le collecteur automatique
4. **Déploiement production** : Configurez Vercel avec les vraies clés

## 📊 **Statut Actuel**

| Service | Statut | Configuration |
|---------|--------|---------------|
| PostgreSQL | ✅ Actif | Base de données configurée |
| Backend API | ✅ Actif | Port 4000 |
| Frontend React | ✅ Actif | Port 3000 |
| Hedera | ⚠️ À configurer | Clés requises |
| IPFS | ⚠️ À configurer | Token requis |
| Cloudinary | ⚠️ Optionnel | Pour les médias |

## 🆘 **Support**

Si vous rencontrez des problèmes :
1. Vérifiez les logs : `backend/logs/`
2. Testez l'API : `curl http://localhost:4000/`
3. Vérifiez la base de données : `npx prisma studio`

---

**🎉 Félicitations !** Votre plateforme Nkwa Vault est prête. Il ne reste plus qu'à configurer les services Web3 pour une expérience complète !
