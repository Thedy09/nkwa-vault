const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');

// Import conditionnel des modèles
let User;
try {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    User = require('../models/User');
  } else {
    console.log('Mode démo: MongoDB non connecté, utilisation du stockage en mémoire');
  }
} catch (error) {
  console.log('Mode démo: Modèles non disponibles');
}

// Stockage en mémoire pour le mode démo
const demoUsers = new Map();
let nextUserId = 1;

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
    if (User) {
      // Mode normal avec MongoDB
      const existingAdmin = await User.findOne({ email: 'admin@acv.africa' });
      if (existingAdmin) {
        console.log('👤 Utilisateur admin déjà existant');
        return;
      }

      const hashedPassword = await bcrypt.hash('admin123', 12);
      const admin = new User({
        name: 'Administrateur ACV',
        email: 'admin@acv.africa',
        password: hashedPassword,
        role: 'admin',
        isActive: true,
        isVerified: true,
        profile: {
          bio: 'Administrateur principal de Nkwa Vault',
          country: 'Afrique',
          languages: ['français', 'anglais'],
          interests: ['culture africaine', 'patrimoine', 'technologie']
        },
        stats: {
          contributions: 0,
          views: 0,
          likes: 0,
          followers: 0,
          following: 0
        }
      });

      await admin.save();
      console.log('👤 Utilisateur admin créé: admin@acv.africa / admin123');
    } else {
      // Mode démo
      if (!demoUsers.has('admin@acv.africa')) {
        const hashedPassword = await bcrypt.hash('admin123', 12);
        const adminData = {
          id: 0,
          name: 'Administrateur ACV',
          email: 'admin@acv.africa',
          password: hashedPassword,
          role: 'admin',
          isActive: true,
          isVerified: true,
          profile: {
            bio: 'Administrateur principal de Nkwa Vault',
            country: 'Afrique',
            languages: ['français', 'anglais'],
            interests: ['culture africaine', 'patrimoine', 'technologie']
          },
          stats: {
            contributions: 0,
            views: 0,
            likes: 0,
            followers: 0,
            following: 0
          },
          createdAt: new Date()
        };
        
        demoUsers.set('admin@acv.africa', adminData);
        console.log('👤 Utilisateur admin créé en mode démo: admin@acv.africa / admin123');
      }
    }
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

    if (User) {
      // Mode normal avec MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const user = new User({
        name,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        isVerified: false,
        stats: {
          contributions: 0,
          views: 0,
          likes: 0,
          followers: 0,
          following: 0
        }
      });

      await user.save();
    } else {
      // Mode démo
      if (demoUsers.has(email)) {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = nextUserId++;
      
      const userData = {
        id: userId,
        name,
        email,
        password: hashedPassword,
        role: 'user',
        isActive: true,
        isVerified: true,
        stats: {
          contributions: 0,
          views: 0,
          likes: 0,
          followers: 0,
          following: 0
        },
        createdAt: new Date()
      };

      demoUsers.set(email, userData);
    }

    // Générer le token et préparer la réponse
    let userData, userId;
    
    if (User) {
      // Mode normal avec MongoDB
      userId = user._id;
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        stats: user.stats,
        createdAt: user.createdAt
      };
    } else {
      // Mode démo
      const user = demoUsers.get(email);
      userId = user.id;
      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        stats: user.stats,
        createdAt: user.createdAt
      };
    }

    const token = jwt.sign(
      { 
        id: userId, 
        email: email, 
        role: 'user',
        name: name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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

    let user, userData;
    
    if (User) {
      // Mode normal avec MongoDB
      user = await User.findOne({ email });
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

      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        stats: user.stats,
        createdAt: user.createdAt
      };
    } else {
      // Mode démo
      user = demoUsers.get(email);
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

      userData = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        stats: user.stats,
        createdAt: user.createdAt
      };
    }

    // Générer le token
    const token = jwt.sign(
      { 
        id: userData.id, 
        email: userData.email, 
        role: userData.role,
        name: userData.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

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
    const user = await User.findById(req.user.id).select('-password');
    
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
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
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