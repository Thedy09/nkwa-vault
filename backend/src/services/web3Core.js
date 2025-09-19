const hederaService = require('./hederaService');
const ipfsService = require('./ipfsService');
const { logInfo, logError, logWeb3Operation } = require('../utils/logger');
const metricsCollector = require('../utils/metrics');

class Web3CoreService {
  constructor() {
    this.isInitialized = false;
    this.hederaReady = false;
    this.ipfsReady = false;
  }

  // Initialisation complète des services Web3
  async initialize() {
    try {
      console.log('🚀 Initialisation du cœur Web3 de Nkwa V...');
      
      // Initialiser Hedera (obligatoire)
      this.hederaReady = await hederaService.initialize();
      if (!this.hederaReady) {
        throw new Error('Hedera non disponible - Service OBLIGATOIRE');
      }

      // Initialiser IPFS (obligatoire)
      this.ipfsReady = await ipfsService.initialize();
      if (!this.ipfsReady) {
        throw new Error('IPFS non disponible - Service OBLIGATOIRE');
      }

      this.isInitialized = true;
      console.log('✅ Cœur Web3 initialisé - Nkwa V prêt pour la décentralisation');
      
      return true;
    } catch (error) {
      logError(error, { service: 'Web3Core', operation: 'initialize' });
      throw error;
    }
  }

  // Vérifier l'état des services Web3
  isReady() {
    return this.isInitialized && this.hederaReady && this.ipfsReady;
  }

  // Créer un contenu culturel avec certification blockchain
  async createCulturalContent(contentData, mediaFiles = []) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non disponibles');
    }

    const startTime = Date.now();
    
    try {
      // 1. Upload des médias sur IPFS
      const ipfsResults = [];
      for (const file of mediaFiles) {
        const result = await ipfsService.uploadFile(file.buffer, file.originalname);
        ipfsResults.push(result);
      }

      // 2. Créer les métadonnées NFT
      const nftMetadata = {
        name: contentData.title,
        description: contentData.content,
        image: ipfsResults[0]?.url || '',
        attributes: [
          { trait_type: "Type", value: contentData.type },
          { trait_type: "Culture", value: contentData.origin || 'Afrique' },
          { trait_type: "Langue", value: contentData.language || 'fr' },
          { trait_type: "Date de création", value: new Date().toISOString() },
          { trait_type: "Plateforme", value: "Nkwa V" }
        ],
        external_url: `https://nkwa.africa/content/${contentData.id}`,
        background_color: "000000"
      };

      // 3. Upload des métadonnées sur IPFS
      const metadataResult = await ipfsService.uploadJSON(nftMetadata);

      // 4. Créer le NFT sur Hedera
      const nftResult = await hederaService.createContentNFT(
        contentData.id,
        metadataResult.cid,
        nftMetadata
      );

      // 5. Enregistrer sur HCS pour l'immutabilité
      const hcsResult = await hederaService.submitMessage(
        process.env.HEDERA_CONTENT_TOPIC_ID,
        {
          contentId: contentData.id,
          type: 'CULTURAL_CONTENT_CREATED',
          metadata: nftMetadata,
          ipfsCid: metadataResult.cid,
          timestamp: new Date().toISOString()
        }
      );

      const duration = Date.now() - startTime;
      logWeb3Operation('createCulturalContent', { success: true }, {
        contentId: contentData.id,
        ipfsResults: ipfsResults.length,
        nftCreated: nftResult.success,
        hcsRecorded: hcsResult.success,
        duration
      });

      // Enregistrer dans les métriques
      metricsCollector.recordWeb3Operation('hedera', 'createContent', true, duration);
      metricsCollector.recordWeb3Operation('ipfs', 'uploadFiles', true, duration);

      return {
        success: true,
        contentId: contentData.id,
        nftMetadata,
        ipfs: {
          metadataCid: metadataResult.cid,
          mediaCids: ipfsResults.map(r => r.cid)
        },
        hedera: {
          nftResult,
          hcsResult
        }
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, { 
        service: 'Web3Core', 
        operation: 'createCulturalContent',
        contentId: contentData.id,
        duration
      });
      
      metricsCollector.recordWeb3Operation('hedera', 'createContent', false, duration);
      metricsCollector.recordWeb3Operation('ipfs', 'uploadFiles', false, duration);
      
      throw error;
    }
  }

  // Certifier un contenu existant
  async certifyContent(contentId, contentData) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non disponibles');
    }

    const startTime = Date.now();

    try {
      // 1. Créer un hash du contenu
      const contentHash = this.createContentHash(contentData);

      // 2. Créer le certificat de propriété intellectuelle
      const certificate = {
        contentId,
        title: contentData.title,
        author: contentData.authorName,
        origin: contentData.origin,
        type: contentData.type,
        contentHash,
        issueDate: new Date().toISOString(),
        issuer: 'Nkwa V',
        rights: {
          attribution: true,
          nonCommercial: false,
          shareAlike: true,
          noDerivatives: false
        }
      };

      // 3. Upload du certificat sur IPFS
      const certificateResult = await ipfsService.uploadJSON(certificate);

      // 4. Enregistrer sur Hedera HCS
      const hcsResult = await hederaService.submitMessage(
        process.env.HEDERA_CONTENT_TOPIC_ID,
        {
          contentId,
          type: 'CONTENT_CERTIFIED',
          certificate: certificate,
          ipfsCid: certificateResult.cid,
          timestamp: new Date().toISOString()
        }
      );

      const duration = Date.now() - startTime;
      logWeb3Operation('certifyContent', { success: true }, {
        contentId,
        certificateCid: certificateResult.cid,
        hcsRecorded: hcsResult.success,
        duration
      });

      return {
        success: true,
        contentId,
        certificate,
        ipfsCid: certificateResult.cid,
        hederaTransactionId: hcsResult.transactionId
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, { 
        service: 'Web3Core', 
        operation: 'certifyContent',
        contentId,
        duration
      });
      throw error;
    }
  }

  // Créer un système de récompenses Web3
  async createRewardSystem() {
    if (!this.isReady()) {
      throw new Error('Services Web3 non disponibles');
    }

    try {
      // 1. Créer le token de récompense sur Hedera
      const tokenResult = await hederaService.createToken(
        'Nkwa V Rewards',
        'NKWA',
        1000000 // 1 million de tokens initiaux
      );

      // 2. Créer le topic HCS pour les récompenses
      const topicResult = await hederaService.createTopic('Nkwa V Rewards System');

      // 3. Enregistrer la configuration
      const config = {
        tokenId: tokenResult.tokenId,
        topicId: topicResult.topicId,
        createdAt: new Date().toISOString(),
        status: 'ACTIVE'
      };

      await ipfsService.uploadJSON(config);

      logInfo('Reward system created', { 
        tokenId: tokenResult.tokenId,
        topicId: topicResult.topicId
      });

      return {
        success: true,
        tokenId: tokenResult.tokenId,
        topicId: topicResult.topicId,
        config
      };

    } catch (error) {
      logError(error, { service: 'Web3Core', operation: 'createRewardSystem' });
      throw error;
    }
  }

  // Distribuer des récompenses
  async distributeReward(userId, rewardType, amount, metadata = {}) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non disponibles');
    }

    const startTime = Date.now();

    try {
      // 1. Distribuer les tokens
      const rewardResult = await hederaService.rewardContributor(
        userId,
        rewardType,
        amount
      );

      // 2. Enregistrer la distribution sur HCS
      const hcsResult = await hederaService.submitMessage(
        process.env.HEDERA_REWARDS_TOPIC_ID,
        {
          userId,
          rewardType,
          amount,
          metadata,
          timestamp: new Date().toISOString(),
          type: 'REWARD_DISTRIBUTED'
        }
      );

      const duration = Date.now() - startTime;
      logWeb3Operation('distributeReward', { success: true }, {
        userId,
        rewardType,
        amount,
        duration
      });

      return {
        success: true,
        userId,
        rewardType,
        amount,
        transactionId: rewardResult.transactionId,
        hcsSequenceNumber: hcsResult.sequenceNumber
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      logError(error, { 
        service: 'Web3Core', 
        operation: 'distributeReward',
        userId,
        rewardType,
        amount,
        duration
      });
      throw error;
    }
  }

  // Vérifier l'authenticité d'un contenu
  async verifyContentAuthenticity(contentId, contentHash) {
    if (!this.isReady()) {
      throw new Error('Services Web3 non disponibles');
    }

    try {
      // 1. Récupérer les données du HCS
      const hcsData = await this.getHCSData(contentId);

      // 2. Vérifier le hash
      const isValid = hcsData.contentHash === contentHash;

      // 3. Vérifier l'intégrité IPFS
      const ipfsData = await ipfsService.getContent(hcsData.ipfsCid);
      const ipfsHash = this.createContentHash(JSON.parse(ipfsData.toString()));

      return {
        success: true,
        contentId,
        isAuthentic: isValid,
        ipfsIntegrity: ipfsHash === contentHash,
        hcsData,
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

  // Créer un hash du contenu
  createContentHash(content) {
    const crypto = require('crypto');
    const contentString = JSON.stringify(content, Object.keys(content).sort());
    return crypto.createHash('sha256').update(contentString).digest('hex');
  }

  // Récupérer les données du HCS
  async getHCSData(contentId) {
    // Implémentation pour récupérer les données du HCS
    // Cette fonction devrait interroger le HCS pour récupérer les données
    // Pour l'instant, on retourne des données simulées
    return {
      contentId,
      contentHash: 'simulated_hash',
      ipfsCid: 'simulated_cid',
      timestamp: new Date().toISOString()
    };
  }

  // Obtenir le statut des services Web3
  getStatus() {
    return {
      initialized: this.isInitialized,
      hedera: this.hederaReady,
      ipfs: this.ipfsReady,
      ready: this.isReady(),
      timestamp: new Date().toISOString()
    };
  }

  // Obtenir les statistiques Web3
  async getStats() {
    if (!this.isReady()) {
      return null;
    }

    try {
      const hederaStats = await hederaService.getAccountBalance(process.env.HEDERA_ACCOUNT_ID);
      const ipfsStats = await ipfsService.getStats();

      return {
        hedera: {
          accountId: process.env.HEDERA_ACCOUNT_ID,
          balance: hederaStats.hbars,
          tokens: hederaStats.tokens
        },
        ipfs: ipfsStats,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logError(error, { service: 'Web3Core', operation: 'getStats' });
      return null;
    }
  }
}

module.exports = new Web3CoreService();
