# Configuration des Variables d'Environnement pour Vercel

## Variables Web3 (OBLIGATOIRES)
Ces variables sont essentielles pour le fonctionnement de Nkwa Vault :

```bash
HEDERA_ACCOUNT_ID=0.0.123456
HEDERA_PRIVATE_KEY=302e020100300506032b657004220420...
HEDERA_NETWORK=testnet
```

## Variables Base de données
```bash
DATABASE_URL=postgresql://username:password@host:5432/database
```

## Variables Optionnelles
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
CORS_ORIGIN=https://your-domain.vercel.app
```

## Comment configurer dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans Settings > Environment Variables
4. Ajoutez chaque variable avec sa valeur
5. Redéployez le projet

## Configuration de base de données recommandée

Pour un déploiement rapide, utilisez :
- **Neon** : https://neon.tech (PostgreSQL gratuit)
- **PlanetScale** : https://planetscale.com (MySQL)
- **Supabase** : https://supabase.com (PostgreSQL + plus)

## Configuration Web3 recommandée

Pour les tests, utilisez :
- **Hedera Testnet** : https://portal.hedera.com
- Créez un compte testnet gratuit
- Obtenez votre Account ID et Private Key
