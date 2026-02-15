import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Wallet, 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';

const Web3Auth = ({ isOpen, onAuthSuccess, onClose }) => {
  const [step, setStep] = useState(1);
  const [walletAddress, setWalletAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setWalletAddress('');
      setSignature('');
      setIsConnecting(false);
      setError('');
      setShowPrivateKey(false);
      setPrivateKey('');
    }
  }, [isOpen]);

  // Simuler la connexion à un wallet (dans un vrai projet, utiliser Web3Modal ou WalletConnect)
  const connectWallet = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulation de connexion wallet
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Adresse simulée pour la démo
      const mockAddress = '0x' + Math.random().toString(16).substr(2, 40);
      setWalletAddress(mockAddress);
      setStep(2);
    } catch (err) {
      setError('Erreur de connexion au wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  // Générer une signature pour l'authentification
  const generateSignature = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulation de génération de signature
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockSignature = '0x' + Math.random().toString(16).substr(2, 64);
      setSignature(mockSignature);
      setStep(3);
    } catch (err) {
      setError('Erreur de génération de signature');
    } finally {
      setIsConnecting(false);
    }
  };

  // Finaliser l'authentification Web3
  const finalizeAuth = async () => {
    setIsConnecting(true);
    setError('');

    try {
      // Simulation d'authentification avec le backend
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simuler la création d'un compte utilisateur Web3
      const userData = {
        id: 'web3_user_' + Date.now(),
        walletAddress,
        signature,
        authMethod: 'web3',
        isVerified: true,
        role: 'CONTRIBUTOR'
      };

      // Sauvegarder en localStorage pour la démo
      localStorage.setItem('web3_user', JSON.stringify(userData));
      
      onAuthSuccess(userData);
    } catch (err) {
      setError('Erreur d\'authentification Web3');
    } finally {
      setIsConnecting(false);
    }
  };

  // Copier l'adresse du wallet
  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
  };

  // Générer une clé privée pour la démo
  const generatePrivateKey = () => {
    const mockPrivateKey = '0x' + Math.random().toString(16).substr(2, 64);
    setPrivateKey(mockPrivateKey);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="web3-auth-modal">
          <div className="modal-overlay" onClick={onClose}></div>
          <motion.div 
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
        <div className="modal-header">
          <h2>🌐 Authentification Web3</h2>
          <p>Connectez votre wallet pour accéder à Nkwa V</p>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          {/* Étape 1: Connexion Wallet */}
          {step === 1 && (
            <motion.div 
              className="auth-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-icon">
                <Wallet size={48} />
              </div>
              <h3>Connexion Wallet</h3>
              <p>Connectez votre wallet crypto pour commencer</p>
              
              <div className="wallet-options">
                <button 
                  className="wallet-btn primary"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <Loader className="spinning" size={20} />
                  ) : (
                    <Wallet size={20} />
                  )}
                  {isConnecting ? 'Connexion...' : 'Connecter Wallet'}
                </button>
                
                <button 
                  className="wallet-btn secondary"
                  onClick={generatePrivateKey}
                >
                  <Shield size={20} />
                  Générer Clé Privée (Démo)
                </button>
              </div>

              {privateKey && (
                <div className="private-key-section">
                  <h4>Clé Privée Générée (Démo)</h4>
                  <div className="private-key-display">
                    <input
                      type={showPrivateKey ? 'text' : 'password'}
                      value={privateKey}
                      readOnly
                      className="private-key-input"
                    />
                    <button 
                      className="toggle-btn"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button 
                      className="copy-btn"
                      onClick={() => navigator.clipboard.writeText(privateKey)}
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  <p className="warning">
                    ⚠️ Ne partagez jamais votre clé privée. Cette clé est générée pour la démo uniquement.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* Étape 2: Signature */}
          {step === 2 && (
            <motion.div 
              className="auth-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-icon">
                <Shield size={48} />
              </div>
              <h3>Signature de Sécurité</h3>
              <p>Signez un message pour prouver la propriété de votre wallet</p>
              
              <div className="wallet-info">
                <div className="info-item">
                  <strong>Adresse Wallet:</strong>
                  <div className="address-display">
                    <span>{walletAddress}</span>
                    <button onClick={copyAddress} className="copy-btn">
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <button 
                className="sign-btn"
                onClick={generateSignature}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader className="spinning" size={20} />
                ) : (
                  <Shield size={20} />
                )}
                {isConnecting ? 'Génération...' : 'Signer le Message'}
              </button>
            </motion.div>
          )}

          {/* Étape 3: Finalisation */}
          {step === 3 && (
            <motion.div 
              className="auth-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="step-icon success">
                <CheckCircle size={48} />
              </div>
              <h3>Authentification Réussie</h3>
              <p>Votre wallet est maintenant connecté à Nkwa V</p>
              
              <div className="auth-details">
                <div className="detail-item">
                  <strong>Adresse:</strong>
                  <span>{walletAddress}</span>
                </div>
                <div className="detail-item">
                  <strong>Signature:</strong>
                  <span className="signature">{signature.substring(0, 20)}...</span>
                </div>
                <div className="detail-item">
                  <strong>Méthode:</strong>
                  <span>Web3 Wallet</span>
                </div>
              </div>

              <button 
                className="finalize-btn"
                onClick={finalizeAuth}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader className="spinning" size={20} />
                ) : (
                  <CheckCircle size={20} />
                )}
                {isConnecting ? 'Finalisation...' : 'Finaliser l\'Authentification'}
              </button>
            </motion.div>
          )}

          {/* Gestion des erreurs */}
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Informations Web3 */}
          <div className="web3-info">
            <h4>🔐 Sécurité Web3</h4>
            <ul>
              <li>Votre wallet reste sous votre contrôle</li>
              <li>Aucune clé privée n'est stockée sur nos serveurs</li>
              <li>Authentification décentralisée et sécurisée</li>
              <li>Accès aux fonctionnalités blockchain de Nkwa V</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <div className="step-indicator">
            {[1, 2, 3].map((stepNum) => (
              <div 
                key={stepNum}
                className={`step-dot ${step >= stepNum ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>

            <style jsx>{`
          .web3-auth-modal {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(5px);
          }

          .modal-content {
            position: relative;
            background: white;
            border-radius: 20px;
            width: 90%;
            max-width: 500px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .modal-header {
            padding: 2rem 2rem 1rem;
            text-align: center;
            border-bottom: 1px solid #e0e0e0;
            position: relative;
          }

          .modal-header h2 {
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .modal-header p {
            color: #666;
            margin-bottom: 0;
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .close-btn:hover {
            background: #f0f0f0;
            color: #333;
          }

          .modal-body {
            padding: 2rem;
          }

          .auth-step {
            text-align: center;
          }

          .step-icon {
            margin-bottom: 1.5rem;
            color: #667eea;
          }

          .step-icon.success {
            color: #10b981;
          }

          .auth-step h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            color: #333;
          }

          .auth-step p {
            color: #666;
            margin-bottom: 2rem;
          }

          .wallet-options {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 2rem;
          }

          .wallet-btn, .sign-btn, .finalize-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 1rem 2rem;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .wallet-btn.primary, .sign-btn, .finalize-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .wallet-btn.secondary {
            background: #f8f9fa;
            color: #333;
            border: 1px solid #e0e0e0;
          }

          .wallet-btn:hover, .sign-btn:hover, .finalize-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }

          .wallet-btn:disabled, .sign-btn:disabled, .finalize-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }

          .spinning {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }

          .private-key-section {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
            text-align: left;
          }

          .private-key-section h4 {
            margin-bottom: 1rem;
            color: #333;
          }

          .private-key-display {
            display: flex;
            gap: 0.5rem;
            margin-bottom: 1rem;
          }

          .private-key-input {
            flex: 1;
            padding: 0.75rem;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-family: monospace;
            font-size: 0.9rem;
          }

          .toggle-btn, .copy-btn {
            padding: 0.75rem;
            border: 1px solid #ddd;
            background: white;
            border-radius: 5px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .toggle-btn:hover, .copy-btn:hover {
            background: #f0f0f0;
          }

          .warning {
            color: #e74c3c;
            font-size: 0.9rem;
            margin: 0;
          }

          .wallet-info {
            margin-bottom: 2rem;
          }

          .info-item {
            margin-bottom: 1rem;
          }

          .info-item strong {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
          }

          .address-display {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 5px;
            font-family: monospace;
            font-size: 0.9rem;
          }

          .address-display span {
            flex: 1;
            word-break: break-all;
          }

          .auth-details {
            margin-bottom: 2rem;
            text-align: left;
          }

          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem 0;
            border-bottom: 1px solid #e0e0e0;
          }

          .detail-item:last-child {
            border-bottom: none;
          }

          .detail-item strong {
            color: #333;
          }

          .signature {
            font-family: monospace;
            color: #666;
          }

          .error-message {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 1rem;
            background: #fee;
            color: #e74c3c;
            border-radius: 5px;
            margin-bottom: 1rem;
          }

          .web3-info {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #f0f8ff;
            border-radius: 10px;
            text-align: left;
          }

          .web3-info h4 {
            margin-bottom: 1rem;
            color: #333;
          }

          .web3-info ul {
            margin: 0;
            padding-left: 1.5rem;
          }

          .web3-info li {
            margin-bottom: 0.5rem;
            color: #666;
          }

          .modal-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            border-top: 1px solid #e0e0e0;
          }

          .cancel-btn {
            background: none;
            border: 1px solid #ddd;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            color: #666;
          }

          .cancel-btn:hover {
            background: #f0f0f0;
          }

          .step-indicator {
            display: flex;
            gap: 0.5rem;
          }

          .step-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #ddd;
            transition: all 0.3s ease;
          }

          .step-dot.active {
            background: #667eea;
            transform: scale(1.2);
          }

          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              margin: 1rem;
            }

            .modal-header, .modal-body {
              padding: 1.5rem;
            }

            .wallet-options {
              gap: 0.75rem;
            }

            .wallet-btn, .sign-btn, .finalize-btn {
              padding: 0.75rem 1.5rem;
            }
          }
            `}</style>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Web3Auth;
