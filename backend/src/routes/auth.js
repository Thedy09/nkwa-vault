const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('../middleware/auth');
const { prisma } = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  }
});

const demoUsersByEmail = new Map();
const defaultDemoUsers = [
  {
    id: 1,
    name: 'Administrateur ACV',
    email: 'admin@acv.africa',
    password: 'admin123',
    role: 'ADMIN',
    isActive: true,
    isVerified: true
  },
  {
    id: 2,
    name: 'Utilisateur Démo',
    email: 'demo@nkwa.africa',
    password: 'demo123',
    role: 'USER',
    isActive: true,
    isVerified: true
  }
];

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isPrismaUnavailableError(error) {
  const message = `${error?.message || ''}`;
  return (
    message.includes('Environment variable not found: DATABASE_URL')
    || message.includes('PrismaClientInitializationError')
    || message.includes('Can\'t reach database server')
    || message.includes('P1001')
    || message.includes('P1012')
  );
}

function shouldUseDemoAuth(error = null) {
  const forcedDemoMode = String(process.env.AUTH_DEMO_MODE || '').toLowerCase() === 'true';
  const missingDatabaseUrl = !process.env.DATABASE_URL;
  return forcedDemoMode || missingDatabaseUrl || isPrismaUnavailableError(error);
}

function ensureDemoUsersSeeded() {
  if (demoUsersByEmail.size > 0) {
    return;
  }

  const now = new Date().toISOString();
  for (const user of defaultDemoUsers) {
    demoUsersByEmail.set(normalizeEmail(user.email), {
      ...user,
      createdAt: now,
      updatedAt: now
    });
  }
}

function createAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function formatUserResponse(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: Boolean(user.isActive),
    isVerified: Boolean(user.isVerified),
    profile: user.profile || null,
    stats: user.stats || {
      contributions: 0,
      views: 0,
      likes: 0,
      followers: 0,
      following: 0
    },
    preferences: user.preferences || null,
    createdAt: user.createdAt || new Date().toISOString()
  };
}

function registerDemoUser({ email, password, name }) {
  ensureDemoUsersSeeded();
  const normalizedEmail = normalizeEmail(email);
  if (demoUsersByEmail.has(normalizedEmail)) {
    return { error: 'exists' };
  }

  const now = new Date().toISOString();
  const user = {
    id: Date.now(),
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: 'USER',
    isActive: true,
    isVerified: true,
    createdAt: now,
    updatedAt: now
  };

  demoUsersByEmail.set(normalizedEmail, user);
  return { user };
}

function loginDemoUser({ email, password }) {
  ensureDemoUsersSeeded();
  const normalizedEmail = normalizeEmail(email);
  const user = demoUsersByEmail.get(normalizedEmail);

  if (!user) {
    return { error: 'invalid_credentials' };
  }

  if (String(user.password) !== String(password)) {
    return { error: 'invalid_credentials' };
  }

  if (!user.isActive) {
    return { error: 'disabled' };
  }

  return { user };
}

function getDemoUserFromTokenPayload(payload) {
  ensureDemoUsersSeeded();
  const fromEmail = demoUsersByEmail.get(normalizeEmail(payload?.email));
  if (fromEmail) return fromEmail;

  const byId = Array.from(demoUsersByEmail.values()).find(
    (user) => String(user.id) === String(payload?.id)
  );
  if (byId) return byId;

  if (!payload?.id || !payload?.email) {
    return null;
  }

  return {
    id: payload.id,
    name: payload.name || 'Utilisateur',
    email: payload.email,
    role: payload.role || 'USER',
    isActive: true,
    isVerified: true,
    createdAt: new Date().toISOString()
  };
}

async function createDefaultAdmin() {
  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@acv.africa' }
    });

    if (existingAdmin) {
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

    await prisma.userProfile.create({
      data: {
        userId: admin.id,
        bio: 'Administrateur principal de Nkwa V',
        country: 'Afrique',
        languages: ['français', 'anglais'],
        interests: ['culture africaine', 'patrimoine', 'technologie']
      }
    });

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
  } catch (error) {
    if (!shouldUseDemoAuth(error)) {
      console.error('Erreur création admin:', error);
    }
  }
}

if (shouldUseDemoAuth()) {
  ensureDemoUsersSeeded();
  console.log('ℹ️ Auth en mode démo (DATABASE_URL manquant ou AUTH_DEMO_MODE=true)');
} else {
  createDefaultAdmin();
}

router.post('/register', authLimiter, async (req, res) => {
  try {
    const { email, password, name } = req.body;

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

    if (shouldUseDemoAuth()) {
      const demo = registerDemoUser({ email, password, name });
      if (demo.error === 'exists') {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }

      const token = createAccessToken(demo.user);
      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès (mode démo)',
        data: {
          user: formatUserResponse(demo.user),
          token
        }
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
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
        email: normalizedEmail,
        password: hashedPassword,
        role: 'USER',
        isActive: true,
        isVerified: false
      }
    });

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

    const token = createAccessToken(user);
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        stats: true,
        preferences: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès',
      data: {
        user: formatUserResponse(userWithRelations),
        token
      }
    });
  } catch (error) {
    if (shouldUseDemoAuth(error)) {
      const { email, password, name } = req.body;
      const demo = registerDemoUser({ email, password, name });
      if (demo.error === 'exists') {
        return res.status(409).json({
          success: false,
          message: 'Un compte avec cet email existe déjà'
        });
      }

      const token = createAccessToken(demo.user);
      return res.status(201).json({
        success: true,
        message: 'Compte créé avec succès (mode démo)',
        data: {
          user: formatUserResponse(demo.user),
          token
        }
      });
    }

    console.error('Erreur inscription:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du compte'
    });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis'
      });
    }

    if (shouldUseDemoAuth()) {
      const demo = loginDemoUser({ email, password });
      if (demo.error === 'invalid_credentials') {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }
      if (demo.error === 'disabled') {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé. Contactez l\'administrateur.'
        });
      }

      const token = createAccessToken(demo.user);
      return res.json({
        success: true,
        message: 'Connexion réussie (mode démo)',
        data: {
          user: formatUserResponse(demo.user),
          token
        }
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Compte désactivé. Contactez l\'administrateur.'
      });
    }

    const token = createAccessToken(user);
    const userWithRelations = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: true,
        stats: true,
        preferences: true
      }
    });

    return res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        user: formatUserResponse(userWithRelations),
        token
      }
    });
  } catch (error) {
    if (shouldUseDemoAuth(error)) {
      const { email, password } = req.body;
      const demo = loginDemoUser({ email, password });
      if (demo.error === 'invalid_credentials') {
        return res.status(401).json({
          success: false,
          message: 'Email ou mot de passe incorrect'
        });
      }
      if (demo.error === 'disabled') {
        return res.status(403).json({
          success: false,
          message: 'Compte désactivé. Contactez l\'administrateur.'
        });
      }

      const token = createAccessToken(demo.user);
      return res.json({
        success: true,
        message: 'Connexion réussie (mode démo)',
        data: {
          user: formatUserResponse(demo.user),
          token
        }
      });
    }

    console.error('Erreur connexion:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion'
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (shouldUseDemoAuth()) {
      const demoUser = getDemoUserFromTokenPayload(req.user);
      if (!demoUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      return res.json({
        success: true,
        data: { user: formatUserResponse(demoUser) }
      });
    }

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

    return res.json({
      success: true,
      data: { user: formatUserResponse(user) }
    });
  } catch (error) {
    if (shouldUseDemoAuth(error)) {
      const demoUser = getDemoUserFromTokenPayload(req.user);
      if (!demoUser) {
        return res.status(404).json({
          success: false,
          message: 'Utilisateur non trouvé'
        });
      }

      return res.json({
        success: true,
        data: { user: formatUserResponse(demoUser) }
      });
    }

    console.error('Erreur récupération profil:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du profil'
    });
  }
});

router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

router.get('/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé. Droits administrateur requis.'
      });
    }

    if (shouldUseDemoAuth()) {
      const users = Array.from(demoUsersByEmail.values())
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

      return res.json({
        success: true,
        data: { users }
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

    return res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    if (shouldUseDemoAuth(error)) {
      const users = Array.from(demoUsersByEmail.values())
        .map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }))
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

      return res.json({
        success: true,
        data: { users }
      });
    }

    console.error('Erreur récupération utilisateurs:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des utilisateurs'
    });
  }
});

module.exports = router;
