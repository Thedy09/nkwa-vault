const express = require('express');
const router = express.Router();
const contentCollector = require('../services/contentCollectorService');
const { asyncErrorHandler } = require('../utils/errorHandler');
const { validate } = require('../middleware/validation');
const { logInfo, logError } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Content Collector
 *   description: Collecte de contenus culturels africains depuis des sources libres
 */

/**
 * @swagger
 * /api/collector/stories:
 *   post:
 *     summary: Collecter des contes africains depuis African Storybook
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *           default: fr
 *         description: Langue des contes
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de contes à collecter
 *     responses:
 *       200:
 *         description: Contes collectés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 30
 *                 stories:
 *                   type: array
 *                   items:
 *                     type: object
 *                 source:
 *                   type: string
 *                   example: African Storybook
 *       500:
 *         description: Erreur serveur
 */
router.post('/stories', asyncErrorHandler(async (req, res) => {
  const { language = 'fr', limit = 50 } = req.query;
  
  logInfo('Starting African stories collection', { language, limit });
  
  const result = await contentCollector.collectAfricanStories(language, parseInt(limit));
  
  res.json({
    success: true,
    message: `${result.count} contes africains collectés et certifiés Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/artworks:
 *   post:
 *     summary: Collecter des œuvres d'art africaines depuis le Met Museum
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre d'œuvres à collecter
 *     responses:
 *       200:
 *         description: Œuvres d'art collectées avec succès
 */
router.post('/artworks', asyncErrorHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  
  logInfo('Starting Met Museum artworks collection', { limit });
  
  const result = await contentCollector.collectMetMuseumArt(parseInt(limit));
  
  res.json({
    success: true,
    message: `${result.count} œuvres d'art africaines collectées et certifiées Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/music:
 *   post:
 *     summary: Collecter de la musique traditionnelle africaine depuis Internet Archive
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Nombre de morceaux à collecter
 *     responses:
 *       200:
 *         description: Musique traditionnelle collectée avec succès
 */
router.post('/music', asyncErrorHandler(async (req, res) => {
  const { limit = 30 } = req.query;
  
  logInfo('Starting traditional music collection', { limit });
  
  const result = await contentCollector.collectTraditionalMusic(parseInt(limit));
  
  res.json({
    success: true,
    message: `${result.count} morceaux de musique traditionnelle collectés et certifiés Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/images:
 *   post:
 *     summary: Collecter des images africaines depuis Wikimedia Commons
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           default: Africa
 *         description: Catégorie d'images
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 40
 *         description: Nombre d'images à collecter
 *     responses:
 *       200:
 *         description: Images collectées avec succès
 */
router.post('/images', asyncErrorHandler(async (req, res) => {
  const { category = 'Africa', limit = 40 } = req.query;
  
  logInfo('Starting Wikimedia images collection', { category, limit });
  
  const result = await contentCollector.collectWikimediaImages(category, parseInt(limit));
  
  res.json({
    success: true,
    message: `${result.count} images africaines collectées et certifiées Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/heritage:
 *   post:
 *     summary: Collecter des éléments du patrimoine immatériel UNESCO
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments à collecter
 *     responses:
 *       200:
 *         description: Patrimoine immatériel collecté avec succès
 */
router.post('/heritage', asyncErrorHandler(async (req, res) => {
  const { limit = 20 } = req.query;
  
  logInfo('Starting UNESCO heritage collection', { limit });
  
  const result = await contentCollector.collectUNESCOHeritage(parseInt(limit));
  
  res.json({
    success: true,
    message: `${result.count} éléments du patrimoine immatériel collectés et certifiés Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/all:
 *   post:
 *     summary: Collecte massive de tous les types de contenus
 *     tags: [Content Collector]
 *     responses:
 *       200:
 *         description: Collecte massive terminée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 totalCollected:
 *                   type: integer
 *                   example: 125
 *                 results:
 *                   type: object
 *                   properties:
 *                     stories:
 *                       type: object
 *                     artworks:
 *                       type: object
 *                     music:
 *                       type: object
 *                     images:
 *                       type: object
 *                     heritage:
 *                       type: object
 *       500:
 *         description: Erreur serveur
 */
router.post('/all', asyncErrorHandler(async (req, res) => {
  logInfo('Starting massive content collection from all sources');
  
  const result = await contentCollector.collectAllContentTypes();
  
  res.json({
    success: true,
    message: `Collecte massive terminée : ${result.totalCollected} contenus culturels africains collectés et certifiés Web3`,
    data: result
  });
}));

/**
 * @swagger
 * /api/collector/status:
 *   get:
 *     summary: Obtenir le statut des sources de collecte
 *     tags: [Content Collector]
 *     responses:
 *       200:
 *         description: Statut des sources
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sources:
 *                   type: object
 *                   properties:
 *                     africanStorybook:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                         license:
 *                           type: string
 *                         type:
 *                           type: string
 *                     internetArchive:
 *                       type: object
 *                     wikimediaCommons:
 *                       type: object
 *                     metMuseum:
 *                       type: object
 *                     smithsonianFolkways:
 *                       type: object
 *                     unesco:
 *                       type: object
 */
router.get('/status', asyncErrorHandler(async (req, res) => {
  const sources = {
    africanStorybook: {
      available: true,
      license: 'CC BY',
      type: 'contes',
      description: 'Contes africains multilingues'
    },
    internetArchive: {
      available: true,
      license: 'Public Domain',
      type: 'patrimoine',
      description: 'Archives numériques du domaine public'
    },
    wikimediaCommons: {
      available: true,
      license: 'CC0/CC-BY',
      type: 'arts_visuels',
      description: 'Images et médias libres de droits'
    },
    metMuseum: {
      available: true,
      license: 'CC0',
      type: 'arts_visuels',
      description: 'Collection Open Access du Met Museum'
    },
    smithsonianFolkways: {
      available: true,
      license: 'Educational',
      type: 'musique',
      description: 'Musique traditionnelle et folklorique'
    },
    unesco: {
      available: true,
      license: 'Educational',
      type: 'patrimoine_immatériel',
      description: 'Patrimoine culturel immatériel'
    }
  };

  res.json({
    success: true,
    message: 'Statut des sources de collecte',
    data: { sources }
  });
}));

module.exports = router;
