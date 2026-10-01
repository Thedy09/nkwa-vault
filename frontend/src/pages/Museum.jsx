import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { Search, Music, MapPin, User, Calendar, Play } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import ReelViewer from '../components/social/ReelViewer';

function archiveKind(item) {
  if (item.videoUrl || item.video) return 'video';
  if (item.audioUrl || item.audio || item.ipfs_cid) return 'audio';
  const url = String(item.imageUrl || item.image || item.videoUrl || '').toLowerCase();
  if (/\.pdf($|\?)/.test(url)) return 'page';
  if (item.imageUrl || item.image) return 'image';
  return 'text';
}

function archiveReel(item) {
  const kind = archiveKind(item);
  const src = kind === 'video'
    ? (item.videoUrl || item.video)
    : kind === 'audio'
      ? (item.audioUrl || item.audio || (item.ipfs_cid ? `https://ipfs.io/ipfs/${item.ipfs_cid}` : ''))
      : kind === 'page'
        ? (item.imageUrl || item.image)
        : (item.imageUrl || item.image || '');
  return {
    id: item.id,
    kind,
    src: src || '',
    poster: item.posterUrl || item.imageUrl || item.image || '',
    body: item.description || item.content || item.title || '',
    origin: item.location || '',
    language: item.language || '',
    translations: item.translations || null,
    author: item.sourceTitle || item.credit || item.location || 'Ressource vérifiée',
    username: '',
    credit: item.credit || ''
  };
}

export default function Museum({ onOpenArticle }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeReel, setActiveReel] = useState(-1);

  const categories = [
    { value: 'all', label: t('all'), color: 'var(--african-yellow)' },
    { value: 'conte', label: t('talesFilter'), color: 'var(--african-green)' },
    { value: 'proverbe', label: t('proverbs'), color: 'var(--african-red)' },
    { value: 'devinette', label: 'Devinettes', color: 'var(--african-gold)' },
    { value: 'chant', label: t('songs'), color: 'var(--african-gold)' },
    { value: 'artisanat', label: t('artFilter'), color: 'var(--african-yellow)' }
  ];

  const mapArchiveCategory = (category) => {
    if (category === 'musique') return 'chant';
    if (category === 'art') return 'artisanat';
    return category;
  };

  const loadCulturalContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/api/social/explore?heritage=1&limit=50`);
      const payload = await response.json();
      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Archives indisponibles');
      }

      const allItems = (payload.data?.posts || []).map((post) => {
        const title = String(post.body || '').split('\n')[0].slice(0, 90);
        return {
          id: post.id,
          title,
          description: post.body,
          content: post.body,
          category: mapArchiveCategory(post.category),
          location: post.origin,
          author_name: post.sourceTitle || post.origin || 'Ressource vérifiée',
          language: post.language || '',
          translations: post.translations || null,
          source: post.sourceTitle || 'Ressource vérifiée',
          imageUrl: post.imageUrl || null,
          videoUrl: post.videoUrl || null,
          audioUrl: post.audioUrl || null,
          posterUrl: post.posterUrl || post.imageUrl || null,
          sourceUrl: post.sourceUrl || null,
          sourceTitle: post.sourceTitle || '',
          categoryRaw: post.category,
          credit: post.sourceTitle || '',
          createdAt: post.createdAt,
          timestamp: post.createdAt
        };
      });

      setItems(allItems);
      setFilteredItems(allItems);
    } catch (err) {
      console.error('Erreur lors du chargement des archives:', err);
      setItems([]);
      setFilteredItems([]);
      setError('Les archives sont momentanément indisponibles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCulturalContent();
    // Chargement initial unique. loadCulturalContent est recréée à chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setActiveReel(-1);
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        (item.title || '').toLowerCase().includes(q)
        || (item.description || '').toLowerCase().includes(q)
        || (item.content || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory]);

  const formatDate = (timestamp) => new Date(timestamp).toLocaleDateString('fr-FR');

  return (
    <div className="museum">
      <motion.div
        className="museum-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <h1 className="museum-title">
            <Music size={34} />
            {t('museumTitle')}
          </h1>
          <p className="museum-subtitle">{t('museumSubtitle')}</p>
        </div>
      </motion.div>

      <motion.div
        className="museum-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="container">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`category-filter ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="museum-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="container">
          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Chargement du contenu culturel...</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <p>{error}</p>
              <button onClick={loadCulturalContent} className="retry-button">
                Réessayer
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="items-feed">
              {filteredItems.map((item, index) => {
                const mediaType = archiveKind(item);
                const poster = item.posterUrl || item.imageUrl;
                const categoryLabel = categories.find((c) => c.value === item.category)?.label || item.category;
                const categoryColor = categories.find((c) => c.value === item.category)?.color || 'var(--african-yellow)';

                return (
                  <motion.article
                    key={item.id}
                    className="reel-card"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.05, 0.35), duration: 0.4 }}
                    layout
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      const isArticle = item.sourceUrl && !item.videoUrl && !item.audioUrl;
                      if (isArticle && onOpenArticle) {
                        onOpenArticle({
                          id: item.id,
                          title: item.title,
                          body: item.description,
                          origin: item.location,
                          category: item.categoryRaw || item.category,
                          sourceTitle: item.sourceTitle,
                          sourceUrl: item.sourceUrl,
                          authorName: item.author_name
                        });
                        return;
                      }
                      setActiveReel(index);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        const isArticle = item.sourceUrl && !item.videoUrl && !item.audioUrl;
                        if (isArticle && onOpenArticle) {
                          onOpenArticle({
                            id: item.id,
                            title: item.title,
                            body: item.description,
                            origin: item.location,
                            category: item.categoryRaw || item.category,
                            sourceTitle: item.sourceTitle,
                            sourceUrl: item.sourceUrl,
                            authorName: item.author_name
                          });
                          return;
                        }
                        setActiveReel(index);
                      }
                    }}
                  >
                    <div className="reel-media-layer">
                      {(mediaType === 'video' || mediaType === 'image' || mediaType === 'page') && poster && (
                        <img
                          src={poster}
                          alt={item.title}
                          className="reel-image"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      )}

                      {mediaType === 'audio' && (
                        <div className="reel-audio-stage">
                          {poster ? (
                            <img src={poster} alt={item.title} className="reel-image" />
                          ) : (
                            <div className="audio-gradient">
                              <Music size={48} />
                            </div>
                          )}
                        </div>
                      )}

                      {mediaType === 'text' && (
                        <div className="reel-text-stage">
                          <div className="text-mark">"</div>
                          <p>{item.content || item.description || item.title}</p>
                        </div>
                      )}
                      <span className="reel-open-badge" aria-hidden="true"><Play size={18} /></span>
                    </div>

                    <div className="reel-overlay">
                      <span className="item-category" style={{ backgroundColor: categoryColor }}>
                        {categoryLabel}
                      </span>
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>
                      <div className="item-meta">
                        <div className="meta-item">
                          <MapPin size={14} />
                          <span>{item.location || item.origin || 'Afrique'}</span>
                        </div>
                        <div className="meta-item">
                          <User size={14} />
                          <span>{item.sourceTitle || item.author_name || 'Ressource vérifiée'}</span>
                        </div>
                        <div className="meta-item">
                          <Calendar size={14} />
                          <span>{formatDate(item.createdAt || item.timestamp)}</span>
                        </div>
                      </div>
                      {item.source && <span className="source-pill">📚 {item.source}</span>}
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}

          {!loading && !error && filteredItems.length === 0 && (
            <div className="no-results">
              <Music size={64} />
              <h3>{t('noResults')}</h3>
              <p>{t('tryModifying')}</p>
            </div>
          )}
        </div>
      </motion.div>

      {activeReel >= 0 ? (
        <ReelViewer
          items={filteredItems.map(archiveReel)}
          index={activeReel}
          onClose={() => setActiveReel(-1)}
          onChangeIndex={setActiveReel}
        />
      ) : null}

      <style jsx>{`
        .museum {
          min-height: 100vh;
          padding: var(--spacing-lg) 0;
          user-select: none;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
        }

        .museum * {
          user-select: none;
          -webkit-user-select: none;
        }

        .museum-header {
          background: var(--gradient-dark);
          padding: var(--spacing-xl) 0;
          margin-bottom: var(--spacing-lg);
        }

        .museum-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
          color: var(--african-yellow);
        }

        .museum-subtitle {
          opacity: 0.85;
        }

        .museum-controls {
          margin-bottom: var(--spacing-lg);
        }

        .search-container {
          position: relative;
          margin-bottom: var(--spacing-sm);
          max-width: 640px;
        }

        .search-container svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--african-yellow);
          z-index: 1;
        }

        .search-input {
          width: 100%;
          padding: 12px 14px 12px 40px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          font-family: inherit;
          user-select: text;
          -webkit-user-select: text;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.12);
        }

        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .category-filter {
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          color: white;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .category-filter.active,
        .category-filter:hover {
          background: var(--african-yellow);
          color: var(--african-black);
          border-color: var(--african-yellow);
        }

        .museum-content .container {
          max-width: 680px;
        }

        .items-feed {
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-snap-type: y proximity;
        }

        .reel-card {
          position: relative;
          cursor: pointer;
          height: min(78vh, 760px);
          min-height: 520px;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: #131313;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
          scroll-snap-align: start;
        }

        .reel-media-layer {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #191919, #101010);
        }

        .reel-image,
        .reel-video,
        .reel-pdf {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border: none;
          display: block;
        }

        .reel-image.dimmed {
          filter: brightness(0.35);
        }

        .reel-audio-stage,
        .reel-text-stage {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 25% 20%, rgba(255, 215, 0, 0.26), rgba(0, 0, 0, 0.88));
        }

        .audio-gradient {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.88);
          background: radial-gradient(circle at 20% 20%, rgba(255, 215, 0, 0.3), rgba(0, 0, 0, 0.92));
        }

        .audio-controls {
          position: absolute;
          left: 16px;
          right: 16px;
          bottom: 130px;
          z-index: 2;
        }

        .audio-controls audio {
          width: 100%;
        }

        .reel-text-stage {
          flex-direction: column;
          gap: 8px;
          padding: 24px;
          text-align: center;
          color: rgba(255, 255, 255, 0.95);
        }

        .text-mark {
          font-size: 4rem;
          line-height: 1;
          opacity: 0.55;
          color: var(--african-yellow);
        }

        .reel-text-stage p {
          font-size: 1.2rem;
          line-height: 1.6;
          max-width: 90%;
        }

        .reel-open-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 4;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.85);
        }

        .reel-overlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 18px;
          background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.88) 45%, rgba(0, 0, 0, 0.98) 100%);
        }

        .item-category {
          display: inline-flex;
          align-items: center;
          border-radius: 999px;
          padding: 5px 10px;
          color: white;
          font-size: 0.74rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .item-title {
          margin: 0 0 6px 0;
          font-size: 1.25rem;
          color: #fff;
        }

        .item-description {
          margin: 0 0 10px 0;
          color: rgba(255, 255, 255, 0.88);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .item-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 14px;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.82);
          font-size: 0.86rem;
        }

        .meta-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          min-width: 0;
        }

        .meta-item span {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 180px;
        }

        .source-pill {
          display: inline-flex;
          align-items: center;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(255, 215, 0, 0.35);
          background: rgba(255, 215, 0, 0.16);
          color: var(--african-yellow);
          font-size: 0.8rem;
          font-weight: 600;
        }

        .loading-container,
        .error-container,
        .no-results {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          text-align: center;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 215, 0, 0.3);
          border-top: 3px solid var(--african-yellow);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: var(--spacing-md);
        }

        .retry-button {
          margin-top: var(--spacing-sm);
          padding: 10px 16px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          background: var(--gradient-primary);
          color: var(--african-black);
          font-weight: 600;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .museum-title {
            font-size: 1.9rem;
          }

          .museum-content .container {
            max-width: 100%;
            padding: 0 10px;
          }

          .reel-card {
            min-height: 72vh;
            border-radius: 14px;
          }

          .audio-controls {
            bottom: 120px;
          }
        }
      `}</style>
    </div>
  );
}
