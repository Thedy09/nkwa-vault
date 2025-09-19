const redisService = require('../services/redisService');
const { logInfo, logError } = require('../utils/logger');

// Middleware de cache générique
const cacheMiddleware = (ttl = 3600, keyGenerator = null) => {
  return async (req, res, next) => {
    try {
      // Vérifier si Redis est disponible
      if (!await redisService.isReady()) {
        return next();
      }

      // Générer la clé de cache
      const cacheKey = keyGenerator 
        ? keyGenerator(req) 
        : `cache:${req.method}:${req.originalUrl}`;

      // Essayer de récupérer depuis le cache
      const cached = await redisService.get(cacheKey);
      
      if (cached !== null) {
        logInfo('Cache hit', { key: cacheKey, url: req.originalUrl });
        return res.json(cached);
      }

      // Intercepter la réponse pour la mettre en cache
      const originalSend = res.send;
      res.send = function(data) {
        // Mettre en cache seulement les réponses réussies
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(data);
            redisService.set(cacheKey, responseData, ttl);
            logInfo('Response cached', { key: cacheKey, ttl });
          } catch (error) {
            logError(error, { operation: 'cache_response', key: cacheKey });
          }
        }
        
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logError(error, { operation: 'cache_middleware' });
      next();
    }
  };
};

// Middleware de cache pour les collections du musée
const museumCacheMiddleware = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    const { type, culture, country, search, limit, offset } = req.query;
    return `museum:collection:${type || 'all'}:${culture || 'all'}:${country || 'all'}:${search || 'all'}:${limit || 50}:${offset || 0}`;
  });
};

// Middleware de cache pour les statistiques
const statsCacheMiddleware = (ttl = 300) => {
  return cacheMiddleware(ttl, (req) => {
    return `stats:${req.path}`;
  });
};

// Middleware de cache pour les recherches
const searchCacheMiddleware = (ttl = 600) => {
  return cacheMiddleware(ttl, (req) => {
    const { q, type, culture, country, tags } = req.query;
    return `search:${q || 'empty'}:${type || 'all'}:${culture || 'all'}:${country || 'all'}:${tags || 'all'}`;
  });
};

// Middleware de cache pour les contenus culturels
const culturalContentCacheMiddleware = (ttl = 3600) => {
  return cacheMiddleware(ttl, (req) => {
    const { id } = req.params;
    const { type, culture, language } = req.query;
    return `cultural:${id || 'list'}:${type || 'all'}:${culture || 'all'}:${language || 'all'}`;
  });
};

// Middleware de cache pour les devinettes
const riddlesCacheMiddleware = (ttl = 1800) => {
  return cacheMiddleware(ttl, (req) => {
    const { category, difficulty, language, region } = req.query;
    return `riddles:${category || 'all'}:${difficulty || 'all'}:${language || 'all'}:${region || 'all'}`;
  });
};

// Fonction pour invalider le cache
const invalidateCache = async (pattern) => {
  try {
    if (await redisService.isReady()) {
      const deleted = await redisService.invalidateCache(pattern);
      logInfo('Cache invalidated', { pattern, deleted });
      return deleted;
    }
  } catch (error) {
    logError(error, { operation: 'invalidate_cache', pattern });
  }
  return 0;
};

// Fonction pour invalider le cache du musée
const invalidateMuseumCache = async () => {
  return await invalidateCache('museum:*');
};

// Fonction pour invalider le cache des contenus culturels
const invalidateCulturalContentCache = async () => {
  return await invalidateCache('cultural:*');
};

// Fonction pour invalider le cache des devinettes
const invalidateRiddlesCache = async () => {
  return await invalidateCache('riddles:*');
};

// Fonction pour invalider le cache des statistiques
const invalidateStatsCache = async () => {
  return await invalidateCache('stats:*');
};

// Fonction pour invalider le cache des recherches
const invalidateSearchCache = async () => {
  return await invalidateCache('search:*');
};

// Middleware pour invalider le cache après modification
const cacheInvalidationMiddleware = (invalidationFunction) => {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      // Invalider le cache seulement pour les requêtes de modification réussies
      if (res.statusCode >= 200 && res.statusCode < 300 && 
          ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        invalidationFunction().catch(error => {
          logError(error, { operation: 'cache_invalidation' });
        });
      }
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Middleware de cache conditionnel
const conditionalCacheMiddleware = (condition, ttl = 3600) => {
  return (req, res, next) => {
    if (condition(req)) {
      return cacheMiddleware(ttl)(req, res, next);
    }
    next();
  };
};

// Middleware de cache avec headers
const cacheWithHeadersMiddleware = (ttl = 3600) => {
  return async (req, res, next) => {
    try {
      if (!await redisService.isReady()) {
        return next();
      }

      const cacheKey = `cache:${req.method}:${req.originalUrl}`;
      const cached = await redisService.get(cacheKey);
      
      if (cached !== null) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', cacheKey);
        return res.json(cached);
      }

      const originalSend = res.send;
      res.send = function(data) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const responseData = JSON.parse(data);
            redisService.set(cacheKey, responseData, ttl);
            res.set('X-Cache', 'MISS');
            res.set('X-Cache-Key', cacheKey);
            res.set('X-Cache-TTL', ttl);
          } catch (error) {
            logError(error, { operation: 'cache_with_headers' });
          }
        }
        
        originalSend.call(this, data);
      };

      next();
    } catch (error) {
      logError(error, { operation: 'cache_with_headers_middleware' });
      next();
    }
  };
};

module.exports = {
  cacheMiddleware,
  museumCacheMiddleware,
  statsCacheMiddleware,
  searchCacheMiddleware,
  culturalContentCacheMiddleware,
  riddlesCacheMiddleware,
  invalidateCache,
  invalidateMuseumCache,
  invalidateCulturalContentCache,
  invalidateRiddlesCache,
  invalidateStatsCache,
  invalidateSearchCache,
  cacheInvalidationMiddleware,
  conditionalCacheMiddleware,
  cacheWithHeadersMiddleware
};
