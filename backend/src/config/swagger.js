const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Nkwa V API',
      version: '1.0.0',
      description: 'API pour la plateforme de préservation et de partage du patrimoine culturel africain',
      contact: {
        name: 'Nkwa V Team',
        email: 'contact@nkwa.africa',
        url: 'https://nkwa.africa'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Serveur de développement'
      },
      {
        url: 'https://acv-project-starter.vercel.app',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'user_123' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            name: { type: 'string', example: 'John Doe' },
            role: { 
              type: 'string', 
              enum: ['ADMIN', 'MODERATOR', 'CONTRIBUTOR', 'USER'],
              example: 'USER'
            },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CulturalContent: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'content_123' },
            title: { type: 'string', example: 'Proverbe Yoruba' },
            content: { type: 'string', example: 'Le contenu du proverbe...' },
            type: { 
              type: 'string', 
              enum: ['PROVERB', 'TALE', 'RIDDLE', 'MUSIC', 'ART', 'DANCE', 'RECIPE'],
              example: 'PROVERB'
            },
            language: { type: 'string', example: 'fr' },
            origin: { type: 'string', example: 'Nigeria' },
            region: { type: 'string', example: 'Lagos' },
            country: { type: 'string', example: 'Nigeria' },
            authorName: { type: 'string', example: 'Auteur Anonyme' },
            status: { 
              type: 'string', 
              enum: ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT', 'VERIFIED'],
              example: 'APPROVED'
            },
            verified: { type: 'boolean', example: true },
            ipfsCid: { type: 'string', example: 'QmHash123' },
            ipfsUrl: { type: 'string', example: 'ipfs://QmHash123' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        MuseumObject: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'object_123' },
            name: { type: 'string', example: 'Masque Traditionnel' },
            description: { type: 'string', example: 'Masque cérémoniel de la culture Yoruba' },
            type: { 
              type: 'string', 
              enum: ['nft', 'art'],
              example: 'nft'
            },
            culture: { type: 'string', example: 'Yoruba' },
            country: { type: 'string', example: 'Nigeria' },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['masque', 'cérémonie', 'traditionnel']
            },
            image: { type: 'string', example: 'https://ipfs.io/ipfs/QmImage123' },
            nftMetadata: { type: 'object' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Erreur de validation' },
            errors: { 
              type: 'array',
              items: { type: 'string' },
              example: ['Le champ email est requis']
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Opération réussie' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/server.js'
  ]
};

const specs = swaggerJsdoc(options);

module.exports = specs;
