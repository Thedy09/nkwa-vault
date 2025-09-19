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
          culturalContext: "Dans de nombreuses cultures africaines, l'arbre baobab est considéré comme sacré et représente la connexion entre la terre et le ciel.",
          category: "nature",
          difficulty: "easy",
          language: "fr",
          author: "tradition-orale",
          authorName: "Tradition Orale Africaine",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 2,
          question: "Je marche sans jambes, je cours sans pieds, je traverse les montagnes et les vallées. Qui suis-je ?",
          answer: "Le vent",
          hint: "Je souffle et je déplace les nuages",
          explanation: "Le vent peut parcourir de grandes distances sans avoir de jambes ou de pieds physiques.",
          culturalContext: "Cette devinette peule du Burkina Faso enseigne aux enfants à observer la nature et ses phénomènes. Le vent est personnifié dans many traditions africaines.",
          category: "nature",
          difficulty: "easy",
          language: "fr",
          author: "tradition-peule",
          authorName: "Tradition Orale Peule",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 3,
          question: "Nous sommes deux frères jumeaux. L'un pleure quand l'autre rit. Qui sommes-nous ?",
          answer: "Les yeux",
          hint: "Nous sommes sur votre visage",
          explanation: "Quand on pleure, un œil peut pleurer plus que l'autre, ou quand on cligne, un œil se ferme pendant que l'autre reste ouvert.",
          culturalContext: "Cette devinette yoruba du Nigeria aide les enfants à comprendre le corps humain de manière ludique et poétique.",
          category: "family",
          difficulty: "medium",
          language: "fr",
          author: "tradition-yoruba",
          authorName: "Tradition Orale Yoruba",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 4,
          question: "Je suis la maison de millions d'habitants, mais personne ne paie de loyer. Qui suis-je ?",
          answer: "La fourmilière",
          hint: "Les habitants sont très travailleurs et organisés",
          explanation: "La fourmilière abrite des milliers de fourmis qui vivent ensemble sans payer de loyer.",
          culturalContext: "Cette devinette akan du Ghana enseigne l'importance de la communauté et du travail d'équipe, valeurs centrales de la culture akan.",
          category: "community",
          difficulty: "medium",
          language: "fr",
          author: "tradition-akan",
          authorName: "Tradition Orale Akan",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 5,
          question: "Plus je vieillis, plus je deviens petit. Qui suis-je ?",
          answer: "La bougie",
          hint: "Je donne de la lumière mais je me consume",
          explanation: "Une bougie rétrécit au fur et à mesure qu'elle brûle et donne de la lumière.",
          culturalContext: "Cette devinette swahilie de Tanzanie enseigne le concept du temps et du sacrifice pour éclairer les autres, métaphore de la sagesse partagée.",
          category: "wisdom",
          difficulty: "easy",
          language: "fr",
          author: "tradition-swahilie",
          authorName: "Tradition Orale Swahilie",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 6,
          question: "Je peux porter un éléphant mais pas une plume. Qui suis-je ?",
          answer: "L'eau",
          hint: "Je suis liquide et les choses flottent sur moi",
          explanation: "L'eau peut porter un éléphant qui nage, mais une plume coule si elle est mouillée.",
          culturalContext: "Cette devinette zoulou d'Afrique du Sud enseigne les propriétés physiques et la logique paradoxale, stimulant la réflexion critique.",
          category: "nature",
          difficulty: "hard",
          language: "fr",
          author: "tradition-zoulou",
          authorName: "Tradition Orale Zoulou",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 7,
          question: "Je suis plus grand que la montagne, mais je peux tenir dans un grain de mil. Qui suis-je ?",
          answer: "L'ombre",
          hint: "Je suis toujours avec toi mais je change de taille",
          explanation: "L'ombre peut être immense et couvrir une montagne entière, mais elle peut aussi être très petite et tenir dans un grain de mil.",
          culturalContext: "Cette devinette bambara du Mali développe la logique et l'observation chez les enfants. Elle fait partie des jeux traditionnels d'éducation.",
          category: "nature",
          difficulty: "medium",
          language: "fr",
          author: "tradition-bambara",
          authorName: "Tradition Orale Bambara",
          status: "approved",
          isActive: true,
          isPublic: true,
          stats: { plays: 0, correctAnswers: 0, incorrectAnswers: 0, likes: 0, dislikes: 0, rating: 0 },
          createdAt: new Date(),
          publishedAt: new Date()
        },
        {
          id: 8,
          question: "Je vole sans ailes, je nage sans nageoires, je parle sans bouche. Qui suis-je ?",
          answer: "L'écho",
          hint: "Je répète tout ce que tu dis",
          explanation: "L'écho peut sembler voler dans l'air, se propager sous l'eau et répéter les paroles sans avoir de bouche.",
          culturalContext: "Cette devinette hausa du Niger enseigne les phénomènes acoustiques et développe la compréhension des sons dans la nature.",
          category: "nature",
          difficulty: "hard",
          language: "fr",
          author: "tradition-hausa",
          authorName: "Tradition Orale Hausa",
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
