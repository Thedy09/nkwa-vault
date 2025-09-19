const redisService = require('./redisService');
const { logInfo, logWarning, logError } = require('../utils/logger');

class SmartCacheService {
  constructor() {
    this.cachePrefix = 'nkwa:';
    this.defaultTTL = 3600; // 1 heure
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  // Générer une clé de cache
  generateKey(prefix, ...parts) {
    const keyParts = [this.cachePrefix, prefix, ...parts.filter(Boolean)];
    return keyParts.join(':');
  }

  // Mettre en cache une valeur
  async set(key, value, ttl = this.defaultTTL, options = {}) {
    try {
      if (!await redisService.isReady()) {
        return false;
      }

      const cacheKey = this.generateKey(...key);
      const cacheValue = {
        data: value,
        timestamp: Date.now(),
        ttl,
        ...options
      };

      await redisService.set(cacheKey, cacheValue, ttl);
      this.cacheStats.sets++;
      
      logInfo('Cache set', { key: cacheKey, ttl });
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_set', key });
      return false;
    }
  }

  // Récupérer une valeur du cache
  async get(key) {
    try {
      if (!await redisService.isReady()) {
        return null;
      }

      const cacheKey = this.generateKey(...key);
      const cached = await redisService.get(cacheKey);

      if (cached) {
        this.cacheStats.hits++;
        logInfo('Cache hit', { key: cacheKey });
        return cached.data;
      } else {
        this.cacheStats.misses++;
        logInfo('Cache miss', { key: cacheKey });
        return null;
      }
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_get', key });
      return null;
    }
  }

  // Supprimer une valeur du cache
  async delete(key) {
    try {
      if (!await redisService.isReady()) {
        return false;
      }

      const cacheKey = this.generateKey(...key);
      const deleted = await redisService.del(cacheKey);
      
      if (deleted) {
        this.cacheStats.deletes++;
        logInfo('Cache delete', { key: cacheKey });
      }
      
      return deleted;
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_delete', key });
      return false;
    }
  }

  // Vérifier si une clé existe
  async exists(key) {
    try {
      if (!await redisService.isReady()) {
        return false;
      }

      const cacheKey = this.generateKey(...key);
      return await redisService.exists(cacheKey);
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_exists', key });
      return false;
    }
  }

  // Mettre en cache avec fonction de fallback
  async remember(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Essayer de récupérer depuis le cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Si pas en cache, exécuter la fonction et mettre en cache
      const data = await fetchFunction();
      await this.set(key, data, ttl);
      return data;
    } catch (error) {
      logError(error, { operation: 'cache_remember', key });
      throw error;
    }
  }

  // Mettre en cache avec invalidation
  async rememberWithInvalidation(key, fetchFunction, ttl = this.defaultTTL, invalidationKeys = []) {
    try {
      const data = await this.remember(key, fetchFunction, ttl);
      
      // Stocker les clés d'invalidation
      if (invalidationKeys.length > 0) {
        const invalidationKey = this.generateKey('invalidation', ...key);
        await redisService.sadd(invalidationKey, invalidationKeys);
        await redisService.expire(invalidationKey, ttl);
      }
      
      return data;
    } catch (error) {
      logError(error, { operation: 'cache_remember_with_invalidation', key });
      throw error;
    }
  }

  // Invalider le cache par pattern
  async invalidate(pattern) {
    try {
      if (!await redisService.isReady()) {
        return 0;
      }

      const fullPattern = this.generateKey(pattern);
      const deleted = await redisService.invalidateCache(fullPattern);
      
      logInfo('Cache invalidated', { pattern: fullPattern, deleted });
      return deleted;
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_invalidate', pattern });
      return 0;
    }
  }

  // Invalider le cache par tags
  async invalidateByTags(tags) {
    try {
      if (!await redisService.isReady()) {
        return 0;
      }

      let totalDeleted = 0;
      
      for (const tag of tags) {
        const pattern = this.generateKey('tag', tag, '*');
        const deleted = await redisService.invalidateCache(pattern);
        totalDeleted += deleted;
      }
      
      logInfo('Cache invalidated by tags', { tags, deleted: totalDeleted });
      return totalDeleted;
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_invalidate_by_tags', tags });
      return 0;
    }
  }

  // Mettre en cache avec tags
  async setWithTags(key, value, tags, ttl = this.defaultTTL) {
    try {
      // Mettre en cache la valeur
      await this.set(key, value, ttl);
      
      // Ajouter les tags
      for (const tag of tags) {
        const tagKey = this.generateKey('tag', tag);
        await redisService.sadd(tagKey, this.generateKey(...key));
        await redisService.expire(tagKey, ttl);
      }
      
      return true;
    } catch (error) {
      this.cacheStats.errors++;
      logError(error, { operation: 'cache_set_with_tags', key, tags });
      return false;
    }
  }

  // Cache intelligent pour les collections
  async cacheCollection(collectionName, query, fetchFunction, ttl = 1800) {
    const cacheKey = ['collection', collectionName, JSON.stringify(query)];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les statistiques
  async cacheStats(statsName, fetchFunction, ttl = 300) {
    const cacheKey = ['stats', statsName];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les recherches
  async cacheSearch(searchTerm, filters, fetchFunction, ttl = 600) {
    const cacheKey = ['search', searchTerm, JSON.stringify(filters)];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les contenus culturels
  async cacheCulturalContent(contentId, fetchFunction, ttl = 3600) {
    const cacheKey = ['cultural', contentId];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les devinettes
  async cacheRiddles(filters, fetchFunction, ttl = 1800) {
    const cacheKey = ['riddles', JSON.stringify(filters)];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les utilisateurs
  async cacheUser(userId, fetchFunction, ttl = 1800) {
    const cacheKey = ['user', userId];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Cache intelligent pour les métadonnées
  async cacheMetadata(metadataType, fetchFunction, ttl = 7200) {
    const cacheKey = ['metadata', metadataType];
    return await this.remember(cacheKey, fetchFunction, ttl);
  }

  // Précharger les données
  async preload(key, fetchFunction, ttl = this.defaultTTL) {
    try {
      // Vérifier si déjà en cache
      const cached = await this.get(key);
      if (cached !== null) {
        return cached;
      }

      // Précharger en arrière-plan
      setImmediate(async () => {
        try {
          const data = await fetchFunction();
          await this.set(key, data, ttl);
          logInfo('Data preloaded', { key });
        } catch (error) {
          logError(error, { operation: 'cache_preload', key });
        }
      });

      return null;
    } catch (error) {
      logError(error, { operation: 'cache_preload', key });
      return null;
    }
  }

  // Nettoyer le cache expiré
  async cleanup() {
    try {
      if (!await redisService.isReady()) {
        return 0;
      }

      // Nettoyer les clés d'invalidation expirées
      const invalidationPattern = this.generateKey('invalidation', '*');
      const deleted = await redisService.invalidateCache(invalidationPattern);
      
      logInfo('Cache cleanup completed', { deleted });
      return deleted;
    } catch (error) {
      logError(error, { operation: 'cache_cleanup' });
      return 0;
    }
  }

  // Obtenir les statistiques du cache
  getStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    const hitRate = total > 0 ? (this.cacheStats.hits / total) * 100 : 0;
    
    return {
      ...this.cacheStats,
      hitRate: Math.round(hitRate * 100) / 100,
      total
    };
  }

  // Réinitialiser les statistiques
  resetStats() {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0
    };
  }

  // Obtenir la taille du cache
  async getCacheSize() {
    try {
      if (!await redisService.isReady()) {
        return 0;
      }

      const pattern = this.generateKey('*');
      const keys = await redisService.client.keys(pattern);
      return keys.length;
    } catch (error) {
      logError(error, { operation: 'cache_size' });
      return 0;
    }
  }

  // Vider le cache
  async flush() {
    try {
      if (!await redisService.isReady()) {
        return false;
      }

      const pattern = this.generateKey('*');
      const deleted = await redisService.invalidateCache(pattern);
      
      logInfo('Cache flushed', { deleted });
      return true;
    } catch (error) {
      logError(error, { operation: 'cache_flush' });
      return false;
    }
  }
}

module.exports = new SmartCacheService();
