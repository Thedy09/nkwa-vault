const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'audio', 'video', 'document'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  cloudinaryId: String,
  filename: String,
  originalName: String,
  size: Number,
  mimeType: String,
  duration: Number, // Pour audio/vidéo
  thumbnail: String, // Pour vidéo
  metadata: {
    width: Number,
    height: Number,
    bitrate: Number,
    format: String
  }
}, { _id: true });

const culturalItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['conte', 'proverbe', 'chanson', 'danse', 'artisanat', 'histoire', 'tradition', 'autre'],
    required: true
  },
  subcategory: {
    type: String,
    trim: true,
    maxlength: 100
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  region: {
    type: String,
    trim: true,
    maxlength: 100
  },
  language: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  originalLanguage: {
    type: String,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  media: [mediaSchema],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contributors: [{
    name: String,
    role: {
      type: String,
      enum: ['narrateur', 'traducteur', 'collecteur', 'interprète', 'autre']
    },
    contact: String
  }],
  source: {
    type: String,
    trim: true,
    maxlength: 500
  },
  collectionDate: {
    type: Date
  },
  publicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'approved', 'rejected', 'archived'],
    default: 'pending'
  },
  moderation: {
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    notes: String,
    reason: String
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  shares: {
    type: Number,
    default: 0
  },
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isApproved: {
      type: Boolean,
      default: false
    }
  }],
  blockchain: {
    nftTokenId: String,
    hcsMessageId: String,
    ipfsHash: String,
    transactionHash: String
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['facile', 'moyen', 'difficile'],
    default: 'moyen'
  },
  ageGroup: {
    type: String,
    enum: ['tout-public', 'enfants', 'adolescents', 'adultes'],
    default: 'tout-public'
  },
  culturalSignificance: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  relatedItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CulturalItem'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
culturalItemSchema.index({ title: 'text', description: 'text', content: 'text', tags: 'text' });
culturalItemSchema.index({ category: 1, country: 1, language: 1 });
culturalItemSchema.index({ author: 1, status: 1 });
culturalItemSchema.index({ createdAt: -1 });
culturalItemSchema.index({ views: -1 });
culturalItemSchema.index({ 'likes.user': 1 });

// Virtual pour le nombre de likes
culturalItemSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

// Virtual pour le nombre de commentaires approuvés
culturalItemSchema.virtual('commentsCount').get(function() {
  return this.comments.filter(comment => comment.isApproved).length;
});

// Virtual pour l'URL de l'image principale
culturalItemSchema.virtual('mainImage').get(function() {
  const image = this.media.find(m => m.type === 'image');
  return image ? image.url : null;
});

// Virtual pour l'URL de l'audio principal
culturalItemSchema.virtual('mainAudio').get(function() {
  const audio = this.media.find(m => m.type === 'audio');
  return audio ? audio.url : null;
});

// Virtual pour l'URL de la vidéo principale
culturalItemSchema.virtual('mainVideo').get(function() {
  const video = this.media.find(m => m.type === 'video');
  return video ? video.url : null;
});

// Middleware pre-save pour nettoyer les tags
culturalItemSchema.pre('save', function(next) {
  if (this.tags) {
    this.tags = this.tags.map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  }
  next();
});

// Méthode pour incrémenter les vues
culturalItemSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Méthode pour ajouter un like
culturalItemSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  if (!existingLike) {
    this.likes.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthode pour retirer un like
culturalItemSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(like => like.user.toString() !== userId.toString());
  return this.save();
};

// Méthode pour ajouter un commentaire
culturalItemSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Méthode statique pour la recherche
culturalItemSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  
  if (filters.country) {
    searchQuery.country = new RegExp(filters.country, 'i');
  }
  
  if (filters.language) {
    searchQuery.language = new RegExp(filters.language, 'i');
  }
  
  if (filters.tags && filters.tags.length > 0) {
    searchQuery.tags = { $in: filters.tags };
  }
  
  if (filters.status) {
    searchQuery.status = filters.status;
  }
  
  if (filters.isPublic !== undefined) {
    searchQuery.isPublic = filters.isPublic;
  }
  
  return this.find(searchQuery)
    .populate('author', 'name email')
    .populate('contributors')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('CulturalItem', culturalItemSchema);


