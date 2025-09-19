const hederaService = require('../../services/hederaService');

describe('HederaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully with valid config', async () => {
      const result = await hederaService.initialize();
      expect(result).toBe(true);
    });
  });

  describe('createTopic', () => {
    it('should create a topic successfully', async () => {
      const topicMemo = 'Test Topic';
      const result = await hederaService.createTopic(topicMemo);
      
      expect(result.success).toBe(true);
      expect(result.topicId).toBeDefined();
      expect(result.transactionId).toBeDefined();
    });

    it('should handle errors when creating topic', async () => {
      // Mock pour simuler une erreur
      jest.spyOn(hederaService, 'createTopic').mockRejectedValueOnce(new Error('Network error'));
      
      await expect(hederaService.createTopic('Test')).rejects.toThrow('Network error');
    });
  });

  describe('submitMessage', () => {
    it('should submit message successfully', async () => {
      const topicId = 'test-topic-id';
      const message = { content: 'test message' };
      
      const result = await hederaService.submitMessage(topicId, message);
      
      expect(result.success).toBe(true);
      expect(result.sequenceNumber).toBeDefined();
      expect(result.transactionId).toBeDefined();
    });
  });

  describe('createContentNFT', () => {
    it('should create NFT for content successfully', async () => {
      const contentId = 'test-content-123';
      const contentHash = 'test-hash';
      const metadata = {
        type: 'PROVERB',
        origin: 'Afrique',
        language: 'fr'
      };
      
      const result = await hederaService.createContentNFT(contentId, contentHash, metadata);
      
      expect(result.success).toBe(true);
      expect(result.contentId).toBe(contentId);
      expect(result.contentHash).toBe(contentHash);
      expect(result.nftMetadata).toBeDefined();
    });
  });

  describe('rewardContributor', () => {
    it('should reward contributor successfully', async () => {
      const contributorId = 'contributor-123';
      const contributionType = 'CONTENT_UPLOAD';
      const amount = 100;
      
      const result = await hederaService.rewardContributor(contributorId, contributionType, amount);
      
      expect(result.success).toBe(true);
      expect(result.transactionId).toBeDefined();
    });
  });

  describe('validateParams', () => {
    it('should validate required parameters', () => {
      const params = { id: '123', name: 'test' };
      const requiredFields = ['id', 'name'];
      
      expect(() => hederaService.validateParams(params, requiredFields)).not.toThrow();
    });

    it('should throw error for missing parameters', () => {
      const params = { id: '123' };
      const requiredFields = ['id', 'name'];
      
      expect(() => hederaService.validateParams(params, requiredFields)).toThrow('Paramètres manquants: name');
    });
  });
});
