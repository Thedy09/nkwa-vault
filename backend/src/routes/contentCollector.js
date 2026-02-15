const express = require('express');
const router = express.Router();
const contentCollector = require('../services/contentCollectorService');
const { asyncErrorHandler } = require('../utils/errorHandler');
const { logInfo } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Content Collector
 *   description: Collecte de contenus culturels africains depuis des sources libres
 */

const collectTalesHandler = async (req, res) => {
  const { language = 'fr', limit = 50 } = req.query;

  logInfo('Starting African tales collection', { language, limit });

  const result = await contentCollector.collectAfricanStories(language, parseInt(limit, 10));

  res.json({
    success: true,
    message: `${result.count} tales africains collectés et certifiés Web3`,
    data: result
  });
};

const collectArtHandler = async (req, res) => {
  const { limit = 30 } = req.query;

  logInfo('Starting African art collection', { limit });

  const result = await contentCollector.collectMetMuseumArt(parseInt(limit, 10));

  res.json({
    success: true,
    message: `${result.count} éléments d'art africain collectés et certifiés Web3`,
    data: result
  });
};

const collectChantsHandler = async (req, res) => {
  const { limit = 30 } = req.query;

  logInfo('Starting African chants collection', { limit });

  const result = await contentCollector.collectTraditionalMusic(parseInt(limit, 10));

  res.json({
    success: true,
    message: `${result.count} chants traditionnels collectés et certifiés Web3`,
    data: result
  });
};

/**
 * @swagger
 * /api/collector/stories:
 *   post:
 *     summary: Collecter des contes africains depuis Gutendex (Project Gutenberg)
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
 *                   example: Gutendex / Project Gutenberg
 *       500:
 *         description: Erreur serveur
 */
router.post('/stories', asyncErrorHandler(collectTalesHandler));
router.post('/tales', asyncErrorHandler(collectTalesHandler));

/**
 * @swagger
 * /api/collector/proverbs:
 *   post:
 *     summary: Collecter des proverbes africains depuis Wikiquote
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Nombre de proverbes à collecter
 *     responses:
 *       200:
 *         description: Proverbes collectés avec succès
 */
router.post('/proverbs', asyncErrorHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  logInfo('Starting African proverbs collection', { limit });

  const result = await contentCollector.collectAfricanProverbs(parseInt(limit, 10));

  res.json({
    success: true,
    message: `${result.count} proverbes africains collectés et certifiés Web3`,
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
router.post('/artworks', asyncErrorHandler(collectArtHandler));
router.post('/art', asyncErrorHandler(collectArtHandler));

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
router.post('/music', asyncErrorHandler(collectChantsHandler));
router.post('/chants', asyncErrorHandler(collectChantsHandler));

/**
 * @swagger
 * /api/collector/dances:
 *   post:
 *     summary: Collecter des danses traditionnelles africaines depuis Internet Archive
 *     tags: [Content Collector]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments de danse à collecter
 *     responses:
 *       200:
 *         description: Danses traditionnelles collectées avec succès
 */
router.post('/dances', asyncErrorHandler(async (req, res) => {
  const { limit = 20 } = req.query;

  logInfo('Starting traditional dance collection', { limit });

  const result = await contentCollector.collectTraditionalDances(parseInt(limit, 10));

  res.json({
    success: true,
    message: `${result.count} danses traditionnelles collectées et certifiées Web3`,
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
  
  const result = await contentCollector.collectWikimediaImages(category, parseInt(limit, 10));
  
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
  
  const result = await contentCollector.collectUNESCOHeritage(parseInt(limit, 10));
  
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
 *                     tales:
 *                       type: object
 *                     proverbs:
 *                       type: object
 *                     chants:
 *                       type: object
 *                     danses:
 *                       type: object
 *                     art:
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
 *                     gutendex:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                         license:
 *                           type: string
 *                         type:
 *                           type: string
 *                     wikiquote:
 *                       type: object
 *                     internetArchive:
 *                       type: object
 *                     wikimediaCommons:
 *                       type: object
 *                     metMuseum:
 *                       type: object
 */
router.get('/status', asyncErrorHandler(async (req, res) => {
  const sources = {
    gutendex: {
      available: true,
      license: 'Public Domain',
      type: 'contes',
      description: 'Contes africains du domaine public (Project Gutenberg)'
    },
    wikiquote: {
      available: true,
      license: 'CC BY-SA 4.0',
      type: 'proverbes',
      description: 'Proverbes africains issus de pages publiques Wikiquote'
    },
    internetArchive: {
      available: true,
      license: 'Creative Commons / Public Domain',
      type: 'chants',
      description: 'Archives audio traditionnelles en accès libre'
    },
    wikimediaCommons: {
      available: true,
      license: 'CC BY-SA / CC0',
      type: 'danses',
      description: 'Médias libres (images/vidéos) sur les danses africaines'
    },
    metMuseum: {
      available: true,
      license: 'CC0',
      type: 'art',
      description: 'Collection Open Access du Met Museum (art africain)'
    }
  };

  res.json({
    success: true,
    message: 'Statut des sources de collecte',
    data: { sources }
  });
}));

module.exports = router;
