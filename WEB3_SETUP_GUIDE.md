# 🌐 Guide de Configuration Web3 (EVM + Vyper) - Nkwa Vault

## 📋 Configuration Requise

### 1. Blockchain EVM + relayer (obligatoire)
Le backend publie les certifications on-chain pour l'utilisateur (mode gasless).

Variables à configurer dans `backend/.env`:

```bash
EVM_RPC_URL=https://sepolia.base.org
EVM_CHAIN_ID=84532
EVM_NETWORK=base-sepolia
EVM_EXPLORER_URL=https://sepolia.basescan.org
EVM_RELAYER_PRIVATE_KEY=0x...
EVM_REGISTRY_CONTRACT=0xYourCulturalRegistryAddress
```

Réseaux conseillés:
- Base Sepolia (tests)
- Arbitrum Sepolia (tests)
- Base / Arbitrum mainnet (production)

### 2. Contrat Vyper (obligatoire)
Le contrat est dans `contracts/vyper/CulturalRegistry.vy`.

Compiler (si `vyper` installé):

```bash
vyper contracts/vyper/CulturalRegistry.vy
```

Déployer puis renseigner l'adresse dans `EVM_REGISTRY_CONTRACT`.

### 3. IPFS (obligatoire)

Configurer au moins un provider:

```bash
# Option 1: endpoint RPC Kubo compatible
IPFS_API_URL=https://ipfs.my-provider.example
IPFS_API_TOKEN=...

# Option 2: Infura IPFS
IPFS_PROJECT_ID=...
IPFS_PROJECT_SECRET=...
```

## 🚀 Démarrage

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

```bash
# Frontend
cd frontend
npm install
npm start
```

## ✅ Résultat attendu

- Les contenus sont enregistrés sur IPFS.
- Une preuve d'authenticité est écrite sur la blockchain EVM.
- Les utilisateurs non-crypto utilisent la plateforme normalement (email/UI classique).
- Le relayer backend gère les transactions on-chain.

## 🧪 Mode démo

Si `EVM_RPC_URL`, `EVM_RELAYER_PRIVATE_KEY` ou `EVM_REGISTRY_CONTRACT` manquent:
- l'app reste fonctionnelle,
- la partie blockchain passe en mode démo,
- l'interface reste accessible à tous.
