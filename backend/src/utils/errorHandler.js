const { logError, logWarning } = require('./logger');
const metricsCollector = require('./metrics');

// Classes d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400);
    this.name = 'ValidationError';
    this.field = field;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Non autorisé') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Accès refusé') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Ressource non trouvée') {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflit de ressources') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Trop de requêtes') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

class DatabaseError extends AppError {
  constructor(message = 'Erreur de base de données') {
    super(message, 500);
    this.name = 'DatabaseError';
  }
}

class Web3Error extends AppError {
  constructor(message = 'Erreur Web3') {
    super(message, 502);
    this.name = 'Web3Error';
  }
}

class CacheError extends AppError {
  constructor(message = 'Erreur de cache') {
    super(message, 503);
    this.name = 'CacheError';
  }
}

// Gestionnaire d'erreurs pour les promesses rejetées
const handleUnhandledRejection = (err) => {
  console.error('🚨 PROMISE REJECTION:', err);
  logError(err, { type: 'unhandledRejection' });
  
  // Enregistrer dans les métriques
  metricsCollector.recordError('UnhandledRejection', 'global', err);
  
  // Fermer proprement l'application
  process.exit(1);
};

// Gestionnaire d'erreurs pour les exceptions non capturées
const handleUncaughtException = (err) => {
  console.error('🚨 UNCAUGHT EXCEPTION:', err);
  logError(err, { type: 'uncaughtException' });
  
  // Enregistrer dans les métriques
  metricsCollector.recordError('UncaughtException', 'global', err);
  
  // Fermer proprement l'application
  process.exit(1);
};

// Gestionnaire d'erreurs pour les signaux
const handleSignal = (signal) => {
  console.log(`📡 Signal reçu: ${signal}`);
  logWarning(`Application arrêtée par signal: ${signal}`);
  process.exit(0);
};

// Middleware de gestion d'erreurs Express
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log de l'erreur
  logError(err, {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    body: req.body,
    params: req.params,
    query: req.query
  });

  // Enregistrer dans les métriques
  const endpoint = req.route ? req.route.path : req.path;
  metricsCollector.recordError(err.name || 'UnknownError', endpoint, err);

  // Erreurs Prisma
  if (err.code === 'P2002') {
    const message = 'Violation de contrainte unique';
    error = new ConflictError(message);
  } else if (err.code === 'P2025') {
    const message = 'Enregistrement non trouvé';
    error = new NotFoundError(message);
  } else if (err.code && err.code.startsWith('P')) {
    const message = 'Erreur de base de données';
    error = new DatabaseError(message);
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token invalide';
    error = new AuthenticationError(message);
  } else if (err.name === 'TokenExpiredError') {
    const message = 'Token expiré';
    error = new AuthenticationError(message);
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    const message = 'Données de validation invalides';
    error = new ValidationError(message);
  }

  // Erreurs de limite de taux
  if (err.status === 429) {
    error = new RateLimitError(err.message);
  }

  // Erreurs Web3
  if (err.message && err.message.includes('Hedera')) {
    error = new Web3Error('Erreur de connexion Hedera');
  } else if (err.message && err.message.includes('IPFS')) {
    error = new Web3Error('Erreur de connexion IPFS');
  }

  // Erreurs Redis
  if (err.message && err.message.includes('Redis')) {
    error = new CacheError('Erreur de connexion Redis');
  }

  // Déterminer le code de statut
  const statusCode = error.statusCode || 500;
  const isOperational = error.isOperational !== undefined ? error.isOperational : false;

  // Préparer la réponse d'erreur
  const errorResponse = {
    success: false,
    error: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };

  // Ajouter des détails supplémentaires pour les erreurs de validation
  if (error.name === 'ValidationError' && error.field) {
    errorResponse.field = error.field;
  }

  // Ajouter un ID de trace pour le debugging
  if (process.env.NODE_ENV === 'production') {
    errorResponse.traceId = req.traceId || 'unknown';
  }

  // Répondre avec l'erreur
  res.status(statusCode).json(errorResponse);

  // Log des erreurs non opérationnelles
  if (!isOperational) {
    console.error('🚨 ERREUR NON OPÉRATIONNELLE:', error);
  }
};

// Middleware pour capturer les erreurs asynchrones
const asyncErrorHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware pour valider les paramètres requis
const validateRequired = (fields) => {
  return (req, res, next) => {
    const missing = fields.filter(field => {
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        return !req[parent] || !req[parent][child];
      }
      return !req.body[field] && !req.params[field] && !req.query[field];
    });

    if (missing.length > 0) {
      return next(new ValidationError(`Champs requis manquants: ${missing.join(', ')}`));
    }

    next();
  };
};

// Middleware pour valider les types de données
const validateTypes = (schema) => {
  return (req, res, next) => {
    const errors = [];

    for (const [field, type] of Object.entries(schema)) {
      const value = req.body[field] || req.params[field] || req.query[field];
      
      if (value !== undefined) {
        if (type === 'string' && typeof value !== 'string') {
          errors.push(`${field} doit être une chaîne de caractères`);
        } else if (type === 'number' && isNaN(Number(value))) {
          errors.push(`${field} doit être un nombre`);
        } else if (type === 'boolean' && typeof value !== 'boolean') {
          errors.push(`${field} doit être un booléen`);
        } else if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${field} doit être une adresse email valide`);
        } else if (type === 'url' && !/^https?:\/\/.+/.test(value)) {
          errors.push(`${field} doit être une URL valide`);
        }
      }
    }

    if (errors.length > 0) {
      return next(new ValidationError(errors.join(', ')));
    }

    next();
  };
};

// Middleware pour gérer les erreurs 404
const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route non trouvée: ${req.originalUrl}`);
  next(error);
};

// Fonction utilitaire pour créer des erreurs
const createError = (message, statusCode = 500, isOperational = true) => {
  return new AppError(message, statusCode, isOperational);
};

// Fonction utilitaire pour créer des erreurs de validation
const createValidationError = (message, field = null) => {
  return new ValidationError(message, field);
};

// Fonction utilitaire pour créer des erreurs d'authentification
const createAuthError = (message = 'Non autorisé') => {
  return new AuthenticationError(message);
};

// Fonction utilitaire pour créer des erreurs d'autorisation
const createAuthzError = (message = 'Accès refusé') => {
  return new AuthorizationError(message);
};

// Fonction utilitaire pour créer des erreurs de ressource non trouvée
const createNotFoundError = (message = 'Ressource non trouvée') => {
  return new NotFoundError(message);
};

// Fonction utilitaire pour créer des erreurs de conflit
const createConflictError = (message = 'Conflit de ressources') => {
  return new ConflictError(message);
};

// Fonction utilitaire pour créer des erreurs de base de données
const createDatabaseError = (message = 'Erreur de base de données') => {
  return new DatabaseError(message);
};

// Fonction utilitaire pour créer des erreurs Web3
const createWeb3Error = (message = 'Erreur Web3') => {
  return new Web3Error(message);
};

// Fonction utilitaire pour créer des erreurs de cache
const createCacheError = (message = 'Erreur de cache') => {
  return new CacheError(message);
};

// Configuration des gestionnaires d'erreurs globaux
const setupErrorHandlers = () => {
  process.on('unhandledRejection', handleUnhandledRejection);
  process.on('uncaughtException', handleUncaughtException);
  process.on('SIGTERM', () => handleSignal('SIGTERM'));
  process.on('SIGINT', () => handleSignal('SIGINT'));
};

module.exports = {
  // Classes d'erreurs
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  DatabaseError,
  Web3Error,
  CacheError,
  
  // Gestionnaires d'erreurs
  errorHandler,
  asyncErrorHandler,
  notFoundHandler,
  setupErrorHandlers,
  
  // Middlewares de validation
  validateRequired,
  validateTypes,
  
  // Fonctions utilitaires
  createError,
  createValidationError,
  createAuthError,
  createAuthzError,
  createNotFoundError,
  createConflictError,
  createDatabaseError,
  createWeb3Error,
  createCacheError
};
