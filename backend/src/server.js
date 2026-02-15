require('dotenv').config({ override: true });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

// Database
const { prisma, testConnection } = require('./config/database');

// Web3 Configuration - PILIER CENTRAL
const web3Config = require('./config/web3');
const web3Core = require('./services/web3Core');

// Redis Service
const redisService = require('./services/redisService');

// Routes
const authRoute = require('./routes/auth');
const uploadRoute = require('./routes/upload');
const riddlesRoute = require('./routes/riddles');
const culturalContentRoute = require('./routes/culturalContent');
const contentManagerRoute = require('./routes/contentManager');
const web3CoreRoute = require('./routes/web3Core');
const museumRoute = require('./routes/museum');
const metricsRoute = require('./routes/metrics');
const cacheRoute = require('./routes/cache');

// Monitoring
const {
  metricsMiddleware,
  errorMetricsMiddleware,
  performanceMiddleware,
  memoryMonitoringMiddleware,
  web3MonitoringMiddleware,
  databaseMonitoringMiddleware,
  uploadMonitoringMiddleware,
  authMonitoringMiddleware
} = require('./middleware/monitoring');
const metricsCollector = require('./utils/metrics');

// Gestion d'erreurs
const { 
  errorHandler, 
  notFoundHandler, 
  setupErrorHandlers,
  asyncErrorHandler 
} = require('./utils/errorHandler');

const app = express();

// Middleware de compression
app.use(compression());

// Middleware de sécurité
app.use(helmet());
const configuredOrigins = new Set([
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGIN || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean),
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean));

function isLocalDevOrigin(origin) {
  try {
    const parsed = new URL(origin);
    const isLocalHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    return parsed.protocol === 'http:' && isLocalHost;
  } catch (_) {
    return false;
  }
}

function isVercelOrigin(origin) {
  try {
    const parsed = new URL(origin);
    return parsed.protocol === 'https:' && parsed.hostname.endsWith('.vercel.app');
  } catch (_) {
    return false;
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }

    if (configuredOrigins.has(origin) || isLocalDevOrigin(origin) || isVercelOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de monitoring
app.use(metricsMiddleware);
app.use(performanceMiddleware);
app.use(memoryMonitoringMiddleware);
app.use(web3MonitoringMiddleware);
app.use(databaseMonitoringMiddleware);
app.use(uploadMonitoringMiddleware);
app.use(authMonitoringMiddleware);

// Routes
app.use(['/auth', '/api/auth'], authRoute);
app.use(['/upload', '/api/upload'], uploadRoute);
app.use(['/riddles', '/api/riddles'], riddlesRoute);
app.use(['/cultural-content', '/api/cultural-content'], culturalContentRoute);
app.use('/api/content', contentManagerRoute);
app.use('/api/web3', web3CoreRoute);
app.use('/api/museum', museumRoute);
app.use('/api/collector', require('./routes/contentCollector'));
app.use('/api/metrics', metricsRoute);
app.use('/api/cache', cacheRoute);

// Documentation API Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Nkwa V API Documentation'
}));

// Route de santé
app.get(['/health', '/api/health'], (req, res) => {
  res.json({
    success: true,
    message: 'Nkwa V Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route 404
app.use(notFoundHandler);

// Gestionnaire d'erreurs global avec monitoring
app.use(errorMetricsMiddleware);
app.use(errorHandler);

let servicesInitializationPromise = null;

// Initialisation des services
const initializeServices = async () => {
  if (servicesInitializationPromise) {
    return servicesInitializationPromise;
  }

  servicesInitializationPromise = (async () => {
    try {
      // Connexion à la base de données
      await testConnection();
      
      // Initialisation des services Web3 - PILIER CENTRAL
      await web3Config.initialize();
      await web3Core.initialize();
      
      // Initialisation de Redis (optionnel)
      const redisReady = await redisService.initialize();
      if (!redisReady) {
        console.log('⚠️ Redis indisponible: cache Redis désactivé pour cette session');
      }
      
      // Démarrer le système de métriques uniquement hors serverless/test
      if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
        metricsCollector.start();
      }
      
      console.log('✅ Tous les services initialisés avec succès');
      console.log('🌐 Web3 (pilier central) - Prêt pour la décentralisation');
      console.log('📊 Système de monitoring activé');
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation des services:', error.message);
      throw error;
    }
  })();

  try {
    await servicesInitializationPromise;
  } catch (_) {
    servicesInitializationPromise = null;
  }

  return servicesInitializationPromise;
};

if (!process.env.VERCEL) {
  // Configurer les gestionnaires d'erreurs globaux uniquement en mode serveur long-lived
  setupErrorHandlers();
}

// Initialiser les services au démarrage
initializeServices().catch((error) => {
  console.error('❌ Initialisation partielle:', error.message);
});

const shouldListen = !process.env.VERCEL && process.env.NODE_ENV !== 'test';
if (shouldListen) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('Nkwa V Backend running on port', PORT);
    console.log('Authentication system ready');
    console.log('Database connection ready');
    console.log('CORS enabled for local dev origins: http://localhost:* and http://127.0.0.1:*');
    if (process.env.FRONTEND_URL) {
      console.log('CORS enabled for configured FRONTEND_URL:', process.env.FRONTEND_URL);
    }
    if (process.env.CORS_ORIGIN) {
      console.log('CORS enabled for configured CORS_ORIGIN:', process.env.CORS_ORIGIN);
    }
  });
}

module.exports = app;
