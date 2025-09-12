const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'moderator', 'contributor', 'user'],
    default: 'user'
  },
  profile: {
    avatar: String,
    bio: {
      type: String,
      maxlength: 500
    },
    country: String,
    region: String,
    languages: [String],
    interests: [String],
    website: String,
    socialMedia: {
      twitter: String,
      facebook: String,
      instagram: String,
      linkedin: String
    }
  },
  preferences: {
    language: {
      type: String,
      default: 'fr'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      newContent: {
        type: Boolean,
        default: true
      },
      comments: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showEmail: {
        type: Boolean,
        default: false
      },
      showProfile: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    contributions: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    followers: {
      type: Number,
      default: 0
    },
    following: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  verificationToken: String,
  verificationExpires: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour la recherche
userSchema.index({ email: 1 });
userSchema.index({ name: 'text', 'profile.bio': 'text' });
userSchema.index({ role: 1, isActive: 1 });

// Virtual pour l'URL de l'avatar
userSchema.virtual('avatarUrl').get(function() {
  if (this.profile.avatar) {
    return this.profile.avatar;
  }
  // Générer un avatar par défaut avec les initiales
  const initials = this.name.split(' ').map(n => n[0]).join('').toUpperCase();
  return `https://ui-avatars.com/api/?name=${initials}&background=FFD700&color=1a1a1a&size=200`;
});

// Middleware pre-save pour hacher le mot de passe
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour vérifier le mot de passe
userSchema.methods.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Méthode pour générer un token JWT
userSchema.methods.generateToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      email: this.email, 
      role: this.role,
      name: this.name
    },
    process.env.JWT_SECRET || 'african-culture-vault-secret-key',
    { expiresIn: '7d' }
  );
};

// Méthode pour retourner les données publiques
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.preferences.privacy.showEmail ? this.email : undefined,
    role: this.role,
    profile: {
      avatar: this.avatarUrl,
      bio: this.profile.bio,
      country: this.profile.country,
      region: this.profile.region,
      languages: this.profile.languages,
      interests: this.profile.interests,
      website: this.profile.website,
      socialMedia: this.preferences.privacy.showProfile ? this.profile.socialMedia : undefined
    },
    stats: this.stats,
    isActive: this.isActive,
    isVerified: this.isVerified,
    createdAt: this.createdAt
  };
};

// Méthode pour mettre à jour les statistiques
userSchema.methods.updateStats = function(field, increment = 1) {
  if (this.stats[field] !== undefined) {
    this.stats[field] += increment;
    return this.save();
  }
  return Promise.resolve(this);
};

// Méthode pour incrémenter le nombre de connexions
userSchema.methods.incrementLogin = function() {
  this.loginCount += 1;
  this.lastLogin = new Date();
  return this.save();
};

// Méthode statique pour la recherche
userSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {};
  
  if (query) {
    searchQuery.$text = { $search: query };
  }
  
  if (filters.role) {
    searchQuery.role = filters.role;
  }
  
  if (filters.country) {
    searchQuery['profile.country'] = new RegExp(filters.country, 'i');
  }
  
  if (filters.isActive !== undefined) {
    searchQuery.isActive = filters.isActive;
  }
  
  return this.find(searchQuery)
    .select('-password -resetPasswordToken -verificationToken')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('User', userSchema);
