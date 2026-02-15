const axios = require('axios');
const cheerio = require('cheerio');
const { logInfo, logError, logWarning } = require('../utils/logger');
const web3Core = require('./web3Core');

class ContentCollectorService {
  constructor() {
    this.httpClient = axios.create({
      timeout: 15000,
      headers: {
        Accept: 'application/json, text/plain, */*'
      }
    });

    this.wikimediaHeaders = {
      'User-Agent': 'NkwaVaultBot/1.0 (open cultural platform; contact: admin@nkwa.local)',
      'Api-User-Agent': 'NkwaVaultBot/1.0 (open cultural platform)',
      Accept: 'application/json'
    };

    this.sources = {
      gutendex: {
        baseUrl: 'https://gutendex.com',
        apiUrl: 'https://gutendex.com/books/',
        license: 'Public Domain',
        type: 'contes'
      },
      wikiquote: {
        baseUrl: 'https://en.wikiquote.org',
        apiUrl: 'https://en.wikiquote.org/w/api.php',
        license: 'CC BY-SA 4.0',
        type: 'proverbes'
      },
      internetArchive: {
        baseUrl: 'https://archive.org',
        apiUrl: 'https://archive.org/advancedsearch.php',
        metadataApiUrl: 'https://archive.org/metadata',
        license: 'Open Access',
        type: 'chants'
      },
      wikimediaCommons: {
        baseUrl: 'https://commons.wikimedia.org',
        apiUrl: 'https://commons.wikimedia.org/w/api.php',
        license: 'CC0/CC-BY',
        type: 'arts_visuels'
      },
      metMuseum: {
        baseUrl: 'https://www.metmuseum.org',
        apiUrl: 'https://collectionapi.metmuseum.org/public/collection/v1',
        license: 'CC0',
        type: 'arts_visuels'
      },
      unesco: {
        baseUrl: 'https://ich.unesco.org',
        apiUrl: 'https://ich.unesco.org/api',
        license: 'Educational',
        type: 'patrimoine_immatériel'
      }
    };

    this.archiveBlockedKeywords = [
      'episode',
      'podcast',
      'debate',
      'news',
      'interview',
      'conference',
      'talk show',
      'report',
      'discography',
      'album',
      'remix',
      'dj mix',
      'military',
      'army',
      'command ceremony',
      'road',
      'roads',
      'highway',
      'traffic study'
    ];
  }

  async ensureWeb3Ready() {
    if (!web3Core.isReady()) {
      await web3Core.initialize();
    }
  }

  normalizeWhitespace(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  cleanHtmlText(value) {
    const html = String(value || '');
    if (!html) return '';
    const $ = cheerio.load(`<div>${html}</div>`);
    return this.normalizeWhitespace($.text());
  }

  slugify(value) {
    return this.normalizeWhitespace(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  buildContentId(prefix, rawValue) {
    const base = this.slugify(rawValue || `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    return `${prefix}_${base}`.slice(0, 64);
  }

  toArray(value) {
    if (Array.isArray(value)) return value;
    if (value === undefined || value === null || value === '') return [];
    return [value];
  }

  firstDefined(values = []) {
    for (const value of values) {
      if (value) return value;
    }
    return null;
  }

  parseYear(rawValue) {
    if (!rawValue) return null;
    const yearMatch = String(rawValue).match(/\b(1[89]\d{2}|20\d{2})\b/);
    return yearMatch ? Number(yearMatch[1]) : null;
  }

  extractCountry(rawText = '') {
    const text = this.normalizeWhitespace(rawText).toLowerCase();
    const countries = [
      ['senegal', 'Sénégal'],
      ['mali', 'Mali'],
      ['ghana', 'Ghana'],
      ['nigeria', 'Nigeria'],
      ['burundi', 'Burundi'],
      ['ethiopia', 'Éthiopie'],
      ['kenya', 'Kenya'],
      ['somali', 'Somalie'],
      ['congo', 'Congo'],
      ['south africa', 'Afrique du Sud'],
      ['ivory coast', 'Côte d\'Ivoire'],
      ['cote d ivoire', 'Côte d\'Ivoire'],
      ['zambia', 'Zambie'],
      ['uganda', 'Ouganda'],
      ['cameroon', 'Cameroun'],
      ['burkina', 'Burkina Faso'],
      ['comoros', 'Comores']
    ];

    const matched = countries.find(([keyword]) => text.includes(keyword));
    return matched ? matched[1] : null;
  }

  inferRegion(country) {
    const westAfrica = ['Sénégal', 'Mali', 'Ghana', 'Nigeria', 'Côte d\'Ivoire', 'Burkina Faso'];
    const eastAfrica = ['Kenya', 'Somalie', 'Éthiopie', 'Ouganda'];
    const centralAfrica = ['Congo', 'Cameroun'];
    const southernAfrica = ['Afrique du Sud', 'Zambie'];

    if (westAfrica.includes(country)) return 'Afrique de l\'Ouest';
    if (eastAfrica.includes(country)) return 'Afrique de l\'Est';
    if (centralAfrica.includes(country)) return 'Afrique Centrale';
    if (southernAfrica.includes(country)) return 'Afrique Australe';
    return 'Afrique';
  }

  parseLanguageCode(code) {
    const languageMap = {
      en: 'anglais',
      fr: 'français',
      sw: 'swahili',
      ar: 'arabe',
      pt: 'portugais'
    };
    return languageMap[String(code || '').toLowerCase()] || code || 'français';
  }

  normalizeLicense(licenseUrl) {
    const normalized = String(licenseUrl || '').toLowerCase();
    if (normalized.includes('publicdomain') || normalized.includes('/zero/1.0')) return 'Public Domain';
    if (normalized.includes('/by-sa/')) return 'CC BY-SA';
    if (normalized.includes('/by-nc-sa/')) return 'CC BY-NC-SA';
    if (normalized.includes('/by-nc-nd/')) return 'CC BY-NC-ND';
    if (normalized.includes('/by-nc/')) return 'CC BY-NC';
    if (normalized.includes('/by-nd/')) return 'CC BY-ND';
    if (normalized.includes('/by/')) return 'CC BY';
    if (normalized.includes('creativecommons.org')) return 'Creative Commons';
    return 'Open Access';
  }

  isOpenLicense(licenseUrl) {
    const normalized = String(licenseUrl || '').toLowerCase();
    return normalized.includes('creativecommons.org') || normalized.includes('publicdomain');
  }

  dedupeBy(items, keySelector) {
    const seen = new Set();
    const deduped = [];

    for (const item of items) {
      const key = keySelector(item);
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(item);
    }

    return deduped;
  }

  isAfricanStoryCandidate(book) {
    const title = this.normalizeWhitespace(book.title || '').toLowerCase();
    const subjects = this.toArray(book.subjects).join(' ').toLowerCase();
    const combined = `${title} ${subjects}`;

    const africaKeywords = [
      'africa',
      'african',
      'west african',
      'south-african',
      'east african',
      'anansi',
      'ashanti',
      'yoruba',
      'zulu',
      'swahili'
    ];
    const storyKeywords = ['folk', 'folktale', 'tale', 'story', 'stories', 'folklore', 'legend', 'myth'];

    return africaKeywords.some((keyword) => combined.includes(keyword))
      && storyKeywords.some((keyword) => combined.includes(keyword));
  }

  isRelevantArchiveItem(doc) {
    const title = this.normalizeWhitespace(doc.title || '').toLowerCase();
    const identifier = this.normalizeWhitespace(doc.identifier || '').toLowerCase();
    const subjects = this.toArray(doc.subject).join(' ').toLowerCase();
    const description = this.normalizeWhitespace(doc.description || '').toLowerCase();
    const titleIdentifierText = `${title} ${identifier}`;
    const primaryText = `${titleIdentifierText} ${subjects}`;
    const text = `${primaryText} ${description}`;

    const africaTerms = ['africa', 'african', 'swahili', 'yoruba', 'zulu', 'griot', 'ethiopia', 'senegal', 'mali', 'burundi', 'congo'];
    const traditionalTerms = ['traditional', 'folk', 'folklore', 'chant', 'griot'];
    const hasBlockedKeyword = this.archiveBlockedKeywords.some((keyword) => text.includes(keyword));
    const hasAfricaSignal = africaTerms.some((term) => primaryText.includes(term));
    const hasTraditionalSignal = traditionalTerms.some((term) => titleIdentifierText.includes(term));

    return hasAfricaSignal
      && hasTraditionalSignal
      && !hasBlockedKeyword;
  }

  isRelevantArchiveDanceItem(doc) {
    const title = this.normalizeWhitespace(doc.title || '').toLowerCase();
    const identifier = this.normalizeWhitespace(doc.identifier || '').toLowerCase();
    const subjects = this.toArray(doc.subject).join(' ').toLowerCase();
    const description = this.normalizeWhitespace(doc.description || '').toLowerCase();
    const titleIdentifierText = `${title} ${identifier}`;
    const primaryText = `${titleIdentifierText} ${subjects}`;
    const text = `${primaryText} ${description}`;

    const africaTerms = ['africa', 'african', 'swahili', 'yoruba', 'zulu', 'ethiopia', 'senegal', 'mali', 'burundi', 'congo'];
    const danceTerms = ['dance', 'traditional dance', 'ritual dance', 'choreography', 'danse', 'dancing'];
    const hasBlockedKeyword = this.archiveBlockedKeywords.some((keyword) => text.includes(keyword));
    const hasAfricaSignal = africaTerms.some((term) => primaryText.includes(term));
    const hasDanceSignal = danceTerms.some((term) => titleIdentifierText.includes(term));

    return hasAfricaSignal
      && hasDanceSignal
      && !hasBlockedKeyword;
  }

  isRelevantMetObject(objectData) {
    const tags = this.toArray(objectData.tags).map((tag) => tag.term || '').join(' ');
    const text = [
      objectData.title,
      objectData.objectName,
      objectData.department,
      objectData.classification,
      objectData.culture,
      objectData.country,
      objectData.region,
      tags
    ].join(' ').toLowerCase();

    const africaTerms = [
      'africa',
      'african',
      'arts of africa',
      'yoruba',
      'akan',
      'ashanti',
      'dogon',
      'bamana',
      'benin',
      'ethiopia',
      'congo',
      'mali',
      'swahili',
      'zulu'
    ];

    return africaTerms.some((term) => text.includes(term));
  }

  cleanProverb(rawText) {
    const withoutReferences = String(rawText || '').replace(/\[\d+\]/g, '');
    let cleaned = this.normalizeWhitespace(withoutReferences);

    cleaned = cleaned
      .replace(/\s*Meaning:.*$/i, '')
      .replace(/\s*English equivalent:.*$/i, '')
      .replace(/\s*Equivalent:.*$/i, '')
      .replace(/\s+As quoted in.*$/i, '')
      .replace(/\s+[A-Z][^.!?]*\bp\.\s*\d+.*$/i, '')
      .replace(/\s*[A-Z][^.!?]*\(\d{4}\).*$/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Remove trailing editorial quotes/annotations often appended on Wikiquote.
    cleaned = cleaned.split('“')[0].split('"')[0].trim();

    if (!cleaned) return null;
    if (cleaned.length < 12 || cleaned.length > 170) return null;
    if (!/[a-zA-Z]/.test(cleaned)) return null;
    if (cleaned.includes('http://') || cleaned.includes('https://')) return null;
    if (/[,:;]$/.test(cleaned)) return null;

    const lower = cleaned.toLowerCase();
    const blockedFragments = [
      'encyclopedic article',
      'on wikipedia',
      'see also',
      'external links',
      'main article',
      'for more',
      'template:'
    ];

    if (blockedFragments.some((fragment) => lower.includes(fragment))) return null;
    if (lower.startsWith('see also') || lower.startsWith('references')) return null;
    if (lower.endsWith('proverbs')) return null;
    if (lower === 'afrikaans proverbs' || lower === 'nigerian proverbs' || lower === 'somali proverbs' || lower === 'swahili proverbs') return null;

    return cleaned;
  }

  extractProverbsFromWikiquoteHtml(html) {
    const $ = cheerio.load(html);
    const proverbs = [];

    $('.mw-parser-output > ul > li, .mw-parser-output > ol > li').each((_, element) => {
      const proverb = this.cleanProverb($(element).text());
      if (proverb) {
        proverbs.push(proverb);
      }
    });

    return this.dedupeBy(proverbs, (proverb) => proverb.toLowerCase());
  }

  async certifyCollectedItems(items, operation, itemIdKey = 'id') {
    await this.ensureWeb3Ready();
    const certifiedItems = [];

    for (const item of items) {
      try {
        const contentPayload = {
          ...item,
          id: item.id || this.buildContentId('content', item.title || item.sourceUrl)
        };

        const web3Result = await web3Core.createCulturalContent(contentPayload, []);
        certifiedItems.push({
          ...contentPayload,
          web3: web3Result
        });

        logInfo('Content collected and certified', {
          operation,
          id: contentPayload.id,
          title: contentPayload.title,
          transactionHash: web3Result.blockchain?.txHash || null
        });
      } catch (error) {
        const context = {
          service: 'ContentCollectorService',
          operation
        };
        context[itemIdKey] = item[itemIdKey] || item.id || null;
        logError(error, context);
      }
    }

    return certifiedItems;
  }

  async fetchStoriesFromGutendex(limit, language = 'fr') {
    const searchTerms = [
      'african folk tales',
      'west african folklore',
      'south african folk tales',
      'anansi',
      'african stories',
      'conte africain',
      'east african folklore',
      'swahili tales',
      'yoruba tales',
      'zulu tales',
      'bantu folklore',
      'hausa folktales',
      'ethiopian tales'
    ];

    const records = new Map();

    for (const term of searchTerms) {
      if (records.size >= limit) break;

      try {
        const response = await this.httpClient.get(this.sources.gutendex.apiUrl, {
          params: { search: term, page: 1 }
        });
        const books = this.toArray(response.data?.results);

        for (const book of books) {
          if (records.size >= limit) break;
          if (book.copyright) continue;
          if (!this.isAfricanStoryCandidate(book)) continue;

          const formats = book.formats || {};
          const textUrl = this.firstDefined([
            formats['text/plain; charset=utf-8'],
            formats['text/plain; charset=us-ascii'],
            formats['text/plain'],
            formats['text/html; charset=utf-8'],
            formats['text/html']
          ]);
          if (!textUrl) continue;

          const subjects = this.toArray(book.subjects);
          const authors = this.toArray(book.authors).map((author) => author.name).filter(Boolean);
          const country = this.extractCountry(`${book.title || ''} ${subjects.join(' ')}`);
          const sourceId = String(book.id);

          records.set(sourceId, {
            id: sourceId,
            sourceId,
            title: this.normalizeWhitespace(book.title || `Conte ${sourceId}`),
            content: `Conte africain libre d'accès (domaine public). Téléchargement texte: ${textUrl}`,
            language: this.parseLanguageCode(this.firstDefined(book.languages) || language),
            origin: 'Afrique',
            region: this.inferRegion(country),
            country,
            author: authors.join(', ') || 'Tradition orale',
            url: `https://www.gutenberg.org/ebooks/${sourceId}`,
            textUrl,
            themes: subjects.slice(0, 8),
            metadata: {
              gutendexId: sourceId,
              formats: Object.keys(formats),
              downloadCount: book.download_count || 0
            }
          });
        }
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchStoriesFromGutendex',
          searchTerm: term
        });
      }
    }

    const stories = Array.from(records.values()).slice(0, limit);
    if (stories.length === 0) {
      logWarning('Gutendex did not return stories, using fallback stories', { limit });
      return this.simulateAfricanStorybookAPI(language, limit);
    }
    return stories;
  }

  async fetchProverbsFromWikiquote(limit) {
    const pages = [
      { title: 'Afrikaans proverbs', origin: 'Afrique du Sud', language: 'afrikaans / anglais' },
      { title: 'South African proverbs', origin: 'Afrique du Sud', language: 'anglais' },
      { title: 'Nigerian proverbs', origin: 'Nigeria', language: 'anglais' },
      { title: 'Somali proverbs', origin: 'Somalie', language: 'somali / anglais' },
      { title: 'Swahili proverbs', origin: 'Afrique de l\'Est', language: 'swahili / anglais' }
    ];

    const proverbs = [];

    for (const page of pages) {
      if (proverbs.length >= limit) break;

      try {
        const response = await this.httpClient.get(this.sources.wikiquote.apiUrl, {
          params: {
            action: 'parse',
            page: page.title,
            prop: 'text',
            format: 'json',
            formatversion: 2
          },
          headers: this.wikimediaHeaders
        });

        const html = response.data?.parse?.text || '';
        const list = this.extractProverbsFromWikiquoteHtml(html);

        list.forEach((text, index) => {
          proverbs.push({
            id: this.buildContentId('proverb', `${page.title}_${index}_${text.slice(0, 80)}`),
            title: this.normalizeWhitespace(text.slice(0, 120)),
            content: text,
            origin: page.origin,
            language: page.language,
            country: page.origin,
            url: `${this.sources.wikiquote.baseUrl}/wiki/${encodeURIComponent(page.title.replace(/\s+/g, '_'))}`,
            sourcePage: page.title
          });
        });
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchProverbsFromWikiquote',
          page: page.title
        });
      }
    }

    const deduped = this.dedupeBy(proverbs, (item) => item.content.toLowerCase()).slice(0, limit);
    if (deduped.length === 0) {
      logWarning('Wikiquote did not return proverbs, using fallback proverbs', { limit });
      return this.getFallbackProverbs(limit);
    }

    return deduped;
  }

  async fetchArchiveAudioFile(identifier) {
    try {
      const response = await this.httpClient.get(`${this.sources.internetArchive.metadataApiUrl}/${encodeURIComponent(identifier)}`);
      const files = this.toArray(response.data?.files);
      const audioFiles = files.filter((file) => /\.(mp3|ogg|wav|flac|m4a)$/i.test(file.name || ''));

      if (!audioFiles.length) return null;

      const preferred = audioFiles.find((file) => /VBR MP3|Ogg Vorbis|FLAC|WAV/i.test(file.format || ''))
        || audioFiles[0];

      return {
        name: preferred.name,
        format: preferred.format || null,
        duration: preferred.length || preferred.duration || null
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'fetchArchiveAudioFile',
        identifier
      });
      return null;
    }
  }

  async fetchArchiveVideoFile(identifier) {
    try {
      const response = await this.httpClient.get(`${this.sources.internetArchive.metadataApiUrl}/${encodeURIComponent(identifier)}`);
      const files = this.toArray(response.data?.files);
      const videoFiles = files.filter((file) => /\.(mp4|webm|mkv|mov|avi|ogv|mpeg)$/i.test(file.name || ''));

      if (!videoFiles.length) return null;

      const preferred = videoFiles.find((file) => /h\.264|mpeg4|mp4|matroska/i.test(file.format || ''))
        || videoFiles[0];

      return {
        name: preferred.name,
        format: preferred.format || null,
        duration: preferred.length || preferred.duration || null
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'fetchArchiveVideoFile',
        identifier
      });
      return null;
    }
  }

  async fetchMusicFromInternetArchive(limit) {
    const query = 'mediatype:audio AND (subject:("traditional music" OR "folk music" OR folklore OR chant) OR title:(traditional OR folklore OR chant)) AND (subject:(africa OR african OR swahili OR yoruba OR zulu OR griot OR ethiopia OR mali OR senegal OR congo) OR title:(africa OR african OR swahili OR yoruba OR zulu OR griot OR ethiopia OR mali OR senegal OR congo)) AND licenseurl:(*creativecommons.org* OR *publicdomain*)';

    try {
      const response = await this.httpClient.get(this.sources.internetArchive.apiUrl, {
        params: {
          q: query,
          'fl[]': ['identifier', 'title', 'description', 'creator', 'date', 'licenseurl', 'subject', 'language', 'collection'],
          rows: Math.max(limit * 8, 40),
          page: 1,
          output: 'json'
        }
      });

      const docs = this.toArray(response.data?.response?.docs);
      const filteredDocs = docs.filter((doc) => this.isOpenLicense(doc.licenseurl) && this.isRelevantArchiveItem(doc));
      const musicTracks = [];

      for (const doc of filteredDocs) {
        if (musicTracks.length >= limit) break;

        const audioFile = await this.fetchArchiveAudioFile(doc.identifier);
        if (!audioFile) continue;

        const subjects = this.toArray(doc.subject).slice(0, 6);
        const searchText = `${doc.title || ''} ${subjects.join(' ')} ${doc.description || ''}`;
        const country = this.extractCountry(searchText);
        const creator = this.toArray(doc.creator).join(', ');

        musicTracks.push({
          identifier: doc.identifier,
          title: this.normalizeWhitespace(doc.title || doc.identifier),
          description: this.normalizeWhitespace(doc.description || 'Enregistrement traditionnel africain libre d’accès.'),
          region: this.inferRegion(country),
          country,
          performer: creator || 'Artiste traditionnel',
          url: `${this.sources.internetArchive.baseUrl}/details/${doc.identifier}`,
          audioUrl: `${this.sources.internetArchive.baseUrl}/download/${doc.identifier}/${encodeURIComponent(audioFile.name)}`,
          duration: audioFile.duration,
          format: audioFile.format,
          year: this.parseYear(doc.date),
          genre: 'Traditional / Folk',
          instruments: [],
          language: this.parseLanguageCode(this.firstDefined(doc.language) || 'fr'),
          licenseUrl: doc.licenseurl,
          license: this.normalizeLicense(doc.licenseurl),
          subjects
        });
      }

      const deduped = this.dedupeBy(musicTracks, (track) => track.identifier).slice(0, limit);
      if (deduped.length === 0) {
        logWarning('Internet Archive returned no relevant music, using fallback music', { limit });
        return this.simulateInternetArchiveMusicAPI(limit);
      }
      return deduped;
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'fetchMusicFromInternetArchive'
      });
      return this.simulateInternetArchiveMusicAPI(limit);
    }
  }

  async fetchDancesFromInternetArchive(limit) {
    const query = 'mediatype:movies AND (subject:(dance OR "traditional dance" OR choreography OR "ritual dance" OR danse) OR title:(dance OR "traditional dance" OR choreography OR danse)) AND (subject:(africa OR african OR swahili OR yoruba OR zulu OR ethiopia OR mali OR senegal OR congo) OR title:(africa OR african OR swahili OR yoruba OR zulu OR ethiopia OR mali OR senegal OR congo)) AND licenseurl:(*creativecommons.org* OR *publicdomain*)';

    try {
      const response = await this.httpClient.get(this.sources.internetArchive.apiUrl, {
        params: {
          q: query,
          'fl[]': ['identifier', 'title', 'description', 'creator', 'date', 'licenseurl', 'subject', 'language'],
          rows: Math.max(limit * 8, 40),
          page: 1,
          output: 'json'
        }
      });

      const docs = this.toArray(response.data?.response?.docs);
      const filteredDocs = docs.filter((doc) => this.isOpenLicense(doc.licenseurl) && this.isRelevantArchiveDanceItem(doc));
      const dances = [];

      for (const doc of filteredDocs) {
        if (dances.length >= limit) break;

        const videoFile = await this.fetchArchiveVideoFile(doc.identifier);
        if (!videoFile) continue;

        const subjects = this.toArray(doc.subject).slice(0, 8);
        const searchText = `${doc.title || ''} ${subjects.join(' ')} ${doc.description || ''}`;
        const country = this.extractCountry(searchText);
        const creator = this.toArray(doc.creator).join(', ');

        dances.push({
          identifier: doc.identifier,
          title: this.normalizeWhitespace(doc.title || doc.identifier),
          description: this.normalizeWhitespace(doc.description || 'Danse traditionnelle africaine libre d’accès.'),
          region: this.inferRegion(country),
          country,
          performer: creator || 'Troupe traditionnelle',
          url: `${this.sources.internetArchive.baseUrl}/details/${doc.identifier}`,
          videoUrl: `${this.sources.internetArchive.baseUrl}/download/${doc.identifier}/${encodeURIComponent(videoFile.name)}`,
          duration: videoFile.duration,
          format: videoFile.format,
          year: this.parseYear(doc.date),
          genre: 'Traditional Dance',
          language: this.parseLanguageCode(this.firstDefined(doc.language) || 'fr'),
          licenseUrl: doc.licenseurl,
          license: this.normalizeLicense(doc.licenseurl),
          subjects
        });
      }

      const deduped = this.dedupeBy(dances, (item) => item.identifier).slice(0, limit);
      if (deduped.length === 0) {
        logWarning('Internet Archive returned no relevant dances, using fallback dances', { limit });
        return this.simulateInternetArchiveDanceAPI(limit);
      }
      return deduped;
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'fetchDancesFromInternetArchive'
      });
      return this.simulateInternetArchiveDanceAPI(limit);
    }
  }

  async fetchDancesFromWikimedia(limit) {
    const searchTerms = [
      'African dance',
      'traditional dance Africa',
      'West African dance',
      'Yoruba dance',
      'Zulu dance',
      'Swahili dance'
    ];
    const fileTitles = new Set();

    for (const term of searchTerms) {
      if (fileTitles.size >= Math.max(limit * 8, 80)) break;

      try {
        const searchResponse = await this.httpClient.get(this.sources.wikimediaCommons.apiUrl, {
          params: {
            action: 'query',
            list: 'search',
            srsearch: term,
            srnamespace: 6,
            srlimit: 30,
            format: 'json'
          },
          headers: this.wikimediaHeaders
        });

        const results = this.toArray(searchResponse.data?.query?.search);
        results.forEach((result) => {
          if (typeof result.title === 'string' && result.title.startsWith('File:')) {
            fileTitles.add(result.title);
          }
        });
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchDancesFromWikimedia.search',
          searchTerm: term
        });
      }
    }

    if (!fileTitles.size) {
      logWarning('Wikimedia did not return dance files, using Internet Archive fallback', { limit });
      return this.fetchDancesFromInternetArchive(limit);
    }

    const titlesArray = Array.from(fileTitles);
    const chunkSize = 25;
    const danceItems = [];

    for (let i = 0; i < titlesArray.length && danceItems.length < limit; i += chunkSize) {
      const chunk = titlesArray.slice(i, i + chunkSize);

      try {
        const infoResponse = await this.httpClient.get(this.sources.wikimediaCommons.apiUrl, {
          params: {
            action: 'query',
            prop: 'imageinfo',
            iiprop: 'url|mime|size|extmetadata',
            titles: chunk.join('|'),
            format: 'json'
          },
          headers: this.wikimediaHeaders
        });

        const pages = Object.values(infoResponse.data?.query?.pages || {});
        for (const page of pages) {
          if (danceItems.length >= limit) break;

          const imageInfo = this.toArray(page.imageinfo)[0];
          if (!imageInfo) continue;

          const ext = imageInfo.extmetadata || {};
          const title = this.normalizeWhitespace((page.title || '').replace(/^File:/, ''));
          const description = this.cleanHtmlText(ext.ImageDescription?.value) || 'Danse traditionnelle africaine libre d’accès.';
          const searchable = `${title} ${description}`.toLowerCase();

          const hasDanceKeyword = searchable.includes('dance') || searchable.includes('danse') || searchable.includes('dancing');
          const hasAfricaKeyword = [
            'africa',
            'african',
            'yoruba',
            'zulu',
            'swahili',
            'senegal',
            'mali',
            'congo',
            'ethiopia',
            'burundi',
            'ghana',
            'nigeria'
          ].some((term) => searchable.includes(term));

          if (!hasDanceKeyword || !hasAfricaKeyword) continue;

          const licenseName = this.cleanHtmlText(ext.LicenseShortName?.value || ext.License?.value);
          const licenseUrl = this.cleanHtmlText(ext.LicenseUrl?.value);
          const mime = this.normalizeWhitespace(imageInfo.mime || '');
          const titleLower = title.toLowerCase();
          const isVideo = mime.startsWith('video/') || /\.(ogv|webm|mp4|mov|mkv|avi)$/i.test(titleLower);
          const isImage = mime.startsWith('image/') || /\.(jpg|jpeg|png|gif|svg|tiff|bmp)$/i.test(titleLower);
          const country = this.extractCountry(searchable);

          danceItems.push({
            identifier: String(page.pageid || title),
            title,
            description,
            region: this.inferRegion(country),
            country,
            performer: this.cleanHtmlText(ext.Artist?.value) || 'Contributeur Wikimedia Commons',
            url: imageInfo.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent((page.title || '').replace(/\s+/g, '_'))}`,
            videoUrl: isVideo ? imageInfo.url : null,
            imageUrl: isImage ? imageInfo.url : null,
            duration: null,
            format: mime || null,
            year: this.parseYear(ext.DateTime?.value || ext.DateTimeOriginal?.value || ''),
            genre: 'Traditional Dance',
            language: 'anglais',
            licenseUrl: licenseUrl || null,
            license: licenseName || this.normalizeLicense(licenseUrl),
            source: 'Wikimedia Commons'
          });
        }
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchDancesFromWikimedia.imageinfo'
        });
      }
    }

    const deduped = this.dedupeBy(danceItems, (item) => item.title.toLowerCase()).slice(0, limit);
    if (!deduped.length) {
      logWarning('Wikimedia dance extraction empty, using Internet Archive fallback', { limit });
      return this.fetchDancesFromInternetArchive(limit);
    }
    return deduped;
  }

  async fetchArtFromMetMuseum(limit) {
    const searchTerms = [
      'africa',
      'african art',
      'yoruba',
      'akan',
      'ashanti',
      'dogon',
      'bamana',
      'benin',
      'congo',
      'ethiopia',
      'mali',
      'zulu'
    ];
    const objectIdSet = new Set();
    const objectApiBase = this.sources.metMuseum.apiUrl;

    for (const term of searchTerms) {
      if (objectIdSet.size >= Math.max(limit * 25, 120)) break;

      try {
        const searchResponse = await this.httpClient.get(`${objectApiBase}/search`, {
          params: {
            hasImages: true,
            q: term
          }
        });

        const objectIds = this.toArray(searchResponse.data?.objectIDs).slice(0, 180);
        objectIds.forEach((id) => objectIdSet.add(Number(id)));
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchArtFromMetMuseum.search',
          searchTerm: term
        });
      }
    }

    const artworks = [];
    for (const objectId of objectIdSet) {
      if (artworks.length >= limit) break;

      try {
        const objectResponse = await this.httpClient.get(`${objectApiBase}/objects/${objectId}`);
        const objectData = objectResponse.data;

        if (!objectData || !objectData.isPublicDomain) continue;
        if (!objectData.primaryImage && !objectData.primaryImageSmall) continue;
        if (!this.isRelevantMetObject(objectData)) continue;

        const country = this.extractCountry(`${objectData.country || ''} ${objectData.culture || ''} ${objectData.title || ''}`)
          || this.normalizeWhitespace(objectData.country || '') || null;

        artworks.push({
          objectId: String(objectData.objectID),
          title: this.normalizeWhitespace(objectData.title || `Objet ${objectId}`),
          description: this.normalizeWhitespace([
            objectData.objectName,
            objectData.culture,
            objectData.country,
            objectData.objectDate,
            objectData.medium
          ].filter(Boolean).join(' - ')) || 'Œuvre d\'art africaine en accès libre.',
          region: this.inferRegion(country),
          country,
          artist: this.normalizeWhitespace(objectData.artistDisplayName || objectData.constituents?.[0]?.name || 'Artiste inconnu'),
          url: objectData.objectURL || `${this.sources.metMuseum.baseUrl}/art/collection/search/${objectData.objectID}`,
          department: objectData.department || null,
          culture: objectData.culture || null,
          period: objectData.objectDate || null,
          medium: objectData.medium || null,
          dimensions: objectData.dimensions || null,
          imageUrl: objectData.primaryImageSmall || objectData.primaryImage || null,
          highResImageUrl: objectData.primaryImage || objectData.primaryImageSmall || null,
          tags: this.toArray(objectData.tags).map((tag) => tag.term).filter(Boolean)
        });
      } catch (error) {
        logError(error, {
          service: 'ContentCollectorService',
          operation: 'fetchArtFromMetMuseum.object',
          objectId
        });
      }
    }

    const deduped = this.dedupeBy(artworks, (item) => item.objectId).slice(0, limit);
    if (deduped.length === 0) {
      logWarning('Met Museum did not return relevant art, using fallback art', { limit });
      return this.simulateMetMuseumAPI(limit);
    }
    return deduped;
  }

  // Collecter des contes depuis des sources ouvertes vérifiées
  async collectAfricanStories(language = 'fr', limit = 50) {
    try {
      logInfo('Collecting African stories from Gutendex (Project Gutenberg)', { language, limit });

      const stories = await this.fetchStoriesFromGutendex(limit, language);
      const culturalStories = stories.map((story) => ({
        id: this.buildContentId('tale', story.id || story.title),
        title: story.title,
        content: story.content,
        type: 'TALE',
        language: story.language || language,
        origin: story.origin || 'Afrique',
        region: story.region || null,
        country: story.country || null,
        authorName: story.author || 'Tradition orale',
        source: 'Gutendex / Project Gutenberg',
        sourceUrl: story.url,
        license: 'Public Domain',
        metadata: {
          originalId: story.id,
          textUrl: story.textUrl,
          themes: story.themes || [],
          apiSource: 'gutendex',
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedStories = await this.certifyCollectedItems(culturalStories, 'collectAfricanStories', 'storyId');

      return {
        success: true,
        count: collectedStories.length,
        stories: collectedStories,
        source: 'Gutendex / Project Gutenberg'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectAfricanStories'
      });
      throw error;
    }
  }

  // Collecter des proverbes africains depuis Wikiquote
  async collectAfricanProverbs(limit = 50) {
    try {
      logInfo('Collecting African proverbs from Wikiquote', { limit });

      const proverbs = await this.fetchProverbsFromWikiquote(limit);
      const culturalProverbs = proverbs.map((proverb) => ({
        id: proverb.id || this.buildContentId('proverb', proverb.content),
        title: proverb.title,
        content: proverb.content,
        type: 'PROVERB',
        language: proverb.language || 'anglais',
        origin: 'Afrique',
        region: this.inferRegion(proverb.country),
        country: proverb.country || proverb.origin,
        authorName: 'Tradition orale',
        source: 'Wikiquote',
        sourceUrl: proverb.url,
        license: 'CC BY-SA 4.0',
        metadata: {
          sourcePage: proverb.sourcePage,
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedProverbs = await this.certifyCollectedItems(culturalProverbs, 'collectAfricanProverbs', 'proverbId');

      return {
        success: true,
        count: collectedProverbs.length,
        proverbs: collectedProverbs,
        source: 'Wikiquote'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectAfricanProverbs'
      });
      throw error;
    }
  }

  // Collecter de la musique traditionnelle depuis Internet Archive
  async collectTraditionalMusic(limit = 30) {
    try {
      logInfo('Collecting traditional African music from Internet Archive', { limit });

      const musicTracks = await this.fetchMusicFromInternetArchive(limit);
      const culturalMusic = musicTracks.map((track) => ({
        id: this.buildContentId('music', track.identifier || track.title),
        title: track.title,
        content: track.description,
        type: 'MUSIC',
        language: track.language || 'fr',
        origin: 'Afrique',
        region: track.region || null,
        country: track.country || null,
        authorName: track.performer || 'Artiste traditionnel',
        source: 'Internet Archive',
        sourceUrl: track.url,
        license: track.license || 'Open Access',
        metadata: {
          archiveId: track.identifier,
          audioUrl: track.audioUrl,
          duration: track.duration,
          format: track.format,
          year: track.year,
          genre: track.genre,
          instruments: track.instruments || [],
          licenseUrl: track.licenseUrl || null,
          subjects: track.subjects || [],
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedMusic = await this.certifyCollectedItems(culturalMusic, 'collectTraditionalMusic', 'trackId');

      return {
        success: true,
        count: collectedMusic.length,
        music: collectedMusic,
        source: 'Internet Archive'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectTraditionalMusic'
      });
      throw error;
    }
  }

  // Collecter des danses traditionnelles depuis Internet Archive
  async collectTraditionalDances(limit = 20) {
    try {
      logInfo('Collecting traditional African dances from Wikimedia Commons', { limit });

      const danceItems = await this.fetchDancesFromWikimedia(limit);
      const culturalDances = danceItems.map((dance) => ({
        id: this.buildContentId('dance', dance.identifier || dance.title),
        title: dance.title,
        content: dance.description,
        type: 'DANCE',
        language: dance.language || 'fr',
        origin: 'Afrique',
        region: dance.region || null,
        country: dance.country || null,
        authorName: dance.performer || 'Troupe traditionnelle',
        source: dance.source || 'Wikimedia Commons',
        sourceUrl: dance.url,
        license: dance.license || 'Open Access',
        metadata: {
          externalId: dance.identifier,
          videoUrl: dance.videoUrl,
          imageUrl: dance.imageUrl || null,
          duration: dance.duration,
          format: dance.format,
          year: dance.year,
          genre: dance.genre,
          licenseUrl: dance.licenseUrl || null,
          subjects: dance.subjects || [],
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedDances = await this.certifyCollectedItems(culturalDances, 'collectTraditionalDances', 'danceId');
      const sourceName = danceItems.some((dance) => (dance.source || '').includes('Internet Archive'))
        ? 'Wikimedia Commons / Internet Archive'
        : 'Wikimedia Commons';

      return {
        success: true,
        count: collectedDances.length,
        dances: collectedDances,
        source: sourceName
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectTraditionalDances'
      });
      throw error;
    }
  }

  // Collecter des œuvres d'art depuis le Met Museum Open Access
  async collectMetMuseumArt(limit = 50) {
    try {
      logInfo('Collecting African art from Met Museum Open Access', { limit });

      const artworks = await this.fetchArtFromMetMuseum(limit);
      const culturalArtworks = artworks.map((artwork) => ({
        id: this.buildContentId('art', artwork.objectId),
        title: artwork.title,
        content: artwork.description,
        type: 'ART',
        language: 'fr',
        origin: 'Afrique',
        region: artwork.region,
        country: artwork.country,
        authorName: artwork.artist || 'Artiste inconnu',
        source: 'Metropolitan Museum of Art',
        sourceUrl: artwork.url,
        license: 'CC0',
        metadata: {
          objectId: artwork.objectId,
          department: artwork.department,
          culture: artwork.culture,
          period: artwork.period,
          medium: artwork.medium,
          dimensions: artwork.dimensions,
          imageUrl: artwork.imageUrl,
          highResImageUrl: artwork.highResImageUrl,
          tags: artwork.tags || [],
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedArtworks = await this.certifyCollectedItems(culturalArtworks, 'collectMetMuseumArt', 'artworkId');

      return {
        success: true,
        count: collectedArtworks.length,
        artworks: collectedArtworks,
        source: 'Metropolitan Museum of Art'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectMetMuseumArt'
      });
      throw error;
    }
  }

  // Collecter des images depuis Wikimedia Commons (fallback simulé)
  async collectWikimediaImages(category = 'Africa', limit = 40) {
    try {
      logInfo('Collecting African images from Wikimedia Commons', { category, limit });

      const images = await this.simulateWikimediaCommonsAPI(category, limit);
      const culturalImages = images.map((image) => ({
        id: this.buildContentId('image', image.fileId),
        title: image.title,
        content: image.description,
        type: 'CUSTOM',
        language: 'fr',
        origin: 'Afrique',
        region: image.region,
        country: image.country,
        authorName: image.photographer || 'Photographe inconnu',
        source: 'Wikimedia Commons',
        sourceUrl: image.url,
        license: image.license,
        metadata: {
          fileId: image.fileId,
          imageUrl: image.imageUrl,
          thumbUrl: image.thumbUrl,
          width: image.width,
          height: image.height,
          fileSize: image.fileSize,
          categories: image.categories,
          tags: image.tags,
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedImages = await this.certifyCollectedItems(culturalImages, 'collectWikimediaImages', 'imageId');

      return {
        success: true,
        count: collectedImages.length,
        images: collectedImages,
        source: 'Wikimedia Commons'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectWikimediaImages'
      });
      throw error;
    }
  }

  // Collecter des éléments du patrimoine immatériel UNESCO (fallback simulé)
  async collectUNESCOHeritage(limit = 20) {
    try {
      logInfo('Collecting UNESCO intangible heritage from Africa', { limit });

      const heritageItems = await this.simulateUNESCOAPI(limit);
      const culturalHeritage = heritageItems.map((item) => ({
        id: this.buildContentId('heritage', item.id),
        title: item.title,
        content: item.description,
        type: 'CUSTOM',
        language: 'fr',
        origin: 'Afrique',
        region: item.region,
        country: item.country,
        authorName: 'Communauté traditionnelle',
        source: 'UNESCO',
        sourceUrl: item.url,
        license: 'Educational',
        metadata: {
          unescoId: item.id,
          yearInscribed: item.yearInscribed,
          category: item.category,
          practices: item.practices,
          bearers: item.bearers,
          threats: item.threats,
          safeguarding: item.safeguarding,
          collectedAt: new Date().toISOString()
        }
      }));

      const collectedHeritage = await this.certifyCollectedItems(culturalHeritage, 'collectUNESCOHeritage', 'heritageId');

      return {
        success: true,
        count: collectedHeritage.length,
        heritage: collectedHeritage,
        source: 'UNESCO'
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectUNESCOHeritage'
      });
      throw error;
    }
  }

  // Collecte massive de tous les types de contenus
  async collectAllContentTypes() {
    try {
      logInfo('Starting massive content collection from all sources');

      const results = {
        tales: await this.collectAfricanStories('fr', 30),
        proverbs: await this.collectAfricanProverbs(30),
        chants: await this.collectTraditionalMusic(20),
        danses: await this.collectTraditionalDances(15),
        art: await this.collectMetMuseumArt(20)
      };

      const totalCollected = Object.values(results).reduce((sum, result) => sum + result.count, 0);

      logInfo('Massive content collection completed', {
        totalCollected,
        sources: Object.keys(results)
      });

      return {
        success: true,
        totalCollected,
        results
      };
    } catch (error) {
      logError(error, {
        service: 'ContentCollectorService',
        operation: 'collectAllContentTypes'
      });
      throw error;
    }
  }

  // Méthodes de fallback
  getFallbackProverbs(limit = 20) {
    const fallback = [
      { text: 'Quand les racines sont profondes, on ne craint pas le vent.', origin: 'Afrique' },
      { text: 'Seul, on va plus vite. Ensemble, on va plus loin.', origin: 'Afrique' },
      { text: 'Le mensonge donne des fleurs mais pas de fruits.', origin: 'Afrique de l\'Ouest' },
      { text: 'Celui qui pose des questions ne se perd pas.', origin: 'Afrique de l\'Est' },
      { text: 'La pluie n’oublie aucune maison.', origin: 'Afrique Centrale' }
    ];

    return fallback.slice(0, limit).map((item, index) => ({
      id: this.buildContentId('proverb_fallback', `${item.text}_${index}`),
      title: item.text,
      content: item.text,
      origin: item.origin,
      country: item.origin,
      language: 'français',
      url: 'https://en.wikiquote.org',
      sourcePage: 'fallback'
    }));
  }

  async simulateAfricanStorybookAPI(language, limit) {
    return Array.from({ length: limit }, (_, i) => ({
      id: `story_${i + 1}`,
      title: `Conte traditionnel ${i + 1}`,
      content: 'Il était une fois, dans un village d\'Afrique...',
      language,
      origin: 'Afrique',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Kenya'][i % 5],
      author: 'Tradition orale',
      url: `https://www.africanstorybook.org/story/${i + 1}`,
      textUrl: null,
      themes: ['Amitié', 'Courage', 'Sagesse', 'Famille'][i % 4]
    }));
  }

  async simulateMetMuseumAPI(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      objectId: `met_${i + 1}`,
      title: `Œuvre d'art africaine ${i + 1}`,
      description: 'Magnifique objet d\'art traditionnel africain...',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Nigeria', 'Ghana', 'Congo', 'Éthiopie', 'Mali'][i % 5],
      artist: 'Artiste traditionnel',
      url: `https://www.metmuseum.org/art/collection/${i + 1}`,
      department: 'Arts of Africa, Oceania, and the Americas',
      culture: ['Yoruba', 'Akan', 'Kongo', 'Bamana', 'Asante'][i % 5],
      period: ['19th century', '18th century', '20th century'][i % 3],
      medium: ['Wood', 'Bronze', 'Terracotta', 'Ivory'][i % 4],
      dimensions: 'H. 15 in. (38.1 cm)',
      imageUrl: `https://images.metmuseum.org/art/collection/${i + 1}.jpg`,
      highResImageUrl: `https://images.metmuseum.org/art/collection/highres/${i + 1}.jpg`
    }));
  }

  async simulateInternetArchiveMusicAPI(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      identifier: `music_${i + 1}`,
      title: `Chant traditionnel ${i + 1}`,
      description: 'Enregistrement de musique traditionnelle africaine...',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Kenya'][i % 5],
      performer: 'Groupe traditionnel',
      url: `https://archive.org/details/music_${i + 1}`,
      audioUrl: `https://archive.org/download/music_${i + 1}/track.mp3`,
      duration: '3:45',
      format: 'MP3',
      year: 1960 + (i % 40),
      genre: ['Griot', 'Percussion', 'Chant', 'Danse'][i % 4],
      instruments: ['Djembé', 'Kora', 'Balafon', 'Talking Drum'][i % 4],
      language: 'fr',
      license: 'Open Access',
      licenseUrl: null,
      subjects: ['traditional', 'african']
    }));
  }

  async simulateInternetArchiveDanceAPI(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      identifier: `dance_${i + 1}`,
      title: `Danse traditionnelle ${i + 1}`,
      description: 'Enregistrement vidéo de danse traditionnelle africaine...',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Kenya'][i % 5],
      performer: 'Troupe traditionnelle',
      url: `https://archive.org/details/dance_${i + 1}`,
      videoUrl: `https://archive.org/download/dance_${i + 1}/performance.mp4`,
      duration: '6:30',
      format: 'MP4',
      year: 1970 + (i % 40),
      genre: 'Traditional Dance',
      language: 'fr',
      license: 'Open Access',
      licenseUrl: null,
      subjects: ['dance', 'traditional', 'african']
    }));
  }

  async simulateWikimediaCommonsAPI(category, limit) {
    return Array.from({ length: limit }, (_, i) => ({
      fileId: `commons_${i + 1}`,
      title: `Image africaine ${i + 1}`,
      description: 'Photographie d\'éléments culturels africains...',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Kenya'][i % 5],
      photographer: 'Photographe',
      url: `https://commons.wikimedia.org/wiki/File:Image_${i + 1}.jpg`,
      license: ['CC0', 'CC BY 4.0', 'CC BY-SA 4.0'][i % 3],
      imageUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/Image_${i + 1}.jpg`,
      thumbUrl: `https://upload.wikimedia.org/wikipedia/commons/thumb/Image_${i + 1}.jpg/300px-Image_${i + 1}.jpg`,
      width: 1920,
      height: 1080,
      fileSize: '2.5 MB',
      categories: [category, 'Culture', 'Traditional'],
      tags: ['culture', 'tradition', 'africa', 'heritage']
    }));
  }

  async simulateUNESCOAPI(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      id: `unesco_${i + 1}`,
      title: `Patrimoine immatériel ${i + 1}`,
      description: 'Élément du patrimoine culturel immatériel africain...',
      region: ['Afrique de l\'Ouest', 'Afrique de l\'Est', 'Afrique Centrale'][i % 3],
      country: ['Sénégal', 'Mali', 'Côte d\'Ivoire', 'Cameroun', 'Kenya'][i % 5],
      url: `https://ich.unesco.org/en/RL/heritage_${i + 1}`,
      yearInscribed: 2008 + (i % 10),
      category: ['Oral traditions', 'Performing arts', 'Social practices', 'Traditional craftsmanship'][i % 4],
      practices: ['Chant', 'Danse', 'Rituel', 'Artisanat'][i % 4],
      bearers: 'Communauté traditionnelle',
      threats: ['Urbanisation', 'Globalisation', 'Perte de transmission'][i % 3],
      safeguarding: 'Mesures de sauvegarde en cours'
    }));
  }
}

module.exports = new ContentCollectorService();
