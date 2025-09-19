import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { useNotifications } from '../components/NotificationSystem';
import { Search, Music, Play, Pause, MapPin, User, Calendar } from 'lucide-react';
import AdvancedSearch from '../components/AdvancedSearch';
import InteractiveActions from '../components/InteractiveActions';
import RecommendationEngine from '../components/RecommendationEngine';
import { staticCulturalContent } from '../data/staticContent';

export default function Museum() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingAudio, setPlayingAudio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    { value: 'all', label: t('all'), color: 'var(--african-yellow)' },
    { value: 'conte', label: t('talesFilter'), color: 'var(--african-green)' },
    { value: 'proverbe', label: t('proverbs'), color: 'var(--african-red)' },
    { value: 'devinette', label: 'Devinettes', color: 'var(--african-gold)' },
    { value: 'chant', label: t('songs'), color: 'var(--african-gold)' },
    { value: 'artisanat', label: t('artFilter'), color: 'var(--african-yellow)' }
  ];

  // Fonction pour charger les contenus culturels depuis l'API
  const loadCulturalContent = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
      
      // Chargement des contenus culturels
      
      // Charger tous les types de contenu en parallèle depuis les sources officielles
      const [talesRes, proverbsRes, riddlesRes, musicRes, artRes] = await Promise.all([
        fetch(`${API_BASE_URL}/cultural-content/tales`),
        fetch(`${API_BASE_URL}/cultural-content/proverbs`),
        fetch(`${API_BASE_URL}/cultural-content/cultural-riddles`),
        fetch(`${API_BASE_URL}/cultural-content/music`),
        fetch(`${API_BASE_URL}/cultural-content/art`)
      ]);

      // Vérification des réponses API

      const [talesData, proverbsData, riddlesData, musicData, artData] = await Promise.all([
        talesRes.json(),
        proverbsRes.json(),
        riddlesRes.json(),
        musicRes.json(),
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
          source: tale.sourceUrl,
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
          source: proverb.sourceUrl,
          timestamp: new Date().toISOString()
        })),
        ...(riddlesData.data?.riddles || []).map(riddle => ({
          id: `riddle-${riddle.question}`,
          title: riddle.question,
          description: riddle.answer,
          category: 'devinette',
          location: riddle.region || riddle.culture,
          author_name: riddle.culture || 'Tradition orale',
          source: riddle.sourceUrl,
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
                       <p>🎨 {items.filter(item => item.category === 'artisanat').length} art</p>
                     </div>
              <div className="items-grid">
                {filteredItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="museum-item"
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
                            <a href={item.sourceUrl || item.source} target="_blank" rel="noopener noreferrer" className="source-link">
                              📚 {item.source}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {item.ipfs_cid && (
                      <div className="item-media">
                        <div className="audio-player">
                          <motion.button
                            className="play-button"
                            onClick={() => toggleAudio(item.id)}
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

        .source-link {
          color: var(--african-yellow);
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          background: rgba(255, 215, 0, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.9em;
        }

        .source-link:hover {
          color: var(--african-gold);
          background: rgba(255, 215, 0, 0.2);
          text-decoration: none;
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