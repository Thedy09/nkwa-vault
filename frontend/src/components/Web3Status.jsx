import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Link, 
  Shield, 
  Coins, 
  Award, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';

const Web3Status = () => {
  const [web3Status, setWeb3Status] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [userLevel, setUserLevel] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeb3Status();
  }, []);

  const fetchWeb3Status = async () => {
    try {
      setLoading(true);
      
      // Récupérer le statut des services Web3
      const statusResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/web3/status`);
      const statusData = await statusResponse.json();
      
      if (statusData.success) {
        setWeb3Status(statusData.services);
        
        // Récupérer le solde utilisateur si connecté
        const token = localStorage.getItem('acv_token');
        if (token) {
          try {
            const balanceResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/web3/user-balance`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const balanceData = await balanceResponse.json();
            
            if (balanceData.success) {
              setUserBalance(balanceData.balance);
            }
          } catch (error) {
            console.log('Utilisateur non connecté');
          }
          
          try {
            const levelResponse = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/web3/user-level`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const levelData = await levelResponse.json();
            
            if (levelData.success) {
              setUserLevel(levelData.level);
            }
          } catch (error) {
            console.log('Niveau utilisateur non disponible');
          }
        }
      }
    } catch (error) {
      console.error('Erreur récupération statut Web3:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="web3-status">
        <div className="loading">
          <Loader className="animate-spin" size={24} />
          <span>Chargement des services Web3...</span>
        </div>
      </div>
    );
  }

  if (!web3Status) {
    return (
      <div className="web3-status">
        <div className="error">
          <AlertCircle size={24} />
          <span>Services Web3 non disponibles</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className="web3-status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="web3-header">
        <h3>🌐 Services Web3</h3>
        <p>Blockchain et stockage décentralisé</p>
      </div>

      <div className="web3-services">
        {/* Statut Hedera */}
        <div className={`service-card ${web3Status.hedera.initialized ? 'active' : 'demo'}`}>
          <div className="service-icon">
            <Shield size={24} />
          </div>
          <div className="service-info">
            <h4>Hedera Hashgraph</h4>
            <p>{web3Status.hedera.initialized ? 'Connecté' : 'Mode démo'}</p>
            <span className="service-network">{web3Status.hedera.network}</span>
          </div>
          <div className="service-status">
            {web3Status.hedera.initialized ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
          </div>
        </div>

        {/* Statut IPFS */}
        <div className={`service-card ${web3Status.ipfs.initialized ? 'active' : 'demo'}`}>
          <div className="service-icon">
            <Link size={24} />
          </div>
          <div className="service-info">
            <h4>IPFS Storage</h4>
            <p>{web3Status.ipfs.initialized ? 'Connecté' : 'Mode démo'}</p>
            <span className="service-provider">{web3Status.ipfs.provider}</span>
          </div>
          <div className="service-status">
            {web3Status.ipfs.initialized ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {/* Solde utilisateur */}
      {userBalance && (
        <div className="user-balance">
          <div className="balance-header">
            <Coins size={20} />
            <span>Mes Tokens</span>
          </div>
          <div className="balance-amount">
            {userBalance.totalRewards.toLocaleString()} NKWA
          </div>
          {userBalance.hederaBalance && (
            <div className="balance-source">
              {userBalance.hederaBalance.demo ? 'Mode démo' : 'Blockchain'}
            </div>
          )}
        </div>
      )}

      {/* Niveau utilisateur */}
      {userLevel && (
        <div className="user-level">
          <div className="level-header">
            <Award size={20} />
            <span>Niveau: {userLevel.current.name}</span>
          </div>
          <div className="level-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${userLevel.progress}%`,
                  backgroundColor: userLevel.current.color
                }}
              />
            </div>
            <span className="progress-text">
              {userLevel.progress.toFixed(1)}% vers {userLevel.next?.name || 'Max'}
            </span>
          </div>
          <div className="level-stats">
            <div className="stat">
              <TrendingUp size={16} />
              <span>{userLevel.contributions} contributions</span>
            </div>
            <div className="stat">
              <Coins size={16} />
              <span>{userLevel.totalRewards} tokens</span>
            </div>
          </div>
        </div>
      )}

      {/* Mode démo */}
      {web3Status.blockchain.demo && (
        <div className="demo-notice">
          <AlertCircle size={16} />
          <span>Mode démo activé - Configurez les services Web3 pour la production</span>
        </div>
      )}

      <style jsx>{`
        .web3-status {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          padding: 24px;
          color: white;
          margin: 20px 0;
        }

        .web3-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .web3-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .web3-header p {
          opacity: 0.8;
          margin: 0;
        }

        .web3-services {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .service-card {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .service-card.active {
          border-color: #10b981;
          background: rgba(16, 185, 129, 0.1);
        }

        .service-card.demo {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
        }

        .service-icon {
          flex-shrink: 0;
        }

        .service-info {
          flex: 1;
        }

        .service-info h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .service-info p {
          font-size: 0.875rem;
          opacity: 0.8;
          margin: 0 0 4px 0;
        }

        .service-network,
        .service-provider {
          font-size: 0.75rem;
          opacity: 0.7;
          background: rgba(255, 255, 255, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .service-status {
          flex-shrink: 0;
        }

        .user-balance,
        .user-level {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          backdrop-filter: blur(10px);
        }

        .balance-header,
        .level-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .balance-amount {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .balance-source {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .level-progress {
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }

        .progress-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .progress-text {
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .level-stats {
          display: flex;
          gap: 16px;
        }

        .stat {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.875rem;
          opacity: 0.8;
        }

        .demo-notice {
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          padding: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.875rem;
        }

        .loading,
        .error {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }

        .error {
          color: #ef4444;
        }
      `}</style>
    </motion.div>
  );
};

export default Web3Status;


