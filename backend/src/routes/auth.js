const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../config/database');

// Configuration JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const router = express.Router();

// Rate limiting pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives par IP
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  }
});

// Créer un utilisateur admin par défaut
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acv.africa' }
    });
    
    if (existingAdmin) {
      // Utilisateur admin déjà existant
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur ACV',
        email: 'admin@acv.africa',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        isVerified: true
      }
    });

    // Créer le profil séparément
    await prisma.userProfile.create({
      data: {
        userId: admin.id,
        bio: 'Administrateur principal de Nkwa V',
        country: 'Afrique',
        languages: ['français', 'anglais'],
        interests: ['culture africaine', 'patrimoine', 'technologie']
      }
    });

    // Créer les stats séparément
    await prisma.userStats.create({
      data: {
        userId: admin.id,
        contributions: 0,
        views: 0,
        likes: 0,
        followers: 0,
        following: 0
      }
    });

    // Utilisateur admin créé avec succès
  } catch (error) {
    console.error('Erreur création admin:', error);
  }
};

// Initialiser l'admin par défaut
createDefaultAdmin();

// POST /auth/register - Inscription
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, mot de passe et nom requis'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 6 caractères'
      });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Un compte avec cet email existe déjà'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        isVerified: false
      }
    });

    // Créer les stats séparément
    await prisma.userStats.create({
      data: {
        userId: user.id,
        contributions: 0,
        views: 0,
        likes: 0,
        followers: 0,
        following: 0
      }
    });

    // Générer le token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Récupérer les données complètes de l'utilisateur
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        stats: true,
        preferences: true
      }
    });

    // Préparer les données utilisateur (sans le mot de passe)
    const userData = {
      id: userWithRelations.id,
      name: userWithRelations.name,
      email: userWithRelations.email,
      role: userWithRelations.role,
      isActive: userWithRelations.isActive,
      isVerified: userWithRelations.isVerified,
      profile: userWithRelations.profile,
      stats: userWithRelations.stats,
      preferences: userWithRelations.preferences,
      createdAt: userWithRelations.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Erreur inscription:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
});

// POST /auth/login - Connexion
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    // Générer le token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Récupérer les données complètes de l'utilisateur
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        stats: true,
        preferences: true
      }
    });

    // Préparer les données utilisateur (sans le mot de passe)
    const userData = {
      id: userWithRelations.id,
      name: userWithRelations.name,
      email: userWithRelations.email,
      role: userWithRelations.role,
      isActive: userWithRelations.isActive,
      isVerified: userWithRelations.isVerified,
      profile: userWithRelations.profile,
      stats: userWithRelations.stats,
      preferences: userWithRelations.preferences,
      createdAt: userWithRelations.createdAt
    };

    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: userData,
        token
      }
    });
  } catch (error) {
    console.error('Erreur connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

// GET /auth/me - Profil utilisateur
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        profile: true,
        preferences: true,
        stats: true
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

// POST /auth/logout - Déconnexion
router.post('/logout', authenticateToken, (req, res) => {
  // En JWT, la déconnexion se fait côté client en supprimant le token
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// GET /auth/users - Liste des utilisateurs (admin seulement)
router.get('/users', authenticateToken, async (req, res) => {
  try {
    // Vérifier les droits admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Erreur récupération utilisateurs:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

module.exports = router;