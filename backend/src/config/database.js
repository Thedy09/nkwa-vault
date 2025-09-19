const { PrismaClient } = require('@prisma/client');

// Instance Prisma globale
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // En développement, réutiliser l'instance existante
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

// Fonction pour tester la connexion
async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Connexion PostgreSQL réussie via Prisma');
    return true;
  } catch (error) {
    console.error('Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
}

// Fonction pour fermer la connexion
async function closeConnection() {
  try {
    await prisma.$disconnect();
    console.log('Connexion PostgreSQL fermée');
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error.message);
  }
}

module.exports = {
  prisma,
  testConnection,
  closeConnection
};