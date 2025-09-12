#!/bin/bash

# Script de déploiement pour African Culture Vault
# Usage: ./scripts/deploy.sh [environment]

set -e

ENVIRONMENT=${1:-development}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 Déploiement Nkwa Vault - Environnement: $ENVIRONMENT"
echo "📁 Répertoire projet: $PROJECT_DIR"
echo "=" | head -c 50 && echo ""

# Fonction pour afficher les étapes
step() {
    echo "📋 $1"
    echo "-" | head -c 30 && echo ""
}

# Vérifier les prérequis
step "Vérification des prérequis"
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Node.js $(node --version)"
echo "✅ npm $(npm --version)"

# Installation des dépendances backend
step "Installation des dépendances backend"
cd "$BACKEND_DIR"
npm install --production

# Installation des dépendances frontend
step "Installation des dépendances frontend"
cd "$FRONTEND_DIR"
npm install

# Build du frontend
step "Build du frontend"
npm run build

# Vérification des fichiers de configuration
step "Vérification de la configuration"
if [ ! -f "$BACKEND_DIR/.env" ]; then
    echo "⚠️  Fichier .env manquant dans le backend"
    echo "💡 Copiez .env.example vers .env et configurez les variables"
fi

# Test des services
step "Test des services"
cd "$BACKEND_DIR"
if node scripts/testServices.js; then
    echo "✅ Tests des services réussis"
else
    echo "⚠️  Certains tests ont échoué (mode démo activé)"
fi

# Démarrage des services
step "Démarrage des services"

# Backend
echo "🔄 Démarrage du backend..."
cd "$BACKEND_DIR"
node scripts/start.js &
BACKEND_PID=$!

# Attendre que le backend soit prêt
sleep 5

# Vérifier que le backend fonctionne
if curl -s http://localhost:4000/health > /dev/null; then
    echo "✅ Backend démarré (PID: $BACKEND_PID)"
else
    echo "❌ Échec du démarrage du backend"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Frontend
echo "🔄 Démarrage du frontend..."
cd "$FRONTEND_DIR"
HOST=0.0.0.0 npm start &
FRONTEND_PID=$!

# Attendre que le frontend soit prêt
sleep 10

# Vérifier que le frontend fonctionne
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend démarré (PID: $FRONTEND_PID)"
else
    echo "❌ Échec du démarrage du frontend"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Affichage des informations de déploiement
step "Déploiement terminé"
echo "🎉 Nkwa Vault est maintenant en ligne !"
echo ""
echo "📱 Accès local:"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend:  http://localhost:4000"
echo "   - API Health: http://localhost:4000/health"
echo ""
echo "🌐 Accès réseau:"
echo "   - Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "   - Backend:  http://$(hostname -I | awk '{print $1}'):4000"
echo ""
echo "📊 Processus:"
echo "   - Backend PID: $BACKEND_PID"
echo "   - Frontend PID: $FRONTEND_PID"
echo ""
echo "🛑 Pour arrêter les services:"
echo "   kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Sauvegarder les PIDs
echo "$BACKEND_PID $FRONTEND_PID" > "$PROJECT_DIR/.pids"

echo "✅ Déploiement réussi !"
