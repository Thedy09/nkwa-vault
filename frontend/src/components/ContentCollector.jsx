import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
  Download, 
  BookOpen, 
  Music, 
  Image, 
  Shield, 
  Globe,
  CheckCircle,
  Loader,
  AlertCircle,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

const ContentCollector = () => {
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState({});
  const [totalCollected, setTotalCollected] = useState(0);
  const [collectionHistory, setCollectionHistory] = useState([]);
  const [currentCollection, setCurrentCollection] = useState(null);

  const collectionTypes = [
    {
      id: 'stories',
      name: 'Contes Africains',
      description: 'Collecte depuis African Storybook',
      icon: BookOpen,
      color: 'blue',
      endpoint: '/api/collector/stories',
      defaultLimit: 30
    },
    {
      id: 'artworks',
      name: 'Œuvres d\'Art',
      description: 'Collection Met Museum Open Access',
      icon: Image,
      color: 'purple',
      endpoint: '/api/collector/artworks',
      defaultLimit: 25
    },
    {
      id: 'music',
      name: 'Musique Traditionnelle',
      description: 'Archives Internet Archive',
      icon: Music,
      color: 'green',
      endpoint: '/api/collector/music',
      defaultLimit: 20
    },
    {
      id: 'images',
      name: 'Images Culturelles',
      description: 'Wikimedia Commons',
      icon: Globe,
      color: 'orange',
      endpoint: '/api/collector/images',
      defaultLimit: 35
    },
    {
      id: 'heritage',
      name: 'Patrimoine UNESCO',
      description: 'Patrimoine immatériel africain',
      icon: Shield,
      color: 'red',
      endpoint: '/api/collector/heritage',
      defaultLimit: 15
    }
  ];

  const startCollection = async (type, limit) => {
    try {
      setIsCollecting(true);
      setCurrentCollection({ type, limit, startTime: Date.now() });
      
      const response = await axios.post(`${type.endpoint}?limit=${limit}`);
      
      if (response.data.success) {
        setCollectionStatus(prev => ({
          ...prev,
          [type.id]: {
            status: 'completed',
            count: response.data.data.count,
            timestamp: new Date().toISOString()
          }
        }));
        
        setTotalCollected(prev => prev + response.data.data.count);
        
        setCollectionHistory(prev => [{
          id: Date.now(),
          type: type.name,
          count: response.data.data.count,
          timestamp: new Date().toISOString(),
          duration: Date.now() - currentCollection.startTime
        }, ...prev]);
      }
    } catch (error) {
      console.error('Collection error:', error);
      setCollectionStatus(prev => ({
        ...prev,
        [type.id]: {
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    } finally {
      setIsCollecting(false);
      setCurrentCollection(null);
    }
  };

  const startMassiveCollection = async () => {
    try {
      setIsCollecting(true);
      setCurrentCollection({ type: 'all', startTime: Date.now() });
      
      const response = await axios.post('/api/collector/all');
      
      if (response.data.success) {
        setTotalCollected(response.data.data.totalCollected);
        
        // Mettre à jour le statut pour tous les types
        const newStatus = {};
        Object.keys(response.data.data.results).forEach(key => {
          newStatus[key] = {
            status: 'completed',
            count: response.data.data.results[key].count,
            timestamp: new Date().toISOString()
          };
        });
        setCollectionStatus(newStatus);
        
        setCollectionHistory(prev => [{
          id: Date.now(),
          type: 'Collecte Massive',
          count: response.data.data.totalCollected,
          timestamp: new Date().toISOString(),
          duration: Date.now() - currentCollection.startTime
        }, ...prev]);
      }
    } catch (error) {
      console.error('Massive collection error:', error);
    } finally {
      setIsCollecting(false);
      setCurrentCollection(null);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'collecting':
        return <Loader size={20} className="text-blue-500 animate-spin" />;
      default:
        return <Play size={20} className="text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-200';
      case 'error':
        return 'bg-red-100 border-red-200';
      case 'collecting':
        return 'bg-blue-100 border-blue-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  return (
    <motion.div
      className="content-collector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="collector-header">
        <h2>🌍 Collecte de Contenus Culturels Africains</h2>
        <p>Collecte automatique depuis des sources libres et certification Web3</p>
      </div>

      <div className="collector-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Download size={24} />
          </div>
          <div className="stat-content">
            <h3>{totalCollected}</h3>
            <p>Contenus collectés</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3>100%</h3>
            <p>Certifiés Web3</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Globe size={24} />
          </div>
          <div className="stat-content">
            <h3>6</h3>
            <p>Sources libres</p>
          </div>
        </div>
      </div>

      <div className="collector-actions">
        <motion.button
          className="massive-collection-btn"
          onClick={startMassiveCollection}
          disabled={isCollecting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isCollecting && currentCollection?.type === 'all' ? (
            <>
              <Loader size={20} className="animate-spin" />
              Collecte en cours...
            </>
          ) : (
            <>
              <Download size={20} />
              Collecte Massive
            </>
          )}
        </motion.button>
      </div>

      <div className="collection-types">
        <h3>Sources de Collecte</h3>
        <div className="types-grid">
          {collectionTypes.map((type) => {
            const IconComponent = type.icon;
            const status = collectionStatus[type.id];
            
            return (
              <motion.div
                key={type.id}
                className={`type-card ${type.color} ${status ? getStatusColor(status.status) : ''}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="type-header">
                  <div className="type-icon">
                    <IconComponent size={32} />
                  </div>
                  <div className="type-status">
                    {getStatusIcon(status?.status)}
                  </div>
                </div>
                
                <h4>{type.name}</h4>
                <p>{type.description}</p>
                
                {status && (
                  <div className="type-results">
                    {status.status === 'completed' && (
                      <div className="success-info">
                        <CheckCircle size={16} />
                        <span>{status.count} collectés</span>
                      </div>
                    )}
                    {status.status === 'error' && (
                      <div className="error-info">
                        <AlertCircle size={16} />
                        <span>Erreur</span>
                      </div>
                    )}
                  </div>
                )}
                
                <button
                  className="collect-btn"
                  onClick={() => startCollection(type, type.defaultLimit)}
                  disabled={isCollecting}
                >
                  {isCollecting && currentCollection?.type === type.id ? (
                    <>
                      <Loader size={16} className="animate-spin" />
                      Collecte...
                    </>
                  ) : (
                    <>
                      <Play size={16} />
                      Collecter
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {collectionHistory.length > 0 && (
        <div className="collection-history">
          <h3>Historique des Collectes</h3>
          <div className="history-list">
            {collectionHistory.slice(0, 10).map((item) => (
              <div key={item.id} className="history-item">
                <div className="history-info">
                  <h4>{item.type}</h4>
                  <p>{item.count} contenus collectés</p>
                </div>
                <div className="history-meta">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  {item.duration && (
                    <span>{(item.duration / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .content-collector {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .collector-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .collector-header h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .collector-header p {
          font-size: 1.2rem;
          color: #666;
          max-width: 600px;
          margin: 0 auto;
        }

        .collector-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-content h3 {
          font-size: 2rem;
          margin: 0;
          color: #333;
        }

        .stat-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .collector-actions {
          text-align: center;
          margin-bottom: 3rem;
        }

        .massive-collection-btn {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 10px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 auto;
          transition: all 0.3s ease;
        }

        .massive-collection-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .massive-collection-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .collection-types h3 {
          font-size: 1.8rem;
          margin-bottom: 2rem;
          text-align: center;
          color: #333;
        }

        .types-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .type-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }

        .type-card.blue {
          border-color: #3b82f6;
        }

        .type-card.purple {
          border-color: #8b5cf6;
        }

        .type-card.green {
          border-color: #10b981;
        }

        .type-card.orange {
          border-color: #f59e0b;
        }

        .type-card.red {
          border-color: #ef4444;
        }

        .type-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .type-icon {
          color: #667eea;
        }

        .type-status {
          display: flex;
          align-items: center;
        }

        .type-card h4 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: #333;
        }

        .type-card p {
          color: #666;
          margin-bottom: 1.5rem;
          line-height: 1.5;
        }

        .type-results {
          margin-bottom: 1rem;
        }

        .success-info, .error-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
        }

        .success-info {
          color: #10b981;
        }

        .error-info {
          color: #ef4444;
        }

        .collect-btn {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .collect-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
        }

        .collect-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .collection-history {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .collection-history h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .history-info h4 {
          margin: 0 0 0.25rem 0;
          color: #333;
        }

        .history-info p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .history-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.25rem;
          font-size: 0.8rem;
          color: #666;
        }

        @media (max-width: 768px) {
          .content-collector {
            padding: 1rem;
          }

          .collector-header h2 {
            font-size: 2rem;
          }

          .types-grid {
            grid-template-columns: 1fr;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .history-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .history-meta {
            align-items: flex-start;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default ContentCollector;
