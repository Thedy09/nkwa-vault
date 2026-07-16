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

## Variables Base de données (Supabase)

Créez un projet sur [supabase.com](https://supabase.com) puis copiez les chaînes dans
**Project Settings → Database → Connection string** :

```bash
# Runtime (Transaction pooler, port 6543) — obligatoire sur Vercel
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

# Migrations Prisma (Direct, port 5432) — obligatoire pour `npm run db:deploy`
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
```

Après avoir défini les variables :

```bash
npm run db:deploy   # applique les migrations Prisma sur Supabase
npm run db:check    # vérifie la connexion
```

En production, contrôlez aussi : `https://<votre-app>/api/health/db`

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

# Client Supabase (optionnel)
SUPABASE_URL=https://[REF].supabase.co
SUPABASE_ANON_KEY=...
```

## Comment configurer dans Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Sélectionnez votre projet
3. Allez dans Settings > Environment Variables
4. Ajoutez `DATABASE_URL` et `DIRECT_URL` (Production + Preview)
5. Redéployez le projet
6. Lancez `npm run db:deploy` une fois avec `DIRECT_URL` exporté en local

## Configuration Web3 recommandée

Pour les tests, utilisez :
- **Base Sepolia** : https://docs.base.org
- ou **Arbitrum Sepolia** : https://docs.arbitrum.io
- Déployez `contracts/vyper/CulturalRegistry.vy` puis renseignez `EVM_REGISTRY_CONTRACT`
