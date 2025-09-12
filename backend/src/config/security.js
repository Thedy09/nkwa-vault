const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Configuration de sécurité avancée
const securityConfig = {
  // Headers de sécurité
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        mediaSrc: ["'self'", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "https:", "wss:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }),

  // Rate limiting par IP
  apiLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requêtes par IP
    message: {
      success: false,
      message: 'Trop de requêtes, veuillez réessayer plus tard'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiting pour l'authentification
  authLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives de connexion
    message: {
      success: false,
      message: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Rate limiting pour l'upload
  uploadLimiter: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 10, // 10 uploads par heure
    message: {
      success: false,
      message: 'Limite d\'upload atteinte, veuillez réessayer plus tard'
    },
    standardHeaders: true,
    legacyHeaders: false,
  }),

  // Configuration CORS sécurisée
  cors: {
    origin: function (origin, callback) {
      // Autoriser les requêtes sans origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'https://nkwa.africa',
        'https://www.nkwa.africa',
        'https://nkwa-vault.vercel.app',
        'https://nkwa-vault-frontend.vercel.app',
        'http://localhost:3000', // Développement local
        'http://localhost:3001', // Développement local alternatif
      ];
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Non autorisé par CORS'));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Configuration de session sécurisée
  session: {
    secret: process.env.SESSION_SECRET || process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      sameSite: 'strict'
    }
  },

  // Validation des entrées
  inputValidation: {
    // Sanitisation des entrées
    sanitize: (input) => {
      if (typeof input !== 'string') return input;
      
      return input
        .replace(/[<>]/g, '') // Supprimer les balises HTML
        .replace(/javascript:/gi, '') // Supprimer les scripts
        .replace(/on\w+=/gi, '') // Supprimer les événements
        .trim();
    },

    // Validation des emails
    validateEmail: (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },

    // Validation des mots de passe
    validatePassword: (password) => {
      return password && password.length >= 8;
    },

    // Validation des URLs
    validateUrl: (url) => {
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }
  },

  // Configuration de logging sécurisé
  logging: {
    // Ne pas logger les informations sensibles
    sanitizeLog: (data) => {
      const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
      const sanitized = { ...data };
      
      sensitiveFields.forEach(field => {
        if (sanitized[field]) {
          sanitized[field] = '***REDACTED***';
        }
      });
      
      return sanitized;
    },

    // Format de log sécurisé
    formatLog: (req, res, next) => {
      const logData = {
        method: req.method,
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        statusCode: res.statusCode
      };
      
      console.log('📊 Request:', securityConfig.logging.sanitizeLog(logData));
      next();
    }
  },

  // Configuration de monitoring
  monitoring: {
    // Métriques de performance
    performanceMetrics: {
      responseTime: true,
      memoryUsage: true,
      cpuUsage: true,
      requestCount: true
    },

    // Alertes de sécurité
    securityAlerts: {
      failedLogins: 5, // Alerte après 5 échecs de connexion
      suspiciousActivity: true,
      rateLimitExceeded: true
    }
  }
};

module.exports = securityConfig;


