const express = require('express');
const router = express.Router();
const museumCollectionService = require('../services/museumCollectionService');
const multer = require('multer');
const { 
  museumCacheMiddleware, 
  statsCacheMiddleware, 
  searchCacheMiddleware,
  cacheInvalidationMiddleware,
  invalidateMuseumCache
} = require('../middleware/cache');

/**
 * @swagger
 * tags:
 *   name: Museum
 *   description: Gestion du musée virtuel et de la collection
 */

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Accepter les images, audio et vidéo
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.startsWith('audio/') || 
        file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté'), false);
    }
  }
});

/**
 * @swagger
 * /api/museum/collection:
 *   get:
 *     summary: Récupère la collection du musée
 *     tags: [Museum]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [nft, art]
 *         description: Filtrer par type d'objet
 *       - in: query
 *         name: culture
 *         schema:
 *           type: string
 *         description: Filtrer par culture
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrer par pays
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche textuelle
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'objets à retourner
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Décalage pour la pagination
 *     responses:
 *       200:
 *         description: Collection récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MuseumObject'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     limit:
 *                       type: integer
 *                       example: 50
 *                     offset:
 *                       type: integer
 *                       example: 0
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/collection', museumCacheMiddleware(), async (req, res) => {
  try {
    const { type, culture, country, search, limit = 50, offset = 0 } = req.query;
    
    let collection = await museumCollectionService.getCollection();
    
    // Appliquer les filtres
    if (type) {
      collection = collection.filter(item => item.type === type);
    }
    
    if (culture) {
      collection = collection.filter(item => 
        item.culture && item.culture.toLowerCase().includes(culture.toLowerCase())
      );
    }
    
    if (country) {
      collection = collection.filter(item => 
        item.country && item.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      collection = collection.filter(item => 
        item.name.toLowerCase().includes(lowerSearch) ||
        item.description.toLowerCase().includes(lowerSearch) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(lowerSearch)))
      );
    }
    
    // Pagination
    const total = collection.length;
    const paginatedCollection = collection.slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        collection: paginatedCollection,
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + parseInt(limit) < total
      }
    });
  } catch (error) {
    console.error('Erreur récupération collection:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de la collection'
    });
  }
});

// GET /api/museum/nft/:tokenId - Détail d'un NFT
router.get('/nft/:tokenId', async (req, res) => {
  try {
    const { tokenId } = req.params;
    const { serialNumber } = req.query;
    
    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        error: 'Serial number requis'
      });
    }
    
    const nft = await museumCollectionService.getObjectById(`NFT-${tokenId}-${serialNumber}`);
    
    if (!nft) {
      return res.status(404).json({
        success: false,
        error: 'NFT non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: { nft }
    });
  } catch (error) {
    console.error('Erreur récupération NFT:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération du NFT'
    });
  }
});

// GET /api/museum/object/:id - Récupérer un objet par ID
router.get('/object/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const object = await museumCollectionService.getObjectById(id);
    
    if (!object) {
      return res.status(404).json({
        success: false,
        error: 'Objet non trouvé'
      });
    }
    
    res.json({
      success: true,
      data: { object }
    });
  } catch (error) {
    console.error('Erreur récupération objet:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération de l\'objet'
    });
  }
});

// POST /api/museum/nft - Créer un nouveau NFT
router.post('/nft', upload.single('image'), cacheInvalidationMiddleware(invalidateMuseumCache), async (req, res) => {
  try {
    const { name, description, culture, country, tags, source, license } = req.body;
    const imageFile = req.file;
    
    if (!name || !description || !imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Nom, description et image requis'
      });
    }
    
    const metadata = {
      name,
      description,
      culture: culture || 'Inconnue',
      country: country || 'Afrique',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      source: source || 'Musée Virtuel Africain',
      license: license || 'CC0'
    };
    
    const result = await museumCollectionService.createNFT(metadata, imageFile.buffer);
    
    if (result.success) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Erreur création NFT:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la création du NFT'
    });
  }
});

// GET /api/museum/stats - Statistiques de la collection
router.get('/stats', statsCacheMiddleware(), async (req, res) => {
  try {
    const stats = await museumCollectionService.getCollectionStats();
    
    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Erreur récupération stats:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des statistiques'
    });
  }
});

// GET /api/museum/cultures - Liste des cultures
router.get('/cultures', async (req, res) => {
  try {
    const stats = await museumCollectionService.getCollectionStats();
    
    res.json({
      success: true,
      data: { cultures: stats.cultures }
    });
  } catch (error) {
    console.error('Erreur récupération cultures:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des cultures'
    });
  }
});

// GET /api/museum/countries - Liste des pays
router.get('/countries', async (req, res) => {
  try {
    const stats = await museumCollectionService.getCollectionStats();
    
    res.json({
      success: true,
      data: { countries: stats.countries }
    });
  } catch (error) {
    console.error('Erreur récupération pays:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des pays'
    });
  }
});

// GET /api/museum/tags - Liste des tags
router.get('/tags', async (req, res) => {
  try {
    const stats = await museumCollectionService.getCollectionStats();
    
    res.json({
      success: true,
      data: { tags: stats.tags }
    });
  } catch (error) {
    console.error('Erreur récupération tags:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des tags'
    });
  }
});

// POST /api/museum/refresh - Rafraîchir la collection
router.post('/refresh', async (req, res) => {
  try {
    await museumCollectionService.refreshCollection();
    
    res.json({
      success: true,
      message: 'Collection rafraîchie avec succès'
    });
  } catch (error) {
    console.error('Erreur rafraîchissement:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du rafraîchissement de la collection'
    });
  }
});

/**
 * @swagger
 * /api/museum/search:
 *   get:
 *     summary: Recherche avancée dans la collection
 *     tags: [Museum]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Terme de recherche
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [nft, art]
 *         description: Filtrer par type d'objet
 *       - in: query
 *         name: culture
 *         schema:
 *           type: string
 *         description: Filtrer par culture
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *         description: Filtrer par pays
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Tags séparés par des virgules
 *     responses:
 *       200:
 *         description: Résultats de recherche
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MuseumObject'
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     query:
 *                       type: string
 *                       example: "masque traditionnel"
 *       400:
 *         description: Paramètre de recherche manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/search', searchCacheMiddleware(), async (req, res) => {
  try {
    const { q, type, culture, country, tags } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Paramètre de recherche requis'
      });
    }
    
    let results = await museumCollectionService.searchCollection(q);
    
    // Appliquer les filtres supplémentaires
    if (type) {
      results = results.filter(item => item.type === type);
    }
    
    if (culture) {
      results = results.filter(item => 
        item.culture && item.culture.toLowerCase().includes(culture.toLowerCase())
      );
    }
    
    if (country) {
      results = results.filter(item => 
        item.country && item.country.toLowerCase().includes(country.toLowerCase())
      );
    }
    
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      results = results.filter(item => 
        item.tags && item.tags.some(tag => 
          tagList.some(searchTag => tag.toLowerCase().includes(searchTag))
        )
      );
    }
    
    res.json({
      success: true,
      data: {
        results,
        total: results.length,
        query: q
      }
    });
  } catch (error) {
    console.error('Erreur recherche:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la recherche'
    });
  }
});

module.exports = router;

