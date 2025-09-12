#!/bin/bash

# Déploiement rapide de Nkwa Vault
# Usage: ./scripts/quick-deploy.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 Déploiement rapide Nkwa Vault"
echo "📁 Répertoire: $PROJECT_DIR"
echo "=" | head -c 40 && echo ""

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Build du frontend
echo "📦 Build du frontend..."
cd "$FRONTEND_DIR"
npm install
npm run build

if [ ! -d "build" ]; then
    echo "❌ Échec du build du frontend"
    exit 1
fi

echo "✅ Frontend buildé avec succès"

# Déployer le frontend sur Vercel
echo "🚀 Déploiement du frontend sur Vercel..."
vercel --prod --yes --name nkwa-vault-demo

echo ""
echo "🎉 Déploiement terminé !"
echo ""
echo "📱 URL de test:"
echo "   - Frontend: https://nkwa-vault-demo.vercel.app"
echo ""
echo "👥 Partagez cette URL avec vos amis !"
echo ""
echo "💬 Le bouton de feedback (💬) est intégré dans l'app"
echo ""

# Créer un message de partage
echo "📝 Message à envoyer à vos amis :"
echo ""
echo "🎯 Salut ! J'ai créé Nkwa Vault, une app pour préserver le patrimoine culturel africain."
echo ""
echo "🌐 Testez l'app ici : https://nkwa-vault-demo.vercel.app"
echo ""
echo "✨ Fonctionnalités à tester :"
echo "- Explorer le musée culturel"
echo "- Partager du contenu (contes, proverbes, etc.)"
echo "- Tester l'interface mobile"
echo "- Donner votre avis (bouton 💬)"
echo ""
echo " Votre feedback m'aidera à améliorer l'app avant le lancement public !"
echo ""
echo "Merci ! 🙏"
echo ""


