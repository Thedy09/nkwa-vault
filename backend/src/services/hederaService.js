// Mode démo - simulation des services Hedera
let TOPIC_ID = 'demo-topic-123';

async function createTopicIfNeeded() {
  return TOPIC_ID;
}

async function submitToHCS(message) {
  // Simulation d'une soumission à Hedera
  console.log('📝 Simulation HCS:', message);
  return { 
    topicId: TOPIC_ID, 
    consensusTimestamp: new Date().toISOString(),
    status: 'demo-mode'
  };
}
async function createNftToken(name, symbol, supplyKeyPrivateKeyStr) {
  // Simulation de création de token NFT
  console.log('🎨 Simulation création NFT:', { name, symbol });
  return `demo-token-${Date.now()}`;
}

async function mintNft(tokenId, metadataList) {
  // Simulation de mint NFT
  console.log('🪙 Simulation mint NFT:', { tokenId, metadataList });
  return [Date.now()];
}
module.exports = { submitToHCS, createNftToken, mintNft };
