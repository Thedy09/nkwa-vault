#!/usr/bin/env node

require('dotenv').config();
const path = require('path');

// Vérifier les variables d'environnement requises
const requiredEnvVars = [
  'JWT_SECRET',
  'PORT'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variables d\'environnement manquantes:', missingVars.join(', '));
  console.error('💡 Créez un fichier .env avec les variables requises');
  process.exit(1);
}

// Afficher la configuration
console.log('🚀 Démarrage du serveur Nkwa Vault...');
console.log('📋 Configuration:');
console.log(`   - Port: ${process.env.PORT}`);
console.log(`   - Environnement: ${process.env.NODE_ENV || 'development'}`);
console.log(`   - Base de données: ${process.env.MONGODB_URI || 'MongoDB local'}`);
console.log(`   - CORS: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);

// Démarrer le serveur
try {
  require('../src/server');
} catch (error) {
  console.error('❌ Erreur lors du démarrage:', error.message);
  process.exit(1);
}
