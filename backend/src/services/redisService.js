const Redis = require('ioredis');
const { logInfo, logError, logWarning } = require('../utils/logger');

class RedisService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.retryAttempts = 0;
    this.maxRetries = 5;
    this.retryDelay = 1000;
  }

  async initialize() {
    try {
      // Configuration Redis
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        db: process.env.REDIS_DB || 0,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        keepAlive: 30000,
        connectTimeout: 10000,
        commandTimeout: 5000
      };

      this.client = new Redis(redisConfig);

      // Gestion des événements
      this.client.on('connect', () => {
        console.log('✅ Redis connecté');
        this.isConnected = true;
        this.retryAttempts = 0;
      });

      this.client.on('error', (error) => {
        console.error('❌ Erreur Redis:', error.message);
        this.isConnected = false;
        this.handleConnectionError(error);
      });

      this.client.on('close', () => {
        console.log('⚠️ Connexion Redis fermée');
        this.isConnected = false;
      });

      this.client.on('reconnecting', () => {
        console.log('🔄 Reconnexion Redis...');
      });

      // Test de connexion
      await this.client.ping();
      
      logInfo('Redis service initialisé', { 
        host: redisConfig.host, 
        port: redisConfig.port 
      });
      
      return true;
    } catch (error) {
      logError(error, { service: 'Redis', operation: 'initialize' });
      this.isConnected = false;
      return false;
    }
  }

  handleConnectionError(error) {
    this.retryAttempts++;
    
    if (this.retryAttempts <= this.maxRetries) {
      logWarning(`Tentative de reconnexion Redis ${this.retryAttempts}/${this.maxRetries}`, {
        error: error.message
      });
      
      setTimeout(() => {
        this.initialize();
      }, this.retryDelay * this.retryAttempts);
    } else {
      logError(new Error('Impossible de se connecter à Redis après plusieurs tentatives'), {
        attempts: this.retryAttempts
      });
    }
  }

  // Vérifier la connexion
  async isReady() {
    if (!this.client || !this.isConnected) {
      return false;
    }
    
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.isConnected = false;
      return false;
    }
  }

  // Opérations de base
  async set(key, value, ttl = null) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await this.client.setex(key, ttl, serializedValue);
      } else {
        await this.client.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      logError(error, { operation: 'set', key, ttl });
      throw error;
    }
  }

  async get(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logError(error, { operation: 'get', key });
      throw error;
    }
  }

  async del(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      logError(error, { operation: 'del', key });
      throw error;
    }
  }

  async exists(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logError(error, { operation: 'exists', key });
      throw error;
    }
  }

  async expire(key, ttl) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      logError(error, { operation: 'expire', key, ttl });
      throw error;
    }
  }

  async ttl(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      return await this.client.ttl(key);
    } catch (error) {
      logError(error, { operation: 'ttl', key });
      throw error;
    }
  }

  // Opérations de cache
  async cache(key, fetchFunction, ttl = 3600) {
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
      logError(error, { operation: 'cache', key, ttl });
      throw error;
    }
  }

  // Cache avec invalidation
  async cacheWithInvalidation(key, fetchFunction, ttl = 3600, invalidationKeys = []) {
    try {
      const data = await this.cache(key, fetchFunction, ttl);
      
      // Stocker les clés d'invalidation
      if (invalidationKeys.length > 0) {
        await this.sadd(`invalidation:${key}`, invalidationKeys);
      }
      
      return data;
    } catch (error) {
      logError(error, { operation: 'cacheWithInvalidation', key, ttl });
      throw error;
    }
  }

  // Invalider le cache
  async invalidateCache(pattern) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
      return keys.length;
    } catch (error) {
      logError(error, { operation: 'invalidateCache', pattern });
      throw error;
    }
  }

  // Opérations sur les listes
  async lpush(key, ...values) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const serializedValues = values.map(v => JSON.stringify(v));
      return await this.client.lpush(key, ...serializedValues);
    } catch (error) {
      logError(error, { operation: 'lpush', key });
      throw error;
    }
  }

  async rpop(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const value = await this.client.rpop(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logError(error, { operation: 'rpop', key });
      throw error;
    }
  }

  async llen(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      return await this.client.llen(key);
    } catch (error) {
      logError(error, { operation: 'llen', key });
      throw error;
    }
  }

  // Opérations sur les ensembles
  async sadd(key, ...members) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const serializedMembers = members.map(m => JSON.stringify(m));
      return await this.client.sadd(key, ...serializedMembers);
    } catch (error) {
      logError(error, { operation: 'sadd', key });
      throw error;
    }
  }

  async smembers(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const members = await this.client.smembers(key);
      return members.map(m => JSON.parse(m));
    } catch (error) {
      logError(error, { operation: 'smembers', key });
      throw error;
    }
  }

  // Opérations sur les hash
  async hset(key, field, value) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const serializedValue = JSON.stringify(value);
      return await this.client.hset(key, field, serializedValue);
    } catch (error) {
      logError(error, { operation: 'hset', key, field });
      throw error;
    }
  }

  async hget(key, field) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const value = await this.client.hget(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logError(error, { operation: 'hget', key, field });
      throw error;
    }
  }

  async hgetall(key) {
    if (!await this.isReady()) {
      throw new Error('Redis non connecté');
    }

    try {
      const hash = await this.client.hgetall(key);
      const result = {};
      for (const [field, value] of Object.entries(hash)) {
        result[field] = JSON.parse(value);
      }
      return result;
    } catch (error) {
      logError(error, { operation: 'hgetall', key });
      throw error;
    }
  }

  // Gestion des sessions
  async setSession(sessionId, sessionData, ttl = 86400) {
    const key = `session:${sessionId}`;
    return await this.set(key, sessionData, ttl);
  }

  async getSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.get(key);
  }

  async deleteSession(sessionId) {
    const key = `session:${sessionId}`;
    return await this.del(key);
  }

  // Statistiques
  async getStats() {
    if (!await this.isReady()) {
      return null;
    }

    try {
      const info = await this.client.info();
      const memory = await this.client.memory('usage');
      const dbsize = await this.client.dbsize();
      
      return {
        connected: this.isConnected,
        dbsize,
        memory,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {})
      };
    } catch (error) {
      logError(error, { operation: 'getStats' });
      return null;
    }
  }

  // Fermer la connexion
  async close() {
    if (this.client) {
      await this.client.quit();
      this.isConnected = false;
      console.log('✅ Connexion Redis fermée');
    }
  }
}

module.exports = new RedisService();
