const express = require('express');
const multer = require('multer');
const CulturalItem = require('../models/CulturalItem');
const { authenticateToken, authorize, optionalAuth } = require('../middleware/auth');
const { upload, uploadFile, deleteFile } = require('../config/cloudinary');
const { demoCulturalItems } = require('../data/demoData');

const router = express.Router();

// Configuration Multer pour les uploads
const uploadMiddleware = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'audio', maxCount: 5 },
  { name: 'videos', maxCount: 3 },
  { name: 'documents', maxCount: 5 }
]);

// GET /cultural-items - Récupérer tous les éléments culturels
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      country,
      language,
      tags,
      search,
      status = 'approved',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Vérifier si MongoDB est disponible
    if (CulturalItem.db.readyState !== 1) {
      // Mode démo - utiliser les données statiques
      let items = [...demoCulturalItems];

      // Appliquer les filtres
      if (category) {
        items = items.filter(item => item.category === category);
      }
      if (country) {
        items = items.filter(item => item.country.toLowerCase().includes(country.toLowerCase()));
      }
      if (language) {
        items = items.filter(item => item.language.toLowerCase().includes(language.toLowerCase()));
      }
      if (tags) {
        const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
        items = items.filter(item => 
          tagList.some(tag => item.tags.some(itemTag => itemTag.toLowerCase().includes(tag)))
        );
      }
      if (search) {
        const searchLower = search.toLowerCase();
        items = items.filter(item => 
          item.title.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.content.toLowerCase().includes(searchLower) ||
          item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      // Appliquer le tri
      items.sort((a, b) => {
        const aValue = a[sortBy];
        const bValue = b[sortBy];
        if (sortOrder === 'desc') {
          return bValue > aValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      // Pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedItems = items.slice(startIndex, endIndex);

      return res.json({
        success: true,
        data: {
          items: paginatedItems,
          pagination: {
            current: parseInt(page),
            pages: Math.ceil(items.length / limit),
            total: items.length,
            limit: parseInt(limit)
          }
        }
      });
    }

    // Mode normal avec MongoDB
    const filters = {
      status: req.user?.role === 'admin' ? status : 'approved',
      isPublic: true
    };

    if (category) filters.category = category;
    if (country) filters.country = new RegExp(country, 'i');
    if (language) filters.language = new RegExp(language, 'i');
    if (tags) filters.tags = { $in: tags.split(',') };

    const query = search ? CulturalItem.search(search, filters) : CulturalItem.find(filters);

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const items = await query
      .populate('author', 'name profile.avatar')
      .populate('contributors')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await CulturalItem.countDocuments(filters);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Erreur récupération éléments culturels:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des éléments'
    });
  }
});

// GET /cultural-items/:id - Récupérer un élément culturel par ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = await CulturalItem.findById(req.params.id)
      .populate('author', 'name profile.avatar stats')
      .populate('contributors')
      .populate('relatedItems', 'title category mainImage')
      .populate('comments.user', 'name profile.avatar');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    // Vérifier les permissions
    if (!item.isPublic && (!req.user || req.user.id !== item.author._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé'
      });
    }

    // Incrémenter les vues
    await item.incrementViews();

    res.json({
      success: true,
      data: { item }
    });

  } catch (error) {
    console.error('Erreur récupération élément culturel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération de l\'élément'
    });
  }
});

// POST /cultural-items - Créer un nouvel élément culturel
router.post('/', authenticateToken, uploadMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      subcategory,
      country,
      region,
      language,
      originalLanguage,
      tags,
      source,
      collectionDate,
      culturalSignificance,
      difficulty,
      ageGroup,
      isPublic = true
    } = req.body;

    // Validation des données requises
    if (!title || !description || !content || !category || !country || !language) {
      return res.status(400).json({
        success: false,
        message: 'Titre, description, contenu, catégorie, pays et langue sont requis'
      });
    }

    // Traitement des médias
    const media = [];
    
    // Images
    if (req.files.images) {
      for (const file of req.files.images) {
        const uploadResult = await uploadFile(file, { resource_type: 'image' });
        if (uploadResult.success) {
          media.push({
            type: 'image',
            url: uploadResult.data.url,
            cloudinaryId: uploadResult.data.public_id,
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            metadata: {
              width: uploadResult.data.width,
              height: uploadResult.data.height,
              format: uploadResult.data.format
            }
          });
        }
      }
    }

    // Audio
    if (req.files.audio) {
      for (const file of req.files.audio) {
        const uploadResult = await uploadFile(file, { resource_type: 'video' });
        if (uploadResult.success) {
          media.push({
            type: 'audio',
            url: uploadResult.data.url,
            cloudinaryId: uploadResult.data.public_id,
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            duration: uploadResult.data.duration,
            metadata: {
              format: uploadResult.data.format
            }
          });
        }
      }
    }

    // Vidéos
    if (req.files.videos) {
      for (const file of req.files.videos) {
        const uploadResult = await uploadFile(file, { resource_type: 'video' });
        if (uploadResult.success) {
          media.push({
            type: 'video',
            url: uploadResult.data.url,
            cloudinaryId: uploadResult.data.public_id,
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            duration: uploadResult.data.duration,
            thumbnail: uploadResult.data.thumbnail_url,
            metadata: {
              width: uploadResult.data.width,
              height: uploadResult.data.height,
              format: uploadResult.data.format
            }
          });
        }
      }
    }

    // Documents
    if (req.files.documents) {
      for (const file of req.files.documents) {
        const uploadResult = await uploadFile(file, { resource_type: 'raw' });
        if (uploadResult.success) {
          media.push({
            type: 'document',
            url: uploadResult.data.url,
            cloudinaryId: uploadResult.data.public_id,
            filename: file.originalname,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
            metadata: {
              format: uploadResult.data.format
            }
          });
        }
      }
    }

    // Créer l'élément culturel
    const culturalItem = new CulturalItem({
      title,
      description,
      content,
      category,
      subcategory,
      country,
      region,
      language,
      originalLanguage,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      source,
      collectionDate: collectionDate ? new Date(collectionDate) : undefined,
      culturalSignificance,
      difficulty,
      ageGroup,
      isPublic: isPublic === 'true',
      author: req.user.id,
      media
    });

    await culturalItem.save();

    // Mettre à jour les statistiques de l'utilisateur
    await req.user.updateStats('contributions');

    res.status(201).json({
      success: true,
      message: 'Élément culturel créé avec succès',
      data: { culturalItem }
    });

  } catch (error) {
    console.error('Erreur création élément culturel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création de l\'élément'
    });
  }
});

// PUT /cultural-items/:id - Mettre à jour un élément culturel
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await CulturalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.id !== item.author.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    const updates = req.body;
    delete updates.author; // Empêcher la modification de l'auteur
    delete updates.createdAt; // Empêcher la modification de la date de création

    Object.assign(item, updates);
    await item.save();

    res.json({
      success: true,
      message: 'Élément culturel mis à jour avec succès',
      data: { item }
    });

  } catch (error) {
    console.error('Erreur mise à jour élément culturel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour'
    });
  }
});

// DELETE /cultural-items/:id - Supprimer un élément culturel
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const item = await CulturalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    // Vérifier les permissions
    if (req.user.id !== item.author.toString() && !['admin', 'moderator'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Permissions insuffisantes'
      });
    }

    // Supprimer les médias de Cloudinary
    for (const media of item.media) {
      if (media.cloudinaryId) {
        await deleteFile(media.cloudinaryId);
      }
    }

    await CulturalItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Élément culturel supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur suppression élément culturel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la suppression'
    });
  }
});

// POST /cultural-items/:id/like - Liker un élément culturel
router.post('/:id/like', authenticateToken, async (req, res) => {
  try {
    const item = await CulturalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    await item.addLike(req.user.id);

    res.json({
      success: true,
      message: 'Élément liké avec succès',
      data: { likesCount: item.likesCount }
    });

  } catch (error) {
    console.error('Erreur like élément culturel:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du like'
    });
  }
});

// DELETE /cultural-items/:id/like - Retirer le like
router.delete('/:id/like', authenticateToken, async (req, res) => {
  try {
    const item = await CulturalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    await item.removeLike(req.user.id);

    res.json({
      success: true,
      message: 'Like retiré avec succès',
      data: { likesCount: item.likesCount }
    });

  } catch (error) {
    console.error('Erreur retrait like:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du retrait du like'
    });
  }
});

// POST /cultural-items/:id/comment - Ajouter un commentaire
router.post('/:id/comment', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Le contenu du commentaire est requis'
      });
    }

    const item = await CulturalItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Élément culturel non trouvé'
      });
    }

    await item.addComment(req.user.id, content);

    res.json({
      success: true,
      message: 'Commentaire ajouté avec succès'
    });

  } catch (error) {
    console.error('Erreur ajout commentaire:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de l\'ajout du commentaire'
    });
  }
});

module.exports = router;
