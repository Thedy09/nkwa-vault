const express = require('express');
const fs = require('fs');
const path = require('path');
const { prisma } = require('../config/database');

const router = express.Router();

const MAX_LIMIT = 500;
const DEFAULT_LIMIT = 200;

function parseLimit(rawValue, fallback = DEFAULT_LIMIT) {
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, MAX_LIMIT);
}

function parseSource(rawSource) {
  const sourceString = String(rawSource || '').trim();
  if (!sourceString) {
    return { source: null, sourceUrl: null };
  }

  const parts = sourceString.split('|').map((part) => part.trim()).filter(Boolean);
  const urlPart = parts.find((part) => /^https?:\/\//i.test(part)) || null;
  const sourceParts = parts.filter((part) => part !== urlPart);
  const source = sourceParts.join(' | ') || sourceString;

  return { source, sourceUrl: urlPart };
}

function mapTale(tale) {
  const { source, sourceUrl } = parseSource(tale.source);
  return {
    id: tale.id,
    title: tale.title,
    content: tale.content,
    category: 'conte',
    language: tale.language,
    origin: tale.origin,
    region: tale.origin,
    culture: tale.author || 'Tradition orale',
    author: tale.author || 'Tradition orale',
    source,
    sourceUrl,
    tags: tale.tags || [],
    createdAt: tale.createdAt,
    dateAdded: tale.dateAdded
  };
}

function mapProverb(proverb) {
  const { source, sourceUrl } = parseSource(proverb.source);
  return {
    id: proverb.id,
    text: proverb.text,
    meaning: proverb.translation,
    category: 'proverbe',
    language: proverb.language,
    origin: proverb.origin,
    region: proverb.origin,
    culture: proverb.origin,
    source,
    sourceUrl,
    createdAt: proverb.createdAt,
    dateAdded: proverb.dateAdded
  };
}

function mapMusic(track) {
  const { source, sourceUrl } = parseSource(track.source);
  return {
    id: track.id,
    title: track.title,
    description: track.description,
    category: 'chant',
    type: track.type,
    origin: track.origin,
    artist: null,
    source,
    sourceUrl,
    createdAt: track.createdAt,
    dateAdded: track.dateAdded
  };
}

function mapArt(art) {
  const { source, sourceUrl } = parseSource(art.source);
  const normalizedCategory = art.category === 'danse' ? 'danse' : 'artisanat';

  return {
    id: art.id,
    title: art.title,
    description: art.description,
    category: normalizedCategory,
    origin: art.origin,
    artist: art.artist || 'Artisans traditionnels',
    source,
    sourceUrl,
    imageUrl: art.imageUrl,
    audioUrl: art.audioUrl,
    videoUrl: art.videoUrl,
    createdAt: art.createdAt,
    dateAdded: art.dateAdded
  };
}

function mapRiddle(riddle) {
  return {
    id: riddle.id,
    question: riddle.question,
    answer: riddle.answer,
    category: 'devinette',
    language: riddle.language,
    region: riddle.region,
    culture: riddle.country || riddle.region || 'Tradition orale',
    source: 'Communauté Nkwa',
    sourceUrl: null,
    createdAt: riddle.createdAt
  };
}

const collectionsDir = path.resolve(__dirname, '../../data/collections');
let cachedFallbackCollection = null;

function mapFallbackTale(item) {
  return {
    id: item.id,
    title: item.title,
    content: item.content,
    category: 'conte',
    language: item.language,
    origin: item.origin,
    region: item.region || item.origin,
    culture: item.authorName || 'Tradition orale',
    author: item.authorName || 'Tradition orale',
    source: item.source || null,
    sourceUrl: item.sourceUrl || null,
    tags: item.metadata?.themes || [],
    createdAt: item.metadata?.collectedAt || null,
    dateAdded: item.metadata?.collectedAt || null
  };
}

function mapFallbackProverb(item) {
  return {
    id: item.id,
    text: item.title,
    meaning: item.content,
    category: 'proverbe',
    language: item.language,
    origin: item.origin,
    region: item.region || item.origin,
    culture: item.authorName || item.origin || 'Sagesse traditionnelle',
    source: item.source || null,
    sourceUrl: item.sourceUrl || null,
    createdAt: item.metadata?.collectedAt || null,
    dateAdded: item.metadata?.collectedAt || null
  };
}

function mapFallbackMusic(item) {
  return {
    id: item.id,
    title: item.title,
    description: item.content,
    category: 'chant',
    type: 'chant',
    origin: item.origin,
    artist: item.authorName || null,
    source: item.source || null,
    sourceUrl: item.sourceUrl || null,
    createdAt: item.metadata?.collectedAt || null,
    dateAdded: item.metadata?.collectedAt || null
  };
}

function mapFallbackArt(item, category) {
  return {
    id: item.id,
    title: item.title,
    description: item.content,
    category,
    origin: item.origin,
    artist: item.authorName || 'Artisans traditionnels',
    source: item.source || null,
    sourceUrl: item.sourceUrl || null,
    imageUrl: item.metadata?.thumbnailUrl || null,
    audioUrl: null,
    videoUrl: null,
    createdAt: item.metadata?.collectedAt || null,
    dateAdded: item.metadata?.collectedAt || null
  };
}

function loadLatestFallbackCollection() {
  if (cachedFallbackCollection) {
    return cachedFallbackCollection;
  }

  try {
    if (!fs.existsSync(collectionsDir)) {
      return null;
    }

    const files = fs
      .readdirSync(collectionsDir)
      .filter((file) => file.endsWith('.json'))
      .sort();

    if (files.length === 0) {
      return null;
    }

    const latestFile = files[files.length - 1];
    const fullPath = path.join(collectionsDir, latestFile);
    const parsed = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    cachedFallbackCollection = parsed;
    return cachedFallbackCollection;
  } catch (error) {
    console.error('Impossible de charger le fallback local:', error.message);
    return null;
  }
}

function buildFallbackContent(limit) {
  const collection = loadLatestFallbackCollection();
  if (!collection?.data) {
    return null;
  }

  const tales = (collection.data.tales || []).slice(0, limit).map(mapFallbackTale);
  const proverbs = (collection.data.proverbes || []).slice(0, limit).map(mapFallbackProverb);
  const music = (collection.data.chants || []).slice(0, limit).map(mapFallbackMusic);
  const dances = (collection.data.danses || []).slice(0, limit).map((item) => mapFallbackArt(item, 'danse'));
  const art = (collection.data.art || []).slice(0, limit).map((item) => mapFallbackArt(item, 'artisanat'));
  const riddles = [];

  return {
    tales,
    proverbs,
    music,
    dances,
    art,
    riddles,
    sourceLabel: collection.generatedAt || 'fallback-local'
  };
}

function respondWithFallback(res, message, payloadBuilder) {
  const fallback = payloadBuilder();
  if (!fallback) {
    return false;
  }

  res.json({
    success: true,
    fallback: true,
    message,
    data: fallback
  });

  return true;
}

async function fetchDbContent(limit) {
  const [tales, proverbs, music, art, dances, riddles] = await Promise.all([
    prisma.tale.findMany({
      where: { verified: true },
      orderBy: { dateAdded: 'desc' },
      take: limit
    }),
    prisma.proverb.findMany({
      where: { verified: true },
      orderBy: { dateAdded: 'desc' },
      take: limit
    }),
    prisma.music.findMany({
      where: { verified: true, category: 'chant' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    }),
    prisma.art.findMany({
      where: { verified: true, category: 'art' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    }),
    prisma.art.findMany({
      where: { verified: true, category: 'danse' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    }),
    prisma.riddle.findMany({
      where: { status: 'APPROVED', isActive: true, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    })
  ]);

  return {
    tales: tales.map(mapTale),
    proverbs: proverbs.map(mapProverb),
    music: music.map(mapMusic),
    art: art.map(mapArt),
    dances: dances.map(mapArt),
    riddles: riddles.map(mapRiddle)
  };
}

router.get('/', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const dbContent = await fetchDbContent(limit);
    const content = [
      ...dbContent.tales,
      ...dbContent.proverbs,
      ...dbContent.riddles,
      ...dbContent.music,
      ...dbContent.dances,
      ...dbContent.art
    ];

    res.json({
      success: true,
      data: {
        content,
        total: content.length,
        sources: [
          'PostgreSQL (Nkwa Vault)',
          'Project Gutenberg (via collection import)',
          'Wikiquote (via collection import)',
          'Internet Archive (via collection import)',
          'Wikimedia Commons (via collection import)',
          'Met Museum Open Access (via collection import)'
        ],
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contenus:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Contenus servis depuis les collections locales (mode fallback, base de données indisponible).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        const content = [
          ...fallback.tales,
          ...fallback.proverbs,
          ...fallback.riddles,
          ...fallback.music,
          ...fallback.dances,
          ...fallback.art
        ];
        return {
          content,
          total: content.length,
          sources: [
            'Fallback local (collections open-content)',
            'Project Gutenberg',
            'Wikiquote',
            'Internet Archive',
            'Wikimedia Commons',
            'Met Museum Open Access'
          ],
          lastUpdated: new Date().toISOString()
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contenus culturels',
      error: error.message
    });
  }
});

router.get('/tales', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const tales = await prisma.tale.findMany({
      where: { verified: true },
      orderBy: { dateAdded: 'desc' },
      take: limit
    });

    const mapped = tales.map(mapTale);
    res.json({
      success: true,
      data: {
        tales: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des contes:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Contes servis depuis les collections locales (mode fallback).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        return {
          tales: fallback.tales,
          total: fallback.tales.length
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des contes',
      error: error.message
    });
  }
});

router.get('/proverbs', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const proverbs = await prisma.proverb.findMany({
      where: { verified: true },
      orderBy: { dateAdded: 'desc' },
      take: limit
    });

    const mapped = proverbs.map(mapProverb);
    res.json({
      success: true,
      data: {
        proverbs: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des proverbes:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Proverbes servis depuis les collections locales (mode fallback).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        return {
          proverbs: fallback.proverbs,
          total: fallback.proverbs.length
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des proverbes',
      error: error.message
    });
  }
});

router.get('/cultural-riddles', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit, 100);
    const riddles = await prisma.riddle.findMany({
      where: { status: 'APPROVED', isActive: true, isPublic: true },
      orderBy: { createdAt: 'desc' },
      take: limit
    });

    const mapped = riddles.map(mapRiddle);
    res.json({
      success: true,
      data: {
        riddles: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des devinettes:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Aucune devinette en fallback local pour le moment.',
      () => ({
        riddles: [],
        total: 0
      })
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des devinettes',
      error: error.message
    });
  }
});

router.get('/music', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const music = await prisma.music.findMany({
      where: { verified: true, category: 'chant' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    });

    const mapped = music.map(mapMusic);
    res.json({
      success: true,
      data: {
        music: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la musique:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Chants servis depuis les collections locales (mode fallback).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        return {
          music: fallback.music,
          total: fallback.music.length
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la musique',
      error: error.message
    });
  }
});

router.get('/dances', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const dances = await prisma.art.findMany({
      where: { verified: true, category: 'danse' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    });

    const mapped = dances.map(mapArt);
    res.json({
      success: true,
      data: {
        dances: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des danses:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Danses servies depuis les collections locales (mode fallback).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        return {
          dances: fallback.dances,
          total: fallback.dances.length
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des danses',
      error: error.message
    });
  }
});

router.get('/art', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const art = await prisma.art.findMany({
      where: { verified: true, category: 'art' },
      orderBy: { dateAdded: 'desc' },
      take: limit
    });

    const mapped = art.map(mapArt);
    res.json({
      success: true,
      data: {
        art: mapped,
        total: mapped.length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'art:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Art servi depuis les collections locales (mode fallback).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        return {
          art: fallback.art,
          total: fallback.art.length
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de l\'art',
      error: error.message
    });
  }
});

router.get('/refresh', async (req, res) => {
  try {
    const limit = parseLimit(req.query.limit);
    const dbContent = await fetchDbContent(limit);
    const total = dbContent.tales.length
      + dbContent.proverbs.length
      + dbContent.riddles.length
      + dbContent.music.length
      + dbContent.dances.length
      + dbContent.art.length;

    res.json({
      success: true,
      message: 'Données relues depuis PostgreSQL',
      data: {
        totals: {
          tales: dbContent.tales.length,
          proverbs: dbContent.proverbs.length,
          riddles: dbContent.riddles.length,
          music: dbContent.music.length,
          dances: dbContent.dances.length,
          art: dbContent.art.length,
          total
        },
        refreshedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Erreur lors du rafraîchissement:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Mode fallback local activé (base de données indisponible).',
      () => {
        const limit = parseLimit(req.query.limit);
        const fallback = buildFallbackContent(limit);
        if (!fallback) return null;
        const total = fallback.tales.length
          + fallback.proverbs.length
          + fallback.riddles.length
          + fallback.music.length
          + fallback.dances.length
          + fallback.art.length;
        return {
          totals: {
            tales: fallback.tales.length,
            proverbs: fallback.proverbs.length,
            riddles: fallback.riddles.length,
            music: fallback.music.length,
            dances: fallback.dances.length,
            art: fallback.art.length,
            total
          },
          refreshedAt: new Date().toISOString()
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors du rafraîchissement des données',
      error: error.message
    });
  }
});

router.get('/sources', async (req, res) => {
  try {
    const [tales, proverbs, music, art, dances] = await Promise.all([
      prisma.tale.count({ where: { verified: true } }),
      prisma.proverb.count({ where: { verified: true } }),
      prisma.music.count({ where: { verified: true, category: 'chant' } }),
      prisma.art.count({ where: { verified: true, category: 'art' } }),
      prisma.art.count({ where: { verified: true, category: 'danse' } })
    ]);

    res.json({
      success: true,
      data: {
        database: 'PostgreSQL',
        schema: process.env.DATABASE_URL?.includes('schema=') ? process.env.DATABASE_URL.split('schema=').pop() : 'public',
        totals: {
          tales,
          proverbs,
          music,
          art,
          dances,
          total: tales + proverbs + music + art + dances
        },
        providers: [
          'Project Gutenberg',
          'Wikiquote',
          'Internet Archive',
          'Wikimedia Commons',
          'Met Museum Open Access'
        ]
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations sur les sources:', error);

    const fallbackResponse = respondWithFallback(
      res,
      'Sources servies en mode fallback local (sans base de données).',
      () => {
        const fallback = buildFallbackContent(DEFAULT_LIMIT);
        if (!fallback) return null;
        return {
          database: 'Fallback local (no DATABASE_URL)',
          schema: 'n/a',
          totals: {
            tales: fallback.tales.length,
            proverbs: fallback.proverbs.length,
            music: fallback.music.length,
            art: fallback.art.length,
            dances: fallback.dances.length,
            total: fallback.tales.length
              + fallback.proverbs.length
              + fallback.music.length
              + fallback.art.length
              + fallback.dances.length
          },
          providers: [
            'Project Gutenberg',
            'Wikiquote',
            'Internet Archive',
            'Wikimedia Commons',
            'Met Museum Open Access'
          ]
        };
      }
    );

    if (fallbackResponse) {
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des informations sur les sources',
      error: error.message
    });
  }
});

module.exports = router;
