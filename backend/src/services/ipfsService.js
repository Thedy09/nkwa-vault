// Mode démo - simulation du service IPFS
const fs = require('fs');

async function uploadFileToIPFS(path, name) {
  // Simulation d'upload vers IPFS
  console.log('📁 Simulation upload IPFS:', { path, name });
  
  // Générer un CID simulé
  const cid = `bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi-${Date.now()}`;
  
  return cid;
}
module.exports = { uploadFileToIPFS };
