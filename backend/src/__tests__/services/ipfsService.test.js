jest.unmock('../../services/ipfsService');

const ipfsService = require('../../services/ipfsService');

describe('IPFSService', () => {
  beforeEach(async () => {
    await ipfsService.initialize();
  });

  describe('initialize', () => {
    it('should initialize without throwing', async () => {
      const result = await ipfsService.initialize();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully in demo mode', async () => {
      const result = await ipfsService.uploadFile(Buffer.from('test content'), 'test.txt');

      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.url).toBeDefined();
    });
  });

  describe('uploadJSON', () => {
    it('should upload JSON metadata successfully in demo mode', async () => {
      const result = await ipfsService.uploadJSON({ name: 'test', description: 'test description' });

      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
    });
  });

  describe('getGatewayUrl', () => {
    it('should convert IPFS URL to gateway URL', () => {
      const gatewayUrl = ipfsService.getGatewayUrl('ipfs://QmTest123');
      expect(gatewayUrl).toContain('QmTest123');
    });

    it('should return original URL if not IPFS URL', () => {
      const regularUrl = 'https://example.com/image.jpg';
      expect(ipfsService.getGatewayUrl(regularUrl)).toBe(regularUrl);
    });
  });
});
