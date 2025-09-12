const express = require('express');
const { mintNft } = require('../services/hederaService');
const router = express.Router();
router.get('/pending', async (req,res)=>{ res.json([]); });
router.post('/validate/:id', async (req,res)=>{
  const id = req.params.id;
  // TODO: fetch from DB and mark validated
  const metadataBytes = Buffer.from(JSON.stringify({ contributionId:id }));
  const tokenId = process.env.HEDERA_NFT_TOKEN_ID;
  const serials = await mintNft(tokenId, [metadataBytes]);
  res.json({ ok:true, tokenId, serials });
});
module.exports = router;
