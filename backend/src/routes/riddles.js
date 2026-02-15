const express = require('express');
const rateLimit = require('express-rate-limit');
const { prisma } = require('../config/database');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const riddleLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});

router.use(riddleLimiter);

const CATEGORY_MAP = {
  nature: 'NATURE',
  animals: 'ANIMALS',
  family: 'FAMILY',
  wisdom: 'WISDOM',
  community: 'COMMUNITY',
  history: 'HISTORY',
  traditions: 'TRADITIONS',
  other: 'OTHER'
};

const DIFFICULTY_MAP = {
  easy: 'EASY',
  medium: 'MEDIUM',
  hard: 'HARD'
};

const STATUS_MAP = {
  pending: 'PENDING',
  approved: 'APPROVED',
  rejected: 'REJECTED',
  draft: 'DRAFT'
};

const DEFAULT_STATS = {
  plays: 0,
  correctAnswers: 0,
  incorrectAnswers: 0,
  averageTime: 0,
  likes: 0,
  dislikes: 0,
  rating: 0
};

function parsePositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }
  return parsed;
}

function normalizeStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .map((entry) => String(entry || '').trim())
    .filter((entry) => entry.length > 0);
}

function parseCategory(input, fallback = undefined) {
  if (typeof input !== 'string') {
    return fallback;
  }
  return CATEGORY_MAP[input.toLowerCase()] || fallback;
}

function parseDifficulty(input, fallback = undefined) {
  if (typeof input !== 'string') {
    return fallback;
  }
  return DIFFICULTY_MAP[input.toLowerCase()] || fallback;
}

function parseStatus(input, fallback = undefined) {
  if (typeof input !== 'string') {
    return fallback;
  }
  return STATUS_MAP[input.toLowerCase()] || fallback;
}

function computeRating(likes, dislikes) {
  const totalVotes = likes + dislikes;
  if (totalVotes === 0) {
    return 0;
  }
  return Number(((likes / totalVotes) * 5).toFixed(2));
}

function mapRiddleForClient(riddle) {
  if (!riddle) {
    return null;
  }

  return {
    ...riddle,
    category: riddle.category ? riddle.category.toLowerCase() : null,
    difficulty: riddle.difficulty ? riddle.difficulty.toLowerCase() : null,
    status: riddle.status ? riddle.status.toLowerCase() : null,
    stats: riddle.stats || { ...DEFAULT_STATS }
  };
}

const riddleInclude = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      profile: {
        select: {
          avatar: true
        }
      }
    }
  },
  stats: true
};

router.get('/', optionalAuth, async (req, res) => {
  try {
    const category = parseCategory(req.query.category);
    const difficulty = parseDifficulty(req.query.difficulty);
    const language = req.query.language || 'fr';
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const sort = req.query.sort || 'recent';
    const featured = req.query.featured === 'true';
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const where = {
      status: 'APPROVED',
      isActive: true,
      isPublic: true,
      language
    };

    if (category) {
      where.category = category;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (featured) {
      where.isFeatured = true;
    }
    if (search) {
      where.OR = [
        { question: { contains: search, mode: 'insensitive' } },
        { answer: { contains: search, mode: 'insensitive' } },
        { explanation: { contains: search, mode: 'insensitive' } },
        { culturalContext: { contains: search, mode: 'insensitive' } }
      ];
    }

    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = [{ stats: { plays: 'desc' } }, { stats: { rating: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'rating':
        orderBy = [{ stats: { rating: 'desc' } }, { stats: { plays: 'desc' } }, { createdAt: 'desc' }];
        break;
      case 'difficulty':
        orderBy = [{ difficulty: 'asc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
        break;
      case 'recent':
      default:
        orderBy = [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
    }

    const [riddles, total] = await prisma.$transaction([
      prisma.riddle.findMany({
        where,
        include: riddleInclude,
        orderBy,
        skip,
        take: limit
      }),
      prisma.riddle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        riddles: riddles.map(mapRiddleForClient),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
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

router.get('/featured', async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, 5), 50);

    const riddles = await prisma.riddle.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        isPublic: true,
        isFeatured: true
      },
      include: riddleInclude,
      orderBy: [{ featuredAt: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit
    });

    res.json({
      success: true,
      data: {
        riddles: riddles.map(mapRiddleForClient)
      }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes vedette:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes en vedette'
    });
  }
});

router.get('/popular', async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, 10), 50);

    const riddles = await prisma.riddle.findMany({
      where: {
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      include: riddleInclude,
      orderBy: [{ stats: { plays: 'desc' } }, { stats: { rating: 'desc' } }, { createdAt: 'desc' }],
      take: limit
    });

    res.json({
      success: true,
      data: {
        riddles: riddles.map(mapRiddleForClient)
      }
    });
  } catch (error) {
    console.error('Erreur récupération devinettes populaires:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes populaires'
    });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.riddle.groupBy({
      by: ['category'],
      where: {
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      _count: {
        category: true
      }
    });

    const categoryStats = categories.map((entry) => ({
      category: entry.category.toLowerCase(),
      count: entry._count.category
    }));

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

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const riddle = await prisma.riddle.findFirst({
      where: {
        id: req.params.id,
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      include: riddleInclude
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    return res.json({
      success: true,
      data: { riddle: mapRiddleForClient(riddle) }
    });
  } catch (error) {
    console.error('Erreur récupération devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la devinette'
    });
  }
});

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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur non trouvé'
      });
    }

    const riddle = await prisma.$transaction(async (tx) => {
      const createdRiddle = await tx.riddle.create({
        data: {
          question: question.trim(),
          answer: answer.trim(),
          hint: hint?.trim(),
          explanation: explanation?.trim(),
          culturalContext: culturalContext?.trim(),
          category: parseCategory(category, 'OTHER'),
          difficulty: parseDifficulty(difficulty, 'MEDIUM'),
          language,
          region: region?.trim(),
          country: country?.trim(),
          tags: normalizeStringArray(tags),
          keywords: normalizeStringArray(keywords),
          authorId: user.id,
          authorName: user.name,
          status: 'PENDING',
          stats: {
            create: {}
          }
        },
        include: riddleInclude
      });

      await tx.userStats.upsert({
        where: { userId: user.id },
        update: { contributions: { increment: 1 } },
        create: {
          userId: user.id,
          contributions: 1,
          views: 0,
          likes: 0,
          followers: 0,
          following: 0,
          totalRewards: 0
        }
      });

      return createdRiddle;
    });

    return res.status(201).json({
      success: true,
      message: 'Devinette soumise avec succès. Elle sera examinée avant publication.',
      data: { riddle: mapRiddleForClient(riddle) }
    });
  } catch (error) {
    console.error('Erreur création devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la devinette'
    });
  }
});

router.post('/:id/play', optionalAuth, async (req, res) => {
  try {
    const riddle = await prisma.riddle.findFirst({
      where: {
        id: req.params.id,
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      include: { stats: true }
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    const correctAnswer = riddle.answer.toLowerCase();
    const userAnswer = String(req.body.answer || '').toLowerCase().trim();
    const isCorrect = userAnswer.length > 0 && (
      correctAnswer === userAnswer ||
      correctAnswer.includes(userAnswer) ||
      userAnswer.includes(correctAnswer)
    );

    const safeTimeSpent = Math.max(parsePositiveInt(req.body.timeSpent, 0), 0);

    await prisma.$transaction(async (tx) => {
      const stats = await tx.riddleStats.upsert({
        where: { riddleId: riddle.id },
        update: {},
        create: { riddleId: riddle.id }
      });

      const nextPlays = stats.plays + 1;
      const nextAverageTime = Math.round(((stats.averageTime * stats.plays) + safeTimeSpent) / nextPlays);

      await tx.riddleStats.update({
        where: { riddleId: riddle.id },
        data: {
          plays: { increment: 1 },
          correctAnswers: { increment: isCorrect ? 1 : 0 },
          incorrectAnswers: { increment: isCorrect ? 0 : 1 },
          averageTime: nextAverageTime
        }
      });
    });

    return res.json({
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
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du jeu'
    });
  }
});

router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const riddle = await prisma.riddle.findFirst({
      where: {
        id: req.params.id,
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      select: { id: true }
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    const updatedStats = await prisma.$transaction(async (tx) => {
      const stats = await tx.riddleStats.upsert({
        where: { riddleId: riddle.id },
        update: {},
        create: { riddleId: riddle.id }
      });

      const nextLikes = stats.likes + 1;
      const nextRating = computeRating(nextLikes, stats.dislikes);

      return tx.riddleStats.update({
        where: { riddleId: riddle.id },
        data: {
          likes: { increment: 1 },
          rating: nextRating
        }
      });
    });

    return res.json({
      success: true,
      message: 'Devinette aimée avec succès',
      data: {
        likes: updatedStats.likes,
        rating: updatedStats.rating
      }
    });
  } catch (error) {
    console.error('Erreur like devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du like'
    });
  }
});

router.post('/:id/dislike', authenticateToken, async (req, res) => {
  try {
    const riddle = await prisma.riddle.findFirst({
      where: {
        id: req.params.id,
        status: 'APPROVED',
        isActive: true,
        isPublic: true
      },
      select: { id: true }
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    const updatedStats = await prisma.$transaction(async (tx) => {
      const stats = await tx.riddleStats.upsert({
        where: { riddleId: riddle.id },
        update: {},
        create: { riddleId: riddle.id }
      });

      const nextDislikes = stats.dislikes + 1;
      const nextRating = computeRating(stats.likes, nextDislikes);

      return tx.riddleStats.update({
        where: { riddleId: riddle.id },
        data: {
          dislikes: { increment: 1 },
          rating: nextRating
        }
      });
    });

    return res.json({
      success: true,
      message: 'Devinette dislikée',
      data: {
        dislikes: updatedStats.dislikes,
        rating: updatedStats.rating
      }
    });
  } catch (error) {
    console.error('Erreur dislike devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du dislike'
    });
  }
});

router.get('/user/:userId', optionalAuth, async (req, res) => {
  try {
    const status = parseStatus(req.query.status);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const page = parsePositiveInt(req.query.page, 1);
    const skip = (page - 1) * limit;

    const where = { authorId: req.params.userId };
    if (status) {
      where.status = status;
    }

    const [riddles, total] = await prisma.$transaction([
      prisma.riddle.findMany({
        where,
        include: riddleInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.riddle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        riddles: riddles.map(mapRiddleForClient),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
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

router.get('/admin/pending', authenticateToken, authorize('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const page = parsePositiveInt(req.query.page, 1);
    const skip = (page - 1) * limit;

    const where = { status: 'PENDING' };

    const [riddles, total] = await prisma.$transaction([
      prisma.riddle.findMany({
        where,
        include: riddleInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.riddle.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        riddles: riddles.map(mapRiddleForClient),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
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

router.post('/:id/approve', authenticateToken, authorize('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const riddle = await prisma.riddle.findUnique({
      where: { id: req.params.id },
      select: { id: true }
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await prisma.riddle.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason: null,
        publishedAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Devinette approuvée avec succès'
    });
  } catch (error) {
    console.error('Erreur approbation devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'approbation de la devinette'
    });
  }
});

router.post('/:id/reject', authenticateToken, authorize('ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const reason = typeof req.body.reason === 'string' ? req.body.reason.trim() : null;

    const riddle = await prisma.riddle.findUnique({
      where: { id: req.params.id },
      select: { id: true }
    });

    if (!riddle) {
      return res.status(404).json({
        success: false,
        message: 'Devinette non trouvée'
      });
    }

    await prisma.riddle.update({
      where: { id: req.params.id },
      data: {
        status: 'REJECTED',
        reviewedBy: req.user.id,
        reviewedAt: new Date(),
        rejectionReason: reason || 'Aucune raison fournie'
      }
    });

    return res.json({
      success: true,
      message: 'Devinette rejetée'
    });
  } catch (error) {
    console.error('Erreur rejet devinette:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du rejet de la devinette'
    });
  }
});

module.exports = router;
