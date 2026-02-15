const crypto = require('crypto');
const blockchainProvider = require('./blockchainProvider');
const ipfsService = require('./ipfsService');
const { logError, logInfo, logWeb3Operation } = require('../utils/logger');
const metricsCollector = require('../utils/metrics');

class Web3CoreService {
  constructor() {
    this.isInitialized = false;
    this.blockchainReady = false;
    this.ipfsReady = false;
  }

  async initialize() {
    try {
      console.log('🚀 Initialisation du cœur Web3 (EVM + IPFS)...');

      this.blockchainReady = await blockchainProvider.initialize();
      this.ipfsReady = await ipfsService.initialize();
      this.isInitialized = true;

      if (this.blockchainReady) {
        console.log('✅ Blockchain EVM prête');
      } else {
        console.log('⚠️ Blockchain EVM en mode démo');
      }

      if (this.ipfsReady) {
        console.log('✅ IPFS prêt');
      } else {
        console.log('⚠️ IPFS en mode démo');
      }

      return true;
    } catch (error) {
      logError(error, { service: 'Web3Core', operation: 'initialize' });
      this.isInitialized = false;
      this.blockchainReady = false;
      this.ipfsReady = false;
      return false;
    }
  }

  isReady() {
    return this.isInitialized;
  }

  createContentHash(content) {
    const normalized = JSON.stringify(content, Object.keys(content).sort());
    return `0x${crypto.createHash('sha256').update(normalized).digest('hex')}`;
  }

  async uploadMediaFiles(mediaFiles) {
    const uploads = [];
    for (const file of mediaFiles) {
      const result = await ipfsService.uploadFile(file.buffer, file.originalname);
      uploads.push({
        originalName: file.originalname,
        mimeType: file.mimetype,
        cid: result.cid,
        url: result.url,
        gatewayUrl: ipfsService.getGatewayUrl(result.url),
        size: result.size,
        demo: !!result.mock
      });
    }
    return uploads;
  }

  async createCulturalContent(contentData, mediaFiles = []) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non initialisés');
    }

    const start = Date.now();

    try {
      const mediaUploads = await this.uploadMediaFiles(mediaFiles);
      const metadata = {
        id: contentData.id,
        title: contentData.title,
        content: contentData.content,
        type: contentData.type,
        language: contentData.language || 'fr',
        origin: contentData.origin || 'Afrique',
        region: contentData.region || null,
        country: contentData.country || null,
        authorName: contentData.authorName || 'Anonyme',
        media: mediaUploads,
        createdAt: new Date().toISOString(),
        platform: 'Nkwa V'
      };

      const metadataUpload = await ipfsService.uploadJSON(metadata);
      const contentHash = this.createContentHash({
        id: contentData.id,
        title: contentData.title,
        content: contentData.content,
        metadataCid: metadataUpload.cid
      });

      const certification = await blockchainProvider.certifyContent({
        contentId: contentData.id,
        contentHash,
        metadataCid: metadataUpload.cid,
        contentType: contentData.type,
        license: 'CC-BY',
        contributor: contentData.authorAddress,
        rawContent: metadata
      });

      const duration = Date.now() - start;
      metricsCollector.recordWeb3Operation(
        'blockchain',
        'createContent',
        true,
        duration
      );
      metricsCollector.recordWeb3Operation('ipfs', 'uploadMetadata', true, duration);
      logWeb3Operation('createCulturalContent', { success: true }, {
        contentId: contentData.id,
        txHash: certification.txHash,
        metadataCid: metadataUpload.cid,
        duration
      });

      return {
        success: true,
        contentId: contentData.id,
        contentHash,
        metadata,
        ipfs: {
          metadataCid: metadataUpload.cid,
          metadataUrl: metadataUpload.url,
          metadataGatewayUrl: ipfsService.getGatewayUrl(metadataUpload.url),
          mediaCids: mediaUploads.map((item) => item.cid),
          media: mediaUploads
        },
        blockchain: certification
      };
    } catch (error) {
      const duration = Date.now() - start;
      metricsCollector.recordWeb3Operation(
        'blockchain',
        'createContent',
        false,
        duration
      );
      metricsCollector.recordWeb3Operation('ipfs', 'uploadMetadata', false, duration);
      logError(error, {
        service: 'Web3Core',
        operation: 'createCulturalContent',
        contentId: contentData.id,
        duration
      });
      throw error;
    }
  }

  async certifyContent(contentId, contentData) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non initialisés');
    }

    const start = Date.now();

    try {
      const certificate = {
        contentId,
        title: contentData.title,
        authorName: contentData.authorName,
        type: contentData.type,
        origin: contentData.origin || 'Afrique',
        issuedAt: new Date().toISOString(),
        issuer: 'Nkwa V'
      };

      const ipfsCertificate = await ipfsService.uploadJSON(certificate);
      const contentHash = this.createContentHash(certificate);

      const certification = await blockchainProvider.recertifyContent({
        contentId,
        contentHash,
        metadataCid: ipfsCertificate.cid,
        contentType: contentData.type,
        license: 'CC-BY',
        contributor: contentData.authorAddress,
        rawContent: certificate
      });

      const duration = Date.now() - start;
      metricsCollector.recordWeb3Operation('blockchain', 'certify', true, duration);
      logInfo('Content certified on blockchain', {
        contentId,
        txHash: certification.txHash,
        duration
      });

      return {
        success: true,
        contentId,
        certificate,
        contentHash,
        ipfsCid: ipfsCertificate.cid,
        ipfsUrl: ipfsCertificate.url,
        transactionHash: certification.txHash,
        blockNumber: certification.blockNumber,
        explorerUrl: certification.explorerUrl
      };
    } catch (error) {
      const duration = Date.now() - start;
      metricsCollector.recordWeb3Operation('blockchain', 'certify', false, duration);
      logError(error, {
        service: 'Web3Core',
        operation: 'certifyContent',
        contentId,
        duration
      });
      throw error;
    }
  }

  async verifyContentAuthenticity(contentId, contentHash) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non initialisés');
    }

    try {
      const onChain = await blockchainProvider.getContent(contentId);
      const exists = !!onChain.exists;
      const onChainHash = onChain.contentHash || null;
      const matches = exists && onChainHash === blockchainProvider.toBytes32(contentHash);

      return {
        success: true,
        contentId,
        exists,
        isAuthentic: matches,
        ipfsIntegrity: exists,
        onChain,
        verifiedAt: new Date().toISOString()
      };
    } catch (error) {
      logError(error, {
        service: 'Web3Core',
        operation: 'verifyContentAuthenticity',
        contentId
      });
      throw error;
    }
  }

  async distributeReward(userId, rewardType, amount, metadata = {}) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non initialisés');
    }

    const contributor = metadata.walletAddress || process.env.DEFAULT_REWARD_ADDRESS;
    const reward = await blockchainProvider.recordReward({
      contributor,
      points: amount,
      reason: `${rewardType}:${userId}`.slice(0, 64)
    });

    return {
      success: true,
      userId,
      rewardType,
      amount,
      metadata,
      transactionId: reward.txHash,
      blockNumber: reward.blockNumber,
      explorerUrl: reward.explorerUrl,
      demo: reward.demo
    };
  }

  async createRewardSystem() {
    const status = blockchainProvider.getStatus();
    return {
      success: true,
      mode: status.ready ? 'onchain' : 'demo',
      tokenId: null,
      topicId: null,
      config: {
        network: status.network,
        chainId: status.chainId,
        registryContract: status.registryContract,
        relayerAddress: status.relayerAddress
      }
    };
  }

  getStatus() {
    const blockchainStatus = blockchainProvider.getStatus();

    return {
      initialized: this.isInitialized,
      ready: this.isReady(),
      mode: blockchainStatus.ready ? 'onchain' : 'demo',
      blockchain: {
        initialized: blockchainStatus.initialized,
        ready: blockchainStatus.ready,
        demo: blockchainStatus.demo,
        network: blockchainStatus.network,
        chainId: blockchainStatus.chainId,
        relayerAddress: blockchainStatus.relayerAddress,
        contractAddress: blockchainStatus.registryContract,
        explorerUrl: blockchainStatus.explorerUrl
      },
      ipfs: {
        initialized: this.ipfsReady,
        demo: !this.ipfsReady,
        gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/'
      },
      evm: blockchainStatus.initialized,
      timestamp: new Date().toISOString()
    };
  }

  async getStats() {
    const blockchainStats = await blockchainProvider.getStats();

    return {
      blockchain: {
        network: blockchainStats.network,
        chainId: blockchainStats.chainId,
        relayerAddress: blockchainStats.relayerAddress,
        contractAddress: blockchainStats.registryContract,
        balanceEth: blockchainStats.balanceEth,
        totalCertifications: blockchainStats.totalCertifications,
        demo: blockchainStats.demo
      },
      ipfs: {
        initialized: this.ipfsReady,
        gateway: process.env.IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
        mode: this.ipfsReady ? 'live' : 'demo'
      },
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = new Web3CoreService();
