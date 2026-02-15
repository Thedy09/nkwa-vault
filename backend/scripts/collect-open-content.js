const fs = require('fs');
const path = require('path');
const contentCollector = require('../src/services/contentCollectorService');

function readPositiveInt(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseArgValue(name) {
  const match = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  if (!match) return null;
  return match.split('=').slice(1).join('=');
}

async function run() {
  const talesLimit = readPositiveInt(parseArgValue('tales') || parseArgValue('stories'), 60);
  const proverbesLimit = readPositiveInt(parseArgValue('proverbs') || parseArgValue('proverbes'), 80);
  const chantsLimit = readPositiveInt(parseArgValue('chants') || parseArgValue('music'), 40);
  const dansesLimit = readPositiveInt(parseArgValue('dances') || parseArgValue('danses'), 30);
  const artLimit = readPositiveInt(parseArgValue('art') || parseArgValue('artworks'), 30);

  console.log('Starting open cultural content collection...');
  console.log(`Limits -> tales: ${talesLimit}, proverbes: ${proverbesLimit}, chants: ${chantsLimit}, danses: ${dansesLimit}, art: ${artLimit}`);

  await contentCollector.ensureWeb3Ready();

  const tales = await contentCollector.collectAfricanStories('fr', talesLimit);
  const proverbes = await contentCollector.collectAfricanProverbs(proverbesLimit);
  const chants = await contentCollector.collectTraditionalMusic(chantsLimit);
  const danses = await contentCollector.collectTraditionalDances(dansesLimit);
  const art = await contentCollector.collectMetMuseumArt(artLimit);

  const payload = {
    generatedAt: new Date().toISOString(),
    sources: {
      tales: tales.source,
      proverbes: proverbes.source,
      chants: chants.source,
      danses: danses.source,
      art: art.source
    },
    counts: {
      tales: tales.count,
      proverbes: proverbes.count,
      chants: chants.count,
      danses: danses.count,
      art: art.count,
      total: tales.count + proverbes.count + chants.count + danses.count + art.count
    },
    data: {
      tales: tales.stories,
      proverbes: proverbes.proverbs,
      chants: chants.music,
      danses: danses.dances,
      art: art.artworks
    }
  };

  const outputDir = path.join(__dirname, '../data/collections');
  fs.mkdirSync(outputDir, { recursive: true });

  const fileName = `open-content-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
  const outputFile = path.join(outputDir, fileName);
  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2), 'utf8');

  console.log(`Collection completed: ${payload.counts.total} items`);
  console.log(`Output: ${outputFile}`);
}

run().catch((error) => {
  console.error('Collection script failed:', error.message);
  process.exit(1);
});
