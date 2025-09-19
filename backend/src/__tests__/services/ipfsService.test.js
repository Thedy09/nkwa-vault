const ipfsService = require('../../services/ipfsService');

describe('IPFSService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      const result = await ipfsService.initialize();
      expect(result).toBe(true);
    });
  });

  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      const fileBuffer = Buffer.from('test content');
      const fileName = 'test.txt';
      
      const result = await ipfsService.uploadFile(fileBuffer, fileName);
      
      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.size).toBeDefined();
      expect(result.url).toBeDefined();
    });

    it('should return mock upload when not initialized', async () => {
      ipfsService.isInitialized = false;
      
      const result = await ipfsService.uploadFile(Buffer.from('test'), 'test.txt');
      
      expect(result.success).toBe(true);
      expect(result.mock).toBe(true);
    });
  });

  describe('uploadJSON', () => {
    it('should upload JSON metadata successfully', async () => {
      const metadata = { name: 'test', description: 'test description' };
      
      const result = await ipfsService.uploadJSON(metadata);
      
      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.size).toBeDefined();
    });
  });

  describe('uploadImage', () => {
    it('should upload image successfully', async () => {
      const imageBuffer = Buffer.from('fake image data');
      const imageName = 'test.jpg';
      
      const result = await ipfsService.uploadImage(imageBuffer, imageName);
      
      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.gatewayUrl).toBeDefined();
    });
  });

  describe('uploadAudio', () => {
    it('should upload audio successfully', async () => {
      const audioBuffer = Buffer.from('fake audio data');
      const audioName = 'test.mp3';
      
      const result = await ipfsService.uploadAudio(audioBuffer, audioName);
      
      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.gatewayUrl).toBeDefined();
    });
  });

  describe('uploadVideo', () => {
    it('should upload video successfully', async () => {
      const videoBuffer = Buffer.from('fake video data');
      const videoName = 'test.mp4';
      
      const result = await ipfsService.uploadVideo(videoBuffer, videoName);
      
      expect(result.success).toBe(true);
      expect(result.cid).toBeDefined();
      expect(result.gatewayUrl).toBeDefined();
    });
  });

  describe('getGatewayUrl', () => {
    it('should convert IPFS URL to gateway URL', () => {
      const ipfsUrl = 'ipfs://QmTest123';
      const gatewayUrl = ipfsService.getGatewayUrl(ipfsUrl);
      
      expect(gatewayUrl).toBe('https://ipfs.io/ipfs/QmTest123');
    });

    it('should return original URL if not IPFS URL', () => {
      const regularUrl = 'https://example.com/image.jpg';
      const result = ipfsService.getGatewayUrl(regularUrl);
      
      expect(result).toBe(regularUrl);
    });
  });
});
