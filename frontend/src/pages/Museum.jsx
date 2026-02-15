import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { Search, Music, MapPin, User, Calendar } from 'lucide-react';
import { staticCulturalContent } from '../data/staticContent';
import { API_BASE_URL } from '../config/api';

export default function Museum() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'all', label: t('all'), color: 'var(--african-yellow)' },
    { value: 'conte', label: t('talesFilter'), color: 'var(--african-green)' },
    { value: 'proverbe', label: t('proverbs'), color: 'var(--african-red)' },
    { value: 'devinette', label: 'Devinettes', color: 'var(--african-gold)' },
    { value: 'chant', label: t('songs'), color: 'var(--african-gold)' },
    { value: 'danse', label: 'Danses', color: 'var(--african-earth)' },
    { value: 'artisanat', label: t('artFilter'), color: 'var(--african-yellow)' }
  ];

  const loadCulturalContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const [talesRes, proverbsRes, riddlesRes, musicRes, dancesRes, artRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cultural-content/tales`),
        fetch(`${API_BASE_URL}/cultural-content/proverbs`),
        fetch(`${API_BASE_URL}/cultural-content/cultural-riddles`),
        fetch(`${API_BASE_URL}/cultural-content/music`),
        fetch(`${API_BASE_URL}/cultural-content/dances`),
        fetch(`${API_BASE_URL}/cultural-content/art`)
      ]);

      const [talesData, proverbsData, riddlesData, musicData, dancesData, artData] = await Promise.all([
        talesRes.json(),
        proverbsRes.json(),
        riddlesRes.json(),
        musicRes.json(),
        dancesRes.json(),
        artRes.json()
      ]);

      const allItems = [
        ...(talesData.data?.tales || []).map((tale) => ({
          id: `tale-${tale.id || tale.title}`,
          title: tale.title,
          description: tale.content,
          content: tale.content,
          category: 'conte',
          location: tale.region || tale.culture || tale.origin,
          author_name: tale.culture || 'Tradition orale',
          source: tale.source,
          sourceUrl: tale.sourceUrl,
          createdAt: tale.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(proverbsData.data?.proverbs || []).map((proverb) => ({
          id: `proverb-${proverb.id || proverb.text}`,
          title: proverb.text,
          description: proverb.meaning,
          content: proverb.text,
          category: 'proverbe',
          location: proverb.region || proverb.culture || proverb.origin,
          author_name: proverb.culture || 'Sagesse traditionnelle',
          source: proverb.source,
          sourceUrl: proverb.sourceUrl,
          createdAt: proverb.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(riddlesData.data?.riddles || []).map((riddle) => ({
          id: `riddle-${riddle.id || riddle.question}`,
          title: riddle.question,
          description: riddle.answer,
          content: `${riddle.question} - ${riddle.answer}`,
          category: 'devinette',
          location: riddle.region || riddle.culture || riddle.origin,
          author_name: riddle.culture || 'Tradition orale',
          source: riddle.source,
          sourceUrl: riddle.sourceUrl,
          createdAt: riddle.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(musicData.data?.music || []).map((music) => ({
          id: `music-${music.id || music.title}`,
          title: music.title,
          description: music.description,
          content: music.description,
          category: 'chant',
          location: music.origin,
          author_name: music.artist || 'Communauté traditionnelle',
          source: music.source,
          sourceUrl: music.sourceUrl,
          imageUrl: music.imageUrl || null,
          videoUrl: music.videoUrl || null,
          audioUrl: music.audioUrl || null,
          ipfs_cid: music.ipfs_cid || null,
          createdAt: music.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(dancesData.data?.dances || []).map((dance) => ({
          id: `dance-${dance.id || dance.title}`,
          title: dance.title,
          description: dance.description,
          content: dance.description,
          category: 'danse',
          location: dance.origin,
          author_name: dance.artist || 'Troupe traditionnelle',
          source: dance.source,
          sourceUrl: dance.sourceUrl,
          imageUrl: dance.imageUrl || null,
          videoUrl: dance.videoUrl || null,
          audioUrl: dance.audioUrl || null,
          createdAt: dance.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(artData.data?.art || []).map((art) => ({
          id: `art-${art.id || art.title}`,
          title: art.title,
          description: art.description,
          content: art.description,
          category: 'artisanat',
          location: art.origin,
          author_name: art.artist || 'Artisans traditionnels',
          source: art.source,
          sourceUrl: art.sourceUrl,
          imageUrl: art.imageUrl || null,
          videoUrl: art.videoUrl || null,
          audioUrl: art.audioUrl || null,
          createdAt: art.createdAt,
          timestamp: new Date().toISOString()
        }))
      ];

      setItems(allItems);
      setFilteredItems(allItems);
    } catch (err) {
      console.error('Erreur lors du chargement du contenu culturel:', err);

      const fallbackItems = staticCulturalContent.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        content: item.content,
        location: item.origin,
        author_name: item.artist || item.author || 'Tradition orale',
        source: item.source,
        sourceUrl: item.sourceUrl,
        imageUrl: item.image || null,
        videoUrl: item.video || null,
        audioUrl: item.audio || null,
        createdAt: item.createdAt,
        timestamp: item.createdAt
      }));

      setItems(fallbackItems);
      setFilteredItems(fallbackItems);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCulturalContent();
  }, []);

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

  const getItemMediaUrl = (item) => {
    if (item.videoUrl || item.video) return item.videoUrl || item.video;
    if (item.imageUrl || item.image) return item.imageUrl || item.image;
    if (item.audioUrl || item.audio) return item.audioUrl || item.audio;
    if (item.ipfs_cid) return `https://ipfs.io/ipfs/${item.ipfs_cid}`;
    return null;
  };

  const getMediaType = (item) => {
    const mediaUrl = getItemMediaUrl(item);
    if (!mediaUrl) return 'text';

    const normalizedUrl = mediaUrl.toLowerCase();
    if (item.videoUrl || item.video || /\.(mp4|webm|ogg|mov|m3u8)($|\?)/.test(normalizedUrl)) return 'video';
    if (item.imageUrl || item.image || /\.(png|jpe?g|webp|gif|svg)($|\?)/.test(normalizedUrl)) return 'image';
    if (item.audioUrl || item.audio || item.ipfs_cid || /\.(mp3|wav|ogg|aac|m4a|flac)($|\?)/.test(normalizedUrl)) return 'audio';
    if (/\.pdf($|\?)/.test(normalizedUrl)) return 'pdf';
    return 'text';
  };

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
                const mediaType = getMediaType(item);
                const mediaUrl = getItemMediaUrl(item);
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
                  >
                    <div className="reel-media-layer">
                      {mediaType === 'video' && mediaUrl && (
                        <video
                          src={mediaUrl}
                          className="reel-video"
                          autoPlay
                          muted
                          loop
                          playsInline
                          controls
                        />
                      )}

                      {mediaType === 'image' && mediaUrl && (
                        <img
                          src={mediaUrl}
                          alt={item.title}
                          className="reel-image"
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';
                          }}
                        />
                      )}

                      {mediaType === 'audio' && mediaUrl && (
                        <div className="reel-audio-stage">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.title} className="reel-image dimmed" />
                          ) : (
                            <div className="audio-gradient">
                              <Music size={48} />
                            </div>
                          )}
                          <div className="audio-controls">
                            <audio controls preload="none" src={mediaUrl} />
                          </div>
                        </div>
                      )}

                      {mediaType === 'pdf' && mediaUrl && (
                        <iframe title={item.title} src={mediaUrl} className="reel-pdf" />
                      )}

                      {mediaType === 'text' && (
                        <div className="reel-text-stage">
                          <div className="text-mark">"</div>
                          <p>{item.content || item.description || item.title}</p>
                        </div>
                      )}
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
                          <span>{item.author_name || item.artist || 'Tradition orale'}</span>
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
