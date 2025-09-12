require('dotenv').config();
const { createNftToken, mintNft, submitToHCS } = require('../src/services/hederaService');
const { uploadFileToIPFS } = require('../src/services/ipfsService');

async function testHederaServices() {
  console.log('🚀 Test des services Hedera...\n');
  
  try {
    // Test création de token NFT
    console.log('1. Création du token NFT ACV...');
    const tokenId = await createNftToken('ACV Heritage', 'ACV', process.env.HEDERA_OPERATOR_KEY);
    console.log('✅ Token créé:', tokenId);
    
    // Test mint NFT
    console.log('\n2. Mint d\'un NFT...');
    const metadataList = [{
      name: 'Test Heritage Item',
      description: 'Un élément de test du patrimoine africain',
      image: 'https://example.com/image.jpg',
      attributes: [
        { trait_type: 'Category', value: 'Conte' },
        { trait_type: 'Country', value: 'Sénégal' },
        { trait_type: 'Language', value: 'Wolof' }
      ]
    }];
    
    const nftIds = await mintNft(tokenId, metadataList);
    console.log('✅ NFT minté:', nftIds);
    
    // Test HCS
    console.log('\n3. Soumission à HCS...');
    const hcsResult = await submitToHCS({
      type: 'cultural_item_created',
      itemId: 'test-item-123',
      title: 'Le Lion et la Souris',
      author: 'Test User',
      timestamp: new Date().toISOString()
    });
    console.log('✅ HCS soumis:', hcsResult);
    
  } catch (error) {
    console.error('❌ Erreur Hedera:', error.message);
  }
}

async function testIPFSServices() {
  console.log('\n🌐 Test des services IPFS...\n');
  
  try {
    // Test upload IPFS
    console.log('1. Upload vers IPFS...');
    const testData = {
      title: 'Test Heritage Item',
      content: 'Contenu de test pour le patrimoine africain',
      metadata: {
        category: 'conte',
        country: 'Sénégal',
        language: 'wolof'
      }
    };
    
    const ipfsHash = await uploadFileToIPFS(JSON.stringify(testData));
    console.log('✅ Upload IPFS:', ipfsHash);
    
  } catch (error) {
    console.error('❌ Erreur IPFS:', error.message);
  }
}

async function testDatabaseConnection() {
  console.log('\n🗄️ Test de la connexion base de données...\n');
  
  try {
    const connectDB = require('../src/config/database');
    await connectDB();
    console.log('✅ Base de données connectée');
  } catch (error) {
    console.error('❌ Erreur base de données:', error.message);
  }
}

async function runAllTests() {
  console.log('🧪 Tests des services Nkwa Vault\n');
  console.log('=' .repeat(50));
  
  await testHederaServices();
  await testIPFSServices();
  await testDatabaseConnection();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Tests terminés !');
}

// Exécuter les tests
runAllTests().catch(console.error);
