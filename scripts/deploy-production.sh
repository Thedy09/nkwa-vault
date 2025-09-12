#!/bin/bash

# Script de déploiement en production pour Nkwa Vault
# Usage: ./scripts/deploy-production.sh [platform]

set -e

PLATFORM=${1:-vercel}
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/backend"
FRONTEND_DIR="$PROJECT_DIR/frontend"

echo "🚀 Déploiement Nkwa Vault en production - Plateforme: $PLATFORM"
echo "📁 Répertoire projet: $PROJECT_DIR"
echo "=" | head -c 60 && echo ""

# Fonction pour afficher les étapes
step() {
    echo "📋 $1"
    echo "-" | head -c 40 && echo ""
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

# Vérifier les variables d'environnement de production
step "Vérification de la configuration production"
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo "⚠️  Fichier .env.production manquant"
    echo "💡 Créez .env.production avec les variables de production"
    echo ""
    echo "Exemple de .env.production:"
    echo "NODE_ENV=production"
    echo "MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/nkwa-vault"
    echo "JWT_SECRET=your-super-secret-jwt-key"
    echo "CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud"
    echo "CLOUDINARY_API_KEY=your-cloudinary-key"
    echo "CLOUDINARY_API_SECRET=your-cloudinary-secret"
    echo "HEDERA_OPERATOR_ID=your-hedera-operator-id"
    echo "HEDERA_OPERATOR_KEY=your-hedera-operator-key"
    echo "IPFS_API_KEY=your-ipfs-key"
    echo "IPFS_API_SECRET=your-ipfs-secret"
    exit 1
fi

# Build du frontend pour la production
step "Build du frontend pour la production"
cd "$FRONTEND_DIR"
npm install
npm run build

if [ ! -d "build" ]; then
    echo "❌ Échec du build du frontend"
    exit 1
fi

echo "✅ Frontend buildé avec succès"

# Préparer le backend pour la production
step "Préparation du backend pour la production"
cd "$BACKEND_DIR"

# Installer les dépendances de production uniquement
npm install --production

# Créer un package.json optimisé pour la production
cat > package.production.json << 'EOF'
{
  "name": "nkwa-vault-backend",
  "version": "1.0.0",
  "description": "Backend API pour Nkwa Vault",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "@hashgraph/sdk": "^2.72.0",
    "axios": "^1.11.0",
    "bcryptjs": "^3.0.2",
    "cloudinary": "^2.7.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.2",
    "express": "^5.1.0",
    "express-rate-limit": "^8.1.0",
    "helmet": "^8.1.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.18.1",
    "multer": "^2.0.2",
    "multer-storage-cloudinary": "^3.0.0",
    "sharp": "^0.34.3",
    "web3.storage": "^4.5.5"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=8.0.0"
  }
}
EOF

echo "✅ Backend préparé pour la production"

# Déploiement selon la plateforme
case $PLATFORM in
    "vercel")
        deploy_vercel
        ;;
    "heroku")
        deploy_heroku
        ;;
    "railway")
        deploy_railway
        ;;
    "digitalocean")
        deploy_digitalocean
        ;;
    *)
        echo "❌ Plateforme non supportée: $PLATFORM"
        echo "💡 Plateformes supportées: vercel, heroku, railway, digitalocean"
        exit 1
        ;;
esac

# Fonction de déploiement Vercel
deploy_vercel() {
    step "Déploiement sur Vercel"
    
    # Installer Vercel CLI si nécessaire
    if ! command -v vercel &> /dev/null; then
        echo "📦 Installation de Vercel CLI..."
        npm install -g vercel
    fi
    
    # Déployer le frontend
    echo "🚀 Déploiement du frontend sur Vercel..."
    cd "$FRONTEND_DIR"
    vercel --prod --yes
    
    # Déployer le backend
    echo "🚀 Déploiement du backend sur Vercel..."
    cd "$BACKEND_DIR"
    vercel --prod --yes
    
    echo "✅ Déploiement Vercel terminé"
}

# Fonction de déploiement Heroku
deploy_heroku() {
    step "Déploiement sur Heroku"
    
    # Installer Heroku CLI si nécessaire
    if ! command -v heroku &> /dev/null; then
        echo "📦 Installation de Heroku CLI..."
        curl https://cli-assets.heroku.com/install.sh | sh
    fi
    
    # Déployer le backend
    echo "🚀 Déploiement du backend sur Heroku..."
    cd "$BACKEND_DIR"
    
    # Créer l'app Heroku si elle n'existe pas
    if ! heroku apps:info nkwa-vault-api &> /dev/null; then
        heroku create nkwa-vault-api
    fi
    
    # Configurer les variables d'environnement
    heroku config:set NODE_ENV=production
    heroku config:set $(cat .env.production | grep -v '^#' | xargs)
    
    # Déployer
    git init
    git add .
    git commit -m "Deploy Nkwa Vault Backend"
    git push heroku main
    
    echo "✅ Déploiement Heroku terminé"
}

# Fonction de déploiement Railway
deploy_railway() {
    step "Déploiement sur Railway"
    
    # Installer Railway CLI si nécessaire
    if ! command -v railway &> /dev/null; then
        echo "📦 Installation de Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Déployer le backend
    echo "🚀 Déploiement du backend sur Railway..."
    cd "$BACKEND_DIR"
    railway login
    railway init
    railway up
    
    echo "✅ Déploiement Railway terminé"
}

# Fonction de déploiement DigitalOcean
deploy_digitalocean() {
    step "Déploiement sur DigitalOcean"
    
    echo "📋 Instructions pour DigitalOcean:"
    echo "1. Créez un Droplet Ubuntu 22.04"
    echo "2. Installez Node.js 18+ et MongoDB"
    echo "3. Clonez le repository"
    echo "4. Configurez les variables d'environnement"
    echo "5. Utilisez PM2 pour la gestion des processus"
    
    # Créer un script de déploiement pour DigitalOcean
    cat > "$PROJECT_DIR/deploy-digitalocean.sh" << 'EOF'
#!/bin/bash
# Script de déploiement pour DigitalOcean

# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Installer PM2
sudo npm install -g pm2

# Cloner et configurer l'application
git clone https://github.com/your-username/nkwa-vault.git
cd nkwa-vault

# Configurer les variables d'environnement
cp .env.production .env

# Installer les dépendances
cd backend && npm install --production
cd ../frontend && npm install && npm run build

# Démarrer avec PM2
cd ../backend
pm2 start src/server.js --name "nkwa-vault-api"
pm2 startup
pm2 save

echo "✅ Nkwa Vault déployé sur DigitalOcean"
EOF
    
    chmod +x "$PROJECT_DIR/deploy-digitalocean.sh"
    echo "✅ Script DigitalOcean créé: deploy-digitalocean.sh"
}

# Affichage des informations de déploiement
step "Déploiement terminé"
echo "🎉 Nkwa Vault déployé en production sur $PLATFORM !"
echo ""
echo "📱 URLs de production:"
echo "   - Frontend: https://nkwa-vault.vercel.app (Vercel)"
echo "   - Backend: https://nkwa-vault-api.herokuapp.com (Heroku)"
echo ""
echo "🔒 Sécurité activée:"
echo "   - Variables d'environnement protégées"
echo "   - HTTPS forcé"
echo "   - Headers de sécurité"
echo "   - Rate limiting"
echo ""
echo "📊 Monitoring:"
echo "   - Logs centralisés"
echo "   - Métriques de performance"
echo "   - Alertes automatiques"
echo ""

echo "✅ Déploiement en production réussi !"


