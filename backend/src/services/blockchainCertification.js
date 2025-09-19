const hederaService = require('./hederaService');
const ipfsService = require('./ipfsService');
const crypto = require('crypto');

class BlockchainCertificationService {
  constructor() {
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Initialiser les services
      const hederaInit = await hederaService.initialize();
      const ipfsInit = await ipfsService.initialize();

      this.isInitialized = hederaInit || ipfsInit;
      
      if (this.isInitialized) {
        console.log('✅ Service de certification blockchain initialisé');
      } else {
        console.log('⚠️ Service de certification en mode démo');
      }

      return this.isInitialized;
    } catch (error) {
      console.error('❌ Erreur initialisation certification blockchain:', error);
      return false;
    }
  }

  // Certifier un contenu culturel
  async certifyContent(contentData) {
    try {
      const {
        id,
        type,
        title,
        content,
        author,
        origin,
        language,
        mediaFiles = [],
        metadata = {}
      } = contentData;

      console.log(`🔐 Certification du contenu: ${title} (${type})`);

      // 1. Uploader le contenu sur IPFS
      const ipfsResult = await ipfsService.uploadCulturalContent({
        type,
        title,
        content,
        mediaFiles,
        metadata: {
          ...metadata,
          author,
          origin,
          language,
          certificationDate: new Date().toISOString()
        }
      });

      if (!ipfsResult.success) {
        throw new Error(`Erreur upload IPFS: ${ipfsResult.error}`);
      }

      // 2. Créer un hash de certification
      const certificationHash = this.generateCertificationHash({
        contentId: id,
        ipfsCid: ipfsResult.contentCid,
        title,
        author,
        origin,
        timestamp: new Date().toISOString()
      });

      // 3. Enregistrer sur Hedera HCS pour l'immutabilité
      let hederaResult = null;
      if (hederaService.isInitialized) {
        hederaResult = await hederaService.submitMessage(
          process.env.HEDERA_CONTENT_TOPIC_ID,
          {
            contentId: id,
            ipfsCid: ipfsResult.contentCid,
            certificationHash,
            title,
            author,
            origin,
            language,
            type,
            action: 'CONTENT_CERTIFICATION',
            timestamp: new Date().toISOString()
          }
        );
      }

      // 4. Créer un NFT de certification
      let nftResult = null;
      if (hederaService.isInitialized) {
        nftResult = await hederaService.createContentNFT(
          id,
          ipfsResult.contentCid,
          {
            type,
            origin,
            language,
            author,
            title
          }
        );
      }

      // 5. Préparer le certificat
      const certificate = {
        contentId: id,
        type,
        title,
        author,
        origin,
        language,
        certificationDate: new Date().toISOString(),
        ipfsCid: ipfsResult.contentCid,
        ipfsUrl: ipfsResult.contentUrl,
        certificationHash,
        hederaTransactionId: hederaResult?.transactionId,
        hederaSequenceNumber: hederaResult?.sequenceNumber,
        nftMetadata: nftResult?.nftMetadata,
        verified: true,
        blockchain: {
          hedera: !!hederaResult?.success,
          ipfs: !!ipfsResult.success,
          demo: ipfsResult.demo
        }
      };

      console.log(`✅ Contenu certifié: ${title}`);
      console.log(`   📁 IPFS: ${ipfsResult.contentCid}`);
      if (hederaResult?.success) {
        console.log(`   ⛓️ Hedera: ${hederaResult.transactionId}`);
      }

      return {
        success: true,
        certificate,
        ipfsResult,
        hederaResult,
        nftResult
      };
    } catch (error) {
      console.error('❌ Erreur certification contenu:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Vérifier l'authenticité d'un contenu
  async verifyContent(contentId, expectedHash) {
    try {
      console.log(`🔍 Vérification du contenu: ${contentId}`);

      // 1. Récupérer les données depuis IPFS
      const ipfsData = await ipfsService.getData(contentId);
      if (!ipfsData.success) {
        return {
          success: false,
          error: 'Impossible de récupérer les données depuis IPFS'
        };
      }

      // 2. Vérifier l'intégrité du contenu
      const contentHash = this.generateContentHash(ipfsData.data);
      const isIntegrityValid = contentHash === expectedHash;

      // 3. Vérifier sur Hedera (si disponible)
      let hederaVerification = null;
      if (hederaService.isInitialized) {
        // Dans un vrai système, on interrogerait HCS pour vérifier l'enregistrement
        hederaVerification = {
          verified: true, // Simulation
          transactionId: 'simulated',
          demo: true
        };
      }

      const verification = {
        contentId,
        ipfsVerified: ipfsData.success,
        integrityValid: isIntegrityValid,
        hederaVerified: hederaVerification?.verified || false,
        verificationDate: new Date().toISOString(),
        status: isIntegrityValid ? 'VERIFIED' : 'TAMPERED'
      };

      console.log(`✅ Vérification terminée: ${verification.status}`);

      return {
        success: true,
        verification
      };
    } catch (error) {
      console.error('❌ Erreur vérification contenu:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Générer un hash de certification
  generateCertificationHash(data) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex');
  }

  // Générer un hash de contenu
  generateContentHash(content) {
    return crypto
      .createHash('sha256')
      .update(JSON.stringify(content))
      .digest('hex');
  }

  // Créer un certificat de propriété intellectuelle
  async createIntellectualPropertyCertificate(contentData) {
    try {
      const {
        id,
        title,
        author,
        origin,
        type,
        content
      } = contentData;

      const ipCertificate = {
        certificateId: `IP-${id}-${Date.now()}`,
        contentId: id,
        title,
        author,
        origin,
        type,
        contentHash: this.generateContentHash(content),
        issueDate: new Date().toISOString(),
        issuer: 'Nkwa V',
        status: 'ACTIVE',
        rights: {
          attribution: true,
          nonCommercial: false,
          shareAlike: true,
          noDerivatives: false
        },
        blockchain: {
          hedera: hederaService.isInitialized,
          ipfs: ipfsService.isInitialized
        }
      };

      // Enregistrer sur IPFS
      const ipfsResult = await ipfsService.uploadJSON(
        ipCertificate,
        `ip-certificate-${id}.json`
      );

      // Enregistrer sur Hedera
      let hederaResult = null;
      if (hederaService.isInitialized) {
        hederaResult = await hederaService.submitMessage(
          process.env.HEDERA_CONTENT_TOPIC_ID,
          {
            ...ipCertificate,
            action: 'IP_CERTIFICATE_CREATION'
          }
        );
      }

      return {
        success: true,
        certificate: ipCertificate,
        ipfsResult,
        hederaResult
      };
    } catch (error) {
      console.error('❌ Erreur création certificat IP:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Obtenir l'historique de certification d'un contenu
  async getCertificationHistory(contentId) {
    try {
      // Dans un vrai système, on interrogerait HCS pour l'historique
      // Pour l'instant, on simule
      const history = {
        contentId,
        certifications: [
          {
            date: new Date().toISOString(),
            action: 'INITIAL_CERTIFICATION',
            status: 'VERIFIED',
            transactionId: 'simulated'
          }
        ],
        totalCertifications: 1,
        lastVerified: new Date().toISOString()
      };

      return {
        success: true,
        history
      };
    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instance singleton
const blockchainCertificationService = new BlockchainCertificationService();

module.exports = blockchainCertificationService;


