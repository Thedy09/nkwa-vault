const { logPerformance, logWeb3Operation } = require('./logger');

class MetricsCollector {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
        responseTimes: []
      },
      web3: {
        blockchain: {
          operations: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        },
        ipfs: {
          operations: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        }
      },
      database: {
        queries: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      performance: {
        memoryUsage: [],
        cpuUsage: [],
        uptime: 0
      }
    };
    
    this.startTime = Date.now();
    this.intervalId = null;
  }

  // Initialiser la collecte de métriques
  start() {
    // Collecter les métriques système toutes les 30 secondes
    this.intervalId = setInterval(() => {
      this.collectSystemMetrics();
    }, 30000);
    
    console.log('📊 Système de métriques initialisé');
  }

  // Arrêter la collecte de métriques
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Enregistrer une requête HTTP
  recordRequest(method, endpoint, statusCode, responseTime) {
    this.metrics.requests.total++;
    
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.successful++;
    } else {
      this.metrics.requests.failed++;
    }

    // Enregistrer par endpoint
    if (!this.metrics.requests.byEndpoint[endpoint]) {
      this.metrics.requests.byEndpoint[endpoint] = {
        total: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      };
    }
    
    this.metrics.requests.byEndpoint[endpoint].total++;
    if (statusCode >= 200 && statusCode < 400) {
      this.metrics.requests.byEndpoint[endpoint].successful++;
    } else {
      this.metrics.requests.byEndpoint[endpoint].failed++;
    }

    // Enregistrer par méthode
    if (!this.metrics.requests.byMethod[method]) {
      this.metrics.requests.byMethod[method] = 0;
    }
    this.metrics.requests.byMethod[method]++;

    // Enregistrer le temps de réponse
    this.metrics.requests.responseTimes.push(responseTime);
    
    // Garder seulement les 1000 derniers temps de réponse
    if (this.metrics.requests.responseTimes.length > 1000) {
      this.metrics.requests.responseTimes = this.metrics.requests.responseTimes.slice(-1000);
    }

    // Calculer la moyenne des temps de réponse
    const avgResponseTime = this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.requests.responseTimes.length;
    this.metrics.requests.byEndpoint[endpoint].averageResponseTime = Math.round(avgResponseTime);

    // Logger la performance
    logPerformance(`${method} ${endpoint}`, responseTime, {
      statusCode,
      endpoint,
      method
    });
  }

  // Enregistrer une opération Web3
  recordWeb3Operation(service, operation, success, responseTime, metadata = {}) {
    const serviceKey = service.toLowerCase();
    
    if (!this.metrics.web3[serviceKey]) {
      this.metrics.web3[serviceKey] = {
        operations: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      };
    }

    this.metrics.web3[serviceKey].operations++;
    
    if (success) {
      this.metrics.web3[serviceKey].successful++;
    } else {
      this.metrics.web3[serviceKey].failed++;
    }

    // Calculer la moyenne des temps de réponse
    const currentAvg = this.metrics.web3[serviceKey].averageResponseTime;
    const totalOps = this.metrics.web3[serviceKey].operations;
    this.metrics.web3[serviceKey].averageResponseTime = Math.round(
      (currentAvg * (totalOps - 1) + responseTime) / totalOps
    );

    // Logger l'opération Web3
    logWeb3Operation(`${service}.${operation}`, { success }, {
      responseTime,
      metadata
    });
  }

  // Enregistrer une requête base de données
  recordDatabaseQuery(success, responseTime, query = '') {
    this.metrics.database.queries++;
    
    if (success) {
      this.metrics.database.successful++;
    } else {
      this.metrics.database.failed++;
    }

    // Calculer la moyenne des temps de réponse
    const currentAvg = this.metrics.database.averageResponseTime;
    const totalQueries = this.metrics.database.queries;
    this.metrics.database.averageResponseTime = Math.round(
      (currentAvg * (totalQueries - 1) + responseTime) / totalQueries
    );

    // Logger la performance
    logPerformance('Database Query', responseTime, {
      success,
      query: query.substring(0, 100) // Limiter la taille du log
    });
  }

  // Enregistrer une erreur
  recordError(errorType, endpoint, error) {
    this.metrics.errors.total++;
    
    if (!this.metrics.errors.byType[errorType]) {
      this.metrics.errors.byType[errorType] = 0;
    }
    this.metrics.errors.byType[errorType]++;

    if (!this.metrics.errors.byEndpoint[endpoint]) {
      this.metrics.errors.byEndpoint[endpoint] = 0;
    }
    this.metrics.errors.byEndpoint[endpoint]++;
  }

  // Collecter les métriques système
  collectSystemMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    this.metrics.performance.memoryUsage.push({
      rss: memUsage.rss,
      heapTotal: memUsage.heapTotal,
      heapUsed: memUsage.heapUsed,
      external: memUsage.external,
      timestamp: Date.now()
    });

    this.metrics.performance.cpuUsage.push({
      user: cpuUsage.user,
      system: cpuUsage.system,
      timestamp: Date.now()
    });

    this.metrics.performance.uptime = Date.now() - this.startTime;

    // Garder seulement les 100 dernières entrées
    if (this.metrics.performance.memoryUsage.length > 100) {
      this.metrics.performance.memoryUsage = this.metrics.performance.memoryUsage.slice(-100);
    }
    if (this.metrics.performance.cpuUsage.length > 100) {
      this.metrics.performance.cpuUsage = this.metrics.performance.cpuUsage.slice(-100);
    }
  }

  // Obtenir les métriques
  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime
    };
  }

  // Obtenir un résumé des métriques
  getSummary() {
    const uptime = Date.now() - this.startTime;
    const uptimeHours = Math.round(uptime / (1000 * 60 * 60) * 100) / 100;
    
    return {
      uptime: `${uptimeHours}h`,
      requests: {
        total: this.metrics.requests.total,
        successRate: this.metrics.requests.total > 0 
          ? Math.round((this.metrics.requests.successful / this.metrics.requests.total) * 100) 
          : 0,
        averageResponseTime: this.metrics.requests.responseTimes.length > 0
          ? Math.round(this.metrics.requests.responseTimes.reduce((a, b) => a + b, 0) / this.metrics.requests.responseTimes.length)
          : 0
      },
      web3: {
        blockchain: {
          operations: this.metrics.web3.blockchain.operations,
          successRate: this.metrics.web3.blockchain.operations > 0
            ? Math.round((this.metrics.web3.blockchain.successful / this.metrics.web3.blockchain.operations) * 100)
            : 0
        },
        ipfs: {
          operations: this.metrics.web3.ipfs.operations,
          successRate: this.metrics.web3.ipfs.operations > 0
            ? Math.round((this.metrics.web3.ipfs.successful / this.metrics.web3.ipfs.operations) * 100)
            : 0
        }
      },
      database: {
        queries: this.metrics.database.queries,
        successRate: this.metrics.database.queries > 0
          ? Math.round((this.metrics.database.successful / this.metrics.database.queries) * 100)
          : 0
      },
      errors: {
        total: this.metrics.errors.total,
        byType: this.metrics.errors.byType
      }
    };
  }

  // Réinitialiser les métriques
  reset() {
    this.metrics = {
      requests: {
        total: 0,
        successful: 0,
        failed: 0,
        byEndpoint: {},
        byMethod: {},
        responseTimes: []
      },
      web3: {
        blockchain: {
          operations: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        },
        ipfs: {
          operations: 0,
          successful: 0,
          failed: 0,
          averageResponseTime: 0
        }
      },
      database: {
        queries: 0,
        successful: 0,
        failed: 0,
        averageResponseTime: 0
      },
      errors: {
        total: 0,
        byType: {},
        byEndpoint: {}
      },
      performance: {
        memoryUsage: [],
        cpuUsage: [],
        uptime: 0
      }
    };
    this.startTime = Date.now();
  }
}

// Instance singleton
const metricsCollector = new MetricsCollector();

module.exports = metricsCollector;
