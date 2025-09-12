#!/bin/bash

echo "🚀 Démarrage de Nkwa Vault en mode Production"
echo "============================================="

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Vérifier si MongoDB est installé
if ! command -v mongod &> /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB non détecté${NC}"
    echo "Pour installer MongoDB:"
    echo "1. Ubuntu/Debian: sudo apt install mongodb"
    echo "2. Ou utilisez MongoDB Atlas: https://cloud.mongodb.com/"
    echo "3. Configurez MONGODB_URI dans backend/.env"
    echo ""
    echo "Démarrage en mode local avec MongoDB par défaut..."
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f backend/.env ]; then
    echo -e "${YELLOW}📝 Création du fichier .env${NC}"
    cat > backend/.env << EOF
# Configuration MongoDB
MONGODB_URI=mongodb://localhost:27017/nkwa-vault

# Configuration JWT
JWT_SECRET=nkwa-vault-super-secret-jwt-key-2025
JWT_EXPIRES_IN=7d

# Configuration API
PORT=4000
NODE_ENV=production

# Configuration Frontend
FRONTEND_URL=http://localhost:3000
EOF
    echo -e "${GREEN}✅ Fichier .env créé${NC}"
fi

# Installer les dépendances si nécessaire
if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances backend...${NC}"
    cd backend && npm install && cd ..
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installation des dépendances frontend...${NC}"
    cd frontend && npm install && cd ..
fi

# Construire le frontend
echo -e "${YELLOW}🔨 Construction du frontend...${NC}"
cd frontend && npm run build && cd ..

# Démarrer le backend
echo -e "${YELLOW}🚀 Démarrage du backend...${NC}"
cd backend && node src/server.js &
BACKEND_PID=$!

# Attendre que le backend démarre
sleep 5

# Vérifier si le backend fonctionne
if curl -s http://localhost:4000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend démarré avec succès${NC}"
    echo -e "${GREEN}🌐 Application disponible sur: http://localhost:3000${NC}"
    echo -e "${GREEN}🔧 API disponible sur: http://localhost:4000${NC}"
    echo ""
    echo "Comptes par défaut:"
    echo "  Admin: admin@acv.africa / admin123"
    echo ""
    echo "Pour arrêter l'application: Ctrl+C"
    
    # Garder le script en vie
    wait $BACKEND_PID
else
    echo -e "${RED}❌ Erreur lors du démarrage du backend${NC}"
    echo "Vérifiez les logs ci-dessus pour plus de détails"
    exit 1
fi
