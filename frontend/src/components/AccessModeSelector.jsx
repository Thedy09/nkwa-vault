import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Wallet, 
  Globe, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle,
  Users
} from 'lucide-react';

const AccessModeSelector = ({ onModeSelect, onClose }) => {
  const [selectedMode, setSelectedMode] = useState(null);

  const accessModes = [
    {
      id: 'email',
      title: 'Connexion Email',
      subtitle: 'Accès simple et rapide',
      icon: Mail,
      description: 'Connectez-vous avec votre email pour explorer et contribuer au patrimoine culturel africain',
      features: [
        'Navigation complète de la plateforme',
        'Consultation des collections',
        'Participation aux devinettes',
        'Upload de contenus culturels',
        'Système de récompenses traditionnel'
      ],
      color: 'blue',
      recommended: true
    },
    {
      id: 'web3',
      title: 'Mode Web3',
      subtitle: 'Fonctionnalités avancées',
      icon: Wallet,
      description: 'Accès complet avec wallet crypto pour les fonctionnalités blockchain avancées',
      features: [
        'Certification blockchain des contenus',
        'Création de NFTs culturels',
        'Propriété intellectuelle protégée',
        'Récompenses en tokens NKWA',
        'Stockage décentralisé IPFS'
      ],
      color: 'purple',
      advanced: true
    }
  ];

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    setTimeout(() => {
      onModeSelect(mode.id);
    }, 500);
  };

  return (
    <div className="access-mode-modal">
      <div className="modal-overlay" onClick={onClose}></div>
      <motion.div 
        className="modal-content"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="modal-header">
          <h2>🌍 Bienvenue sur Nkwa V</h2>
          <p>Choisissez votre mode d'accès pour explorer le patrimoine culturel africain</p>
          <button className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="modes-grid">
            {accessModes.map((mode) => {
              const IconComponent = mode.icon;
              const isSelected = selectedMode?.id === mode.id;
              
              return (
                <motion.div
                  key={mode.id}
                  className={`mode-card ${mode.color} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleModeSelect(mode)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {mode.recommended && (
                    <div className="recommended-badge">
                      <Star size={16} />
                      Recommandé
                    </div>
                  )}
                  
                  {mode.advanced && (
                    <div className="advanced-badge">
                      <Globe size={16} />
                      Avancé
                    </div>
                  )}

                  <div className="mode-icon">
                    <IconComponent size={48} />
                  </div>

                  <h3>{mode.title}</h3>
                  <p className="mode-subtitle">{mode.subtitle}</p>
                  <p className="mode-description">{mode.description}</p>

                  <div className="features-list">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <CheckCircle size={16} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mode-footer">
                    <button className="select-btn">
                      {isSelected ? (
                        <>
                          <CheckCircle size={20} />
                          Sélectionné
                        </>
                      ) : (
                        <>
                          Choisir ce mode
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="info-section">
            <div className="info-card">
              <Users size={24} />
              <div>
                <h4>Accessible à tous</h4>
                <p>Que vous soyez novice ou expert en technologie, Nkwa V s'adapte à votre niveau</p>
              </div>
            </div>
            
            <div className="info-card">
              <Shield size={24} />
              <div>
                <h4>Sécurité garantie</h4>
                <p>Vos données sont protégées et vous gardez le contrôle total de vos contributions</p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .access-mode-modal {
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
            max-width: 1000px;
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
            font-size: 2rem;
            margin-bottom: 0.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .modal-header p {
            color: #666;
            margin-bottom: 0;
            font-size: 1.1rem;
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

          .modes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
          }

          .mode-card {
            position: relative;
            border: 2px solid #e0e0e0;
            border-radius: 15px;
            padding: 2rem;
            cursor: pointer;
            transition: all 0.3s ease;
            background: white;
          }

          .mode-card:hover {
            border-color: #667eea;
            box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
          }

          .mode-card.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
            box-shadow: 0 15px 40px rgba(102, 126, 234, 0.2);
          }

          .mode-card.blue {
            border-color: #3b82f6;
          }

          .mode-card.blue:hover,
          .mode-card.blue.selected {
            border-color: #2563eb;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          }

          .mode-card.purple {
            border-color: #8b5cf6;
          }

          .mode-card.purple:hover,
          .mode-card.purple.selected {
            border-color: #7c3aed;
            background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
          }

          .recommended-badge {
            position: absolute;
            top: -10px;
            right: 20px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          }

          .advanced-badge {
            position: absolute;
            top: -10px;
            right: 20px;
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
            padding: 0.5rem 1rem;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.25rem;
            box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
          }

          .mode-icon {
            text-align: center;
            margin-bottom: 1.5rem;
          }

          .mode-card.blue .mode-icon {
            color: #3b82f6;
          }

          .mode-card.purple .mode-icon {
            color: #8b5cf6;
          }

          .mode-card h3 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            text-align: center;
            color: #333;
          }

          .mode-subtitle {
            text-align: center;
            color: #666;
            font-weight: 600;
            margin-bottom: 1rem;
          }

          .mode-description {
            text-align: center;
            color: #666;
            margin-bottom: 2rem;
            line-height: 1.6;
          }

          .features-list {
            margin-bottom: 2rem;
          }

          .feature-item {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            margin-bottom: 0.75rem;
            color: #555;
          }

          .feature-item:last-child {
            margin-bottom: 0;
          }

          .feature-item svg {
            color: #10b981;
            flex-shrink: 0;
          }

          .mode-footer {
            text-align: center;
          }

          .select-btn {
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
            width: 100%;
          }

          .mode-card.blue .select-btn {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
          }

          .mode-card.purple .select-btn {
            background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
            color: white;
          }

          .select-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
          }

          .mode-card.selected .select-btn {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          }

          .info-section {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
          }

          .info-card {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1.5rem;
            background: #f8f9fa;
            border-radius: 10px;
          }

          .info-card svg {
            color: #667eea;
            flex-shrink: 0;
          }

          .info-card h4 {
            margin-bottom: 0.5rem;
            color: #333;
          }

          .info-card p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
            line-height: 1.5;
          }

          @media (max-width: 768px) {
            .modal-content {
              width: 95%;
              margin: 1rem;
            }

            .modal-header, .modal-body {
              padding: 1.5rem;
            }

            .modes-grid {
              grid-template-columns: 1fr;
            }

            .mode-card {
              padding: 1.5rem;
            }

            .info-section {
              grid-template-columns: 1fr;
            }

            .info-card {
              flex-direction: column;
              text-align: center;
            }
          }
        `}</style>
      </motion.div>
    </div>
  );
};

export default AccessModeSelector;
