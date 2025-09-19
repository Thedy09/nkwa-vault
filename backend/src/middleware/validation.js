const { ValidationError } = require('../utils/errorHandler');
const { logWarning } = require('../utils/logger');

// Middleware de validation des données d'entrée
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context && detail.context.value
        }));

        logWarning('Validation error', { 
          errors, 
          body: req.body,
          url: req.url,
          method: req.method
        });

        return res.status(400).json({
          success: false,
          error: 'Données de validation invalides',
          details: errors
        });
      }

      // Remplacer req.body par les données validées
      req.body = value;
      next();
    } catch (err) {
      logWarning('Validation middleware error', { error: err.message });
      next(new ValidationError('Erreur de validation des données'));
    }
  };
};

// Middleware de validation des paramètres de requête
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.query, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context && detail.context.value
        }));

        return res.status(400).json({
          success: false,
          error: 'Paramètres de requête invalides',
          details: errors
        });
      }

      req.query = value;
      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation des paramètres de requête'));
    }
  };
};

// Middleware de validation des paramètres d'URL
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate(req.params, { 
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context && detail.context.value
        }));

        return res.status(400).json({
          success: false,
          error: 'Paramètres d\'URL invalides',
          details: errors
        });
      }

      req.params = value;
      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation des paramètres d\'URL'));
    }
  };
};

// Middleware de validation des fichiers uploadés
const validateFile = (options = {}) => {
  return (req, res, next) => {
    try {
      const { 
        required = false,
        maxSize = 10 * 1024 * 1024, // 10MB par défaut
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
      } = options;

      if (required && !req.file) {
        return res.status(400).json({
          success: false,
          error: 'Fichier requis'
        });
      }

      if (req.file) {
        // Vérifier la taille
        if (req.file.size > maxSize) {
          return res.status(400).json({
            success: false,
            error: `Fichier trop volumineux. Taille maximale: ${maxSize / 1024 / 1024}MB`
          });
        }

        // Vérifier le type MIME
        if (!allowedTypes.includes(req.file.mimetype)) {
          return res.status(400).json({
            success: false,
            error: `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`
          });
        }

        // Vérifier l'extension
        const fileExtension = req.file.originalname.toLowerCase().substring(req.file.originalname.lastIndexOf('.'));
        if (!allowedExtensions.includes(fileExtension)) {
          return res.status(400).json({
            success: false,
            error: `Extension de fichier non autorisée. Extensions autorisées: ${allowedExtensions.join(', ')}`
          });
        }
      }

      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation du fichier'));
    }
  };
};

// Middleware de validation des données de pagination
const validatePagination = () => {
  return (req, res, next) => {
    try {
      const { limit = 50, offset = 0, page = 1 } = req.query;

      // Validation des paramètres de pagination
      const parsedLimit = parseInt(limit);
      const parsedOffset = parseInt(offset);
      const parsedPage = parseInt(page);

      if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre limit doit être un nombre entre 1 et 100'
        });
      }

      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre offset doit être un nombre positif ou zéro'
        });
      }

      if (isNaN(parsedPage) || parsedPage < 1) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre page doit être un nombre positif'
        });
      }

      // Ajouter les paramètres validés à la requête
      req.pagination = {
        limit: parsedLimit,
        offset: parsedOffset,
        page: parsedPage
      };

      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation de la pagination'));
    }
  };
};

// Middleware de validation des données de recherche
const validateSearch = () => {
  return (req, res, next) => {
    try {
      const { q, type, culture, country, tags } = req.query;

      // Validation du terme de recherche
      if (q && (typeof q !== 'string' || q.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Le terme de recherche doit contenir au moins 2 caractères'
        });
      }

      // Validation des filtres
      if (type && !['nft', 'art', 'all'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre type doit être "nft", "art" ou "all"'
        });
      }

      if (culture && (typeof culture !== 'string' || culture.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre culture doit contenir au moins 2 caractères'
        });
      }

      if (country && (typeof country !== 'string' || country.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre country doit contenir au moins 2 caractères'
        });
      }

      if (tags && typeof tags !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Le paramètre tags doit être une chaîne de caractères'
        });
      }

      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation de la recherche'));
    }
  };
};

// Middleware de validation des données d'authentification
const validateAuth = () => {
  return (req, res, next) => {
    try {
      const { email, password, name } = req.body;

      // Validation de l'email
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({
          success: false,
          error: 'Adresse email invalide'
        });
      }

      // Validation du mot de passe
      if (password && password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Le mot de passe doit contenir au moins 6 caractères'
        });
      }

      // Validation du nom
      if (name && (typeof name !== 'string' || name.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'Le nom doit contenir au moins 2 caractères'
        });
      }

      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation de l\'authentification'));
    }
  };
};

// Middleware de validation des données de contenu culturel
const validateCulturalContent = () => {
  return (req, res, next) => {
    try {
      const { title, content, type, language, origin } = req.body;

      // Validation du titre
      if (!title || typeof title !== 'string' || title.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Le titre doit contenir au moins 3 caractères'
        });
      }

      // Validation du contenu
      if (!content || typeof content !== 'string' || content.trim().length < 10) {
        return res.status(400).json({
          success: false,
          error: 'Le contenu doit contenir au moins 10 caractères'
        });
      }

      // Validation du type
      if (type && !['PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE'].includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Type de contenu invalide'
        });
      }

      // Validation de la langue
      if (language && typeof language !== 'string' || language.length !== 2) {
        return res.status(400).json({
          success: false,
          error: 'La langue doit être un code de 2 caractères (ex: fr, en)'
        });
      }

      // Validation de l'origine
      if (origin && (typeof origin !== 'string' || origin.trim().length < 2)) {
        return res.status(400).json({
          success: false,
          error: 'L\'origine doit contenir au moins 2 caractères'
        });
      }

      next();
    } catch (err) {
      next(new ValidationError('Erreur de validation du contenu culturel'));
    }
  };
};

module.exports = {
  validateInput,
  validateQuery,
  validateParams,
  validateFile,
  validatePagination,
  validateSearch,
  validateAuth,
  validateCulturalContent
};
