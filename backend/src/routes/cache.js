const express = require('express');
const router = express.Router();
const redisService = require('../services/redisService');
const { 
  invalidateCache,
  invalidateMuseumCache,
  invalidateCulturalContentCache,
  invalidateRiddlesCache,
  invalidateStatsCache,
  invalidateSearchCache
} = require('../middleware/cache');
const { logInfo, logError } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Cache
 *   description: Gestion du cache Redis
 */

/**
 * @swagger
 * /api/cache/status:
 *   get:
 *     summary: Vérifie le statut du cache Redis
 *     tags: [Cache]
 *     responses:
 *       200:
 *         description: Statut du cache récupéré avec succès
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
 *                     connected:
 *                       type: boolean
 *                       example: true
 *                     dbsize:
 *                       type: integer
 *                       example: 150
 *                     memory:
 *                       type: integer
 *                       example: 1024000
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', async (req, res) => {
  try {
    const stats = await redisService.getStats();
    
    if (stats) {
      res.json({
        success: true,
        data: stats
      });
    } else {
      res.status(503).json({
        success: false,
        error: 'Cache Redis non disponible'
      });
    }
  } catch (error) {
    logError(error, { operation: 'cache_status' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la vérification du statut du cache'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear:
 *   post:
 *     summary: Vide le cache Redis
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 150
 *       401:
 *         description: Non autorisé
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
router.post('/clear', async (req, res) => {
  try {
    const deleted = await invalidateCache('*');
    
    logInfo('Cache cleared', { deleted, userAgent: req.get('User-Agent') });
    
    res.json({
      success: true,
      message: 'Cache vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear/museum:
 *   post:
 *     summary: Vide le cache du musée
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache du musée vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache du musée vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 25
 */
router.post('/clear/museum', async (req, res) => {
  try {
    const deleted = await invalidateMuseumCache();
    
    logInfo('Museum cache cleared', { deleted });
    
    res.json({
      success: true,
      message: 'Cache du musée vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'museum_cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache du musée'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear/cultural-content:
 *   post:
 *     summary: Vide le cache des contenus culturels
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache des contenus culturels vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache des contenus culturels vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 30
 */
router.post('/clear/cultural-content', async (req, res) => {
  try {
    const deleted = await invalidateCulturalContentCache();
    
    logInfo('Cultural content cache cleared', { deleted });
    
    res.json({
      success: true,
      message: 'Cache des contenus culturels vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'cultural_content_cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache des contenus culturels'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear/riddles:
 *   post:
 *     summary: Vide le cache des devinettes
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache des devinettes vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache des devinettes vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 20
 */
router.post('/clear/riddles', async (req, res) => {
  try {
    const deleted = await invalidateRiddlesCache();
    
    logInfo('Riddles cache cleared', { deleted });
    
    res.json({
      success: true,
      message: 'Cache des devinettes vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'riddles_cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache des devinettes'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear/stats:
 *   post:
 *     summary: Vide le cache des statistiques
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache des statistiques vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache des statistiques vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 10
 */
router.post('/clear/stats', async (req, res) => {
  try {
    const deleted = await invalidateStatsCache();
    
    logInfo('Stats cache cleared', { deleted });
    
    res.json({
      success: true,
      message: 'Cache des statistiques vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'stats_cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache des statistiques'
    });
  }
});

/**
 * @swagger
 * /api/cache/clear/search:
 *   post:
 *     summary: Vide le cache des recherches
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cache des recherches vidé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cache des recherches vidé avec succès"
 *                 deleted:
 *                   type: integer
 *                   example: 15
 */
router.post('/clear/search', async (req, res) => {
  try {
    const deleted = await invalidateSearchCache();
    
    logInfo('Search cache cleared', { deleted });
    
    res.json({
      success: true,
      message: 'Cache des recherches vidé avec succès',
      deleted
    });
  } catch (error) {
    logError(error, { operation: 'search_cache_clear' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors du vidage du cache des recherches'
    });
  }
});

/**
 * @swagger
 * /api/cache/keys:
 *   get:
 *     summary: Liste les clés du cache
 *     tags: [Cache]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *           default: "*"
 *         description: Pattern de recherche des clés
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Nombre maximum de clés à retourner
 *     responses:
 *       200:
 *         description: Clés du cache récupérées avec succès
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
 *                     keys:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["cache:GET:/api/museum/collection", "stats:museum"]
 *                     total:
 *                       type: integer
 *                       example: 150
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/keys', async (req, res) => {
  try {
    const { pattern = '*', limit = 100 } = req.query;
    
    if (!await redisService.isReady()) {
      return res.status(503).json({
        success: false,
        error: 'Cache Redis non disponible'
      });
    }
    
    const keys = await redisService.client.keys(pattern);
    const limitedKeys = keys.slice(0, parseInt(limit));
    
    res.json({
      success: true,
      data: {
        keys: limitedKeys,
        total: keys.length
      }
    });
  } catch (error) {
    logError(error, { operation: 'cache_keys' });
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des clés du cache'
    });
  }
});

module.exports = router;
