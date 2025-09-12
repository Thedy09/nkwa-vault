
require('dotenv').config();
const { createNftToken } = require('../src/services/hederaService');

(async () => {
  try {
    console.log('🚀 Création du token NFT Nkwa Vault...');
    
    // Vérifier que les variables d'environnement sont définies
    if (!process.env.HEDERA_OPERATOR_KEY) {
      console.error('❌ HEDERA_OPERATOR_KEY n\'est pas définie dans .env');
      process.exit(1);
    }
    
    const tokenId = await createNftToken('Nkwa Heritage', 'Nkwa', process.env.HEDERA_OPERATOR_KEY);
    console.log('✅ Token créé avec succès:', tokenId);
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du token:', error.message);
    process.exit(1);
  }
})();
