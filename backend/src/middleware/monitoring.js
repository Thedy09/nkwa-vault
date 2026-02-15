const metricsCollector = require('../utils/metrics');
const { logError } = require('../utils/logger');

// Middleware pour enregistrer les métriques des requêtes
const metricsMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // Intercepter la réponse pour enregistrer les métriques
  const originalSend = res.send;
  res.send = function(data) {
    const responseTime = Date.now() - startTime;
    const endpoint = req.route ? req.route.path : req.path;
    
    // Enregistrer les métriques
    metricsCollector.recordRequest(
      req.method,
      endpoint,
      res.statusCode,
      responseTime
    );
    
    // Appeler la méthode send originale
    originalSend.call(this, data);
  };
  
  next();
};

// Middleware pour enregistrer les erreurs
const errorMetricsMiddleware = (err, req, res, next) => {
  const endpoint = req.route ? req.route.path : req.path;
  
  // Enregistrer l'erreur dans les métriques
  metricsCollector.recordError(
    err.name || 'UnknownError',
    endpoint,
    err
  );
  
  // Logger l'erreur
  logError(err, {
    method: req.method,
    url: req.url,
    endpoint,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress
  });
  
  next(err);
};

// Middleware pour surveiller les performances
const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime();
  
  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // en millisecondes
    
    // Logger les requêtes lentes (> 1 seconde)
    if (duration > 1000) {
      console.warn(`🐌 Requête lente détectée: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    }
  });
  
  next();
};

// Middleware pour surveiller l'utilisation mémoire
const memoryMonitoringMiddleware = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const memUsageMB = {
    rss: Math.round(memUsage.rss / 1024 / 1024),
    heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
    external: Math.round(memUsage.external / 1024 / 1024)
  };
  
  // Avertir si l'utilisation mémoire est élevée
  if (memUsageMB.heapUsed > 500) { // 500MB
    console.warn(`⚠️ Utilisation mémoire élevée: ${memUsageMB.heapUsed}MB`);
  }
  
  next();
};

// Middleware pour surveiller les requêtes Web3
const web3MonitoringMiddleware = (req, res, next) => {
  // Intercepter les appels aux services Web3
  const originalSend = res.send;
  res.send = function(data) {
    // Vérifier si c'est une requête Web3
    if (req.path.includes('/api/web3/')) {
      const responseTime = Date.now() - req.startTime;
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      // Déterminer le service (Blockchain ou IPFS)
      let service = 'blockchain';
      if (req.path.includes('/ipfs/')) {
        service = 'ipfs';
      }
      
      // Enregistrer les métriques Web3
      metricsCollector.recordWeb3Operation(
        service,
        req.method.toLowerCase(),
        success,
        responseTime,
        {
          endpoint: req.path,
          statusCode: res.statusCode
        }
      );
    }
    
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
};

// Middleware pour surveiller les requêtes base de données
const databaseMonitoringMiddleware = (req, res, next) => {
  // Intercepter les requêtes Prisma
  const originalSend = res.send;
  res.send = function(data) {
    // Vérifier si c'est une requête qui utilise la base de données
    if (req.path.includes('/api/') && !req.path.includes('/health')) {
      const responseTime = Date.now() - req.startTime;
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      // Enregistrer les métriques base de données
      metricsCollector.recordDatabaseQuery(
        success,
        responseTime,
        `${req.method} ${req.path}`
      );
    }
    
    originalSend.call(this, data);
  };
  
  req.startTime = Date.now();
  next();
};

// Middleware pour surveiller les uploads de fichiers
const uploadMonitoringMiddleware = (req, res, next) => {
  if (req.file) {
    const fileSize = req.file.size;
    const fileType = req.file.mimetype;
    
    console.log(`📁 Upload détecté: ${fileType} (${Math.round(fileSize / 1024)}KB)`);
    
    // Avertir pour les gros fichiers
    if (fileSize > 5 * 1024 * 1024) { // 5MB
      console.warn(`⚠️ Gros fichier uploadé: ${Math.round(fileSize / 1024 / 1024)}MB`);
    }
  }
  
  next();
};

// Middleware pour surveiller les tentatives d'authentification
const authMonitoringMiddleware = (req, res, next) => {
  if (req.path.includes('/auth/')) {
    const originalSend = res.send;
    res.send = function(data) {
      const success = res.statusCode >= 200 && res.statusCode < 400;
      
      if (req.path.includes('/login')) {
        console.log(`🔐 Tentative de connexion: ${success ? 'Succès' : 'Échec'}`);
      } else if (req.path.includes('/register')) {
        console.log(`📝 Inscription: ${success ? 'Succès' : 'Échec'}`);
      }
      
      originalSend.call(this, data);
    };
  }
  
  next();
};

module.exports = {
  metricsMiddleware,
  errorMetricsMiddleware,
  performanceMiddleware,
  memoryMonitoringMiddleware,
  web3MonitoringMiddleware,
  databaseMonitoringMiddleware,
  uploadMonitoringMiddleware,
  authMonitoringMiddleware
};
