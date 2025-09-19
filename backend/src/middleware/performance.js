const compression = require('compression');
const { logPerformance } = require('../utils/logger');
const paginationService = require('../utils/pagination');

// Middleware de compression
const compressionMiddleware = compression({
  level: 6, // Niveau de compression (1-9)
  threshold: 1024, // Seuil minimum pour la compression (1KB)
  filter: (req, res) => {
    // Ne pas compresser les images déjà compressées
    if (req.headers['x-no-compression']) {
      return false;
    }
    
    // Utiliser la compression par défaut
    return compression.filter(req, res);
  }
});

// Middleware de mesure de performance
const performanceMiddleware = (req, res, next) => {
  const startTime = process.hrtime();
  const startMemory = process.memoryUsage();

  res.on('finish', () => {
    const [seconds, nanoseconds] = process.hrtime(startTime);
    const duration = seconds * 1000 + nanoseconds / 1000000; // en millisecondes
    
    const endMemory = process.memoryUsage();
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed,
      heapTotal: endMemory.heapTotal - startMemory.heapTotal,
      external: endMemory.external - startMemory.external
    };

    // Logger les performances
    logPerformance(`${req.method} ${req.url}`, duration, {
      statusCode: res.statusCode,
      memoryDelta,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Avertir pour les requêtes lentes
    if (duration > 1000) {
      console.warn(`🐌 Requête lente: ${req.method} ${req.url} - ${duration.toFixed(2)}ms`);
    }

    // Avertir pour l'utilisation mémoire élevée
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // 10MB
      console.warn(`⚠️ Utilisation mémoire élevée: ${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`);
    }
  });

  next();
};

// Middleware de pagination automatique
const paginationMiddleware = (options = {}) => {
  return (req, res, next) => {
    const pagination = paginationService.calculatePagination(req.query);
    req.pagination = pagination;
    
    // Ajouter les options de pagination à la requête
    req.paginationOptions = {
      ...options,
      limit: pagination.limit,
      skip: pagination.skip
    };
    
    next();
  };
};

// Middleware de cache des en-têtes
const cacheHeadersMiddleware = (maxAge = 3600) => {
  return (req, res, next) => {
    // Définir les en-têtes de cache pour les requêtes GET
    if (req.method === 'GET') {
      res.set('Cache-Control', `public, max-age=${maxAge}`);
      res.set('ETag', `"${Date.now()}"`);
    }
    
    next();
  };
};

// Middleware de compression des réponses JSON
const jsonCompressionMiddleware = (req, res, next) => {
  const originalJson = res.json;
  
  res.json = function(data) {
    // Compresser les réponses JSON volumineuses
    if (JSON.stringify(data).length > 1024) {
      res.set('Content-Encoding', 'gzip');
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Middleware de limitation de taille de réponse
const responseSizeLimitMiddleware = (maxSize = 10 * 1024 * 1024) => { // 10MB
  return (req, res, next) => {
    const originalSend = res.send;
    let responseSize = 0;
    
    res.send = function(data) {
      responseSize += Buffer.byteLength(data, 'utf8');
      
      if (responseSize > maxSize) {
        return res.status(413).json({
          success: false,
          error: 'Réponse trop volumineuse',
          maxSize: maxSize,
          actualSize: responseSize
        });
      }
      
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware de préchargement des données
const preloadMiddleware = (preloadFunction) => {
  return async (req, res, next) => {
    try {
      // Précharger les données en arrière-plan
      if (preloadFunction) {
        preloadFunction(req, res).catch(error => {
          console.warn('Preload error:', error.message);
        });
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware de mise en cache des requêtes lentes
const slowQueryCacheMiddleware = (threshold = 1000) => {
  return (req, res, next) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      
      if (duration > threshold) {
        console.warn(`🐌 Requête lente détectée: ${req.method} ${req.url} - ${duration}ms`);
        
        // Suggérer des optimisations
        if (req.query && Object.keys(req.query).length === 0) {
          console.warn('💡 Suggestion: Ajoutez des filtres pour améliorer les performances');
        }
        
        if (req.url.includes('/search') && !req.query.q) {
          console.warn('💡 Suggestion: Utilisez un terme de recherche pour de meilleures performances');
        }
      }
    });
    
    next();
  };
};

// Middleware de monitoring des requêtes de base de données
const databaseMonitoringMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Logger les requêtes de base de données lentes
    if (duration > 500) {
      console.warn(`🗄️ Requête DB lente: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  
  next();
};

// Middleware de compression des images
const imageCompressionMiddleware = (req, res, next) => {
  if (req.file && req.file.mimetype.startsWith('image/')) {
    const originalSize = req.file.size;
    
    // Compresser l'image si elle est trop grande
    if (originalSize > 2 * 1024 * 1024) { // 2MB
      console.log(`🖼️ Image compressée: ${Math.round(originalSize / 1024)}KB`);
    }
  }
  
  next();
};

// Middleware de validation des performances
const performanceValidationMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    // Valider les performances selon le type de requête
    if (req.method === 'GET') {
      if (duration > 2000) {
        console.warn(`⚠️ Requête GET lente: ${req.url} - ${duration}ms`);
      }
    } else if (req.method === 'POST') {
      if (duration > 5000) {
        console.warn(`⚠️ Requête POST lente: ${req.url} - ${duration}ms`);
      }
    } else if (req.method === 'PUT' || req.method === 'PATCH') {
      if (duration > 3000) {
        console.warn(`⚠️ Requête ${req.method} lente: ${req.url} - ${duration}ms`);
      }
    } else if (req.method === 'DELETE') {
      if (duration > 1000) {
        console.warn(`⚠️ Requête DELETE lente: ${req.url} - ${duration}ms`);
      }
    }
  });
  
  next();
};

// Middleware de mise en cache des métadonnées
const metadataCacheMiddleware = (req, res, next) => {
  // Mettre en cache les métadonnées des requêtes
  if (req.method === 'GET' && req.url.includes('/metadata')) {
    res.set('Cache-Control', 'public, max-age=3600'); // 1 heure
  }
  
  next();
};

// Middleware de compression des réponses API
const apiCompressionMiddleware = (req, res, next) => {
  // Compresser les réponses API
  if (req.url.startsWith('/api/')) {
    res.set('Content-Encoding', 'gzip');
  }
  
  next();
};

module.exports = {
  compressionMiddleware,
  performanceMiddleware,
  paginationMiddleware,
  cacheHeadersMiddleware,
  jsonCompressionMiddleware,
  responseSizeLimitMiddleware,
  preloadMiddleware,
  slowQueryCacheMiddleware,
  databaseMonitoringMiddleware,
  imageCompressionMiddleware,
  performanceValidationMiddleware,
  metadataCacheMiddleware,
  apiCompressionMiddleware
};
