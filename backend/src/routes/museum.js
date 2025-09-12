const express = require('express');
const router = express.Router();
// TODO: serve validated contributions from DB
router.get('/', async (req,res)=>{
  res.json([
    { id:1, title:'Demo Conte', description:'Un conte exemple', category:'conte', ipfs_cid:'bafy...demo' }
  ]);
});
module.exports = router;
