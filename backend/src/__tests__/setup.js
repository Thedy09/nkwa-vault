// Configuration globale pour les tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/nkwa_vault_test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.EVM_NETWORK = 'testnet';
process.env.EVM_CHAIN_ID = '84532';

// Mock des services Web3 pour les tests
jest.mock('../services/blockchainProvider', () => ({
  initialize: jest.fn().mockResolvedValue(true),
  isAvailable: jest.fn().mockReturnValue(true),
  isReady: jest.fn().mockReturnValue(false),
  getStatus: jest.fn().mockReturnValue({
    initialized: true,
    ready: false,
    demo: true,
    network: 'testnet',
    chainId: 84532
  }),
  certifyContent: jest.fn().mockResolvedValue({ success: true, txHash: '0xtest' }),
  recertifyContent: jest.fn().mockResolvedValue({ success: true, txHash: '0xtest' }),
  getContent: jest.fn().mockResolvedValue({ success: true, exists: false }),
  recordReward: jest.fn().mockResolvedValue({ success: true, txHash: '0xtest' }),
  getStats: jest.fn().mockResolvedValue({
    initialized: true,
    ready: false,
    demo: true,
    network: 'testnet',
    chainId: 84532,
    relayerAddress: '0x0000000000000000000000000000000000000000',
    registryContract: null,
    balanceEth: '0',
    totalCertifications: 0
  }),
  hashContent: jest.fn().mockReturnValue('0xtest'),
  toBytes32: jest.fn((value) => value)
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
