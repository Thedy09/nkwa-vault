const winston = require('winston');
const path = require('path');
const fs = require('fs');

const isVercel = Boolean(process.env.VERCEL);
const logsDir = path.join(process.cwd(), 'logs');

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

if (!isVercel) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Configuration des transports
const transports = [
  new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'info',
    format: format
  })
];

if (!isVercel) {
  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  );
}

// Création du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

const httpLoggerTransports = isVercel
  ? [new winston.transports.Console({ level: 'http', format })]
  : [
      new winston.transports.File({
        filename: path.join(logsDir, 'http.log')
      })
    ];

// Logger pour les requêtes HTTP
const httpLogger = winston.createLogger({
  level: 'http',
  levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: httpLoggerTransports
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

const performanceTransports = isVercel
  ? [new winston.transports.Console({ level: 'info', format })]
  : [
      new winston.transports.File({
        filename: path.join(logsDir, 'performance.log')
      })
    ];

// Logger pour les performances
const performanceLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: performanceTransports
});

const logPerformance = (operation, duration, metadata = {}) => {
  performanceLogger.info('Performance metric', {
    operation,
    duration: `${duration}ms`,
    metadata,
    timestamp: new Date().toISOString()
  });
};

const web3Transports = isVercel
  ? [new winston.transports.Console({ level: 'info', format })]
  : [
      new winston.transports.File({
        filename: path.join(logsDir, 'web3.log')
      })
    ];

// Logger pour les métriques Web3
const web3Logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: web3Transports
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
