const hederaNFTService = require('./hederaNFTService');
const ipfsService = require('./ipfsService');

class MuseumCollectionService {
  constructor() {
    this.collection = [];
    this.initialized = false;
  }

  async initialize() {
    try {
      console.log('🔄 Initialisation du service de collection du musée...');
      
      // Initialiser les services
      await hederaNFTService.initialize();
      await ipfsService.initialize();
      
      // Charger la collection
      await this.loadCollection();
      
      this.initialized = true;
      console.log('✅ Service de collection du musée initialisé');
    } catch (error) {
      console.log('❌ Erreur initialisation collection:', error.message);
      this.initialized = false;
    }
  }

  async loadCollection() {
    try {
      console.log('🔄 Chargement de la collection du musée...');
      
      // Récupérer les NFTs depuis Hedera
      const nfts = await hederaNFTService.getAllNFTs();
      
      // Charger les arts libres de droits
      const freeArts = await this.loadFreeArts();
      
      // Combiner NFTs et arts libres
      this.collection = [...nfts, ...freeArts];
      
      console.log(`✅ Collection chargée: ${this.collection.length} objets`);
      console.log(`   🎨 ${nfts.length} NFTs`);
      console.log(`   🆓 ${freeArts.length} arts libres`);
    } catch (error) {
      console.log('❌ Erreur chargement collection:', error.message);
      this.collection = await this.loadFreeArts(); // Fallback sur les arts libres
    }
  }

  async loadFreeArts() {
    return [
      {
        id: 'ART-001',
        type: 'art',
        name: 'Danse traditionnelle - Ghana',
        description: 'Photo de danseurs traditionnels du Ghana lors d\'une cérémonie',
        image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&q=80',
        source: 'Pixabay',
        license: 'CC0',
        culture: 'Ghana',
        country: 'Ghana',
        tags: ['danse', 'traditionnel', 'cérémonie'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-002',
        type: 'art',
        name: 'Masque traditionnel - Côte d\'Ivoire',
        description: 'Masque cérémoniel traditionnel de Côte d\'Ivoire',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        source: 'Unsplash',
        license: 'CC0',
        culture: 'Gouro',
        country: 'Côte d\'Ivoire',
        tags: ['masque', 'cérémonie', 'tradition'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-003',
        type: 'art',
        name: 'Tissu Kente - Ghana',
        description: 'Tissu traditionnel Kente aux motifs géométriques',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        source: 'Pexels',
        license: 'CC0',
        culture: 'Akan',
        country: 'Ghana',
        tags: ['tissu', 'Kente', 'motifs'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-004',
        type: 'art',
        name: 'Statue Ashanti - Ghana',
        description: 'Statue en bronze représentant un chef Ashanti',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&q=80',
        source: 'Wikimedia Commons',
        license: 'CC0',
        culture: 'Ashanti',
        country: 'Ghana',
        tags: ['statue', 'bronze', 'chef'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-005',
        type: 'art',
        name: 'Instruments de musique - Mali',
        description: 'Collection d\'instruments de musique traditionnels du Mali',
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&q=80',
        source: 'Flickr',
        license: 'CC0',
        culture: 'Bambara',
        country: 'Mali',
        tags: ['musique', 'instruments', 'tradition'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-006',
        type: 'art',
        name: 'Poterie traditionnelle - Sénégal',
        description: 'Poterie traditionnelle sénégalaise aux motifs géométriques',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop&q=80',
        source: 'Pixabay',
        license: 'CC0',
        culture: 'Wolof',
        country: 'Sénégal',
        tags: ['poterie', 'artisanat', 'géométrique'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-007',
        type: 'art',
        name: 'Danse des masques - Burkina Faso',
        description: 'Danse traditionnelle avec masques au Burkina Faso',
        image: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop&q=80',
        source: 'Unsplash',
        license: 'CC0',
        culture: 'Mossi',
        country: 'Burkina Faso',
        tags: ['danse', 'masques', 'rituel'],
        createdAt: new Date().toISOString()
      },
      {
        id: 'ART-008',
        type: 'art',
        name: 'Bijoux traditionnels - Éthiopie',
        description: 'Bijoux traditionnels éthiopiens en argent et corail',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        source: 'Pexels',
        license: 'CC0',
        culture: 'Amhara',
        country: 'Éthiopie',
        tags: ['bijoux', 'argent', 'corail'],
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Méthode principale pour récupérer tous les objets de la collection
  async getCollection() {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.collection;
  }

  // Filtrer par type (NFT ou art libre)
  async getCollectionByType(type) {
    const collection = await this.getCollection();
    return collection.filter(item => item.type === type);
  }

  // Filtrer par culture
  async getCollectionByCulture(culture) {
    const collection = await this.getCollection();
    return collection.filter(item => 
      item.culture && item.culture.toLowerCase().includes(culture.toLowerCase())
    );
  }

  // Filtrer par pays
  async getCollectionByCountry(country) {
    const collection = await this.getCollection();
    return collection.filter(item => 
      item.country && item.country.toLowerCase().includes(country.toLowerCase())
    );
  }

  // Rechercher par tags
  async searchCollection(query) {
    const collection = await this.getCollection();
    const lowerQuery = query.toLowerCase();
    
    return collection.filter(item => 
      item.name.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery) ||
      item.culture.toLowerCase().includes(lowerQuery) ||
      item.country.toLowerCase().includes(lowerQuery) ||
      (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
    );
  }

  // Créer un nouveau NFT
  async createNFT(metadata, imageBuffer) {
    try {
      console.log('🔄 Création d\'un nouveau NFT...');
      
      // Upload de l'image sur IPFS
      const imageUpload = await ipfsService.uploadImage(imageBuffer, metadata.name);
      
      // Créer les metadata complètes
      const nftMetadata = {
        ...metadata,
        image: imageUpload.url,
        imageGateway: imageUpload.gatewayUrl,
        minted: true,
        createdAt: new Date().toISOString()
      };
      
      // Upload des metadata sur IPFS
      const metadataUpload = await ipfsService.uploadJSON(nftMetadata);
      
      // Mint du NFT sur Hedera
      const nftResult = await hederaNFTService.mintNFT({
        ...nftMetadata,
        metadataUrl: metadataUpload.url
      });
      
      if (nftResult.success) {
        // Ajouter à la collection locale
        const newNFT = {
          id: `NFT-${Date.now()}`,
          type: 'nft',
          tokenId: nftResult.tokenId,
          serialNumber: nftResult.serialNumber,
          ...nftMetadata
        };
        
        this.collection.push(newNFT);
        
        console.log('✅ NFT créé avec succès');
        return {
          success: true,
          nft: newNFT,
          ipfs: {
            image: imageUpload,
            metadata: metadataUpload
          }
        };
      }
      
      return { success: false, error: 'Erreur lors du mint du NFT' };
    } catch (error) {
      console.log('❌ Erreur création NFT:', error.message);
      return { success: false, error: error.message };
    }
  }

  // Récupérer un objet par ID
  async getObjectById(id) {
    const collection = await this.getCollection();
    return collection.find(item => item.id === id);
  }

  // Récupérer les statistiques de la collection
  async getCollectionStats() {
    const collection = await this.getCollection();
    
    const stats = {
      total: collection.length,
      nfts: collection.filter(item => item.type === 'nft').length,
      freeArts: collection.filter(item => item.type === 'art').length,
      cultures: [...new Set(collection.map(item => item.culture).filter(Boolean))],
      countries: [...new Set(collection.map(item => item.country).filter(Boolean))],
      tags: [...new Set(collection.flatMap(item => item.tags || []))],
      lastUpdated: new Date().toISOString()
    };
    
    return stats;
  }

  // Rafraîchir la collection
  async refreshCollection() {
    console.log('🔄 Rafraîchissement de la collection...');
    await this.loadCollection();
    console.log('✅ Collection rafraîchie');
  }
}

module.exports = new MuseumCollectionService();

