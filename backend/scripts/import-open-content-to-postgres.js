const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const prisma = new PrismaClient();

function parseArgValue(name) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!match) return null;
  return match.split('=').slice(1).join('=');
}

function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeKey(value) {
  return normalizeText(value).toLowerCase();
}

function buildSourceLabel(item) {
  const source = normalizeText(item?.source);
  const sourceUrl = normalizeText(item?.sourceUrl);

  if (source && sourceUrl) return `${source} | ${sourceUrl}`;
  if (sourceUrl) return sourceUrl;
  if (source) return source;
  return null;
}

function loadLatestCollectionFile(customFilePath) {
  if (customFilePath) {
    const resolved = path.isAbsolute(customFilePath)
      ? customFilePath
      : path.resolve(process.cwd(), customFilePath);
    if (!fs.existsSync(resolved)) {
      throw new Error(`Collection file not found: ${resolved}`);
    }
    return resolved;
  }

  const collectionsDir = path.resolve(__dirname, '../data/collections');
  if (!fs.existsSync(collectionsDir)) {
    throw new Error(`Collections directory not found: ${collectionsDir}`);
  }

  const files = fs.readdirSync(collectionsDir)
    .filter((fileName) => fileName.endsWith('.json'))
    .sort();

  if (!files.length) {
    throw new Error(`No collection files found in ${collectionsDir}`);
  }

  return path.join(collectionsDir, files[files.length - 1]);
}

function buildTaleKey(record) {
  return `${normalizeKey(record.title)}|${normalizeKey(record.source)}`;
}

function buildProverbKey(record) {
  return `${normalizeKey(record.text)}|${normalizeKey(record.source)}`;
}

function buildMusicKey(record) {
  return `${normalizeKey(record.title)}|${normalizeKey(record.source)}`;
}

function buildArtKey(record) {
  return `${normalizeKey(record.category)}|${normalizeKey(record.title)}|${normalizeKey(record.source)}`;
}

function toArray(value) {
  return Array.isArray(value) ? value : [];
}

async function run() {
  const dryRun = hasFlag('dry-run');
  const customFilePath = parseArgValue('file');

  const filePath = loadLatestCollectionFile(customFilePath);
  const raw = fs.readFileSync(filePath, 'utf8');
  const payload = JSON.parse(raw);

  const data = payload?.data || {};
  const talesItems = toArray(data.tales || data.stories);
  const proverbsItems = toArray(data.proverbes || data.proverbs);
  const chantsItems = toArray(data.chants || data.music);
  const dancesItems = toArray(data.danses || data.dances);
  const artItems = toArray(data.art || data.artworks);

  const taleKeys = new Set();
  const proverbKeys = new Set();
  const musicKeys = new Set();
  const artKeys = new Set();

  let dbConnected = false;
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);

  if (!hasDatabaseUrl) {
    if (!dryRun) {
      throw new Error('DATABASE_URL is not defined. Configure PostgreSQL connection before running import.');
    }
    console.warn('Warning: DATABASE_URL is not defined. Running dry-run without existing-record dedupe.');
  } else {
    try {
      await prisma.$connect();
      dbConnected = true;

      const [existingTales, existingProverbs, existingMusic, existingArt] = await Promise.all([
        prisma.tale.findMany({ select: { title: true, source: true } }),
        prisma.proverb.findMany({ select: { text: true, source: true } }),
        prisma.music.findMany({ select: { title: true, source: true } }),
        prisma.art.findMany({ select: { title: true, source: true, category: true } })
      ]);

      existingTales.forEach((item) => taleKeys.add(buildTaleKey(item)));
      existingProverbs.forEach((item) => proverbKeys.add(buildProverbKey(item)));
      existingMusic.forEach((item) => musicKeys.add(buildMusicKey(item)));
      existingArt.forEach((item) => artKeys.add(buildArtKey(item)));
    } catch (error) {
      if (!dryRun) {
        throw new Error(`Cannot connect to PostgreSQL (${error.message})`);
      }
      console.warn(`Warning: PostgreSQL unavailable (${error.message}). Running dry-run without existing-record dedupe.`);
    }
  }

  const newTales = [];
  const newProverbs = [];
  const newMusic = [];
  const newArt = [];

  for (const item of talesItems) {
    const title = normalizeText(item?.title);
    const content = normalizeText(item?.content);
    if (!title || !content) continue;

    const source = buildSourceLabel(item);
    const candidate = { title, source };
    const key = buildTaleKey(candidate);
    if (taleKeys.has(key)) continue;

    const themes = toArray(item?.metadata?.themes)
      .map((theme) => normalizeText(theme))
      .filter(Boolean);

    newTales.push({
      title,
      content,
      author: normalizeText(item?.authorName) || 'Anonyme',
      origin: normalizeText(item?.country || item?.origin) || 'Afrique',
      language: normalizeText(item?.language) || 'Multilingue',
      category: 'conte',
      source,
      tags: themes,
      verified: true
    });
    taleKeys.add(key);
  }

  for (const item of proverbsItems) {
    const text = normalizeText(item?.content || item?.title);
    if (!text) continue;

    const source = buildSourceLabel(item);
    const candidate = { text, source };
    const key = buildProverbKey(candidate);
    if (proverbKeys.has(key)) continue;

    const translation = normalizeText(item?.translation || item?.metadata?.translation) || text;

    newProverbs.push({
      text,
      translation,
      origin: normalizeText(item?.country || item?.origin) || 'Afrique',
      language: normalizeText(item?.language) || 'Multilingue',
      category: 'proverbe',
      source,
      verified: true
    });
    proverbKeys.add(key);
  }

  for (const item of chantsItems) {
    const title = normalizeText(item?.title);
    const content = normalizeText(item?.content);
    if (!title || !content) continue;

    const source = buildSourceLabel(item);
    const candidate = { title, source };
    const key = buildMusicKey(candidate);
    if (musicKeys.has(key)) continue;

    const audioUrl = normalizeText(item?.metadata?.audioUrl);
    const description = audioUrl ? `${content}\nAudio: ${audioUrl}` : content;

    newMusic.push({
      title,
      description,
      type: normalizeText(item?.metadata?.genre) || 'chant traditionnel',
      origin: normalizeText(item?.country || item?.origin) || 'Afrique',
      category: 'chant',
      source,
      verified: true
    });
    musicKeys.add(key);
  }

  for (const item of dancesItems) {
    const title = normalizeText(item?.title);
    const content = normalizeText(item?.content);
    if (!title || !content) continue;

    const source = buildSourceLabel(item);
    const candidate = { title, source, category: 'danse' };
    const key = buildArtKey(candidate);
    if (artKeys.has(key)) continue;

    const imageUrl = normalizeText(item?.metadata?.imageUrl) || null;
    const videoUrl = normalizeText(item?.metadata?.videoUrl) || null;
    const mediaUrl = videoUrl || imageUrl;
    const description = mediaUrl ? `${content}\nMedia: ${mediaUrl}` : content;

    newArt.push({
      title,
      description,
      artist: normalizeText(item?.authorName) || null,
      origin: normalizeText(item?.country || item?.origin) || 'Afrique',
      category: 'danse',
      source,
      imageUrl,
      videoUrl,
      audioUrl: null,
      verified: true
    });
    artKeys.add(key);
  }

  for (const item of artItems) {
    const title = normalizeText(item?.title);
    const content = normalizeText(item?.content);
    if (!title || !content) continue;

    const source = buildSourceLabel(item);
    const candidate = { title, source, category: 'art' };
    const key = buildArtKey(candidate);
    if (artKeys.has(key)) continue;

    newArt.push({
      title,
      description: content,
      artist: normalizeText(item?.authorName) || null,
      origin: normalizeText(item?.country || item?.origin) || 'Afrique',
      category: 'art',
      source,
      imageUrl: normalizeText(item?.metadata?.imageUrl) || null,
      videoUrl: normalizeText(item?.metadata?.videoUrl) || null,
      audioUrl: normalizeText(item?.metadata?.audioUrl) || null,
      verified: true
    });
    artKeys.add(key);
  }

  const plan = {
    file: filePath,
    dryRun,
    toInsert: {
      tales: newTales.length,
      proverbes: newProverbs.length,
      chants: newMusic.length,
      artAndDanses: newArt.length
    }
  };
  console.log(JSON.stringify(plan, null, 2));

  if (dryRun) {
    if (dbConnected) {
      await prisma.$disconnect();
    }
    return;
  }

  const result = {
    tales: 0,
    proverbes: 0,
    chants: 0,
    artAndDanses: 0
  };

  if (newTales.length) {
    const output = await prisma.tale.createMany({ data: newTales });
    result.tales = output.count;
  }
  if (newProverbs.length) {
    const output = await prisma.proverb.createMany({ data: newProverbs });
    result.proverbes = output.count;
  }
  if (newMusic.length) {
    const output = await prisma.music.createMany({ data: newMusic });
    result.chants = output.count;
  }
  if (newArt.length) {
    const output = await prisma.art.createMany({ data: newArt });
    result.artAndDanses = output.count;
  }

  console.log('Import completed');
  console.log(JSON.stringify(result, null, 2));

  if (dbConnected) {
    await prisma.$disconnect();
  }
}

run().catch(async (error) => {
  console.error('Import failed:', error.message);
  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error('Disconnect failed:', disconnectError.message);
  }
  process.exit(1);
});
