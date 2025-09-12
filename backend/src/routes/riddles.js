const express = require('express');
const router = express.Router();
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

// Import conditionnel des modèles
let Riddle, User;
try {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 1) {
    Riddle = require('../models/Riddle');
    User = require('../models/User');
  } else {
    console.log('Mode démo: MongoDB non connecté, utilisation du stockage en mémoire');
  }
} catch (error) {
  console.log('Mode démo: Modèles non disponibles');
}

// Stockage en mémoire pour le mode démo
const demoRiddles = new Map();
let nextRiddleId = 1;

// Rate limiting pour les devinettes
const riddleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});

// Appliquer le rate limiting à toutes les routes
router.use(riddleLimiter);

// GET /riddles - Récupérer les devinettes avec filtres
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      difficulty,
      language = 'fr',
      limit = 20,
      page = 1,
      search,
      sort = 'recent',
      featured
    } = req.query;

    if (!Riddle) {
      // Mode démo - devinettes par défaut
      const defaultRiddles = [
        {
          id: 1,
          question: "Je suis grand et fort, je porte des feuilles vertes, que suis-je ?",
          answer: "L'arbre",
          hint: "On me trouve dans la forêt",
          explanation: "L'arbre est un élément essentiel de la culture africaine, symbolisant la vie et la sagesse.",
          culturalContext: "Dans de nombreuses cultures africaines, l'arbre est considéré comme sacré et représente la connexion entre la terre et le ciel.",
          category: "nature",
          difficulty: "easy",
          language: "fr",
          author: "system",
          authorName: "Système",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 2,
          question: "J'ai quatre pattes mais je ne peux pas marcher, que suis-je ?",
          answer: "La chaise",
          hint: "On s'assoit sur moi",
          explanation: "Le mobilier est une partie importante de la vie quotidienne et de l'artisanat africain.",
          culturalContext: "Les chaises traditionnelles africaines sont souvent fabriquées à la main et décorées de symboles culturels.",
          category: "family",
          difficulty: "medium",
          language: "fr",
          author: "system",
          authorName: "Système",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        }
      ];

      let filteredRiddles = defaultRiddles;

      // Appliquer les filtres
      if (category) {
        filteredRiddles = filteredRiddles.filter(r => r.category === category);
      }
      if (difficulty) {
        filteredRiddles = filteredRiddles.filter(r => r.difficulty === difficulty);
      }
      if (search) {
        const searchLower = search.toLowerCase();
        filteredRiddles = filteredRiddles.filter(r => 
          r.question.toLowerCase().includes(searchLower) ||
          r.answer.toLowerCase().includes(searchLower) ||
          r.explanation.toLowerCase().includes(searchLower)
        );
      }

      // Appliquer le tri
      switch (sort) {
        case 'recent':
          filteredRiddles.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
          break;
        case 'popular':
          filteredRiddles.sort((a, b) => b.stats.plays - a.stats.plays);
          break;
        case 'rating':
          filteredRiddles.sort((a, b) => b.stats.rating - a.stats.rating);
          break;
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          filteredRiddles.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
          break;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedRiddles = filteredRiddles.slice(skip, skip + parseInt(limit));

      return res.json({
        success: true,
        data: {
          riddles: paginatedRiddles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: filteredRiddles.length,
            pages: Math.ceil(filteredRiddles.length / parseInt(limit))
          }
        }
      });
    }

    // Mode normal avec MongoDB
    const query = {
      status: 'approved',
      isActive: true,
      isPublic: true
    };

    // Filtres
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (language) query.language = language;
    if (featured === 'true') query.isFeatured = true;

    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }

    // Options de tri
    let sortOptions = {};
    switch (sort) {
      case 'recent':
        sortOptions = { publishedAt: -1 };
        break;
      case 'popular':
        sortOptions = { 'stats.plays': -1, 'stats.rating': -1 };
        break;
      case 'rating':
        sortOptions = { 'stats.rating': -1, 'stats.plays': -1 };
        break;
      case 'difficulty':
        sortOptions = { difficulty: 1, 'stats.rating': -1 };
        break;
      default:
        sortOptions = { publishedAt: -1 };
    }

    // Si recherche textuelle, ajouter le score de recherche
    if (search) {
      sortOptions = { score: { $meta: 'textScore' }, ...sortOptions };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const riddles = await Riddle.find(query, search ? { score: { $meta: 'textScore' } } : {})
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email profile.avatar')
      .lean();

    const total = await Riddle.countDocuments(query);

    res.json({
      success: true,
      data: {
        riddles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes'
    });
  }
});

// GET /riddles/featured - Récupérer les devinettes en vedette
router.get('/featured', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    
    // Mode démo
    if (!Riddle) {
      const defaultRiddles = [
        {
          id: 1,
          question: "Je suis grand et fort, je porte des feuilles vertes, que suis-je ?",
          answer: "L'arbre",
          hint: "On me trouve dans la forêt",
          explanation: "L'arbre est un élément essentiel de la culture africaine, symbolisant la vie et la sagesse.",
          culturalContext: "Dans de nombreuses cultures africaines, l'arbre est considéré comme sacré et représente la connexion entre la terre et le ciel.",
          category: "nature",
          difficulty: "easy",
          language: "fr",
          author: "system",
          authorName: "Système",
          status: "approved",
          isActive: true,
          isPublic: true,
          isFeatured: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        }
      ];
      
      return res.json({
        success: true,
        data: { riddles: defaultRiddles.slice(0, limit) }
      });
    }

    const riddles = await Riddle.getFeatured(limit);

    res.json({
      success: true,
      data: { riddles }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes vedette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes en vedette'
    });
  }
});

// GET /riddles/popular - Récupérer les devinettes populaires
router.get('/popular', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const riddles = await Riddle.getPopular(limit);

    res.json({
      success: true,
      data: { riddles }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes populaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes populaires'
    });
  }
});

// GET /riddles/categories - Récupérer les catégories disponibles
router.get('/categories', async (req, res) => {
  try {
    const categories = await Riddle.distinct('category', {
      status: 'approved',
      isActive: true,
      isPublic: true
    });

    const categoryStats = await Promise.all(
      categories.map(async (category) => {
        const count = await Riddle.countDocuments({
          category,
          status: 'approved',
          isActive: true,
          isPublic: true
        });
        return { category, count };
      })
    );

    res.json({
      success: true,
      data: { categories: categoryStats }
    });
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories'
    });
  }
});

// GET /riddles/:id - Récupérer une devinette spécifique
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const riddle = await Riddle.findOne({
      _id: req.params.id,
      status: 'approved',
      isActive: true,
      isPublic: true
    }).populate('author', 'name email profile.avatar');

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    res.json({
      success: true,
      data: { riddle }
    });
  } catch (error) {
    console.error('Erreur récupération devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la devinette'
    });
  }
});

// POST /riddles - Créer une nouvelle devinette
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const {
      question,
      answer,
      hint,
      explanation,
      culturalContext,
      category,
      difficulty,
      language = 'fr',
      region,
      country,
      tags = [],
      keywords = []
    } = req.body;

    // Validation
    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: 'La question et la réponse sont obligatoires'
      });
    }

    if (question.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'La question ne peut pas dépasser 500 caractères'
      });
    }

    if (answer.length > 200) {
      return res.status(400).json({
        success: false,
        message: 'La réponse ne peut pas dépasser 200 caractères'
      });
    }

    // Trouver l'utilisateur
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    // Créer la devinette
    const riddle = new Riddle({
      question: question.trim(),
      answer: answer.trim(),
      hint: hint?.trim(),
      explanation: explanation?.trim(),
      culturalContext: culturalContext?.trim(),
      category: category || 'other',
      difficulty: difficulty || 'medium',
      language,
      region: region?.trim(),
      country: country?.trim(),
      tags: tags.filter(tag => tag.trim().length > 0),
      keywords: keywords.filter(keyword => keyword.trim().length > 0),
      author: userId,
      authorName: user.name,
      status: 'pending'
    });

    await riddle.save();

    // Mettre à jour les statistiques de l'utilisateur
    await user.updateStats('contributions');

    res.status(201).json({
      success: true,
      message: 'Devinette soumise avec succès. Elle sera examinée avant publication.',
      data: { riddle: riddle.toPublicJSON() }
    });
  } catch (error) {
    console.error('Erreur création devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la devinette'
    });
  }
});

// POST /riddles/:id/play - Jouer à une devinette
router.post('/:id/play', optionalAuth, async (req, res) => {
  try {
    const { answer, timeSpent } = req.body;
    const riddle = await Riddle.findById(req.params.id);

    if (!riddle || riddle.status !== 'approved' || !riddle.isActive || !riddle.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    // Vérifier la réponse
    const correctAnswer = riddle.answer.toLowerCase();
    const userAnswer = answer?.toLowerCase().trim() || '';

    const isCorrect = correctAnswer === userAnswer ||
                     correctAnswer.includes(userAnswer) ||
                     userAnswer.includes(correctAnswer);

    // Enregistrer les statistiques
    await riddle.incrementPlays();
    await riddle.recordAnswer(isCorrect, timeSpent || 0);

    res.json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: riddle.answer,
        explanation: riddle.explanation,
        culturalContext: riddle.culturalContext
      }
    });
  } catch (error) {
    console.error('Erreur jeu devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du jeu'
    });
  }
});

// POST /riddles/:id/like - Aimer une devinette
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const riddle = await Riddle.findById(req.params.id);

    if (!riddle || riddle.status !== 'approved' || !riddle.isActive || !riddle.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await riddle.like();

    res.json({
      success: true,
      message: 'Devinette aimée avec succès',
      data: {
        likes: riddle.stats.likes,
        rating: riddle.stats.rating
      }
    });
  } catch (error) {
    console.error('Erreur like devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du like'
    });
  }
});

// POST /riddles/:id/dislike - Ne pas aimer une devinette
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const riddle = await Riddle.findById(req.params.id);

    if (!riddle || riddle.status !== 'approved' || !riddle.isActive || !riddle.isPublic) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await riddle.dislike();

    res.json({
      success: true,
      message: 'Devinette dislikée',
      data: {
        dislikes: riddle.stats.dislikes,
        rating: riddle.stats.rating
      }
    });
  } catch (error) {
    console.error('Erreur dislike devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du dislike'
    });
  }
});

// GET /riddles/user/:userId - Récupérer les devinettes d'un utilisateur
router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const { status, limit = 20, page = 1 } = req.query;
    const userId = req.params.userId;

    const query = { author: userId };
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const riddles = await Riddle.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Riddle.countDocuments(query);

    res.json({
      success: true,
      data: {
        riddles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes utilisateur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes de l\'utilisateur'
    });
  }
});

// Routes d'administration (nécessitent des droits admin/moderator)
// GET /riddles/admin/pending - Récupérer les devinettes en attente
router.get('/admin/pending', authenticateToken, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const riddles = await Riddle.find({ status: 'pending' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('author', 'name email')
      .lean();

    const total = await Riddle.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        riddles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes en attente:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes en attente'
    });
  }
});

// POST /riddles/:id/approve - Approuver une devinette
router.post('/:id/approve', authenticateToken, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const riddle = await Riddle.findById(req.params.id);

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await riddle.approve(req.user.id);

    res.json({
      success: true,
      message: 'Devinette approuvée avec succès'
    });
  } catch (error) {
    console.error('Erreur approbation devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de la devinette'
    });
  }
});

// POST /riddles/:id/reject - Rejeter une devinette
router.post('/:id/reject', authenticateToken, authorize('admin', 'moderator'), async (req, res) => {
  try {
    const { reason } = req.body;
    const riddle = await Riddle.findById(req.params.id);

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await riddle.reject(req.user.id, reason);

    res.json({
      success: true,
      message: 'Devinette rejetée'
    });
  } catch (error) {
    console.error('Erreur rejet devinette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de la devinette'
    });
  }
});

module.exports = router;
