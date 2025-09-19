const express = require('express');
const culturalDataService = require('../services/culturalDataService');

const router = express.Router();

// Cache pour éviter de refaire les appels API trop souvent
let contentCache = {
  data: null,
  lastFetch: null,
  ttl: 30 * 60 * 1000 // 30 minutes
};

// Middleware de cache
const getCachedContent = async () => {
  const now = Date.now();
  
  if (contentCache.data && contentCache.lastFetch && (now - contentCache.lastFetch) < contentCache.ttl) {
    console.log('📦 Utilisation du cache pour les contenus culturels');
    return contentCache.data;
  }

  console.log('🔄 Récupération des contenus culturels depuis les sources...');
  const data = await culturalDataService.fetchAllCulturalContent();
  
  contentCache.data = data;
  contentCache.lastFetch = now;
  
  return data;
};

// GET - Récupérer tous les contenus culturels
router.get('/', async (req, res) => {
  try {
    const content = await getCachedContent();
    
    res.json({
      success: true,
      data: {
        content,
        total: content.length,
        sources: [
          'UNESCO - Patrimoine oral et immatériel',
          'Musée du Quai Branly',
          'IFAN - Institut Fondamental d\'Afrique Noire',
          'Musée Royal de l\'Afrique Centrale'
        ],
        lastUpdated: contentCache.lastFetch ? new Date(contentCache.lastFetch).toISOString() : null
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contenus culturels',
      error: error.message
    });
  }
});

// GET - Récupérer les contes
router.get('/tales', async (req, res) => {
  try {
    const content = await getCachedContent();
    const tales = content.filter(item => item.category === 'conte');
    
    res.json({
      success: true,
      data: {
        tales,
        total: tales.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contes',
      error: error.message
    });
  }
});

// GET - Récupérer les proverbes
router.get('/proverbs', async (req, res) => {
  try {
    const content = await getCachedContent();
    const proverbs = content.filter(item => item.category === 'proverbe');
    
    res.json({
      success: true,
      data: {
        proverbs,
        total: proverbs.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des proverbes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des proverbes',
      error: error.message
    });
  }
});

// GET - Récupérer les devinettes
router.get('/cultural-riddles', async (req, res) => {
  try {
    const content = await getCachedContent();
    const riddles = content.filter(item => item.category === 'devinette');
    
    res.json({
      success: true,
      data: {
        riddles,
        total: riddles.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devinettes:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes',
      error: error.message
    });
  }
});

// GET - Récupérer la musique
router.get('/music', async (req, res) => {
  try {
    const content = await getCachedContent();
    const music = content.filter(item => item.category === 'chant');
    
    res.json({
      success: true,
      data: {
        music,
        total: music.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la musique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la musique',
      error: error.message
    });
  }
});

// GET - Récupérer l'art
router.get('/art', async (req, res) => {
  try {
    const content = await getCachedContent();
    const art = content.filter(item => item.category === 'artisanat');
    
    res.json({
      success: true,
      data: {
        art,
        total: art.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'art:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'art',
      error: error.message
    });
  }
});

// GET - Forcer le rafraîchissement du cache
router.get('/refresh', async (req, res) => {
  try {
    console.log('🔄 Rafraîchissement forcé du cache des contenus culturels...');
    contentCache.data = null;
    contentCache.lastFetch = null;
    
    const content = await getCachedContent();
    
    res.json({
      success: true,
      message: 'Cache rafraîchi avec succès',
      data: {
        content,
        total: content.length,
        refreshedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement du cache',
      error: error.message
    });
  }
});

// GET - Informations sur les sources
router.get('/sources', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        sources: [
          {
            name: 'UNESCO - Patrimoine oral et immatériel',
            url: 'https://ich.unesco.org',
            description: 'Liste représentative du patrimoine culturel immatériel de l\'humanité',
            status: 'active'
          },
          {
            name: 'Musée du Quai Branly',
            url: 'https://www.quaibranly.fr',
            description: 'Collections d\'art et d\'artisanat africain',
            status: 'active'
          },
          {
            name: 'IFAN - Institut Fondamental d\'Afrique Noire',
            url: 'https://www.ifan.ucad.sn',
            description: 'Archives et collections ethnographiques',
            status: 'active'
          },
          {
            name: 'Musée Royal de l\'Afrique Centrale',
            url: 'https://www.africamuseum.be',
            description: 'Collections d\'art et d\'histoire africaine',
            status: 'active'
          }
        ],
        lastCacheUpdate: contentCache.lastFetch ? new Date(contentCache.lastFetch).toISOString() : null,
        cacheStatus: contentCache.data ? 'loaded' : 'empty'
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations sur les sources:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations sur les sources',
      error: error.message
    });
  }
});

module.exports = router;