const express = require('express');
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const prisma = new PrismaClient();

// Configuration multer pour l'upload de fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp3|mp4|wav|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Type de fichier non autorisé'));
    }
  }
});

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token d\'accès requis' });
  }

  // Vérification basique du token (à améliorer avec JWT)
  if (token === 'admin-token') {
    req.user = { id: 1, role: 'ADMIN' };
    next();
  } else {
    res.status(403).json({ message: 'Token invalide' });
  }
};

// GET - Récupérer tout le contenu avec pagination et filtres
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      origin,
      tags
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Construction des filtres
    const where = {};
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (origin) {
      where.origin = { contains: origin, mode: 'insensitive' };
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      where.tags = { hasSome: tagArray };
    }

    // Récupération des données
    const [items, total] = await Promise.all([
      prisma.culturalItem.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortBy]: sortOrder },
        include: {
          reviews: {
            include: {
              user: {
                select: { username: true, profile: { select: { avatar: true } } }
              }
            }
          },
          likes: true,
          _count: {
            select: { likes: true, reviews: true }
          }
        }
      }),
      prisma.culturalItem.count({ where })
    ]);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du contenu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Récupérer un élément spécifique
router.get('/:id', async (req, res) => {
  try {
    const item = await prisma.culturalItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        reviews: {
          include: {
            user: {
              select: { username: true, profile: { select: { avatar: true } } }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        likes: true,
        _count: {
          select: { likes: true, reviews: true }
        }
      }
    });

    if (!item) {
      return res.status(404).json({ message: 'Contenu non trouvé' });
    }

    // Incrémenter les vues
    await prisma.culturalItem.update({
      where: { id: parseInt(req.params.id) },
      data: { views: { increment: 1 } }
    });

    res.json(item);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'élément:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST - Créer un nouveau contenu
router.post('/', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const {
      title,
      category,
      description,
      content,
      origin,
      tags,
      language,
      difficulty,
      moral,
      meaning,
      answer,
      explanation,
      artist,
      duration,
      technique,
      source,
      sourceUrl
    } = req.body;

    // Traitement des fichiers uploadés
    const files = req.files;
    const imagePath = files?.image?.[0]?.filename;
    const audioPath = files?.audio?.[0]?.filename;
    const videoPath = files?.video?.[0]?.filename;

    // Parsing des tags
    const tagsArray = tags ? JSON.parse(tags) : [];

    const item = await prisma.culturalItem.create({
      data: {
        title,
        category,
        description,
        content,
        origin,
        tags: tagsArray,
        language,
        difficulty,
        moral,
        meaning,
        answer,
        explanation,
        artist,
        duration,
        technique,
        source,
        sourceUrl,
        image: imagePath ? `/uploads/${imagePath}` : null,
        audio: audioPath ? `/uploads/${audioPath}` : null,
        video: videoPath ? `/uploads/${videoPath}` : null,
        authorId: req.user.id,
        views: 0,
        likes: 0
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Erreur lors de la création du contenu:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// PUT - Mettre à jour un contenu
router.put('/:id', authenticateToken, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'audio', maxCount: 1 },
  { name: 'video', maxCount: 1 }
]), async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    // Vérifier que l'élément existe
    const existingItem = await prisma.culturalItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Contenu non trouvé' });
    }

    const updateData = { ...req.body };
    
    // Traitement des nouveaux fichiers
    const files = req.files;
    if (files?.image?.[0]) {
      updateData.image = `/uploads/${files.image[0].filename}`;
    }
    if (files?.audio?.[0]) {
      updateData.audio = `/uploads/${files.audio[0].filename}`;
    }
    if (files?.video?.[0]) {
      updateData.video = `/uploads/${files.video[0].filename}`;
    }

    // Parsing des tags si fournis
    if (updateData.tags) {
      updateData.tags = JSON.parse(updateData.tags);
    }

    const updatedItem = await prisma.culturalItem.update({
      where: { id: itemId },
      data: updateData
    });

    res.json(updatedItem);
  } catch (error) {
    console.error('Erreur lors de la mise à jour:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// DELETE - Supprimer un contenu
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    
    // Vérifier que l'élément existe
    const existingItem = await prisma.culturalItem.findUnique({
      where: { id: itemId }
    });

    if (!existingItem) {
      return res.status(404).json({ message: 'Contenu non trouvé' });
    }

    // Supprimer les fichiers associés
    if (existingItem.image) {
      const imagePath = path.join(__dirname, '../../uploads', path.basename(existingItem.image));
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
    if (existingItem.audio) {
      const audioPath = path.join(__dirname, '../../uploads', path.basename(existingItem.audio));
      if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);
    }
    if (existingItem.video) {
      const videoPath = path.join(__dirname, '../../uploads', path.basename(existingItem.video));
      if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
    }

    await prisma.culturalItem.delete({
      where: { id: itemId }
    });

    res.json({ message: 'Contenu supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST - Like/Unlike un contenu
router.post('/:id/like', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'ID utilisateur requis' });
    }

    // Vérifier si l'utilisateur a déjà liké
    const existingLike = await prisma.like.findFirst({
      where: {
        culturalItemId: itemId,
        userId: parseInt(userId)
      }
    });

    if (existingLike) {
      // Supprimer le like
      await prisma.like.delete({
        where: { id: existingLike.id }
      });
      
      // Décrémenter le compteur
      await prisma.culturalItem.update({
        where: { id: itemId },
        data: { likes: { decrement: 1 } }
      });

      res.json({ liked: false, message: 'Like supprimé' });
    } else {
      // Ajouter le like
      await prisma.like.create({
        data: {
          culturalItemId: itemId,
          userId: parseInt(userId)
        }
      });
      
      // Incrémenter le compteur
      await prisma.culturalItem.update({
        where: { id: itemId },
        data: { likes: { increment: 1 } }
      });

      res.json({ liked: true, message: 'Contenu liké' });
    }
  } catch (error) {
    console.error('Erreur lors du like:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// POST - Ajouter un commentaire
router.post('/:id/review', async (req, res) => {
  try {
    const itemId = parseInt(req.params.id);
    const { userId, content, rating } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    const review = await prisma.review.create({
      data: {
        culturalItemId: itemId,
        userId: parseInt(userId),
        content,
        rating: rating ? parseInt(rating) : null
      },
      include: {
        user: {
          select: { username: true, profile: { select: { avatar: true } } }
        }
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commentaire:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// GET - Statistiques du contenu
router.get('/stats/overview', async (req, res) => {
  try {
    const [
      totalItems,
      totalLikes,
      totalViews,
      totalReviews,
      categoryStats,
      recentItems
    ] = await Promise.all([
      prisma.culturalItem.count(),
      prisma.like.count(),
      prisma.culturalItem.aggregate({
        _sum: { views: true }
      }),
      prisma.review.count(),
      prisma.culturalItem.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.culturalItem.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, title: true, category: true, createdAt: true }
      })
    ]);

    res.json({
      totalItems,
      totalLikes,
      totalViews: totalViews._sum.views || 0,
      totalReviews,
      categoryStats,
      recentItems
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;





