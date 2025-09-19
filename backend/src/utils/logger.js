const winston = require('winston');
const path = require('path');

// Configuration des niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Configuration des couleurs pour les logs
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

winston.addColors(colors);

// Format personnalisé pour les logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Configuration des transports
const transports = [
  // Console transport
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: format
  }),
  
  // Fichier pour les erreurs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // Fichier pour tous les logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// Logger pour les requêtes HTTP
const httpLogger = winston.createLogger({
  level: 'http',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'http.log')
    })
  ]
});

// Middleware pour logger les requêtes HTTP
const httpLogMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      httpLogger.error('HTTP Error', logData);
    } else {
      httpLogger.http('HTTP Request', logData);
    }
  });
  
  next();
};

// Fonctions utilitaires pour le logging
const logError = (error, context = {}) => {
  logger.error('Error occurred', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString()
  });
};

const logInfo = (message, data = {}) => {
  logger.info(message, {
    data,
    timestamp: new Date().toISOString()
  });
};

const logWarning = (message, data = {}) => {
  logger.warn(message, {
    data,
    timestamp: new Date().toISOString()
  });
};

const logDebug = (message, data = {}) => {
  logger.debug(message, {
    data,
    timestamp: new Date().toISOString()
  });
};

// Logger pour les performances
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'performance.log')
    })
  ]
});

const logPerformance = (operation, duration, metadata = {}) => {
  performanceLogger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString()
  });
};

// Logger pour les métriques Web3
const web3Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'web3.log')
    })
  ]
});

const logWeb3Operation = (operation, result, metadata = {}) => {
  web3Logger.info('Web3 operation', {
    operation,
    success: result.success,
    result,
    metadata,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  logger,
  httpLogger,
  httpLogMiddleware,
  logError,
  logInfo,
  logWarning,
  logDebug,
  performanceLogger,
  logPerformance,
  web3Logger,
  logWeb3Operation
};
