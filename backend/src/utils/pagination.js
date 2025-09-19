const { logInfo } = require('./logger');

class PaginationService {
  constructor() {
    this.defaultLimit = 50;
    this.maxLimit = 100;
    this.defaultPage = 1;
  }

  // Calculer les paramètres de pagination
  calculatePagination(query) {
    const {
      page = this.defaultPage,
      limit = this.defaultLimit,
      offset = null
    } = query;

    const parsedPage = Math.max(1, parseInt(page));
    const parsedLimit = Math.min(this.maxLimit, Math.max(1, parseInt(limit)));
    
    let calculatedOffset;
    if (offset !== null) {
      calculatedOffset = Math.max(0, parseInt(offset));
    } else {
      calculatedOffset = (parsedPage - 1) * parsedLimit;
    }

    return {
      page: parsedPage,
      limit: parsedLimit,
      offset: calculatedOffset,
      skip: calculatedOffset
    };
  }

  // Créer la réponse paginée
  createPaginatedResponse(data, pagination, total, baseUrl = '', query = {}) => {
    const { page, limit, offset } = pagination;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Créer les liens de pagination
    const links = this.createPaginationLinks(baseUrl, query, page, totalPages);

    return {
      data,
      pagination: {
        page,
        limit,
        offset,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
        links
      }
    };
  }

  // Créer les liens de pagination
  createPaginationLinks(baseUrl, query, currentPage, totalPages) {
    const links = {
      first: null,
      last: null,
      next: null,
      prev: null
    };

    if (totalPages <= 1) {
      return links;
    }

    const createUrl = (page) => {
      const params = new URLSearchParams({ ...query, page });
      return `${baseUrl}?${params.toString()}`;
    };

    // Premier page
    if (currentPage > 1) {
      links.first = createUrl(1);
    }

    // Dernière page
    if (currentPage < totalPages) {
      links.last = createUrl(totalPages);
    }

    // Page suivante
    if (currentPage < totalPages) {
      links.next = createUrl(currentPage + 1);
    }

    // Page précédente
    if (currentPage > 1) {
      links.prev = createUrl(currentPage - 1);
    }

    return links;
  }

  // Appliquer la pagination à une requête Prisma
  async paginatePrismaQuery(prismaQuery, pagination, options = {}) {
    const { limit, skip } = pagination;
    const { orderBy, where } = options;

    try {
      // Compter le total
      const total = await prismaQuery.count({ where });

      // Exécuter la requête avec pagination
      const data = await prismaQuery.findMany({
        where,
        orderBy,
        skip,
        take: limit
      });

      return { data, total };
    } catch (error) {
      logInfo('Pagination error', { error: error.message, pagination });
      throw error;
    }
  }

  // Appliquer la pagination à un tableau
  paginateArray(array, pagination) {
    const { limit, skip } = pagination;
    const total = array.length;
    const data = array.slice(skip, skip + limit);

    return { data, total };
  }

  // Créer un curseur pour la pagination par curseur
  createCursor(data, cursorField = 'id') {
    if (!data || data.length === 0) {
      return null;
    }

    const lastItem = data[data.length - 1];
    return Buffer.from(JSON.stringify({
      field: cursorField,
      value: lastItem[cursorField],
      timestamp: new Date().toISOString()
    })).toString('base64');
  }

  // Décoder un curseur
  decodeCursor(cursor) {
    try {
      const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  // Pagination par curseur pour Prisma
  async paginateWithCursor(prismaQuery, cursor, limit, options = {}) {
    const { orderBy, where } = options;
    const decodedCursor = this.decodeCursor(cursor);

    let whereClause = where || {};
    let orderByClause = orderBy || { id: 'asc' };

    if (decodedCursor) {
      whereClause = {
        ...whereClause,
        [decodedCursor.field]: {
          gt: decodedCursor.value
        }
      };
    }

    try {
      const data = await prismaQuery.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take: limit + 1 // Prendre un élément de plus pour savoir s'il y a une page suivante
      });

      const hasNextPage = data.length > limit;
      if (hasNextPage) {
        data.pop(); // Retirer l'élément supplémentaire
      }

      const nextCursor = hasNextPage ? this.createCursor(data) : null;

      return {
        data,
        hasNextPage,
        nextCursor
      };
    } catch (error) {
      logInfo('Cursor pagination error', { error: error.message, cursor });
      throw error;
    }
  }

  // Optimiser les requêtes avec des index
  optimizeQuery(query, indexes = []) {
    const optimizedQuery = { ...query };

    // Ajouter des index suggérés
    if (indexes.length > 0) {
      optimizedQuery.indexes = indexes;
    }

    return optimizedQuery;
  }

  // Calculer les métriques de performance
  calculatePerformanceMetrics(startTime, endTime, totalItems, limit) {
    const duration = endTime - startTime;
    const itemsPerSecond = totalItems / (duration / 1000);
    const averageTimePerItem = duration / totalItems;

    return {
      duration,
      itemsPerSecond: Math.round(itemsPerSecond * 100) / 100,
      averageTimePerItem: Math.round(averageTimePerItem * 100) / 100,
      totalItems,
      limit
    };
  }

  // Créer une réponse de pagination optimisée
  createOptimizedResponse(data, pagination, total, performance, baseUrl = '', query = {}) {
    const response = this.createPaginatedResponse(data, pagination, total, baseUrl, query);
    
    // Ajouter les métriques de performance
    response.performance = performance;
    
    // Ajouter des suggestions d'optimisation
    if (performance.duration > 1000) {
      response.suggestions = {
        slowQuery: true,
        message: 'Cette requête est lente. Considérez utiliser des filtres plus spécifiques.',
        recommendations: [
          'Utilisez des filtres pour réduire le nombre de résultats',
          'Vérifiez que les index appropriés sont en place',
          'Considérez utiliser la pagination par curseur pour de gros datasets'
        ]
      };
    }

    return response;
  }
}

module.exports = new PaginationService();
