// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/nkwa_vault_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.HEDERA_NETWORK = 'testnet';

// Mock des services Web3 pour les tests
jest.mock('../services/hederaService', () => ({
  initialize: jest.fn().mockResolvedValue(true),
  createTopic: jest.fn().mockResolvedValue({ success: true, topicId: 'test-topic' }),
  submitMessage: jest.fn().mockResolvedValue({ success: true, sequenceNumber: '123' }),
  createContentNFT: jest.fn().mockResolvedValue({ success: true, contentId: 'test-content' }),
  rewardContributor: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../services/ipfsService', () => ({
  initialize: jest.fn().mockResolvedValue(true),
  uploadFile: jest.fn().mockResolvedValue({ success: true, cid: 'test-cid' }),
  uploadJSON: jest.fn().mockResolvedValue({ success: true, cid: 'test-cid' }),
  uploadImage: jest.fn().mockResolvedValue({ success: true, cid: 'test-cid' })
}));

// Mock de Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    culturalContent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    riddle: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}));

// Configuration des timeouts
jest.setTimeout(30000);
