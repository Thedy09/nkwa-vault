const mongoose = require('mongoose');

const riddleSchema = new mongoose.Schema({
  // Informations de base
  question: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  answer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  hint: {
    type: String,
    trim: true,
    maxlength: 300
  },
  explanation: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  culturalContext: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Classification
  category: {
    type: String,
    required: true,
    enum: ['nature', 'animals', 'family', 'wisdom', 'community', 'history', 'traditions', 'other'],
    default: 'other'
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  language: {
    type: String,
    required: true,
    default: 'fr',
    maxlength: 10
  },
  region: {
    type: String,
    trim: true,
    maxlength: 100
  },
  country: {
    type: String,
    trim: true,
    maxlength: 100
  },

  // Auteur et contribution
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorName: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'draft'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Statistiques
  stats: {
    plays: { type: Number, default: 0 },
    correctAnswers: { type: Number, default: 0 },
    incorrectAnswers: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }, // en secondes
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  },

  // Tags et mots-clés
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: 50
  }],

  // Médias associés
  media: {
    image: String,
    audio: String,
    video: String
  },

  // Blockchain et décentralisation
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    ipfsHash: String,
    verified: { type: Boolean, default: false }
  },

  // Métadonnées
  isActive: { type: Boolean, default: true },
  isPublic: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  featuredAt: Date,
  publishedAt: Date,

  // Modération
  moderation: {
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
    flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    flaggedAt: Date,
    resolvedAt: Date,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }

}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour les recherches
riddleSchema.index({ question: 'text', answer: 'text', explanation: 'text', culturalContext: 'text' });
riddleSchema.index({ category: 1, difficulty: 1 });
riddleSchema.index({ author: 1, status: 1 });
riddleSchema.index({ status: 1, publishedAt: -1 });
riddleSchema.index({ isActive: 1, isPublic: 1 });
riddleSchema.index({ 'stats.rating': -1 });
riddleSchema.index({ tags: 1 });

// Virtuals
riddleSchema.virtual('successRate').get(function() {
  const total = this.stats.correctAnswers + this.stats.incorrectAnswers;
  return total > 0 ? (this.stats.correctAnswers / total) * 100 : 0;
});

riddleSchema.virtual('totalPlays').get(function() {
  return this.stats.plays;
});

riddleSchema.virtual('isApproved').get(function() {
  return this.status === 'approved';
});

riddleSchema.virtual('isPending').get(function() {
  return this.status === 'pending';
});

// Méthodes
riddleSchema.methods.incrementPlays = function() {
  this.stats.plays += 1;
  return this.save();
};

riddleSchema.methods.recordAnswer = function(isCorrect, timeSpent) {
  if (isCorrect) {
    this.stats.correctAnswers += 1;
  } else {
    this.stats.incorrectAnswers += 1;
  }
  
  // Mettre à jour le temps moyen
  const totalAnswers = this.stats.correctAnswers + this.stats.incorrectAnswers;
  this.stats.averageTime = ((this.stats.averageTime * (totalAnswers - 1)) + timeSpent) / totalAnswers;
  
  return this.save();
};

riddleSchema.methods.like = function() {
  this.stats.likes += 1;
  this.updateRating();
  return this.save();
};

riddleSchema.methods.dislike = function() {
  this.stats.dislikes += 1;
  this.updateRating();
  return this.save();
};

riddleSchema.methods.updateRating = function() {
  const total = this.stats.likes + this.stats.dislikes;
  if (total > 0) {
    this.stats.rating = (this.stats.likes / total) * 5;
  }
};

riddleSchema.methods.approve = function(reviewerId) {
  this.status = 'approved';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.publishedAt = new Date();
  return this.save();
};

riddleSchema.methods.reject = function(reviewerId, reason) {
  this.status = 'rejected';
  this.reviewedBy = reviewerId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  return this.save();
};

riddleSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.rejectionReason;
  delete obj.moderation;
  return obj;
};

// Méthodes statiques
riddleSchema.statics.findByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    status: 'approved', 
    isActive: true, 
    isPublic: true 
  }).limit(limit);
};

riddleSchema.statics.findByDifficulty = function(difficulty, limit = 10) {
  return this.find({ 
    difficulty, 
    status: 'approved', 
    isActive: true, 
    isPublic: true 
  }).limit(limit);
};

riddleSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    $text: { $search: query },
    status: 'approved',
    isActive: true,
    isPublic: true
  };

  if (filters.category) {
    searchQuery.category = filters.category;
  }
  if (filters.difficulty) {
    searchQuery.difficulty = filters.difficulty;
  }
  if (filters.language) {
    searchQuery.language = filters.language;
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } });
};

riddleSchema.statics.getFeatured = function(limit = 5) {
  return this.find({ 
    isFeatured: true, 
    status: 'approved', 
    isActive: true, 
    isPublic: true 
  })
  .sort({ featuredAt: -1 })
  .limit(limit);
};

riddleSchema.statics.getPopular = function(limit = 10) {
  return this.find({ 
    status: 'approved', 
    isActive: true, 
    isPublic: true 
  })
  .sort({ 'stats.plays': -1, 'stats.rating': -1 })
  .limit(limit);
};

module.exports = mongoose.model('Riddle', riddleSchema);
