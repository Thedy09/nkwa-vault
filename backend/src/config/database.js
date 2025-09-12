const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Vérifier si MongoDB URI est configuré
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI non configuré. Veuillez configurer votre base de données.');
    }

    const mongoURI = process.env.MONGODB_URI;
    
    // Configuration optimisée pour la production
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // 10 secondes
      socketTimeoutMS: 45000,
      maxPoolSize: 10, // Maintenir jusqu'à 10 connexions socket
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      }
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`🗄️ MongoDB connecté: ${conn.connection.host}`);
    console.log(`📊 Base de données: ${conn.connection.name}`);
    
    // Gestion des événements de connexion
    mongoose.connection.on('error', (err) => {
      console.error('❌ Erreur MongoDB:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB déconnecté');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnecté');
    });

    // Gestion de la fermeture propre
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 Connexion MongoDB fermée');
      process.exit(0);
    });

    return true;

  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    console.error('💡 Pour utiliser une base de données locale:');
    console.error('   1. Installez MongoDB: https://www.mongodb.com/try/download/community');
    console.error('   2. Démarrez MongoDB: sudo systemctl start mongod');
    console.error('   3. Ou configurez MongoDB Atlas: https://cloud.mongodb.com/');
    console.error('   4. Créez un fichier .env avec MONGODB_URI');
    console.error('🔄 Mode démo activé - Base de données simulée');
    
    // En mode démo, on continue sans MongoDB
    return false;
  }
};

module.exports = connectDB;
