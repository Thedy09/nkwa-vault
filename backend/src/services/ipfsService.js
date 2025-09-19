const { create, globSource } = require('ipfs-http-client');
const web3Config = require('../config/web3');

class IPFSService {
  constructor() {
    this.ipfs = null;
    this.isInitialized = false;
    this.retryConfig = {
      maxRetries: 3,
      baseDelay: 1000,
      maxDelay: 5000
    };
  }

  async initialize() {
    try {
      // Utiliser la configuration centralisée
      const config = web3Config.getIPFSConfig();
      if (!config.isInitialized) {
        console.log('⚠️ Configuration IPFS non initialisée, mode démo activé');
        this.isInitialized = false;
        return false;
      }

      this.ipfs = config.client;
      this.isInitialized = true;
      console.log('✅ IPFS service initialisé');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation IPFS Service:', error.message);
      this.isInitialized = false;
      return false;
    }
  }

  // Méthode utilitaire pour les retry
  async executeWithRetry(operation, operationName) {
    let lastError;
    
    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        console.warn(`⚠️ ${operationName} - Tentative ${attempt}/${this.retryConfig.maxRetries} échouée:`, error.message);
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(2, attempt - 1),
            this.retryConfig.maxDelay
          );
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`${operationName} échoué après ${this.retryConfig.maxRetries} tentatives: ${lastError.message}`);
  }

  async uploadFile(fileBuffer, fileName) {
    if (!this.isInitialized) {
      return this.createMockUpload(fileName);
    }

    try {
      const result = await this.ipfs.add(fileBuffer, {
        pin: true,
        progress: (bytes) => console.log(`📤 Upload: ${bytes} bytes`)
      });

      console.log(`✅ Fichier uploadé sur IPFS: ${result.path}`);
      return {
        success: true,
        cid: result.path,
        size: result.size,
        url: `ipfs://${result.path}`
      };
    } catch (error) {
      console.log('❌ Erreur upload IPFS:', error.message);
      return this.createMockUpload(fileName);
    }
  }

  async uploadJSON(metadata) {
    if (!this.isInitialized) {
      return this.createMockJSONUpload(metadata);
    }

    try {
      const jsonBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
      const result = await this.ipfs.add(jsonBuffer, {
        pin: true
      });

      console.log(`✅ Metadata JSON uploadé sur IPFS: ${result.path}`);
      return {
        success: true,
        cid: result.path,
        size: result.size,
        url: `ipfs://${result.path}`
      };
    } catch (error) {
      console.log('❌ Erreur upload JSON IPFS:', error.message);
      return this.createMockJSONUpload(metadata);
    }
  }

  async uploadImage(imageBuffer, imageName) {
    if (!this.isInitialized) {
      return this.createMockImageUpload(imageName);
    }

    try {
      const result = await this.ipfs.add(imageBuffer, {
        pin: true,
        progress: (bytes) => console.log(`🖼️ Upload image: ${bytes} bytes`)
      });

      console.log(`✅ Image uploadée sur IPFS: ${result.path}`);
      return {
        success: true,
        cid: result.path,
        size: result.size,
        url: `ipfs://${result.path}`,
        gatewayUrl: `https://ipfs.io/ipfs/${result.path}`
      };
    } catch (error) {
      console.log('❌ Erreur upload image IPFS:', error.message);
      return this.createMockImageUpload(imageName);
    }
  }

  async uploadAudio(audioBuffer, audioName) {
    if (!this.isInitialized) {
      return this.createMockAudioUpload(audioName);
    }

    try {
      const result = await this.ipfs.add(audioBuffer, {
        pin: true,
        progress: (bytes) => console.log(`🎵 Upload audio: ${bytes} bytes`)
      });

      console.log(`✅ Audio uploadé sur IPFS: ${result.path}`);
      return {
        success: true,
        cid: result.path,
        size: result.size,
        url: `ipfs://${result.path}`,
        gatewayUrl: `https://ipfs.io/ipfs/${result.path}`
      };
    } catch (error) {
      console.log('❌ Erreur upload audio IPFS:', error.message);
      return this.createMockAudioUpload(audioName);
    }
  }

  async uploadVideo(videoBuffer, videoName) {
    if (!this.isInitialized) {
      return this.createMockVideoUpload(videoName);
    }

    try {
      const result = await this.ipfs.add(videoBuffer, {
        pin: true,
        progress: (bytes) => console.log(`🎬 Upload vidéo: ${bytes} bytes`)
      });

      console.log(`✅ Vidéo uploadée sur IPFS: ${result.path}`);
      return {
        success: true,
        cid: result.path,
        size: result.size,
        url: `ipfs://${result.path}`,
        gatewayUrl: `https://ipfs.io/ipfs/${result.path}`
      };
    } catch (error) {
      console.log('❌ Erreur upload vidéo IPFS:', error.message);
      return this.createMockVideoUpload(videoName);
    }
  }

  // Méthodes de fallback pour le mode démo
  createMockUpload(fileName) {
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Mode démo IPFS - Upload simulé:', fileName);
    return {
      success: true,
      cid: mockCid,
      size: 1024,
      url: `ipfs://${mockCid}`,
      mock: true
    };
  }

  createMockJSONUpload(metadata) {
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Mode démo IPFS - JSON simulé:', metadata.name || 'Metadata');
    return {
      success: true,
      cid: mockCid,
      size: JSON.stringify(metadata).length,
      url: `ipfs://${mockCid}`,
      mock: true
    };
  }

  createMockImageUpload(imageName) {
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Mode démo IPFS - Image simulée:', imageName);
    return {
      success: true,
      cid: mockCid,
      size: 2048,
      url: `ipfs://${mockCid}`,
      gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
      mock: true
    };
  }

  createMockAudioUpload(audioName) {
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Mode démo IPFS - Audio simulé:', audioName);
    return {
      success: true,
      cid: mockCid,
      size: 4096,
      url: `ipfs://${mockCid}`,
      gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
      mock: true
    };
  }

  createMockVideoUpload(videoName) {
    const mockCid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi${Math.random().toString(36).substr(2, 9)}`;
    console.log('🔧 Mode démo IPFS - Vidéo simulée:', videoName);
    return {
      success: true,
      cid: mockCid,
      size: 8192,
      url: `ipfs://${mockCid}`,
      gatewayUrl: `https://ipfs.io/ipfs/${mockCid}`,
      mock: true
    };
  }

  // Méthode pour convertir les URLs IPFS en URLs gateway
  getGatewayUrl(ipfsUrl) {
    if (ipfsUrl.startsWith('ipfs://')) {
      const cid = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${cid}`;
    }
    return ipfsUrl;
  }

  // Méthode pour récupérer le contenu depuis IPFS
  async getContent(cid) {
    if (!this.isInitialized) {
      return this.getMockContent(cid);
    }

    try {
      const chunks = [];
      for await (const chunk of this.ipfs.cat(cid)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      console.log('❌ Erreur récupération IPFS:', error.message);
      return this.getMockContent(cid);
    }
  }

  getMockContent(cid) {
    console.log('🔧 Mode démo IPFS - Contenu simulé pour CID:', cid);
    return Buffer.from('Contenu simulé pour le mode démo');
  }
}

module.exports = new IPFSService();