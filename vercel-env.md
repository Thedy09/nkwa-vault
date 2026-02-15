# Configuration des Variables d'Environnement pour Vercel

## Variables Web3 (OBLIGATOIRES)
Ces variables sont essentielles pour le fonctionnement de Nkwa Vault :

```bash
EVM_RPC_URL=https://sepolia.base.org
EVM_CHAIN_ID=84532
EVM_NETWORK=base-sepolia
EVM_EXPLORER_URL=https://sepolia.basescan.org
EVM_RELAYER_PRIVATE_KEY=0x...
EVM_REGISTRY_CONTRACT=0xYourCulturalRegistryAddress
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

# IPFS via endpoint RPC Kubo compatible
IPFS_API_URL=https://ipfs.my-provider.example
IPFS_API_TOKEN=your_ipfs_api_token

# Ou IPFS via Infura
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...

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
- **Base Sepolia** : https://docs.base.org
- ou **Arbitrum Sepolia** : https://docs.arbitrum.io
- Déployez `contracts/vyper/CulturalRegistry.vy` puis renseignez `EVM_REGISTRY_CONTRACT`
