import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Grid, List, Upload, Star, MapPin, Calendar, Tag, Eye, Play, Pause } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const VirtualMuseum = () => {
  const [collection, setCollection] = useState([]);
  const [filteredCollection, setFilteredCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    type: '',
    culture: '',
    country: '',
    search: ''
  });
  const [stats, setStats] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCollection();
    loadStats();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [collection, filters]);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/museum/collection`);
      const data = await response.json();
      
      if (data.success) {
        setCollection(data.data.collection);
        setError(null);
      } else {
        setError('Erreur lors du chargement de la collection');
      }
    } catch (err) {
      console.error('Erreur chargement collection:', err);
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/museum/stats`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    }
  };

  const applyFilters = () => {
    let filtered = [...collection];

    if (filters.type) {
      filtered = filtered.filter(item => item.type === filters.type);
    }

    if (filters.culture) {
      filtered = filtered.filter(item => 
        item.culture && item.culture.toLowerCase().includes(filters.culture.toLowerCase())
      );
    }

    if (filters.country) {
      filtered = filtered.filter(item => 
        item.country && item.country.toLowerCase().includes(filters.country.toLowerCase())
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        (item.tags && item.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    setFilteredCollection(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      culture: '',
      country: '',
      search: ''
    });
  };

  const getImageUrl = (item) => {
    if (item.image) {
      // Convertir IPFS URL en gateway URL
      if (item.image.startsWith('ipfs://')) {
        return item.image.replace('ipfs://', 'https://ipfs.io/ipfs/');
      }
      return item.image;
    }
    return '/placeholder-art.jpg';
  };

  const renderObject = (item, index) => (
    <motion.div
      key={item.id || index}
      className="museum-object"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
    >
      <div className="object-image-container">
        <img
          src={getImageUrl(item)}
          alt={item.name}
          className="object-image"
          onError={(e) => {
            e.target.src = '/placeholder-art.jpg';
          }}
        />
        {item.type === 'nft' && (
          <div className="nft-badge">
            <Star size={16} />
            NFT
          </div>
        )}
        {item.type === 'art' && (
          <div className="free-badge">
            <Tag size={16} />
            Libre
          </div>
        )}
      </div>
      
      <div className="object-content">
        <h3 className="object-title">{item.name}</h3>
        <p className="object-description">{item.description}</p>
        
        <div className="object-meta">
          <div className="meta-item">
            <MapPin size={14} />
            <span>{item.country}</span>
          </div>
          <div className="meta-item">
            <Tag size={14} />
            <span>{item.culture}</span>
          </div>
          {item.tags && (
            <div className="object-tags">
              {item.tags.slice(0, 3).map((tag, i) => (
                <span key={i} className="tag">{tag}</span>
              ))}
            </div>
          )}
        </div>
        
        <div className="object-actions">
          <button className="action-btn view-btn">
            <Eye size={16} />
            Voir
          </button>
          {item.type === 'nft' && (
            <button className="action-btn nft-btn">
              <Star size={16} />
              NFT
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="museum-loading">
        <div className="loading-spinner"></div>
        <p>Chargement de la collection...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="museum-error">
        <h2>Erreur de chargement</h2>
        <p>{error}</p>
        <button onClick={loadCollection} className="retry-btn">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="virtual-museum">
      <div className="museum-header">
        <div className="header-content">
          <h1>Musée Virtuel Africain</h1>
          <p>Découvrez l'art et la culture africaine à travers NFTs et œuvres libres</p>
        </div>
        
        {stats && (
          <div className="museum-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Objets</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.nfts}</span>
              <span className="stat-label">NFTs</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.freeArts}</span>
              <span className="stat-label">Arts libres</span>
            </div>
          </div>
        )}
      </div>

      <div className="museum-controls">
        <div className="search-section">
          <div className="search-input">
            <Search size={20} />
            <input
              type="text"
              placeholder="Rechercher dans la collection..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          
          <button
            className="filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={20} />
            Filtres
          </button>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid size={20} />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {showFilters && (
        <motion.div
          className="filters-panel"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="filter-group">
            <label>Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="nft">NFTs</option>
              <option value="art">Arts libres</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Culture</label>
            <select
              value={filters.culture}
              onChange={(e) => handleFilterChange('culture', e.target.value)}
            >
              <option value="">Toutes les cultures</option>
              {stats?.cultures.map(culture => (
                <option key={culture} value={culture}>{culture}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Pays</label>
            <select
              value={filters.country}
              onChange={(e) => handleFilterChange('country', e.target.value)}
            >
              <option value="">Tous les pays</option>
              {stats?.countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          <button className="clear-filters" onClick={clearFilters}>
            Effacer les filtres
          </button>
        </motion.div>
      )}

      <div className="collection-info">
        <p>
          {filteredCollection.length} objet{filteredCollection.length !== 1 ? 's' : ''} trouvé{filteredCollection.length !== 1 ? 's' : ''}
          {filters.search && ` pour "${filters.search}"`}
        </p>
      </div>

      <div className={`museum-gallery ${viewMode}`}>
        {filteredCollection.map((item, index) => renderObject(item, index))}
      </div>

      {filteredCollection.length === 0 && (
        <div className="no-results">
          <h3>Aucun objet trouvé</h3>
          <p>Essayez de modifier vos filtres de recherche</p>
          <button onClick={clearFilters} className="clear-filters">
            Effacer les filtres
          </button>
        </div>
      )}

      <style jsx>{`
        .virtual-museum {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 2rem;
        }

        .museum-header {
          text-align: center;
          margin-bottom: 3rem;
          color: white;
        }

        .header-content h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }

        .header-content p {
          font-size: 1.2rem;
          opacity: 0.9;
        }

        .museum-stats {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat-item {
          text-align: center;
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .museum-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: rgba(255,255,255,0.1);
          padding: 1rem;
          border-radius: 10px;
          backdrop-filter: blur(10px);
        }

        .search-section {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .search-input {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 25px;
          padding: 0.5rem 1rem;
          min-width: 300px;
        }

        .search-input input {
          border: none;
          outline: none;
          margin-left: 0.5rem;
          flex: 1;
        }

        .filter-toggle, .view-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 25px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .filter-toggle:hover, .view-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .view-btn.active {
          background: rgba(255,255,255,0.4);
        }

        .view-controls {
          display: flex;
          gap: 0.5rem;
        }

        .filters-panel {
          background: rgba(255,255,255,0.1);
          padding: 1.5rem;
          border-radius: 10px;
          margin-bottom: 2rem;
          backdrop-filter: blur(10px);
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          color: white;
          font-weight: 500;
        }

        .filter-group select {
          padding: 0.5rem;
          border: none;
          border-radius: 5px;
          background: white;
        }

        .clear-filters {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-filters:hover {
          background: rgba(255,255,255,0.3);
        }

        .collection-info {
          color: white;
          margin-bottom: 1rem;
          text-align: center;
        }

        .museum-gallery {
          display: grid;
          gap: 2rem;
        }

        .museum-gallery.grid {
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }

        .museum-gallery.list {
          grid-template-columns: 1fr;
        }

        .museum-object {
          background: white;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        }

        .museum-object:hover {
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .object-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .object-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .museum-object:hover .object-image {
          transform: scale(1.05);
        }

        .nft-badge, .free-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(0,0,0,0.8);
          color: white;
          padding: 0.3rem 0.8rem;
          border-radius: 20px;
          font-size: 0.8rem;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .nft-badge {
          background: linear-gradient(45deg, #ff6b6b, #ffa500);
        }

        .free-badge {
          background: linear-gradient(45deg, #4ecdc4, #44a08d);
        }

        .object-content {
          padding: 1.5rem;
        }

        .object-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .object-description {
          color: #666;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .object-meta {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }

        .object-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }

        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 0.2rem 0.5rem;
          border-radius: 15px;
          font-size: 0.8rem;
        }

        .object-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .view-btn {
          background: #667eea;
          color: white;
        }

        .view-btn:hover {
          background: #5a6fd8;
        }

        .nft-btn {
          background: #ff6b6b;
          color: white;
        }

        .nft-btn:hover {
          background: #ff5252;
        }

        .museum-loading, .museum-error {
          text-align: center;
          color: white;
          padding: 4rem 2rem;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255,255,255,0.3);
          border-top: 5px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .retry-btn {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          padding: 0.8rem 1.5rem;
          border-radius: 25px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .retry-btn:hover {
          background: rgba(255,255,255,0.3);
        }

        .no-results {
          text-align: center;
          color: white;
          padding: 4rem 2rem;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .virtual-museum {
            padding: 1rem;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .museum-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .search-input {
            min-width: 100%;
          }

          .filters-panel {
            grid-template-columns: 1fr;
          }

          .museum-gallery.grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default VirtualMuseum;
