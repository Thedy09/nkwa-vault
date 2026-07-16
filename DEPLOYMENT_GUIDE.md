# 🚀 Guide de Déploiement - Nkwa Vault (EVM + Vyper)

## 1. Variables d'environnement à définir

### Backend Web3 (obligatoire)

```bash
EVM_RPC_URL=https://sepolia.base.org
EVM_CHAIN_ID=84532
EVM_NETWORK=base-sepolia
EVM_EXPLORER_URL=https://sepolia.basescan.org
EVM_RELAYER_PRIVATE_KEY=0x...
EVM_REGISTRY_CONTRACT=0xYourCulturalRegistryAddress
```

### Données et API (Supabase PostgreSQL)

```bash
# Transaction pooler (runtime Vercel)
DATABASE_URL=postgresql://postgres.[REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
# Direct connection (migrations Prisma)
DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=https://your-domain.example
```

Puis appliquez le schéma :

```bash
npm run db:deploy
npm run db:check
```

### IPFS (au moins une option)

```bash
# Option 1: endpoint RPC Kubo compatible
IPFS_API_URL=https://ipfs.my-provider.example
IPFS_API_TOKEN=...
# ou option 2: Infura
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
```

## 2. Déployer le contrat Vyper

- Contrat: `contracts/vyper/CulturalRegistry.vy`
- Compiler: `vyper contracts/vyper/CulturalRegistry.vy`
- Déployer sur le réseau choisi
- Reporter l'adresse dans `EVM_REGISTRY_CONTRACT`

## 3. Déploiement applicatif

```bash
npm install
npm run build
vercel --prod
```

## 4. Vérifications après déploiement

1. Ouvrir `https://<votre-app>/api/health/db` → `connected: true`, `provider: "supabase"`
2. Ouvrir `https://<votre-app>/api/web3/status`
3. Vérifier:
   - `blockchain.initialized: true`
   - `blockchain.contractAddress` renseigné
   - `ipfs.initialized: true` (ou mode démo si non configuré)
4. Publier un contenu test et vérifier un `txHash` de certification

## 5. Accessibilité pour les non-crypto

- Connexion classique (email) côté utilisateur
- Aucun wallet obligatoire
- Le backend relaie les transactions on-chain

Ce modèle garde la preuve blockchain tout en conservant une UX simple.
