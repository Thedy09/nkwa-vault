import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Heart, 
  Eye,
  Star,
  Users,
  Zap,
  Target,
  BookOpen,
  MapPin
} from 'lucide-react';

const RecommendationEngine = ({ 
  userId, 
  currentItem, 
  userHistory = [], 
  allItems = [],
  onItemClick 
}) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personalized');

  // Algorithmes de recommandation
  const recommendationAlgorithms = {
    // Recommandations personnalisées basées sur l'historique
    personalized: (items, history, userId) => {
      if (!history.length) return getPopularItems(items);
      
      // Analyser les préférences de l'utilisateur
      const userPreferences = analyzeUserPreferences(history);
      
      // Calculer les scores de similarité
      const scoredItems = items
        .filter(item => !history.some(h => h.id === item.id))
        .map(item => ({
          ...item,
          score: calculateSimilarityScore(item, userPreferences)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      return scoredItems;
    },

    // Recommandations basées sur le contenu actuel
    similar: (items, currentItem) => {
      if (!currentItem) return getPopularItems(items);
      
      const similarItems = items
        .filter(item => item.id !== currentItem.id)
        .map(item => ({
          ...item,
          score: calculateContentSimilarity(item, currentItem)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 6);

      return similarItems;
    },

    // Recommandations populaires
    popular: (items) => {
      return getPopularItems(items);
    },

    // Recommandations récentes
    recent: (items) => {
      return items
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
    },

    // Recommandations tendance
    trending: (items) => {
      return items
        .map(item => ({
          ...item,
          trendingScore: calculateTrendingScore(item)
        }))
        .sort((a, b) => b.trendingScore - a.trendingScore)
        .slice(0, 6);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [userId, currentItem, userHistory, allItems, activeTab]);

  const loadRecommendations = async () => {
    setLoading(true);
    
    try {
      const algorithm = recommendationAlgorithms[activeTab];
      const recommendations = algorithm(allItems, userHistory, userId);
      setRecommendations(recommendations);
    } catch (error) {
      console.error('Erreur lors du chargement des recommandations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Analyser les préférences de l'utilisateur
  const analyzeUserPreferences = (history) => {
    const preferences = {
      categories: {},
      origins: {},
      tags: {},
      artists: {},
      avgRating: 0,
      totalInteractions: history.length
    };

    history.forEach(item => {
      // Catégories
      preferences.categories[item.category] = (preferences.categories[item.category] || 0) + 1;
      
      // Origines
      if (item.origin) {
        preferences.origins[item.origin] = (preferences.origins[item.origin] || 0) + 1;
      }
      
      // Tags
      if (item.tags) {
        item.tags.forEach(tag => {
          preferences.tags[tag] = (preferences.tags[tag] || 0) + 1;
        });
      }
      
      // Artistes
      if (item.artist) {
        preferences.artists[item.artist] = (preferences.artists[item.artist] || 0) + 1;
      }
    });

    return preferences;
  };

  // Calculer le score de similarité
  const calculateSimilarityScore = (item, preferences) => {
    let score = 0;
    
    // Score basé sur la catégorie (poids: 40%)
    const categoryScore = preferences.categories[item.category] || 0;
    score += (categoryScore / preferences.totalInteractions) * 0.4;
    
    // Score basé sur l'origine (poids: 20%)
    if (item.origin && preferences.origins[item.origin]) {
      const originScore = preferences.origins[item.origin] || 0;
      score += (originScore / preferences.totalInteractions) * 0.2;
    }
    
    // Score basé sur les tags (poids: 25%)
    if (item.tags) {
      const tagMatches = item.tags.filter(tag => preferences.tags[tag]).length;
      const totalTags = item.tags.length;
      if (totalTags > 0) {
        score += (tagMatches / totalTags) * 0.25;
      }
    }
    
    // Score basé sur l'artiste (poids: 15%)
    if (item.artist && preferences.artists[item.artist]) {
      const artistScore = preferences.artists[item.artist] || 0;
      score += (artistScore / preferences.totalInteractions) * 0.15;
    }
    
    return score;
  };

  // Calculer la similarité de contenu
  const calculateContentSimilarity = (item1, item2) => {
    let score = 0;
    
    // Même catégorie
    if (item1.category === item2.category) score += 0.4;
    
    // Même origine
    if (item1.origin === item2.origin) score += 0.3;
    
    // Tags communs
    if (item1.tags && item2.tags) {
      const commonTags = item1.tags.filter(tag => item2.tags.includes(tag));
      const totalTags = new Set([...item1.tags, ...item2.tags]).size;
      if (totalTags > 0) {
        score += (commonTags.length / totalTags) * 0.3;
      }
    }
    
    return score;
  };

  // Obtenir les éléments populaires
  const getPopularItems = (items) => {
    return items
      .map(item => ({
        ...item,
        popularityScore: (item.likes || 0) * 0.4 + (item.views || 0) * 0.6
      }))
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, 6);
  };

  // Calculer le score de tendance
  const calculateTrendingScore = (item) => {
    const now = new Date();
    const itemDate = new Date(item.createdAt);
    const daysSinceCreation = (now - itemDate) / (1000 * 60 * 60 * 24);
    
    // Score basé sur les interactions récentes et la nouveauté
    const recencyScore = Math.max(0, 1 - (daysSinceCreation / 30)); // Décroît sur 30 jours
    const interactionScore = (item.likes || 0) + (item.views || 0) * 0.1;
    
    return recencyScore * 0.6 + interactionScore * 0.4;
  };

  const tabs = [
    { id: 'personalized', label: 'Pour vous', icon: Sparkles },
    { id: 'similar', label: 'Similaire', icon: Target },
    { id: 'popular', label: 'Populaire', icon: TrendingUp },
    { id: 'recent', label: 'Récent', icon: Clock },
    { id: 'trending', label: 'Tendance', icon: Zap }
  ];

  const getRecommendationTitle = () => {
    switch (activeTab) {
      case 'personalized': return 'Recommandé pour vous';
      case 'similar': return 'Contenu similaire';
      case 'popular': return 'Contenu populaire';
      case 'recent': return 'Nouveautés';
      case 'trending': return 'En tendance';
      default: return 'Recommandations';
    }
  };

  const getRecommendationIcon = () => {
    switch (activeTab) {
      case 'personalized': return Sparkles;
      case 'similar': return Target;
      case 'popular': return TrendingUp;
      case 'recent': return Clock;
      case 'trending': return Zap;
      default: return BookOpen;
    }
  };

  const RecommendationIcon = getRecommendationIcon();

  return (
    <div className="recommendation-engine">
      <div className="recommendation-header">
        <div className="header-title">
          <RecommendationIcon size={24} />
          <h3>{getRecommendationTitle()}</h3>
        </div>
        <div className="recommendation-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recommendations-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Chargement des recommandations...</p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={48} />
            <p>Aucune recommandation disponible</p>
          </div>
        ) : (
          <div className="recommendations-grid">
            {recommendations.map((item, index) => (
              <motion.div
                key={item.id}
                className="recommendation-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onItemClick && onItemClick(item)}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 8px 25px rgba(255, 215, 0, 0.2)"
                }}
              >
                <div className="card-image">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="placeholder-image">
                      <BookOpen size={32} />
                    </div>
                  )}
                  <div className="card-category">
                    {item.category}
                  </div>
                  {item.score && (
                    <div className="recommendation-score">
                      {Math.round(item.score * 100)}%
                    </div>
                  )}
                </div>

                <div className="card-content">
                  <h4 className="card-title">{item.title}</h4>
                  <p className="card-description">{item.description}</p>
                  
                  <div className="card-meta">
                    <div className="meta-item">
                      <MapPin size={12} />
                      <span>{item.origin}</span>
                    </div>
                    {item.artist && (
                      <div className="meta-item">
                        <Users size={12} />
                        <span>{item.artist}</span>
                      </div>
                    )}
                  </div>

                  <div className="card-stats">
                    <div className="stat-item">
                      <Eye size={12} />
                      <span>{item.views || 0}</span>
                    </div>
                    <div className="stat-item">
                      <Heart size={12} />
                      <span>{item.likes || 0}</span>
                    </div>
                    {item.rating && (
                      <div className="stat-item">
                        <Star size={12} />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>

                  {item.tags && item.tags.length > 0 && (
                    <div className="card-tags">
                      {item.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .recommendation-engine {
          margin: 2rem 0;
        }

        .recommendation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .header-title h3 {
          margin: 0;
          color: var(--african-yellow);
          font-size: 1.5rem;
        }

        .recommendation-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.7);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .tab-button:hover {
          background: rgba(255, 255, 255, 0.15);
          color: white;
        }

        .tab-button.active {
          background: var(--african-yellow);
          color: var(--african-dark);
          border-color: var(--african-yellow);
        }

        .recommendations-content {
          min-height: 200px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.1);
          border-top: 3px solid var(--african-yellow);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .empty-state p {
          margin: 1rem 0 0 0;
          font-size: 1.1rem;
        }

        .recommendations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .recommendation-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .recommendation-card:hover {
          transform: translateY(-4px);
        }

        .card-image {
          position: relative;
          height: 200px;
          overflow: hidden;
        }

        .card-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.5);
        }

        .card-category {
          position: absolute;
          top: 0.75rem;
          left: 0.75rem;
          background: var(--african-yellow);
          color: var(--african-dark);
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .recommendation-score {
          position: absolute;
          top: 0.75rem;
          right: 0.75rem;
          background: rgba(0, 0, 0, 0.8);
          color: var(--african-yellow);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .card-content {
          padding: 1rem;
        }

        .card-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          color: white;
          line-height: 1.3;
        }

        .card-description {
          margin: 0 0 1rem 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .card-meta {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          margin-bottom: 0.75rem;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .card-stats {
          display: flex;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.8rem;
        }

        .card-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          background: rgba(255, 215, 0, 0.2);
          color: var(--african-yellow);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .recommendation-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .recommendation-tabs {
            width: 100%;
            justify-content: center;
          }

          .tab-button {
            flex: 1;
            justify-content: center;
            min-width: 0;
          }

          .recommendations-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default RecommendationEngine;
