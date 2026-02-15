import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, Shield, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const Web3Status = () => {
  const [status, setStatus] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setLoading(true);
        const [statusResponse, statsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/web3/status`),
          fetch(`${API_BASE_URL}/api/web3/stats`)
        ]);

        const statusPayload = await statusResponse.json();
        const statsPayload = await statsResponse.json();

        if (statusPayload.success) {
          setStatus(statusPayload.data);
        }

        if (statsPayload.success) {
          setStats(statsPayload.data);
        }
      } catch (error) {
        console.error('Erreur récupération statut Web3:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

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

  if (!status) {
    return (
      <div className="web3-status">
        <div className="error">
          <AlertCircle size={24} />
          <span>Services Web3 non disponibles</span>
        </div>
      </div>
    );
  }

  const blockchain = status.blockchain || {};
  const ipfs = status.ipfs || {};

  return (
    <motion.div
      className="web3-status"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="web3-header">
        <h3>🌐 Services Web3</h3>
        <p>Blockchain EVM + stockage décentralisé</p>
      </div>

      <div className="web3-services">
        <div className={`service-card ${blockchain.initialized ? 'active' : 'demo'}`}>
          <div className="service-icon">
            <Shield size={24} />
          </div>
          <div className="service-info">
            <h4>Réseau EVM</h4>
            <p>{blockchain.initialized ? 'Connecté' : 'Mode démo'}</p>
            <span className="service-network">
              {blockchain.network || 'Non configuré'}
              {blockchain.chainId ? ` (chain ${blockchain.chainId})` : ''}
            </span>
          </div>
          <div className="service-status">
            {blockchain.initialized ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
          </div>
        </div>

        <div className={`service-card ${ipfs.initialized ? 'active' : 'demo'}`}>
          <div className="service-icon">
            <Link size={24} />
          </div>
          <div className="service-info">
            <h4>IPFS Storage</h4>
            <p>{ipfs.initialized ? 'Connecté' : 'Mode démo'}</p>
            <span className="service-provider">{ipfs.gateway || 'ipfs://gateway'}</span>
          </div>
          <div className="service-status">
            {ipfs.initialized ? (
              <CheckCircle size={20} className="text-green-500" />
            ) : (
              <AlertCircle size={20} className="text-yellow-500" />
            )}
          </div>
        </div>
      </div>

      {stats?.blockchain && (
        <div className="runtime">
          <div className="runtime-item">
            <strong>Relayer:</strong>
            <span>{stats.blockchain.relayerAddress || 'N/A'}</span>
          </div>
          <div className="runtime-item">
            <strong>Solde:</strong>
            <span>{stats.blockchain.balanceEth || '0'} ETH</span>
          </div>
          <div className="runtime-item">
            <strong>Certifications:</strong>
            <span>{stats.blockchain.totalCertifications || 0}</span>
          </div>
        </div>
      )}

      {status.mode === 'demo' && (
        <div className="demo-notice">
          <AlertCircle size={16} />
          <span>
            Mode démo activé. Configurez `EVM_RPC_URL`, `EVM_RELAYER_PRIVATE_KEY`
            et `EVM_REGISTRY_CONTRACT` pour activer l&apos;écriture on-chain.
          </span>
        </div>
      )}

      <style jsx>{`
        .web3-status {
          background: linear-gradient(135deg, #005f73 0%, #0a9396 100%);
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
          opacity: 0.85;
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
          background: rgba(16, 185, 129, 0.15);
        }

        .service-card.demo {
          border-color: #f59e0b;
          background: rgba(245, 158, 11, 0.15);
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
          opacity: 0.85;
          margin: 0 0 4px 0;
        }

        .service-network,
        .service-provider {
          font-size: 0.75rem;
          opacity: 0.8;
          background: rgba(255, 255, 255, 0.15);
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .runtime {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 16px;
          display: grid;
          gap: 8px;
        }

        .runtime-item {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 0.9rem;
        }

        .runtime-item span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .loading,
        .error {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: center;
          padding: 20px;
        }

        .demo-notice {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: rgba(245, 158, 11, 0.2);
          border: 1px solid rgba(245, 158, 11, 0.45);
          border-radius: 10px;
          padding: 12px;
          font-size: 0.85rem;
          line-height: 1.4;
        }
      `}</style>
    </motion.div>
  );
};

export default Web3Status;
