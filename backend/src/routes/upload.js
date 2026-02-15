const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { authenticateToken } = require('../middleware/auth');
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });
const router = express.Router();

// Route d'upload simplifiée - mode démo uniquement
router.post('/', authenticateToken, upload.single('media'), async (req, res) => {
  try {
    // Mode démo - simulation d'upload
    const { title, description, category, country, language } = req.body;
    const file = req.file;

    if (!title || !description || !category || !file) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description, catégorie et fichier sont requis'
      });
    }

    // Simulation d'upload réussi
    const contributionId = `nkwa_demo_${Date.now()}`;
    const cid = `demo_cid_${Math.random().toString(36).substr(2, 9)}`;
    
    // Nettoyage du fichier temporaire
    if (file && file.path) {
      try {
        fs.unlinkSync(file.path);
      } catch (cleanupErr) {
        console.error('Erreur nettoyage fichier:', cleanupErr);
      }
    }

    res.json({
      success: true,
      message: 'Contribution simulée avec succès (mode démo)',
      data: {
        contributionId,
        cid,
        title,
        description,
        category,
        country: country || 'Non spécifié',
        language: language || 'Non spécifié',
        status: 'demo',
        nextStep: 'Mode démo - pas de sauvegarde réelle'
      }
    });

  } catch(err) {
    console.error('Erreur upload démo:', err);
    
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
      message: 'Erreur lors de l\'upload démo',
      error: err.message
    });
  }
});

// Route pour vérifier l'authentification avant upload - mode démo
router.get('/check-auth', authenticateToken, async (req, res) => {
  try {
    // Mode démo - simulation d'utilisateur authentifié
    res.json({
      success: true,
      message: 'Utilisateur authentifié (mode démo)',
      data: {
        user: {
          id: req.user.id,
          name: 'Utilisateur Démo',
          email: 'demo@nkwa.africa',
          verified: true,
          active: true,
          role: 'user',
          stats: { contributions: 0 }
        },
        canContribute: true,
        requirements: {
          accountActive: true,
          emailVerified: true,
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
