import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  X, 
  MapPin, 
  Tag, 
  Calendar, 
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const AdvancedSearch = ({ onSearch, onFilter, categories, origins, tags }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    origin: 'all',
    tags: [],
    dateRange: { start: '', end: '' },
    rating: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggestions de recherche
  const searchSuggestions = [
    'conte traditionnel',
    'proverbe africain',
    'musique griot',
    'masque cérémoniel',
    'devinette',
    'artisanat',
    'sagesse',
    'culture',
    'patrimoine'
  ];

  useEffect(() => {
    if (searchTerm.length > 2) {
      const filtered = searchSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  const handleSearch = () => {
    onSearch(searchTerm);
    onFilter(filters);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    handleFilterChange('tags', newTags);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      origin: 'all',
      tags: [],
      dateRange: { start: '', end: '' },
      rating: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    onFilter(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'all') count++;
    if (filters.origin !== 'all') count++;
    if (filters.tags.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.rating > 0) count++;
    return count;
  };

  return (
    <div className="advanced-search">
      <div className="search-container">
        <div className="search-input-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher dans le patrimoine culturel..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
          />
          <button 
            onClick={handleSearch}
            className="search-button"
          >
            Rechercher
          </button>
        </div>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="suggestions"
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setShowSuggestions(false);
                    handleSearch();
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="filters-container">
        <button
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter size={16} />
          Filtres avancés
          {getActiveFiltersCount() > 0 && (
            <span className="filter-count">{getActiveFiltersCount()}</span>
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="filters-panel"
            >
              <div className="filters-grid">
                {/* Catégorie */}
                <div className="filter-group">
                  <label>Catégorie</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="all">Toutes les catégories</option>
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Origine */}
                <div className="filter-group">
                  <label>Origine</label>
                  <select
                    value={filters.origin}
                    onChange={(e) => handleFilterChange('origin', e.target.value)}
                  >
                    <option value="all">Toutes les origines</option>
                    {origins.map(origin => (
                      <option key={origin} value={origin}>
                        {origin}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div className="filter-group">
                  <label>Tags</label>
                  <div className="tags-container">
                    {tags.map(tag => (
                      <button
                        key={tag}
                        className={`tag-button ${filters.tags.includes(tag) ? 'active' : ''}`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        <Tag size={12} />
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plage de dates */}
                <div className="filter-group">
                  <label>Période</label>
                  <div className="date-range">
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        start: e.target.value
                      })}
                      placeholder="Début"
                    />
                    <span>à</span>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', {
                        ...filters.dateRange,
                        end: e.target.value
                      })}
                      placeholder="Fin"
                    />
                  </div>
                </div>

                {/* Note minimale */}
                <div className="filter-group">
                  <label>Note minimale</label>
                  <div className="rating-filter">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        className={`rating-button ${filters.rating >= rating ? 'active' : ''}`}
                        onClick={() => handleFilterChange('rating', rating)}
                      >
                        <Star size={16} fill={filters.rating >= rating ? '#FFD700' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tri */}
                <div className="filter-group">
                  <label>Trier par</label>
                  <div className="sort-controls">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="createdAt">Date de création</option>
                      <option value="title">Titre</option>
                      <option value="likes">Popularité</option>
                      <option value="views">Vues</option>
                      <option value="rating">Note</option>
                    </select>
                    <select
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <option value="desc">Décroissant</option>
                      <option value="asc">Croissant</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="filters-actions">
                <button onClick={clearFilters} className="clear-filters">
                  <X size={16} />
                  Effacer les filtres
                </button>
                <button onClick={handleSearch} className="apply-filters">
                  Appliquer
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .advanced-search {
          margin-bottom: 2rem;
        }

        .search-container {
          position: relative;
          margin-bottom: 1rem;
        }

        .search-input-container {
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 0.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .search-icon {
          color: var(--african-yellow);
          margin-right: 0.5rem;
        }

        .search-input {
          flex: 1;
          background: none;
          border: none;
          color: white;
          font-size: 1rem;
          padding: 0.5rem;
          outline: none;
        }

        .search-input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .search-button {
          background: var(--african-yellow);
          color: var(--african-dark);
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .search-button:hover {
          background: var(--african-gold);
          transform: translateY(-2px);
        }

        .suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 8px;
          margin-top: 0.5rem;
          z-index: 1000;
          max-height: 200px;
          overflow-y: auto;
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          color: white;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .suggestion-item:hover {
          background: rgba(255, 215, 0, 0.1);
        }

        .filters-container {
          position: relative;
        }

        .filters-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .filters-toggle:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .filter-count {
          background: var(--african-yellow);
          color: var(--african-dark);
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .filters-panel {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.95);
          border-radius: 12px;
          padding: 1.5rem;
          margin-top: 0.5rem;
          z-index: 1000;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-group label {
          color: var(--african-yellow);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .filter-group select,
        .filter-group input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .filter-group select:focus,
        .filter-group input:focus {
          outline: none;
          border-color: var(--african-yellow);
        }

        .tags-container {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag-button {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 16px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .tag-button:hover {
          background: rgba(255, 215, 0, 0.2);
        }

        .tag-button.active {
          background: var(--african-yellow);
          color: var(--african-dark);
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-range span {
          color: rgba(255, 255, 255, 0.6);
        }

        .rating-filter {
          display: flex;
          gap: 0.25rem;
        }

        .rating-button {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rating-button.active {
          color: var(--african-yellow);
        }

        .sort-controls {
          display: flex;
          gap: 0.5rem;
        }

        .filters-actions {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
        }

        .clear-filters,
        .apply-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .clear-filters {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
        }

        .clear-filters:hover {
          background: rgba(255, 0, 0, 0.3);
        }

        .apply-filters {
          background: var(--african-yellow);
          border: none;
          color: var(--african-dark);
          font-weight: 600;
        }

        .apply-filters:hover {
          background: var(--african-gold);
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .sort-controls {
            flex-direction: column;
          }
          
          .filters-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedSearch;





