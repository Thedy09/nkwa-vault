require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Database
const connectDB = require('./config/database');

// Routes
const authRoute = require('./routes/auth');
const uploadRoute = require('./routes/upload');
const adminRoute = require('./routes/admin');
const museumRoute = require('./routes/museum');
const culturalItemsRoute = require('./routes/culturalItems');
const riddlesRoute = require('./routes/riddles');

const app = express();

// Middleware de sécurité
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting global
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: {
    success: false,
    message: 'Trop de requêtes. Réessayez plus tard.'
  }
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/auth', authRoute);
app.use('/upload', uploadRoute);
app.use('/admin', adminRoute);
app.use('/museum', museumRoute);
app.use('/cultural-items', culturalItemsRoute);
app.use('/riddles', riddlesRoute);

// Route de santé
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Nkwa Vault Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Route 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route non trouvée'
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur interne du serveur'
  });
});

// Connexion à la base de données
connectDB();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log('🚀 Nkwa Vault Backend running on port', PORT);
  console.log('🔐 Authentication system ready');
  console.log('🗄️ Database connection ready');
  console.log('🌍 CORS enabled for:', process.env.FRONTEND_URL || 'http://localhost:3000');
});
