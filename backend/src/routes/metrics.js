const express = require('express');
const router = express.Router();
const metricsCollector = require('../utils/metrics');
const { logInfo } = require('../utils/logger');

/**
 * @swagger
 * tags:
 *   name: Metrics
 *   description: Métriques et monitoring de l'application
 */

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Récupère les métriques de l'application
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques récupérées avec succès
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
 *                     uptime:
 *                       type: string
 *                       example: "2.5h"
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 1250
 *                         successRate:
 *                           type: integer
 *                           example: 95
 *                         averageResponseTime:
 *                           type: integer
 *                           example: 150
 *                     web3:
 *                       type: object
 *                       properties:
 *                         hedera:
 *                           type: object
 *                           properties:
 *                             operations:
 *                               type: integer
 *                               example: 50
 *                             successRate:
 *                               type: integer
 *                               example: 98
 *                         ipfs:
 *                           type: object
 *                           properties:
 *                             uploads:
 *                               type: integer
 *                               example: 25
 *                             successRate:
 *                               type: integer
 *                               example: 100
 *                     database:
 *                       type: object
 *                       properties:
 *                         queries:
 *                           type: integer
 *                           example: 500
 *                         successRate:
 *                           type: integer
 *                           example: 99
 *                     errors:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           example: 5
 *                         byType:
 *                           type: object
 *                           example: {"ValidationError": 2, "DatabaseError": 3}
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  try {
    const metrics = metricsCollector.getSummary();
    
    logInfo('Métriques récupérées', { 
      endpoint: '/api/metrics',
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Erreur récupération métriques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des métriques'
    });
  }
});

/**
 * @swagger
 * /api/metrics/detailed:
 *   get:
 *     summary: Récupère les métriques détaillées de l'application
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques détaillées récupérées avec succès
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
 *                     requests:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         successful:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *                         byEndpoint:
 *                           type: object
 *                         byMethod:
 *                           type: object
 *                         responseTimes:
 *                           type: array
 *                           items:
 *                             type: integer
 *                     web3:
 *                       type: object
 *                     database:
 *                       type: object
 *                     errors:
 *                       type: object
 *                     performance:
 *                       type: object
 *                       properties:
 *                         memoryUsage:
 *                           type: array
 *                         cpuUsage:
 *                           type: array
 *                         uptime:
 *                           type: integer
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/detailed', (req, res) => {
  try {
    const metrics = metricsCollector.getMetrics();
    
    logInfo('Métriques détaillées récupérées', { 
      endpoint: '/api/metrics/detailed',
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Erreur récupération métriques détaillées:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des métriques détaillées'
    });
  }
});

/**
 * @swagger
 * /api/metrics/reset:
 *   post:
 *     summary: Réinitialise les métriques de l'application
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Métriques réinitialisées avec succès
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
 *                   example: "Métriques réinitialisées avec succès"
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/reset', (req, res) => {
  try {
    metricsCollector.reset();
    
    logInfo('Métriques réinitialisées', { 
      endpoint: '/api/metrics/reset',
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    
    res.json({
      success: true,
      message: 'Métriques réinitialisées avec succès'
    });
  } catch (error) {
    console.error('Erreur réinitialisation métriques:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la réinitialisation des métriques'
    });
  }
});

/**
 * @swagger
 * /api/metrics/health:
 *   get:
 *     summary: Vérifie la santé de l'application
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Application en bonne santé
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
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     uptime:
 *                       type: string
 *                       example: "2.5h"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Application en mauvaise santé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "unhealthy"
 *                     issues:
 *                       type: array
 *                       items:
 *                         type: string
 */
router.get('/health', (req, res) => {
  try {
    const metrics = metricsCollector.getSummary();
    const issues = [];
    
    // Vérifier la santé de l'application
    if (metrics.requests.successRate < 90) {
      issues.push('Taux de succès des requêtes faible');
    }
    
    if (metrics.requests.averageResponseTime > 2000) {
      issues.push('Temps de réponse moyen élevé');
    }
    
    if (metrics.errors.total > 100) {
      issues.push('Nombre d\'erreurs élevé');
    }
    
    const isHealthy = issues.length === 0;
    const status = isHealthy ? 'healthy' : 'unhealthy';
    
    res.status(isHealthy ? 200 : 503).json({
      success: isHealthy,
      data: {
        status,
        uptime: metrics.uptime,
        timestamp: new Date().toISOString(),
        ...(issues.length > 0 && { issues })
      }
    });
  } catch (error) {
    console.error('Erreur vérification santé:', error);
    res.status(503).json({
      success: false,
      data: {
        status: 'unhealthy',
        issues: ['Erreur lors de la vérification de la santé']
      }
    });
  }
});

module.exports = router;
