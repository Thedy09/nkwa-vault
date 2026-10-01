const request = require('supertest');
const express = require('express');

const mockCollection = [
  {
    id: '1',
    name: 'Test Art',
    description: 'Test description',
    type: 'art',
    culture: 'Yoruba',
    country: 'Nigeria',
    tags: ['art']
  }
];

const mockMuseumCollectionService = {
  getCollection: jest.fn(),
  getCollectionStats: jest.fn(),
  searchCollection: jest.fn()
};

jest.mock('../../services/museumCollectionService', () => mockMuseumCollectionService);
jest.mock('../../middleware/cache', () => ({
  museumCacheMiddleware: () => (req, res, next) => next(),
  statsCacheMiddleware: () => (req, res, next) => next(),
  searchCacheMiddleware: () => (req, res, next) => next(),
  cacheInvalidationMiddleware: () => (req, res, next) => next(),
  invalidateMuseumCache: jest.fn()
}));

const museumRoute = require('../../routes/museum');

const app = express();
app.use(express.json());
app.use('/api/museum', museumRoute);

describe('Museum Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/museum/collection', () => {
    it('should return collection successfully', async () => {
      mockMuseumCollectionService.getCollection.mockResolvedValue(mockCollection);

      const response = await request(app)
        .get('/api/museum/collection')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collection).toEqual(mockCollection);
    });

    it('should handle service errors', async () => {
      mockMuseumCollectionService.getCollection.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/museum/collection')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Erreur');
    });
  });

  describe('GET /api/museum/stats', () => {
    it('should return museum statistics', async () => {
      mockMuseumCollectionService.getCollectionStats.mockResolvedValue({
        total: 1,
        nfts: 0,
        freeArts: 1,
        cultures: ['Yoruba'],
        countries: ['Nigeria']
      });

      const response = await request(app)
        .get('/api/museum/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.stats).toBeDefined();
    });
  });

  describe('GET /api/museum/search', () => {
    it('should search collection with query', async () => {
      const mockResults = [
        {
          id: '1',
          name: 'Test Search Result',
          type: 'art'
        }
      ];

      mockMuseumCollectionService.searchCollection.mockResolvedValue(mockResults);

      const response = await request(app)
        .get('/api/museum/search')
        .query({ q: 'test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.results).toEqual(mockResults);
    });

    it('should handle empty search query', async () => {
      const response = await request(app)
        .get('/api/museum/search')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('requis');
    });
  });
});
