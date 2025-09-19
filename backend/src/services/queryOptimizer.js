const { logInfo, logWarning } = require('../utils/logger');
const paginationService = require('../utils/pagination');

class QueryOptimizer {
  constructor() {
    this.queryCache = new Map();
    this.slowQueries = new Set();
    this.optimizationSuggestions = new Map();
  }

  // Optimiser une requête Prisma
  optimizePrismaQuery(query, options = {}) {
    const {
      select = true,
      include = false,
      orderBy = { createdAt: 'desc' },
      where = {},
      take = 50,
      skip = 0
    } = options;

    const optimizedQuery = {
      where: this.optimizeWhereClause(where),
      orderBy: this.optimizeOrderBy(orderBy),
      take: Math.min(take, 100), // Limiter à 100 éléments max
      skip: Math.max(skip, 0)
    };

    // Ajouter select ou include selon les besoins
    if (select && !include) {
      optimizedQuery.select = this.getSelectFields(query);
    } else if (include) {
      optimizedQuery.include = this.getIncludeFields(query);
    }

    return optimizedQuery;
  }

  // Optimiser la clause WHERE
  optimizeWhereClause(where) {
    const optimized = { ...where };

    // Optimiser les recherches textuelles
    if (optimized.title && typeof optimized.title === 'string') {
      optimized.title = {
        contains: optimized.title,
        mode: 'insensitive'
      };
    }

    if (optimized.description && typeof optimized.description === 'string') {
      optimized.description = {
        contains: optimized.description,
        mode: 'insensitive'
      };
    }

    // Optimiser les filtres de date
    if (optimized.createdAt) {
      if (typeof optimized.createdAt === 'object') {
        if (optimized.createdAt.gte) {
          optimized.createdAt.gte = new Date(optimized.createdAt.gte);
        }
        if (optimized.createdAt.lte) {
          optimized.createdAt.lte = new Date(optimized.createdAt.lte);
        }
      }
    }

    // Optimiser les filtres de statut
    if (optimized.status && Array.isArray(optimized.status)) {
      optimized.status = {
        in: optimized.status
      };
    }

    return optimized;
  }

  // Optimiser l'ordre de tri
  optimizeOrderBy(orderBy) {
    if (Array.isArray(orderBy)) {
      return orderBy.map(field => {
        if (typeof field === 'string') {
          return { [field]: 'desc' };
        }
        return field;
      });
    }

    if (typeof orderBy === 'string') {
      return { [orderBy]: 'desc' };
    }

    return orderBy;
  }

  // Obtenir les champs à sélectionner
  getSelectFields(query) {
    const baseFields = {
      id: true,
      createdAt: true,
      updatedAt: true
    };

    // Ajouter des champs spécifiques selon le type de requête
    if (query.includes('title')) {
      baseFields.title = true;
    }
    if (query.includes('description')) {
      baseFields.description = true;
    }
    if (query.includes('status')) {
      baseFields.status = true;
    }
    if (query.includes('type')) {
      baseFields.type = true;
    }

    return baseFields;
  }

  // Obtenir les relations à inclure
  getIncludeFields(query) {
    const include = {};

    if (query.includes('author')) {
      include.author = {
        select: {
          id: true,
          name: true,
          email: true
        }
      };
    }

    if (query.includes('stats')) {
      include.stats = true;
    }

    if (query.includes('reviews')) {
      include.reviews = {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true
        }
      };
    }

    return include;
  }

  // Optimiser une requête de recherche
  optimizeSearchQuery(searchTerm, filters = {}) {
    const optimized = {
      searchTerm: searchTerm.toLowerCase().trim(),
      filters: { ...filters }
    };

    // Optimiser les filtres de recherche
    if (optimized.filters.type && optimized.filters.type === 'all') {
      delete optimized.filters.type;
    }

    if (optimized.filters.culture && optimized.filters.culture === 'all') {
      delete optimized.filters.culture;
    }

    if (optimized.filters.country && optimized.filters.country === 'all') {
      delete optimized.filters.country;
    }

    return optimized;
  }

  // Optimiser une requête de pagination
  optimizePaginationQuery(query, total) {
    const pagination = paginationService.calculatePagination(query);
    
    // Ajuster la limite si nécessaire
    if (pagination.limit > total) {
      pagination.limit = total;
    }

    // Optimiser l'offset pour les grandes collections
    if (total > 10000 && pagination.offset > total / 2) {
      // Utiliser la pagination par curseur pour les grandes collections
      pagination.useCursor = true;
    }

    return pagination;
  }

  // Analyser les performances d'une requête
  analyzeQueryPerformance(query, executionTime, resultCount) {
    const analysis = {
      executionTime,
      resultCount,
      isSlow: executionTime > 1000,
      isVerySlow: executionTime > 5000,
      efficiency: resultCount / executionTime, // résultats par milliseconde
      suggestions: []
    };

    // Suggestions d'optimisation
    if (analysis.isSlow) {
      analysis.suggestions.push('Considérez ajouter des index sur les champs de recherche');
    }

    if (resultCount > 1000) {
      analysis.suggestions.push('Utilisez la pagination pour limiter les résultats');
    }

    if (executionTime > 2000) {
      analysis.suggestions.push('Considérez utiliser des filtres plus spécifiques');
    }

    // Enregistrer les requêtes lentes
    if (analysis.isSlow) {
      this.slowQueries.add(JSON.stringify(query));
      logWarning('Slow query detected', { query, executionTime, resultCount });
    }

    return analysis;
  }

  // Obtenir des suggestions d'optimisation
  getOptimizationSuggestions(query) {
    const suggestions = [];

    // Vérifier les index manquants
    if (query.where && query.where.title) {
      suggestions.push('Index suggéré sur le champ "title"');
    }

    if (query.where && query.where.status) {
      suggestions.push('Index suggéré sur le champ "status"');
    }

    if (query.where && query.where.createdAt) {
      suggestions.push('Index suggéré sur le champ "createdAt"');
    }

    // Vérifier les jointures coûteuses
    if (query.include && Object.keys(query.include).length > 3) {
      suggestions.push('Considérez réduire le nombre de relations incluses');
    }

    // Vérifier les tris coûteux
    if (query.orderBy && Array.isArray(query.orderBy) && query.orderBy.length > 2) {
      suggestions.push('Considérez simplifier l\'ordre de tri');
    }

    return suggestions;
  }

  // Mettre en cache une requête
  cacheQuery(query, result, ttl = 300000) { // 5 minutes par défaut
    const key = JSON.stringify(query);
    const cached = {
      result,
      timestamp: Date.now(),
      ttl
    };

    this.queryCache.set(key, cached);

    // Nettoyer le cache périodiquement
    this.cleanupCache();
  }

  // Récupérer une requête du cache
  getCachedQuery(query) {
    const key = JSON.stringify(query);
    const cached = this.queryCache.get(key);

    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.result;
    }

    if (cached) {
      this.queryCache.delete(key);
    }

    return null;
  }

  // Nettoyer le cache
  cleanupCache() {
    const now = Date.now();
    
    for (const [key, cached] of this.queryCache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.queryCache.delete(key);
      }
    }
  }

  // Obtenir les statistiques du cache
  getCacheStats() {
    return {
      size: this.queryCache.size,
      slowQueries: this.slowQueries.size,
      suggestions: this.optimizationSuggestions.size
    };
  }

  // Réinitialiser le cache
  resetCache() {
    this.queryCache.clear();
    this.slowQueries.clear();
    this.optimizationSuggestions.clear();
  }

  // Optimiser une requête de recherche textuelle
  optimizeTextSearch(searchTerm, fields = ['title', 'description']) {
    const optimized = {
      OR: fields.map(field => ({
        [field]: {
          contains: searchTerm,
          mode: 'insensitive'
        }
      }))
    };

    return optimized;
  }

  // Optimiser une requête de filtrage
  optimizeFiltering(filters) {
    const optimized = {};

    for (const [key, value] of Object.entries(filters)) {
      if (value === null || value === undefined || value === '') {
        continue;
      }

      if (Array.isArray(value)) {
        optimized[key] = {
          in: value
        };
      } else if (typeof value === 'string' && value.includes('*')) {
        optimized[key] = {
          contains: value.replace(/\*/g, ''),
          mode: 'insensitive'
        };
      } else {
        optimized[key] = value;
      }
    }

    return optimized;
  }
}

module.exports = new QueryOptimizer();
