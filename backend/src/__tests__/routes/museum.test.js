const request = require('supertest');
const express = require('express');
const museumRoute = require('../../routes/museum');

// Mock Prisma
const mockPrisma = {
  culturalContent: {
    findMany: jest.fn(),
    count: jest.fn()
  }
};

jest.mock('../../config/database', () => ({
  prisma: mockPrisma
}));

const app = express();
app.use(express.json());
app.use('/api/museum', museumRoute);

describe('Museum Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/museum/collection', () => {
    it('should return collection successfully', async () => {
      const mockCollection = [
        {
          id: '1',
          title: 'Test Art',
          type: 'ART',
          culture: 'Yoruba',
          country: 'Nigeria'
        }
      ];

      mockPrisma.culturalContent.findMany.mockResolvedValue(mockCollection);

      const response = await request(app)
        .get('/api/museum/collection')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.collection).toEqual(mockCollection);
    });

    it('should handle database errors', async () => {
      mockPrisma.culturalContent.findMany.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/api/museum/collection')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Erreur');
    });
  });

  describe('GET /api/museum/stats', () => {
    it('should return museum statistics', async () => {
      const mockStats = {
        total: 10,
        nfts: 2,
        freeArts: 8,
        cultures: ['Yoruba', 'Zulu'],
        countries: ['Nigeria', 'South Africa']
      };

      mockPrisma.culturalContent.count.mockResolvedValue(10);
      mockPrisma.culturalContent.findMany.mockResolvedValue([
        { culture: 'Yoruba', country: 'Nigeria', type: 'NFT' },
        { culture: 'Zulu', country: 'South Africa', type: 'ART' }
      ]);

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
          title: 'Test Search Result',
          type: 'ART'
        }
      ];

      mockPrisma.culturalContent.findMany.mockResolvedValue(mockResults);

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
      expect(response.body.message).toContain('requis');
    });
  });
});
