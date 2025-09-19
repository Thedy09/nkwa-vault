const express = require('express');
const router = express.Router();
const web3Core = require('../services/web3Core');
const { logInfo, logError } = require('../utils/logger');
const { asyncErrorHandler } = require('../utils/errorHandler');

/**
 * @swagger
 * tags:
 *   name: Web3 Core
 *   description: Services Web3 centraux - Pilier de Nkwa V
 */

/**
 * @swagger
 * /api/web3/status:
 *   get:
 *     summary: Vérifie le statut des services Web3
 *     tags: [Web3 Core]
 *     responses:
 *       200:
 *         description: Statut des services Web3
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
 *                     initialized:
 *                       type: boolean
 *                       example: true
 *                     hedera:
 *                       type: boolean
 *                       example: true
 *                     ipfs:
 *                       type: boolean
 *                       example: true
 *                     ready:
 *                       type: boolean
 *                       example: true
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Services Web3 non disponibles
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/status', asyncErrorHandler(async (req, res) => {
  const status = web3Core.getStatus();
  
  if (!status.ready) {
    return res.status(503).json({
      success: false,
      error: 'Services Web3 non disponibles',
      data: status
    });
  }

  res.json({
    success: true,
    data: status
  });
}));

/**
 * @swagger
 * /api/web3/stats:
 *   get:
 *     summary: Récupère les statistiques des services Web3
 *     tags: [Web3 Core]
 *     responses:
 *       200:
 *         description: Statistiques des services Web3
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
 *                     hedera:
 *                       type: object
 *                       properties:
 *                         accountId:
 *                           type: string
 *                           example: "0.0.123456"
 *                         balance:
 *                           type: string
 *                           example: "100.0"
 *                         tokens:
 *                           type: string
 *                           example: "500.0"
 *                     ipfs:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *       503:
 *         description: Services Web3 non disponibles
 */
router.get('/stats', asyncErrorHandler(async (req, res) => {
  const stats = await web3Core.getStats();
  
  if (!stats) {
    return res.status(503).json({
      success: false,
      error: 'Impossible de récupérer les statistiques Web3'
    });
  }

  res.json({
    success: true,
    data: stats
  });
}));

/**
 * @swagger
 * /api/web3/content:
 *   post:
 *     summary: Crée un contenu culturel avec certification blockchain
 *     tags: [Web3 Core]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Proverbe Yoruba"
 *               content:
 *                 type: string
 *                 example: "Le contenu du proverbe..."
 *               type:
 *                 type: string
 *                 enum: [PROVERB, TALE, RIDDLE, MUSIC, ART, DANCE, RECIPE]
 *                 example: "PROVERB"
 *               language:
 *                 type: string
 *                 example: "fr"
 *               origin:
 *                 type: string
 *                 example: "Nigeria"
 *               region:
 *                 type: string
 *                 example: "Lagos"
 *               country:
 *                 type: string
 *                 example: "Nigeria"
 *               authorName:
 *                 type: string
 *                 example: "Auteur Anonyme"
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: Contenu créé avec succès
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
 *                     contentId:
 *                       type: string
 *                       example: "content_123"
 *                     nftMetadata:
 *                       type: object
 *                     ipfs:
 *                       type: object
 *                       properties:
 *                         metadataCid:
 *                           type: string
 *                           example: "QmHash123"
 *                         mediaCids:
 *                           type: array
 *                           items:
 *                             type: string
 *                     hedera:
 *                       type: object
 *       400:
 *         description: Données invalides
 *       503:
 *         description: Services Web3 non disponibles
 */
router.post('/content', asyncErrorHandler(async (req, res) => {
  const { title, content, type, language, origin, region, country, authorName } = req.body;
  const mediaFiles = req.files || [];

  if (!title || !content || !type) {
    return res.status(400).json({
      success: false,
      error: 'Titre, contenu et type requis'
    });
  }

  const contentData = {
    id: `content_${Date.now()}`,
    title,
    content,
    type,
    language: language || 'fr',
    origin: origin || 'Afrique',
    region,
    country,
    authorName: authorName || 'Anonyme'
  };

  const result = await web3Core.createCulturalContent(contentData, mediaFiles);

  logInfo('Cultural content created with Web3', { 
    contentId: contentData.id,
    type: contentData.type,
    ipfsCids: result.ipfs.mediaCids.length
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/web3/certify/{contentId}:
 *   post:
 *     summary: Certifie un contenu existant
 *     tags: [Web3 Core]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contenu à certifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - authorName
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Proverbe Yoruba"
 *               authorName:
 *                 type: string
 *                 example: "Auteur Anonyme"
 *               type:
 *                 type: string
 *                 enum: [PROVERB, TALE, RIDDLE, MUSIC, ART, DANCE, RECIPE]
 *                 example: "PROVERB"
 *               origin:
 *                 type: string
 *                 example: "Nigeria"
 *     responses:
 *       200:
 *         description: Contenu certifié avec succès
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
 *                     contentId:
 *                       type: string
 *                       example: "content_123"
 *                     certificate:
 *                       type: object
 *                     ipfsCid:
 *                       type: string
 *                       example: "QmCertificate123"
 *                     hederaTransactionId:
 *                       type: string
 *                       example: "0.0.123456@1234567890.123456789"
 *       404:
 *         description: Contenu non trouvé
 *       503:
 *         description: Services Web3 non disponibles
 */
router.post('/certify/:contentId', asyncErrorHandler(async (req, res) => {
  const { contentId } = req.params;
  const { title, authorName, type, origin } = req.body;

  if (!title || !authorName || !type) {
    return res.status(400).json({
      success: false,
      error: 'Titre, auteur et type requis pour la certification'
    });
  }

  const contentData = {
    title,
    authorName,
    type,
    origin: origin || 'Afrique'
  };

  const result = await web3Core.certifyContent(contentId, contentData);

  logInfo('Content certified with Web3', { 
    contentId,
    certificateCid: result.ipfsCid
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/web3/verify/{contentId}:
 *   get:
 *     summary: Vérifie l'authenticité d'un contenu
 *     tags: [Web3 Core]
 *     parameters:
 *       - in: path
 *         name: contentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du contenu à vérifier
 *       - in: query
 *         name: contentHash
 *         required: true
 *         schema:
 *           type: string
 *         description: Hash du contenu à vérifier
 *     responses:
 *       200:
 *         description: Vérification d'authenticité
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
 *                     contentId:
 *                       type: string
 *                       example: "content_123"
 *                     isAuthentic:
 *                       type: boolean
 *                       example: true
 *                     ipfsIntegrity:
 *                       type: boolean
 *                       example: true
 *                     hcsData:
 *                       type: object
 *                     verifiedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Paramètres manquants
 *       503:
 *         description: Services Web3 non disponibles
 */
router.get('/verify/:contentId', asyncErrorHandler(async (req, res) => {
  const { contentId } = req.params;
  const { contentHash } = req.query;

  if (!contentHash) {
    return res.status(400).json({
      success: false,
      error: 'Hash du contenu requis'
    });
  }

  const result = await web3Core.verifyContentAuthenticity(contentId, contentHash);

  logInfo('Content authenticity verified', { 
    contentId,
    isAuthentic: result.isAuthentic
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/web3/rewards:
 *   post:
 *     summary: Distribue une récompense Web3
 *     tags: [Web3 Core]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - rewardType
 *               - amount
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "user_123"
 *               rewardType:
 *                 type: string
 *                 enum: [CONTENT_UPLOAD, CONTENT_VERIFICATION, TRANSLATION, REVIEW, SHARE, LIKE, COMMENT, QUALITY_CONTRIBUTION, COMMUNITY_MODERATION, CULTURAL_EXPERT, CHALLENGE_COMPLETION]
 *                 example: "CONTENT_UPLOAD"
 *               amount:
 *                 type: integer
 *                 example: 100
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Récompense distribuée avec succès
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
 *                     userId:
 *                       type: string
 *                       example: "user_123"
 *                     rewardType:
 *                       type: string
 *                       example: "CONTENT_UPLOAD"
 *                     amount:
 *                       type: integer
 *                       example: 100
 *                     transactionId:
 *                       type: string
 *                       example: "0.0.123456@1234567890.123456789"
 *                     hcsSequenceNumber:
 *                       type: string
 *                       example: "123456"
 *       400:
 *         description: Données invalides
 *       503:
 *         description: Services Web3 non disponibles
 */
router.post('/rewards', asyncErrorHandler(async (req, res) => {
  const { userId, rewardType, amount, metadata = {} } = req.body;

  if (!userId || !rewardType || !amount) {
    return res.status(400).json({
      success: false,
      error: 'userId, rewardType et amount requis'
    });
  }

  const result = await web3Core.distributeReward(userId, rewardType, amount, metadata);

  logInfo('Web3 reward distributed', { 
    userId,
    rewardType,
    amount,
    transactionId: result.transactionId
  });

  res.json({
    success: true,
    data: result
  });
}));

/**
 * @swagger
 * /api/web3/rewards/setup:
 *   post:
 *     summary: Configure le système de récompenses Web3
 *     tags: [Web3 Core]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Système de récompenses configuré
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
 *                     tokenId:
 *                       type: string
 *                       example: "0.0.123456"
 *                     topicId:
 *                       type: string
 *                       example: "0.0.123457"
 *                     config:
 *                       type: object
 *       503:
 *         description: Services Web3 non disponibles
 */
router.post('/rewards/setup', asyncErrorHandler(async (req, res) => {
  const result = await web3Core.createRewardSystem();

  logInfo('Web3 reward system setup', { 
    tokenId: result.tokenId,
    topicId: result.topicId
  });

  res.json({
    success: true,
    data: result
  });
}));

module.exports = router;
