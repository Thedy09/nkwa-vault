const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { uploadFileToIPFS } = require('../services/ipfsService');
const { submitToHCS } = require('../services/hederaService');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const CulturalItem = require('../models/CulturalItem');
const upload = multer({ dest: 'uploads/' });
const router = express.Router();

// Middleware d'authentification OBLIGATOIRE pour l'upload
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    // 1. VÉRIFICATION DE L'AUTHENTIFICATION
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // 2. VÉRIFICATION DU STATUT DU COMPTE
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // 3. VALIDATION DES DONNÉES
    const { title, description, category, country, language } = req.body;
    const file = req.file;

    if (!title || !description || !category || !file) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description, catégorie et fichier sont requis'
      });
    }

    // 4. CRÉATION DE L'ID UNIQUE AUTHENTIFIÉ
    const contributionId = `nkwa_${userId}_${Date.now()}`;
    
    // 5. UPLOAD VERS IPFS (décentralisé)
    const cid = await uploadFileToIPFS(file.path, file.originalname);
    
    // 6. PRÉPARATION DES MÉTADONNÉES AUTHENTIFIÉES
    const authenticatedPayload = {
      contributionId,
      cid,
      title,
      description,
      category,
      country: country || 'Non spécifié',
      language: language || 'Non spécifié',
      author: {
        id: userId,
        name: user.name,
        email: user.email,
        verified: user.isVerified
      },
      timestamp: new Date().toISOString(),
      platform: 'Nkwa Vault',
      version: '1.0.0'
    };

    // 7. SOUMISSION À HEDERA HCS (blockchain)
    const hcsRes = await submitToHCS(JSON.stringify(authenticatedPayload));
    
    // 8. SAUVEGARDE EN BASE DE DONNÉES
    const culturalItem = new CulturalItem({
      title,
      description,
      content: description, // Pour l'instant, on utilise la description
      category,
      country: country || 'Non spécifié',
      language: language || 'Non spécifié',
      author: userId,
      media: [{
        type: file.mimetype.startsWith('image') ? 'image' : 
              file.mimetype.startsWith('audio') ? 'audio' : 
              file.mimetype.startsWith('video') ? 'video' : 'document',
        url: `ipfs://${cid}`,
        filename: file.originalname,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype
      }],
      blockchain: {
        ipfsHash: cid,
        hcsMessageId: hcsRes.messageId || hcsRes.topicId,
        transactionHash: hcsRes.transactionHash || 'demo-mode'
      },
      status: 'pending' // En attente de modération
    });

    await culturalItem.save();

    // 9. MISE À JOUR DES STATISTIQUES UTILISATEUR
    await user.updateStats('contributions');

    // 10. NETTOYAGE DU FICHIER TEMPORAIRE
    fs.unlinkSync(file.path);

    // 11. RÉPONSE SUCCÈS
    res.json({
      success: true,
      message: 'Contribution authentifiée et sauvegardée avec succès',
      data: {
        contributionId,
        cid,
        hcs: hcsRes,
        itemId: culturalItem._id,
        author: {
          name: user.name,
          verified: user.isVerified
        },
        status: 'pending',
        nextStep: 'En attente de modération par la communauté'
      }
    });

  } catch(err) {
    console.error('Erreur upload authentifié:', err);
    
    // Nettoyage en cas d'erreur
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupErr) {
        console.error('Erreur nettoyage fichier:', cleanupErr);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la sauvegarde authentifiée',
      error: err.message
    });
  }
});

// Route pour vérifier l'authentification avant upload
router.get('/check-auth', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      message: 'Utilisateur authentifié',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          verified: user.isVerified,
          active: user.isActive,
          role: user.role,
          stats: user.stats
        },
        canContribute: user.isActive && user.isVerified,
        requirements: {
          accountActive: user.isActive,
          emailVerified: user.isVerified,
          authenticated: true
        }
      }
    });
  } catch (error) {
    console.error('Erreur vérification auth:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification d\'authentification'
    });
  }
});

module.exports = router;
