const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const hederaService = require('../services/hederaService');
const ipfsService = require('../services/ipfsService');
const blockchainCertificationService = require('../services/blockchainCertification');
const tokenRewardsService = require('../services/tokenRewards');
const { prisma } = require('../config/database');

const router = express.Router();

// Initialiser les services Web3
let servicesInitialized = false;
const initializeServices = async () => {
  if (servicesInitialized) return true;
  
  try {
    await hederaService.initialize();
    await ipfsService.initialize();
    await blockchainCertificationService.initialize();
    await tokenRewardsService.initialize();
    
    servicesInitialized = true;
    console.log('✅ Services Web3 initialisés');
    return true;
  } catch (error) {
    console.error('❌ Erreur initialisation services Web3:', error);
    return false;
  }
};

// GET /web3/status - Statut des services Web3
router.get('/status', async (req, res) => {
  try {
    const hederaStatus = hederaService.isInitialized;
    const ipfsStatus = ipfsService.isInitialized;
    
    res.json({
      success: true,
      services: {
        hedera: {
          initialized: hederaStatus,
          network: process.env.HEDERA_NETWORK || 'testnet'
        },
        ipfs: {
          initialized: ipfsStatus,
          provider: 'Web3.Storage'
        },
        blockchain: {
          initialized: hederaStatus || ipfsStatus,
          demo: !hederaStatus && !ipfsStatus
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erreur récupération statut services'
    });
  }
});

// POST /web3/certify-content - Certifier un contenu culturel
router.post('/certify-content', authenticateToken, async (req, res) => {
  try {
    const { contentId, contentData } = req.body;
    
    if (!contentId || !contentData) {
      return res.status(400).json({
        success: false,
        message: 'ID du contenu et données requises'
      });
    }

    // Initialiser les services si nécessaire
    await initializeServices();

    // Certifier le contenu
    const result = await blockchainCertificationService.certifyContent({
      id: contentId,
      ...contentData,
      author: req.user.name,
      userId: req.user.id
    });

    if (result.success) {
      // Mettre à jour la base de données
      await prisma.culturalContent.upsert({
        where: { id: contentId },
        create: {
          id: contentId,
          title: contentData.title,
          content: contentData.content,
          type: contentData.type,
          language: contentData.language || 'fr',
          origin: contentData.origin,
          userId: req.user.id,
          authorName: req.user.name,
          ipfsCid: result.certificate.ipfsCid,
          ipfsUrl: result.certificate.ipfsUrl,
          certificationHash: result.certificate.certificationHash,
          hederaTransactionId: result.certificate.hederaTransactionId,
          hederaSequenceNumber: result.certificate.hederaSequenceNumber,
          nftMetadata: result.certificate.nftMetadata,
          verified: result.certificate.verified,
          status: 'VERIFIED',
          metadata: contentData.metadata || {}
        },
        update: {
          ipfsCid: result.certificate.ipfsCid,
          ipfsUrl: result.certificate.ipfsUrl,
          certificationHash: result.certificate.certificationHash,
          hederaTransactionId: result.certificate.hederaTransactionId,
          hederaSequenceNumber: result.certificate.hederaSequenceNumber,
          nftMetadata: result.certificate.nftMetadata,
          verified: result.certificate.verified,
          status: 'VERIFIED'
        }
      });

      // Distribuer une récompense pour l'upload
      await tokenRewardsService.distributeReward(
        req.user.id,
        'CONTENT_UPLOAD',
        { contentId, quality: contentData.quality || 1 }
      );
    }

    res.json(result);
  } catch (error) {
    console.error('Erreur certification contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la certification du contenu'
    });
  }
});

// GET /web3/verify-content/:contentId - Vérifier l'authenticité d'un contenu
router.get('/verify-content/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { hash } = req.query;

    await initializeServices();

    const result = await blockchainCertificationService.verifyContent(contentId, hash);
    res.json(result);
  } catch (error) {
    console.error('Erreur vérification contenu:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du contenu'
    });
  }
});

// GET /web3/user-balance - Solde de tokens de l'utilisateur
router.get('/user-balance', authenticateToken, async (req, res) => {
  try {
    await initializeServices();

    const result = await tokenRewardsService.getUserTokenBalance(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Erreur récupération solde:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du solde'
    });
  }
});

// GET /web3/user-rewards - Historique des récompenses
router.get('/user-rewards', authenticateToken, async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    await initializeServices();

    const result = await tokenRewardsService.getUserRewardHistory(req.user.id, parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Erreur récupération récompenses:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des récompenses'
    });
  }
});

// GET /web3/user-level - Niveau de l'utilisateur
router.get('/user-level', authenticateToken, async (req, res) => {
  try {
    await initializeServices();

    const result = await tokenRewardsService.getUserLevel(req.user.id);
    res.json(result);
  } catch (error) {
    console.error('Erreur récupération niveau:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du niveau'
    });
  }
});

// POST /web3/distribute-reward - Distribuer une récompense (admin seulement)
router.post('/distribute-reward', authenticateToken, async (req, res) => {
  try {
    // Vérifier les droits admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const { userId, contributionType, metadata } = req.body;

    if (!userId || !contributionType) {
      return res.status(400).json({
        success: false,
        message: 'ID utilisateur et type de contribution requis'
      });
    }

    await initializeServices();

    const result = await tokenRewardsService.distributeReward(userId, contributionType, metadata);
    res.json(result);
  } catch (error) {
    console.error('Erreur distribution récompense:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la distribution de la récompense'
    });
  }
});

// GET /web3/leaderboard - Classement des contributeurs
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    await initializeServices();

    const result = await tokenRewardsService.getLeaderboard(parseInt(limit));
    res.json(result);
  } catch (error) {
    console.error('Erreur récupération classement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du classement'
    });
  }
});

// POST /web3/create-challenge - Créer un défi
router.post('/create-challenge', authenticateToken, async (req, res) => {
  try {
    const { type, target, reward } = req.body;

    if (!type || !target || !reward) {
      return res.status(400).json({
        success: false,
        message: 'Type, cible et récompense requis'
      });
    }

    await initializeServices();

    const result = await tokenRewardsService.createChallenge(req.user.id, type, target, reward);
    res.json(result);
  } catch (error) {
    console.error('Erreur création défi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du défi'
    });
  }
});

// POST /web3/check-challenge/:challengeId - Vérifier un défi
router.post('/check-challenge/:challengeId', authenticateToken, async (req, res) => {
  try {
    const { challengeId } = req.params;

    await initializeServices();

    const result = await tokenRewardsService.checkChallengeProgress(req.user.id, challengeId);
    res.json(result);
  } catch (error) {
    console.error('Erreur vérification défi:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du défi'
    });
  }
});

// GET /web3/ipfs/:cid - Récupérer des données depuis IPFS
router.get('/ipfs/:cid', async (req, res) => {
  try {
    const { cid } = req.params;

    await initializeServices();

    const result = await ipfsService.getData(cid);
    res.json(result);
  } catch (error) {
    console.error('Erreur récupération IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des données IPFS'
    });
  }
});

// POST /web3/ipfs/upload - Uploader des données sur IPFS
router.post('/ipfs/upload', authenticateToken, async (req, res) => {
  try {
    const { data, fileName } = req.body;

    if (!data || !fileName) {
      return res.status(400).json({
        success: false,
        message: 'Données et nom de fichier requis'
      });
    }

    await initializeServices();

    const result = await ipfsService.uploadJSON(data, fileName);
    res.json(result);
  } catch (error) {
    console.error('Erreur upload IPFS:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'upload sur IPFS'
    });
  }
});

module.exports = router;


