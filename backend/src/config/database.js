const { PrismaClient } = require('@prisma/client');

function withServerlessParams(url) {
  if (!url) return url;

  try {
    const parsed = new URL(url);
    const isSupabase =
      parsed.hostname.includes('supabase.co') ||
      parsed.hostname.includes('pooler.supabase.com');
    const isServerless = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';

    if (isServerless || isSupabase) {
      if (!parsed.searchParams.has('connection_limit')) {
        parsed.searchParams.set('connection_limit', '1');
      }
    }

    if (isSupabase && parsed.port === '6543' && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
    }

    return parsed.toString();
  } catch (_) {
    return url;
  }
}

function createPrismaClient() {
  const datasourceUrl = withServerlessParams(process.env.DATABASE_URL);

  return new PrismaClient({
    datasources: datasourceUrl
      ? {
          db: {
            url: datasourceUrl
          }
        }
      : undefined,
    log:
      process.env.NODE_ENV === 'development'
        ? ['warn', 'error']
        : ['error']
  });
}

// Instance Prisma globale
let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // En développement, réutiliser l'instance existante
  if (!global.__prisma) {
    global.__prisma = createPrismaClient();
  }
  prisma = global.__prisma;
}

function getDatabaseProvider() {
  const url = process.env.DATABASE_URL || '';
  if (!url) return 'none';
  if (url.includes('supabase.co') || url.includes('pooler.supabase.com')) {
    return 'supabase';
  }
  return 'postgresql';
}

// Fonction pour tester la connexion
async function testConnection() {
  try {
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL manquant — mode fallback local (pas de PostgreSQL)');
      return false;
    }

    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    console.log(
      `Connexion PostgreSQL réussie via Prisma (${getDatabaseProvider()})`
    );
    return true;
  } catch (error) {
    console.error('Erreur de connexion PostgreSQL:', error.message);
    return false;
  }
}

async function getConnectionStatus() {
  const provider = getDatabaseProvider();
  const configured = Boolean(process.env.DATABASE_URL);
  const directConfigured = Boolean(process.env.DIRECT_URL);

  if (!configured) {
    return {
      connected: false,
      configured: false,
      directConfigured,
      provider,
      message: 'DATABASE_URL is not set'
    };
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      configured: true,
      directConfigured,
      provider,
      message: 'Database connection OK'
    };
  } catch (error) {
    return {
      connected: false,
      configured: true,
      directConfigured,
      provider,
      message: error.message
    };
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
  getConnectionStatus,
  getDatabaseProvider,
  closeConnection
};
