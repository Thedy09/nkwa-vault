import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, X, CheckCircle } from 'lucide-react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Détecter si l'app est déjà en mode standalone
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone || 
                      document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    // Écouter l'événement appinstalled
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    };

    // Vérifier si l'app est déjà installée
    if (standalone) {
      setIsInstalled(true);
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      // Afficher le prompt d'installation
      deferredPrompt.prompt();
      
      // Attendre la réponse de l'utilisateur
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ PWA: Installation acceptée par l\'utilisateur');
      } else {
        console.log('❌ PWA: Installation refusée par l\'utilisateur');
      }
      
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    } catch (error) {
      console.error('❌ PWA: Erreur lors de l\'installation', error);
    }
  };

  const handleIOSInstall = () => {
    // Instructions pour iOS
    setShowInstallBanner(false);
    // Ici on pourrait afficher un modal avec les instructions
    alert('Pour installer sur iOS:\n1. Appuyez sur le bouton Partager\n2. Sélectionnez "Sur l\'écran d\'accueil"\n3. Appuyez sur "Ajouter"');
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    // Ne plus afficher pendant cette session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Ne pas afficher si déjà installé ou si l'utilisateur a refusé
  if (isInstalled || isStandalone || !showInstallBanner) {
    return null;
  }

  // Vérifier si l'utilisateur a déjà refusé dans cette session
  if (sessionStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        className="pwa-install-banner"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5, type: "spring" }}
      >
        <div className="pwa-banner-content">
          <div className="pwa-banner-icon">
            <Smartphone size={24} />
          </div>
          
          <div className="pwa-banner-text">
            <h3>Installer ACV</h3>
            <p>
              {isIOS 
                ? 'Ajoutez African Culture Vault à votre écran d\'accueil pour une expérience optimale'
                : 'Installez African Culture Vault pour un accès rapide et une expérience hors ligne'
              }
            </p>
          </div>

          <div className="pwa-banner-actions">
            {isIOS ? (
              <motion.button
                className="pwa-install-btn ios"
                onClick={handleIOSInstall}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
                Instructions
              </motion.button>
            ) : (
              <motion.button
                className="pwa-install-btn"
                onClick={handleInstallClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download size={16} />
                Installer
              </motion.button>
            )}
            
            <button
              className="pwa-dismiss-btn"
              onClick={handleDismiss}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .pwa-install-banner {
            position: fixed;
            bottom: 20px;
            left: 20px;
            right: 20px;
            background: rgba(26, 26, 26, 0.95);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 215, 0, 0.3);
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 1000;
            max-width: 400px;
            margin: 0 auto;
          }

          .pwa-banner-content {
            display: flex;
            align-items: center;
            gap: 12px;
          }

          .pwa-banner-icon {
            color: var(--african-yellow);
            flex-shrink: 0;
          }

          .pwa-banner-text {
            flex: 1;
            min-width: 0;
          }

          .pwa-banner-text h3 {
            margin: 0 0 4px 0;
            font-size: 16px;
            font-weight: 600;
            color: white;
          }

          .pwa-banner-text p {
            margin: 0;
            font-size: 14px;
            color: rgba(255, 255, 255, 0.8);
            line-height: 1.4;
          }

          .pwa-banner-actions {
            display: flex;
            gap: 8px;
            flex-shrink: 0;
          }

          .pwa-install-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            background: var(--gradient-primary);
            color: var(--african-black);
            border: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .pwa-install-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
          }

          .pwa-install-btn.ios {
            background: var(--african-green);
            color: white;
          }

          .pwa-dismiss-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            background: rgba(255, 255, 255, 0.1);
            border: none;
            border-radius: 8px;
            color: rgba(255, 255, 255, 0.6);
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .pwa-dismiss-btn:hover {
            background: rgba(255, 255, 255, 0.2);
            color: white;
          }

          @media (max-width: 480px) {
            .pwa-install-banner {
              left: 10px;
              right: 10px;
              bottom: 10px;
            }

            .pwa-banner-content {
              flex-direction: column;
              align-items: flex-start;
              gap: 12px;
            }

            .pwa-banner-actions {
              width: 100%;
              justify-content: space-between;
            }

            .pwa-install-btn {
              flex: 1;
              justify-content: center;
            }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallButton;


