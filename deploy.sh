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
echo "Variables Web3 (OBLIGATOIRES) :"
echo "- HEDERA_ACCOUNT_ID"
echo "- HEDERA_PRIVATE_KEY"
echo "- HEDERA_NETWORK (testnet ou mainnet)"
echo ""
echo "Variables Base de données :"
echo "- DATABASE_URL"
echo "- REDIS_URL (optionnel)"
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
