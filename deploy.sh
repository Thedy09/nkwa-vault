#!/bin/bash

echo "🚀 Déploiement de Nkwa Vault sur Vercel"
echo "========================================"

# Vérifier que Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation..."
    npm install -g vercel
fi

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Veuillez exécuter ce script depuis la racine du projet"
    exit 1
fi

echo "📦 Installation des dépendances..."
npm install

echo "🔧 Configuration des variables d'environnement..."
echo "Veuillez configurer les variables d'environnement suivantes dans Vercel :"
echo ""
echo "Variables Web3 EVM (OBLIGATOIRES) :"
echo "- EVM_RPC_URL"
echo "- EVM_CHAIN_ID"
echo "- EVM_NETWORK"
echo "- EVM_RELAYER_PRIVATE_KEY"
echo "- EVM_REGISTRY_CONTRACT"
echo ""
echo "Variables Base de données :"
echo "- DATABASE_URL"
echo "- REDIS_URL (optionnel)"
echo ""
echo "Variables IPFS (au moins un provider) :"
echo "- IPFS_API_URL (+ IPFS_API_TOKEN optionnel)"
echo "- ou IPFS_PROJECT_ID + IPFS_PROJECT_SECRET"
echo ""
echo "Variables Cloudinary (optionnel) :"
echo "- CLOUDINARY_CLOUD_NAME"
echo "- CLOUDINARY_API_KEY"
echo "- CLOUDINARY_API_SECRET"
echo ""

# Construire le frontend
echo "🏗️ Construction du frontend..."
cd frontend
npm run build
cd ..

# Déployer sur Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod

echo "✅ Déploiement terminé !"
echo "🌐 Votre application est maintenant en ligne"
echo "📊 Consultez le dashboard Vercel pour les logs et métriques"
