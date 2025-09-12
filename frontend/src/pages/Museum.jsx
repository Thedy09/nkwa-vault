import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { Search, Music, Play, Pause, MapPin, User, Calendar, Filter } from 'lucide-react';

export default function Museum() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [playingAudio, setPlayingAudio] = useState(null);

  const categories = [
    { value: 'all', label: t('all'), color: 'var(--african-yellow)' },
    { value: 'conte', label: t('talesFilter'), color: 'var(--african-green)' },
    { value: 'proverbe', label: t('proverbs'), color: 'var(--african-red)' },
    { value: 'chant', label: t('songs'), color: 'var(--african-gold)' },
    { value: 'danse', label: t('dances'), color: 'var(--african-earth)' },
    { value: 'artisanat', label: t('artFilter'), color: 'var(--african-yellow)' }
  ];

  // Données de démonstration
  const mockItems = [
    {
      id: 1,
      title: 'Le Conte de la Tortue et du Lièvre',
      description: 'Un conte traditionnel du Sénégal qui enseigne la patience.',
      category: 'conte',
      location: 'Sénégal',
      author_name: 'Mamadou Diallo',
      ipfs_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      title: 'Chant de Récolte du Mali',
      description: 'Chant traditionnel entonné pendant la récolte du mil.',
      category: 'chant',
      location: 'Mali',
      author_name: 'Fatoumata Traoré',
      ipfs_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      timestamp: '2024-01-20T14:15:00Z'
    },
    {
      id: 3,
      title: 'Masque Traditionnel Baoulé',
      description: 'Masque cérémoniel utilisé lors des rites d\'initiation.',
      category: 'artisanat',
      location: 'Côte d\'Ivoire',
      author_name: 'Kouassi N\'Guessan',
      ipfs_cid: 'bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi',
      timestamp: '2024-01-25T09:45:00Z'
    }
  ];

  useEffect(() => {
    // Simulation d'appel API
    setTimeout(() => {
      setItems(mockItems);
      setFilteredItems(mockItems);
    }, 1000);
  }, []);

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
                  <h3 className="item-title">{item.title}</h3>
                  <p className="item-description">{item.description}</p>

                  <div className="item-meta">
                    <div className="meta-item">
                      <MapPin size={16} />
                      <span>{item.location}</span>
                    </div>
                    <div className="meta-item">
                      <User size={16} />
                      <span>{item.author_name}</span>
                    </div>
                    <div className="meta-item">
                      <Calendar size={16} />
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
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

          {filteredItems.length === 0 && (
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
