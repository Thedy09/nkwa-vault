import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Shield, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Activity,
  Coins,
  Download,
  Database,
  Link,
  Zap
} from 'lucide-react';
import ContentCollector from './ContentCollector';
import { API_BASE_URL } from '../config/api';

const Web3Dashboard = () => {
  const [web3Status, setWeb3Status] = useState(null);
  const [web3Stats, setWeb3Stats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadWeb3Data();
  }, []);

  const loadWeb3Data = async () => {
    try {
      setLoading(true);
      // Charger le statut Web3
      const statusResponse = await fetch(`${API_BASE_URL}/api/web3/status`);
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        setWeb3Status(statusData.data);
      }

      // Charger les statistiques Web3
      const statsResponse = await fetch(`${API_BASE_URL}/api/web3/stats`);
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        setWeb3Stats(statsData.data);
      }

      setError(null);
    } catch (err) {
      console.error('Erreur chargement Web3:', err);
      setError('Erreur de connexion aux services Web3');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    return status ? (
      <CheckCircle className="text-green-500" size={20} />
    ) : (
      <AlertCircle className="text-red-500" size={20} />
    );
  };

  const getStatusText = (status) => {
    return status ? 'Actif' : 'Inactif';
  };

  const getStatusColor = (status) => {
    return status ? 'text-green-500' : 'text-red-500';
  };

  if (loading) {
    return (
      <div className="web3-dashboard">
        <div className="dashboard-header">
          <h2>🌐 Dashboard Web3 - Pilier Central</h2>
          <p>Chargement des services décentralisés...</p>
        </div>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="web3-dashboard">
        <div className="dashboard-header">
          <h2>🌐 Dashboard Web3 - Pilier Central</h2>
          <p className="error">{error}</p>
          <button onClick={loadWeb3Data} className="retry-btn">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="web3-dashboard">
      <div className="dashboard-header">
        <h2>🌐 Dashboard Web3 - Pilier Central</h2>
        <p>Services décentralisés pour la préservation du patrimoine culturel africain</p>
        
        {/* Onglets */}
        <div className="dashboard-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <Activity size={20} />
            Vue d'ensemble
          </button>
          <button 
            className={`tab-btn ${activeTab === 'collector' ? 'active' : ''}`}
            onClick={() => setActiveTab('collector')}
          >
            <Download size={20} />
            Collecte de Contenus
          </button>
        </div>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <>
          {/* Statut des services */}
          <div className="status-grid">
        <motion.div 
          className="status-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="status-header">
            <Globe size={24} />
            <h3>Réseau EVM</h3>
            {getStatusIcon(web3Status?.blockchain?.initialized)}
          </div>
          <div className="status-content">
            <p className={getStatusColor(web3Status?.blockchain?.initialized)}>
              {getStatusText(web3Status?.blockchain?.initialized)}
            </p>
            <p>
              {web3Status?.blockchain?.network || 'EVM'}{' '}
              {web3Status?.blockchain?.chainId
                ? `(chain ${web3Status.blockchain.chainId})`
                : ''}
            </p>
          </div>
        </motion.div>

        <motion.div 
          className="status-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="status-header">
            <Database size={24} />
            <h3>IPFS</h3>
            {getStatusIcon(web3Status?.ipfs?.initialized)}
          </div>
          <div className="status-content">
            <p className={getStatusColor(web3Status?.ipfs?.initialized)}>
              {getStatusText(web3Status?.ipfs?.initialized)}
            </p>
            <p>Stockage décentralisé des médias</p>
          </div>
        </motion.div>

        <motion.div 
          className="status-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="status-header">
            <Shield size={24} />
            <h3>Certification</h3>
            {getStatusIcon(web3Status?.blockchain?.ready)}
          </div>
          <div className="status-content">
            <p className={getStatusColor(web3Status?.blockchain?.ready)}>
              {getStatusText(web3Status?.blockchain?.ready)}
            </p>
            <p>Certification blockchain active</p>
          </div>
        </motion.div>
      </div>

      {/* Statistiques Web3 */}
      {web3Stats && (
        <div className="stats-section">
          <h3>📊 Statistiques Web3</h3>
          <div className="stats-grid">
            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stat-icon">
                <Coins size={20} />
              </div>
              <div className="stat-content">
                <h4>Solde Relayer</h4>
                <p className="stat-value">{web3Stats.blockchain?.balanceEth || 'N/A'}</p>
                <p className="stat-label">ETH</p>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="stat-icon">
                <Activity size={20} />
              </div>
              <div className="stat-content">
                <h4>Certifications</h4>
                <p className="stat-value">{web3Stats.blockchain?.totalCertifications || '0'}</p>
                <p className="stat-label">On-chain</p>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="stat-icon">
                <Link size={20} />
              </div>
              <div className="stat-content">
                <h4>Réseau</h4>
                <p className="stat-value">{web3Stats.blockchain?.network || 'EVM'}</p>
                <p className="stat-label">
                  {web3Stats.blockchain?.chainId
                    ? `chain ${web3Stats.blockchain.chainId}`
                    : 'non configuré'}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Actions Web3 */}
      <div className="actions-section">
        <h3>⚡ Actions Web3</h3>
        <div className="actions-grid">
          <motion.button 
            className="action-btn primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload size={20} />
            Créer Contenu NFT
          </motion.button>

          <motion.button 
            className="action-btn secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield size={20} />
            Certifier Contenu
          </motion.button>

          <motion.button 
            className="action-btn tertiary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CheckCircle size={20} />
            Vérifier Authenticité
          </motion.button>

          <motion.button 
            className="action-btn quaternary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Zap size={20} />
            Distribuer Récompenses
          </motion.button>
        </div>
      </div>

      {/* Informations techniques */}
      <div className="tech-info">
        <h3>🔧 Informations Techniques</h3>
        <div className="tech-grid">
          <div className="tech-item">
            <strong>Relayer:</strong>
            <span>{web3Stats?.blockchain?.relayerAddress || 'N/A'}</span>
          </div>
          <div className="tech-item">
            <strong>Réseau:</strong>
            <span>{web3Stats?.blockchain?.network || 'EVM'}</span>
          </div>
          <div className="tech-item">
            <strong>Contrat Registry:</strong>
            <span>{web3Stats?.blockchain?.contractAddress || 'N/A'}</span>
          </div>
          <div className="tech-item">
            <strong>IPFS Gateway:</strong>
            <span>{web3Stats?.ipfs?.gateway || 'https://ipfs.io/ipfs/'}</span>
          </div>
          <div className="tech-item">
            <strong>Dernière mise à jour:</strong>
            <span>{new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>
        </>
      )}

      {activeTab === 'collector' && (
        <ContentCollector />
      )}

      <style jsx>{`
        .web3-dashboard {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-header h2 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-header p {
          font-size: 1.1rem;
          color: #666;
          margin-bottom: 1rem;
        }

        .dashboard-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          border-bottom: 2px solid #e0e0e0;
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          color: #666;
          font-weight: 600;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }

        .tab-btn:hover {
          color: #667eea;
          background: #f8f9ff;
        }

        .tab-btn.active {
          color: #667eea;
          border-bottom-color: #667eea;
          background: #f8f9ff;
        }

        .status-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .status-card {
          background: white;
          border-radius: 15px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          border: 1px solid #e0e0e0;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .status-header h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: #333;
        }

        .status-content p:first-child {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .status-content p:last-child {
          color: #666;
          font-size: 0.9rem;
        }

        .stats-section {
          margin-bottom: 3rem;
        }

        .stats-section h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border-radius: 15px;
          padding: 2rem;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stat-icon {
          background: rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          opacity: 0.9;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .actions-section {
          margin-bottom: 3rem;
        }

        .actions-section h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn.primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .action-btn.secondary {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
        }

        .action-btn.tertiary {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }

        .action-btn.quaternary {
          background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          color: white;
        }

        .action-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .tech-info {
          background: #f8f9fa;
          border-radius: 15px;
          padding: 2rem;
        }

        .tech-info h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .tech-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .tech-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e0e0e0;
        }

        .tech-item:last-child {
          border-bottom: none;
        }

        .tech-item strong {
          color: #333;
        }

        .tech-item span {
          color: #666;
          font-family: monospace;
        }

        .loading-spinner {
          width: 50px;
          height: 50px;
          border: 5px solid #f3f3f3;
          border-top: 5px solid #667eea;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 2rem auto;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error {
          color: #e74c3c;
          margin: 1rem 0;
        }

        .retry-btn {
          background: #667eea;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 1rem;
        }

        .retry-btn:hover {
          background: #5a6fd8;
        }

        @media (max-width: 768px) {
          .web3-dashboard {
            padding: 1rem;
          }

          .dashboard-header h2 {
            font-size: 2rem;
          }

          .status-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .tech-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Web3Dashboard;
