const Joi = require('joi');

// Schémas de validation pour l'authentification
const authSchemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
  }),

  resetPassword: Joi.object({
    email: Joi.string().email().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100),
    bio: Joi.string().max(500),
    country: Joi.string().max(100),
    region: Joi.string().max(100),
    languages: Joi.array().items(Joi.string().length(2)),
    interests: Joi.array().items(Joi.string().max(50)),
    website: Joi.string().uri()
  })
};

// Schémas de validation pour les contenus culturels
const culturalContentSchemas = {
  create: Joi.object({
    title: Joi.string().min(3).max(200).required(),
    content: Joi.string().min(10).max(10000).required(),
    type: Joi.string().valid('PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE').required(),
    language: Joi.string().length(2).default('fr'),
    origin: Joi.string().max(100),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    metadata: Joi.object()
  }),

  update: Joi.object({
    title: Joi.string().min(3).max(200),
    content: Joi.string().min(10).max(10000),
    type: Joi.string().valid('PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE'),
    language: Joi.string().length(2),
    origin: Joi.string().max(100),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    metadata: Joi.object()
  }),

  query: Joi.object({
    type: Joi.string().valid('PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE'),
    language: Joi.string().length(2),
    origin: Joi.string().max(100),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'DRAFT', 'VERIFIED'),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).default(1)
  })
};

// Schémas de validation pour les devinettes
const riddleSchemas = {
  create: Joi.object({
    question: Joi.string().min(10).max(500).required(),
    answer: Joi.string().min(1).max(200).required(),
    hint: Joi.string().max(300),
    explanation: Joi.string().max(1000),
    culturalContext: Joi.string().max(1000),
    category: Joi.string().valid('NATURE', 'ANIMALS', 'FAMILY', 'WISDOM', 'COMMUNITY', 'HISTORY', 'TRADITIONS', 'OTHER').required(),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD').required(),
    language: Joi.string().length(2).default('fr'),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    keywords: Joi.array().items(Joi.string().max(50))
  }),

  update: Joi.object({
    question: Joi.string().min(10).max(500),
    answer: Joi.string().min(1).max(200),
    hint: Joi.string().max(300),
    explanation: Joi.string().max(1000),
    culturalContext: Joi.string().max(1000),
    category: Joi.string().valid('NATURE', 'ANIMALS', 'FAMILY', 'WISDOM', 'COMMUNITY', 'HISTORY', 'TRADITIONS', 'OTHER'),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD'),
    language: Joi.string().length(2),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.array().items(Joi.string().max(50)),
    keywords: Joi.array().items(Joi.string().max(50))
  }),

  query: Joi.object({
    category: Joi.string().valid('NATURE', 'ANIMALS', 'FAMILY', 'WISDOM', 'COMMUNITY', 'HISTORY', 'TRADITIONS', 'OTHER'),
    difficulty: Joi.string().valid('EASY', 'MEDIUM', 'HARD'),
    language: Joi.string().length(2),
    region: Joi.string().max(100),
    country: Joi.string().max(100),
    status: Joi.string().valid('PENDING', 'APPROVED', 'REJECTED', 'DRAFT'),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).default(1)
  })
};

// Schémas de validation pour le musée
const museumSchemas = {
  collectionQuery: Joi.object({
    type: Joi.string().valid('nft', 'art'),
    culture: Joi.string().max(100),
    country: Joi.string().max(100),
    search: Joi.string().max(200),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0),
    page: Joi.number().integer().min(1).default(1)
  }),

  searchQuery: Joi.object({
    q: Joi.string().min(2).max(200).required(),
    type: Joi.string().valid('nft', 'art'),
    culture: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.string().max(200)
  }),

  createNFT: Joi.object({
    name: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).max(1000).required(),
    culture: Joi.string().max(100),
    country: Joi.string().max(100),
    tags: Joi.string().max(500),
    source: Joi.string().max(200),
    license: Joi.string().max(50)
  })
};

// Schémas de validation pour les uploads
const uploadSchemas = {
  file: Joi.object({
    fieldname: Joi.string().required(),
    originalname: Joi.string().required(),
    encoding: Joi.string().required(),
    mimetype: Joi.string().required(),
    size: Joi.number().integer().min(1).required(),
    buffer: Joi.binary().required()
  })
};

// Schémas de validation pour les paramètres d'URL
const paramsSchemas = {
  id: Joi.object({
    id: Joi.string().required()
  }),

  tokenId: Joi.object({
    tokenId: Joi.string().required()
  }),

  serialNumber: Joi.object({
    serialNumber: Joi.string().required()
  })
};

// Schémas de validation pour les métriques
const metricsSchemas = {
  query: Joi.object({
    pattern: Joi.string().max(100).default('*'),
    limit: Joi.number().integer().min(1).max(1000).default(100)
  })
};

// Schémas de validation pour les récompenses
const rewardSchemas = {
  create: Joi.object({
    userId: Joi.string().required(),
    contentId: Joi.string(),
    type: Joi.string().valid('CONTENT_UPLOAD', 'CONTENT_VERIFICATION', 'TRANSLATION', 'REVIEW', 'SHARE', 'LIKE', 'COMMENT', 'QUALITY_CONTRIBUTION', 'COMMUNITY_MODERATION', 'CULTURAL_EXPERT', 'CHALLENGE_COMPLETION').required(),
    amount: Joi.number().integer().min(1).required(),
    metadata: Joi.object()
  }),

  query: Joi.object({
    userId: Joi.string(),
    type: Joi.string().valid('CONTENT_UPLOAD', 'CONTENT_VERIFICATION', 'TRANSLATION', 'REVIEW', 'SHARE', 'LIKE', 'COMMENT', 'QUALITY_CONTRIBUTION', 'COMMUNITY_MODERATION', 'CULTURAL_EXPERT', 'CHALLENGE_COMPLETION'),
    status: Joi.string().valid('PENDING', 'DISTRIBUTED', 'FAILED', 'CANCELLED'),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0)
  })
};

// Schémas de validation pour les défis
const challengeSchemas = {
  create: Joi.object({
    userId: Joi.string().required(),
    type: Joi.string().valid('UPLOAD_CONTENT', 'VERIFY_CONTENT', 'TRANSLATE_CONTENT', 'SOCIAL_INTERACTION', 'QUALITY_CONTRIBUTION', 'COMMUNITY_ENGAGEMENT').required(),
    target: Joi.number().integer().min(1).required(),
    reward: Joi.number().integer().min(1).required(),
    metadata: Joi.object()
  }),

  query: Joi.object({
    userId: Joi.string(),
    type: Joi.string().valid('UPLOAD_CONTENT', 'VERIFY_CONTENT', 'TRANSLATE_CONTENT', 'SOCIAL_INTERACTION', 'QUALITY_CONTRIBUTION', 'COMMUNITY_ENGAGEMENT'),
    status: Joi.string().valid('ACTIVE', 'COMPLETED', 'EXPIRED', 'CANCELLED'),
    limit: Joi.number().integer().min(1).max(100).default(50),
    offset: Joi.number().integer().min(0).default(0)
  })
};

module.exports = {
  authSchemas,
  culturalContentSchemas,
  riddleSchemas,
  museumSchemas,
  uploadSchemas,
  paramsSchemas,
  metricsSchemas,
  rewardSchemas,
  challengeSchemas
};
