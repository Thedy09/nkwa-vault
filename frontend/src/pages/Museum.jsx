import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { Search, Music, Play, Pause, MapPin, User, Calendar, X, Eye, ExternalLink } from 'lucide-react';
import { staticCulturalContent } from '../data/staticContent';
import { API_BASE_URL } from '../config/api';

export default function Museum() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeItem, setActiveItem] = useState(null);

  const categories = [
    { value: 'all', label: t('all'), color: 'var(--african-yellow)' },
    { value: 'conte', label: t('talesFilter'), color: 'var(--african-green)' },
    { value: 'proverbe', label: t('proverbs'), color: 'var(--african-red)' },
    { value: 'devinette', label: 'Devinettes', color: 'var(--african-gold)' },
    { value: 'chant', label: t('songs'), color: 'var(--african-gold)' },
    { value: 'danse', label: 'Danses', color: 'var(--african-earth)' },
    { value: 'artisanat', label: t('artFilter'), color: 'var(--african-yellow)' }
  ];

  // Fonction pour charger les contenus culturels depuis l'API
  const loadCulturalContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Chargement des contenus culturels
      
      // Charger tous les types de contenu en parallèle depuis les sources officielles
      const [talesRes, proverbsRes, riddlesRes, musicRes, dancesRes, artRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cultural-content/tales`),
        fetch(`${API_BASE_URL}/cultural-content/proverbs`),
        fetch(`${API_BASE_URL}/cultural-content/cultural-riddles`),
        fetch(`${API_BASE_URL}/cultural-content/music`),
        fetch(`${API_BASE_URL}/cultural-content/dances`),
        fetch(`${API_BASE_URL}/cultural-content/art`)
      ]);

      // Vérification des réponses API

      const [talesData, proverbsData, riddlesData, musicData, dancesData, artData] = await Promise.all([
        talesRes.json(),
        proverbsRes.json(),
        riddlesRes.json(),
        musicRes.json(),
        dancesRes.json(),
        artRes.json()
      ]);

      // Traitement des données reçues

      // Transformer les données pour un format uniforme
      const allItems = [
        ...(talesData.data?.tales || []).map(tale => ({
          id: `tale-${tale.title}`,
          title: tale.title,
          description: tale.content,
          category: 'conte',
          location: tale.region || tale.culture,
          author_name: tale.culture || 'Tradition orale',
          source: tale.source,
          sourceUrl: tale.sourceUrl,
          createdAt: tale.createdAt,
          timestamp: new Date().toISOString(),
          moral: tale.moral
        })),
        ...(proverbsData.data?.proverbs || []).map(proverb => ({
          id: `proverb-${proverb.text}`,
          title: proverb.text,
          description: proverb.meaning,
          category: 'proverbe',
          location: proverb.region || proverb.culture,
          author_name: proverb.culture || 'Sagesse traditionnelle',
          source: proverb.source,
          sourceUrl: proverb.sourceUrl,
          createdAt: proverb.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(riddlesData.data?.riddles || []).map(riddle => ({
          id: `riddle-${riddle.question}`,
          title: riddle.question,
          description: riddle.answer,
          category: 'devinette',
          location: riddle.region || riddle.culture,
          author_name: riddle.culture || 'Tradition orale',
          source: riddle.source,
          sourceUrl: riddle.sourceUrl,
          createdAt: riddle.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(musicData.data?.music || []).map(music => ({
          id: `music-${music.title}`,
          title: music.title,
          description: music.description,
          category: 'chant',
          location: music.origin,
          author_name: music.artist || 'Communauté traditionnelle',
          source: music.source,
          sourceUrl: music.sourceUrl,
          createdAt: music.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(dancesData.data?.dances || []).map(dance => ({
          id: `dance-${dance.id || dance.title}`,
          title: dance.title,
          description: dance.description,
          category: 'danse',
          location: dance.origin,
          author_name: dance.artist || 'Troupe traditionnelle',
          source: dance.source,
          sourceUrl: dance.sourceUrl,
          imageUrl: dance.imageUrl,
          videoUrl: dance.videoUrl,
          createdAt: dance.createdAt,
          timestamp: new Date().toISOString()
        })),
        ...(artData.data?.art || []).map(art => ({
          id: `art-${art.title}`,
          title: art.title,
          description: art.description,
          category: 'artisanat',
          location: art.origin,
          author_name: art.artist || 'Artisans traditionnels',
          source: art.source,
          sourceUrl: art.sourceUrl,
          createdAt: art.createdAt,
          timestamp: new Date().toISOString(),
          imageUrl: art.imageUrl
        }))
      ];

      // Mise à jour de l'état avec les données transformées
      
      setItems(allItems);
      setFilteredItems(allItems);
      
    } catch (err) {
      console.error('Erreur lors du chargement du contenu culturel:', err);
      // Utilisation des données statiques en cas d'échec
      
      // Utiliser les données statiques en cas d'échec de l'API
      const transformedItems = staticCulturalContent.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        description: item.description,
        content: item.content,
        origin: item.origin,
        image: item.image,
        audio: item.audio,
        video: item.video,
        tags: item.tags || [],
        likes: item.likes || 0,
        views: item.views || 0,
        createdAt: item.createdAt,
        // Champs spécifiques selon la catégorie
        ...(item.category === 'proverbe' && {
          meaning: item.meaning,
          language: item.language
        }),
        ...(item.category === 'devinette' && {
          answer: item.answer,
          explanation: item.explanation,
          difficulty: item.difficulty
        }),
        ...(item.category === 'chant' && {
          artist: item.artist,
          duration: item.duration
        }),
        ...(item.category === 'artisanat' && {
          artist: item.artist,
          technique: item.technique
        }),
        // Champs communs
        source: item.source,
        sourceUrl: item.sourceUrl
      }));
      
      setItems(transformedItems);
      setFilteredItems(transformedItems);
      setError(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCulturalContent();
  }, []);

  // Mise à jour des éléments filtrés
  useEffect(() => {
    // Logique de filtrage sera ajoutée ici si nécessaire
  }, [items, filteredItems]);

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory]);

  const toggleAudio = (itemId) => {
    setPlayingAudio(playingAudio === itemId ? null : itemId);
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('fr-FR');
  };

  const getItemMediaUrl = (item) => {
    if (item.image || item.imageUrl) return item.image || item.imageUrl;
    if (item.video || item.videoUrl) return item.video || item.videoUrl;
    if (item.audio || item.audioUrl) return item.audio || item.audioUrl;
    if (item.ipfs_cid) return `https://ipfs.io/ipfs/${item.ipfs_cid}`;
    return null;
  };

  const getMediaType = (item) => {
    const mediaUrl = getItemMediaUrl(item);
    if (!mediaUrl) return 'text';

    const normalizedUrl = mediaUrl.toLowerCase();
    if (item.image || item.imageUrl || /\.(png|jpe?g|webp|gif|svg)($|\?)/.test(normalizedUrl)) return 'image';
    if (item.video || item.videoUrl || /\.(mp4|webm|ogg|mov|m3u8)($|\?)/.test(normalizedUrl)) return 'video';
    if (item.audio || item.audioUrl || item.ipfs_cid || /\.(mp3|wav|ogg|aac|m4a|flac)($|\?)/.test(normalizedUrl)) return 'audio';
    if (/\.pdf($|\?)/.test(normalizedUrl)) return 'pdf';
    return 'text';
  };

  const openItemPreview = (item) => {
    setActiveItem(item);
  };

  const closeItemPreview = () => {
    setActiveItem(null);
  };

  return (
    <div className="museum">
      {/* Header */}
      <motion.div 
        className="museum-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <h1 className="museum-title">
            <Music size={40} />
            {t('museumTitle')}
          </h1>
          <p className="museum-subtitle">
            {t('museumSubtitle')}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div 
        className="museum-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className="container">
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            {categories.map(category => (
              <button
                key={category.value}
                className={`category-filter ${selectedCategory === category.value ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category.value)}
                style={{ '--category-color': category.color }}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Items Grid */}
      <motion.div 
        className="museum-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
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
                   <div>
                     <div className="data-info">
                       <p>📊 {items.length} éléments culturels chargés</p>
                       <p>💭 {items.filter(item => item.category === 'proverbe').length} proverbes</p>
                       <p>📚 {items.filter(item => item.category === 'conte').length} contes</p>
                       <p>🤔 {items.filter(item => item.category === 'devinette').length} devinettes</p>
                       <p>🎵 {items.filter(item => item.category === 'chant').length} musique</p>
                       <p>💃 {items.filter(item => item.category === 'danse').length} danses</p>
                       <p>🎨 {items.filter(item => item.category === 'artisanat').length} art</p>
                     </div>
              <div className="items-grid">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="museum-item"
                    onClick={() => openItemPreview(item)}
                    initial={{ opacity: 0, y: 50, rotateX: -10 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ 
                      delay: index * 0.15, 
                      duration: 0.8,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{ 
                      y: -10, 
                      scale: 1.03,
                      rotateY: 2,
                      boxShadow: "0 20px 40px rgba(255, 215, 0, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                    layout
                  >
                    <div className="item-header">
                      <div 
                        className="item-category"
                        style={{ backgroundColor: categories.find(c => c.value === item.category)?.color }}
                      >
                        {categories.find(c => c.value === item.category)?.label}
                      </div>
                    </div>

                    <div className="item-content">
                      {/* Affichage de l'image si disponible */}
                      {(item.image || item.imageUrl) && (
                        <div className="item-image-container">
                          <img 
                            src={item.image || item.imageUrl} 
                            alt={item.title}
                            className="item-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      
                      <h3 className="item-title">{item.title}</h3>
                      <p className="item-description">{item.description}</p>

                      <div className="item-meta">
                        <div className="meta-item">
                          <MapPin size={16} />
                          <span>{item.origin || item.location}</span>
                        </div>
                        <div className="meta-item">
                          <User size={16} />
                          <span>{item.artist || item.author_name}</span>
                        </div>
                        <div className="meta-item">
                          <Calendar size={16} />
                          <span>{formatDate(item.createdAt || item.timestamp)}</span>
                        </div>
                        {item.source && (
                          <div className="meta-item">
                            <span className="source-label">📚 {item.source}</span>
                          </div>
                        )}
                      </div>

                      <button
                        className="open-item-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openItemPreview(item);
                        }}
                      >
                        <Eye size={16} />
                        Ouvrir sur la plateforme
                      </button>
                    </div>

                    {item.ipfs_cid && (
                      <div className="item-media">
                        <div className="audio-player">
                          <motion.button
                            className="play-button"
                            onClick={(event) => {
                              event.stopPropagation();
                              toggleAudio(item.id);
                            }}
                            whileHover={{ 
                              scale: 1.1,
                              boxShadow: "0 10px 25px rgba(255, 215, 0, 0.4)"
                            }}
                            whileTap={{ scale: 0.9 }}
                            animate={playingAudio === item.id ? {
                              scale: [1, 1.1, 1],
                              boxShadow: [
                                "0 0 0 rgba(255, 215, 0, 0.4)",
                                "0 0 20px rgba(255, 215, 0, 0.6)",
                                "0 0 0 rgba(255, 215, 0, 0.4)"
                              ]
                            } : {}}
                            transition={{ 
                              duration: 1.5,
                              repeat: playingAudio === item.id ? Infinity : 0,
                              ease: "easeInOut"
                            }}
                          >
                            <motion.div
                              animate={playingAudio === item.id ? {
                                rotate: 360
                              } : {}}
                              transition={{ 
                                duration: 2,
                                repeat: playingAudio === item.id ? Infinity : 0,
                                ease: "linear"
                              }}
                            >
                              {playingAudio === item.id ? <Pause size={24} /> : <Play size={24} />}
                            </motion.div>
                          </motion.button>
                          <audio
                            src={`https://ipfs.io/ipfs/${item.ipfs_cid}`}
                            onEnded={() => setPlayingAudio(null)}
                            onPlay={() => setPlayingAudio(item.id)}
                          />
                          <span>{t('audioAvailable')}</span>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
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

      <AnimatePresence>
        {activeItem && (
          <motion.div
            className="content-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeItemPreview}
          >
            <motion.div
              className="content-modal"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="content-modal-header">
                <h3>{activeItem.title}</h3>
                <button className="close-preview-btn" onClick={closeItemPreview}>
                  <X size={18} />
                </button>
              </div>

              <div className="content-modal-body">
                {(() => {
                  const mediaType = getMediaType(activeItem);
                  const mediaUrl = getItemMediaUrl(activeItem);

                  if (mediaType === 'image' && mediaUrl) {
                    return <img src={mediaUrl} alt={activeItem.title} className="modal-media-image" />;
                  }
                  if (mediaType === 'video' && mediaUrl) {
                    return <video src={mediaUrl} controls className="modal-media-video" />;
                  }
                  if (mediaType === 'audio' && mediaUrl) {
                    return <audio src={mediaUrl} controls className="modal-media-audio" />;
                  }
                  if (mediaType === 'pdf' && mediaUrl) {
                    return <iframe title={activeItem.title} src={mediaUrl} className="modal-media-pdf" />;
                  }

                  return (
                    <div className="modal-text-content">
                      <p>{activeItem.description || 'Contenu textuel'}</p>
                    </div>
                  );
                })()}

                <div className="modal-meta">
                  <div className="modal-meta-row">
                    <MapPin size={16} />
                    <span>{activeItem.origin || activeItem.location || 'Afrique'}</span>
                  </div>
                  <div className="modal-meta-row">
                    <User size={16} />
                    <span>{activeItem.artist || activeItem.author_name || 'Tradition orale'}</span>
                  </div>
                  <div className="modal-meta-row">
                    <Calendar size={16} />
                    <span>{formatDate(activeItem.createdAt || activeItem.timestamp)}</span>
                  </div>
                  {activeItem.source && (
                    <div className="modal-meta-row">
                      <span className="modal-source-chip">📚 {activeItem.source}</span>
                    </div>
                  )}
                  {activeItem.sourceUrl && (
                    <a
                      href={activeItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-external-btn"
                    >
                      <ExternalLink size={16} />
                      Source originale
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .museum {
          min-height: 100vh;
          padding: var(--spacing-lg) 0;
        }

        .museum-header {
          background: var(--gradient-dark);
          padding: var(--spacing-xl) 0;
          margin-bottom: var(--spacing-lg);
        }

        .museum-title {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: var(--spacing-md);
          color: var(--african-yellow);
        }

        .museum-subtitle {
          font-size: 1.2rem;
          opacity: 0.8;
        }

        .museum-controls {
          margin-bottom: var(--spacing-lg);
        }

        .search-container {
          position: relative;
          margin-bottom: var(--spacing-md);
        }

        .search-container svg {
          position: absolute;
          left: var(--spacing-sm);
          top: 50%;
          transform: translateY(-50%);
          color: var(--african-yellow);
        }

        .search-input {
          width: 100%;
          max-width: 500px;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-sm) + 24px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .category-filters {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
        }

        .category-filter {
          padding: var(--spacing-xs) var(--spacing-md);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
        }

        .category-filter:hover {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.1);
        }

        .category-filter.active {
          border-color: var(--african-yellow);
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: var(--spacing-lg);
        }

        .museum-item {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          transition: all 0.3s ease;
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }

        .museum-item:hover {
          box-shadow: var(--shadow-xl);
          border-color: var(--african-yellow);
        }

        .item-header {
          margin-bottom: var(--spacing-md);
        }

        .item-category {
          display: inline-block;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
        }

        .item-title {
          font-size: 1.3rem;
          font-weight: 600;
          margin-bottom: var(--spacing-sm);
          color: white;
        }

        .item-description {
          margin-bottom: var(--spacing-md);
          opacity: 0.8;
          line-height: 1.6;
        }

        .item-image-container {
          width: 100%;
          height: 200px;
          margin-bottom: var(--spacing-md);
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
        }

        .item-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .item-image:hover {
          transform: scale(1.05);
        }

        .item-meta {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
          margin-bottom: var(--spacing-md);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .source-label {
          color: var(--african-yellow);
          font-weight: 500;
          background: rgba(255, 215, 0, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .open-item-btn {
          width: 100%;
          margin-top: var(--spacing-sm);
          border: 1px solid rgba(255, 215, 0, 0.4);
          background: rgba(255, 215, 0, 0.08);
          color: var(--african-yellow);
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: inherit;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
        }

        .open-item-btn:hover {
          background: rgba(255, 215, 0, 0.2);
          border-color: var(--african-yellow);
        }

        .item-media {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-md);
        }

        .audio-player {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .play-button {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: var(--gradient-primary);
          color: var(--african-black);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
        }

        .play-button:hover {
          transform: scale(1.1);
        }

        .no-results {
          text-align: center;
          padding: var(--spacing-xl);
          color: rgba(255, 255, 255, 0.7);
        }

        .no-results svg {
          margin-bottom: var(--spacing-md);
          opacity: 0.5;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          color: rgba(255, 255, 255, 0.7);
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--spacing-xl);
          color: var(--african-red);
          text-align: center;
        }

        .retry-button {
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm) var(--spacing-lg);
          background: var(--gradient-primary);
          color: var(--african-black);
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .retry-button:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .content-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 2100;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }

        .content-modal {
          width: min(900px, 100%);
          max-height: 88vh;
          overflow: auto;
          border-radius: 16px;
          border: 1px solid rgba(255, 215, 0, 0.25);
          background: linear-gradient(180deg, rgba(30, 30, 30, 0.98), rgba(20, 20, 20, 0.98));
        }

        .content-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .content-modal-header h3 {
          margin: 0;
          color: var(--african-yellow);
          font-size: 1.2rem;
        }

        .close-preview-btn {
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: transparent;
          color: #fff;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .content-modal-body {
          padding: 16px 20px 22px;
          display: grid;
          gap: 16px;
        }

        .modal-media-image,
        .modal-media-video,
        .modal-media-pdf {
          width: 100%;
          max-height: 52vh;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.2);
          object-fit: contain;
        }

        .modal-media-audio {
          width: 100%;
        }

        .modal-text-content {
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          padding: 14px;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          user-select: text;
          -webkit-user-select: text;
        }

        .modal-meta {
          display: grid;
          gap: 8px;
          color: rgba(255, 255, 255, 0.86);
          user-select: text;
          -webkit-user-select: text;
        }

        .modal-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.95rem;
        }

        .modal-source-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 215, 0, 0.12);
          color: var(--african-yellow);
          border: 1px solid rgba(255, 215, 0, 0.35);
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 0.85rem;
        }

        .source-external-btn {
          margin-top: 4px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #fff;
          padding: 8px 12px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .source-external-btn:hover {
          border-color: var(--african-yellow);
          color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.08);
        }

        .data-info {
          background: rgba(255, 215, 0, 0.1);
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: var(--radius-sm);
          padding: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-md);
          justify-content: center;
        }

        .data-info p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--african-yellow);
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .items-grid {
            grid-template-columns: 1fr;
          }

          .museum-title {
            font-size: 2rem;
          }

          .category-filters {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
