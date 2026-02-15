import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { NotificationProvider } from './components/NotificationSystem';
import Home from './pages/Home';
import UploadForm from './components/UploadForm';
import Museum from './pages/Museum';
import VirtualMuseum from './pages/VirtualMuseum';
import About from './pages/About';
import Riddles from './pages/Riddles';
import AdminDashboard from './pages/AdminDashboard';
import Web3Dashboard from './components/Web3Dashboard';
import AuthModal from './components/AuthModal';
import Web3Auth from './components/Web3Auth';
import AccessModeSelector from './components/AccessModeSelector';
import Web3Status from './components/Web3Status';
import { 
  Home as HomeIcon, 
  Upload, 
  Music, 
  Menu, 
  X, 
  LogIn, 
  User, 
  Users, 
  Brain, 
  Star,
  Globe
} from 'lucide-react';
import Logo from './components/Logo';

// Composant principal avec authentification
const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const { t, language, changeLanguage, getSupportedLanguages, isTranslating } = useTranslation();
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [accessModeSelectorOpen, setAccessModeSelectorOpen] = useState(false);
  const [web3AuthOpen, setWeb3AuthOpen] = useState(false);
  const [userAccessMode, setUserAccessMode] = useState(null);

  const preferredLanguageOrder = ['fr', 'en', 'es', 'pt', 'ar', 'sw', 'yo', 'ig', 'ha', 'zu'];
  const allLanguages = getSupportedLanguages();
  const languageOptions = [...allLanguages].sort((a, b) => {
    const indexA = preferredLanguageOrder.indexOf(a.code);
    const indexB = preferredLanguageOrder.indexOf(b.code);
    const rankA = indexA === -1 ? preferredLanguageOrder.length + 1 : indexA;
    const rankB = indexB === -1 ? preferredLanguageOrder.length + 1 : indexB;
    if (rankA !== rankB) return rankA - rankB;
    return a.name.localeCompare(b.name);
  });

  // Fonction pour gérer la redirection après connexion
  const handleLoginSuccess = (page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  // Fonction pour gérer la sélection du mode d'accès
  const handleAccessModeSelect = (mode) => {
    setUserAccessMode(mode);
    setAccessModeSelectorOpen(false);
    
    if (mode === 'email') {
      setAuthModalOpen(true);
    } else if (mode === 'web3') {
      setWeb3AuthOpen(true);
    }
  };

  // Fonction pour gérer la connexion Web3
  const handleWeb3AuthSuccess = (userData) => {
    setUserAccessMode('web3');
    setWeb3AuthOpen(false);
    // Ici vous pouvez intégrer avec votre système d'auth
    console.log('Web3 Auth Success:', userData);
  };

  const menuItems = [
    { id: 'home', label: t('home'), icon: HomeIcon },
    { id: 'museum', label: t('museum'), icon: Music },
    { id: 'virtual-museum', label: t('virtualMuseum'), icon: Star },
    // Web3 dashboard - only visible for Web3 users
    ...(userAccessMode === 'web3' ? [{ id: 'web3-dashboard', label: `🌐 ${t('web3Dashboard')}`, icon: Globe }] : []),
    { id: 'riddles', label: t('riddles'), icon: Brain },
    { id: 'upload', label: t('share'), icon: Upload },
    { id: 'about', label: t('about'), icon: Users },
    // Admin menu item - only visible for admin users
    ...(isAuthenticated() && user?.role === 'ADMIN' ? [{ id: 'admin', label: t('admin'), icon: Users }] : [])
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'museum':
        return <Museum />;
      case 'virtual-museum':
        return <VirtualMuseum />;
      case 'web3-dashboard':
        return <Web3Dashboard />;
      case 'riddles':
        return <Riddles />;
      case 'upload':
        return <UploadForm userId={1} />;
      case 'about':
        return <About />;
      case 'admin':
        // Vérifier que l'utilisateur est admin
        if (isAuthenticated() && user?.role === 'ADMIN') {
          return <AdminDashboard />;
        } else {
          // Rediriger vers la page d'accueil si pas admin
          setCurrentPage('home');
          return <Home />;
        }
      default:
        return <Home />;
    }
  };

  return (
    <div className="app">
      {/* Navigation */}
      <motion.nav 
        className="navbar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="nav-brand">
            <Logo size={40} animated={true} />
            <span>Nkwa V</span>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links desktop">
            {menuItems.map(page => (
              <button
                key={page.id}
                className={`nav-link ${currentPage === page.id ? 'active' : ''}`}
                onClick={() => setCurrentPage(page.id)}
              >
                <page.icon size={20} />
                {page.label}
              </button>
            ))}
          </div>

          {/* Auth Section */}
          <div className="nav-actions desktop">
            <div className="language-picker">
              <Globe size={16} />
              <select
                value={language}
                onChange={(event) => changeLanguage(event.target.value)}
                disabled={isTranslating}
                aria-label={t('languages')}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="nav-auth">
              {isAuthenticated() ? (
                <div className="user-info">
                  <User size={20} />
                  <span>{user?.firstName || t('guestUser')}</span>
                </div>
              ) : (
                <motion.button
                  className="auth-button"
                  onClick={() => setAccessModeSelectorOpen(true)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogIn size={20} />
                  {t('login')}
                </motion.button>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Sidebar */}
      <motion.div 
        className={`mobile-sidebar ${sidebarOpen ? 'open' : ''}`}
        initial={{ x: '-100%' }}
        animate={{ x: sidebarOpen ? '0%' : '-100%' }}
        transition={{ duration: 0.3 }}
      >
        <div className="sidebar-content">
          <div className="sidebar-header">
            <Logo size={32} animated={false} />
            <span>Nkwa V</span>
          </div>
          <div className="sidebar-links">
            {menuItems.map(page => (
              <button
                key={page.id}
                className={`sidebar-link ${currentPage === page.id ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPage(page.id);
                  setSidebarOpen(false);
                }}
              >
                <page.icon size={20} />
                {page.label}
              </button>
            ))}
          </div>

          <div className="sidebar-language">
            <label htmlFor="mobile-language-select">{t('languages')}</label>
            <select
              id="mobile-language-select"
              value={language}
              onChange={(event) => changeLanguage(event.target.value)}
              disabled={isTranslating}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile Auth Section */}
          <div className="sidebar-auth">
            {isAuthenticated() ? (
              <div className="user-info">
                <User size={20} />
                <span>{user?.firstName || t('guestUser')}</span>
              </div>
            ) : (
              <button
                className="sidebar-auth-button"
                onClick={() => {
                  setAuthModalOpen(true);
                  setSidebarOpen(false);
                }}
              >
                <LogIn size={20} />
                {t('login')}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <motion.div 
          className="sidebar-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <motion.main 
        className="main-content"
        key={currentPage}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {currentPage === 'home' ? (
          <div>
            <Home onNavigate={setCurrentPage} />
            <Web3Status />
          </div>
        ) : (
          renderPage()
        )}
      </motion.main>

      {/* Footer */}
      <motion.footer 
        className="footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Logo size={28} animated={false} />
              <span>Nkwa V</span>
            </div>
            <p className="footer-description">
              {t('footerDesc')}
            </p>
            <div className="footer-links">
              <button onClick={() => setCurrentPage('home')}>{t('home')}</button>
              <button onClick={() => setCurrentPage('museum')}>{t('museum')}</button>
              <button onClick={() => setCurrentPage('upload')}>{t('share')}</button>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 Nkwa V. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </motion.footer>

            {/* Access Mode Selector */}
            <AccessModeSelector
              isOpen={accessModeSelectorOpen}
              onModeSelect={handleAccessModeSelect}
              onClose={() => setAccessModeSelectorOpen(false)}
            />

            {/* Auth Modal */}
            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
              onLoginSuccess={handleLoginSuccess}
            />

            {/* Web3 Auth Modal */}
            <Web3Auth
              isOpen={web3AuthOpen}
              onClose={() => setWeb3AuthOpen(false)}
              onAuthSuccess={handleWeb3AuthSuccess}
            />

      <style jsx>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: var(--spacing-sm) 0;
        }

        .navbar .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--african-yellow);
        }

        .nav-links {
          display: flex;
          gap: var(--spacing-md);
        }

        .nav-auth {
          display: flex;
          align-items: center;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .language-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: var(--radius-sm);
          padding: 6px 10px;
        }

        .language-picker svg {
          color: var(--african-yellow);
        }

        .language-picker select {
          background: transparent;
          border: none;
          color: white;
          font-family: inherit;
          font-size: 0.85rem;
          min-width: 120px;
          cursor: pointer;
        }

        .language-picker select:focus {
          outline: none;
        }

        .language-picker select:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .language-picker option {
          background: #1a1a1a;
          color: white;
        }

        .auth-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border: 2px solid var(--african-yellow);
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--african-yellow);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-button:hover {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--african-yellow);
          font-weight: 500;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          border: none;
          background: transparent;
          color: white;
          font-family: inherit;
          font-size: 0.9rem;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background: rgba(255, 215, 0, 0.1);
          color: var(--african-yellow);
        }

        .nav-link.active {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: var(--spacing-xs);
        }

        .mobile-sidebar {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100vh;
          background: var(--gradient-dark);
          z-index: 1001;
          box-shadow: var(--shadow-xl);
        }

        .sidebar-content {
          padding: var(--spacing-lg);
        }

        .sidebar-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-xl);
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--african-yellow);
        }

        .sidebar-links {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-bottom: var(--spacing-lg);
        }

        .sidebar-language {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-md);
          margin-bottom: var(--spacing-md);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-language label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .sidebar-language select {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-sm);
          color: white;
          padding: 10px 12px;
          font-family: inherit;
          font-size: 0.9rem;
        }

        .sidebar-language select:focus {
          outline: none;
          border-color: var(--african-yellow);
        }

        .sidebar-auth {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: var(--spacing-md);
        }

        .sidebar-auth-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: 2px solid var(--african-yellow);
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--african-yellow);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }

        .sidebar-auth-button:hover {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .sidebar-link {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-md);
          border: none;
          background: transparent;
          color: white;
          font-family: inherit;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
          text-align: left;
        }

        .sidebar-link:hover {
          background: rgba(255, 215, 0, 0.1);
          color: var(--african-yellow);
        }

        .sidebar-link.active {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .sidebar-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .main-content {
          flex: 1;
          margin-top: 80px;
        }

        .footer {
          background: var(--gradient-dark);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: var(--spacing-xl) 0 var(--spacing-md);
          margin-top: auto;
        }

        .footer-content {
          text-align: center;
          margin-bottom: var(--spacing-lg);
        }

        .footer-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--african-yellow);
          margin-bottom: var(--spacing-sm);
        }

        .footer-description {
          opacity: 0.8;
          margin-bottom: var(--spacing-md);
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: var(--spacing-md);
          flex-wrap: wrap;
        }

        .footer-links button {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
        }

        .footer-links button:hover {
          color: var(--african-yellow);
        }

        .footer-bottom {
          text-align: center;
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          opacity: 0.6;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .desktop {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .main-content {
            margin-top: 70px;
          }

          .footer-links {
            flex-direction: column;
            align-items: center;
          }
        }
        
        .feedback-btn {
          position: fixed;
          bottom: 20px;
          right: 200px;
          background: linear-gradient(135deg, var(--african-green), var(--african-yellow));
          color: var(--african-black);
          border: none;
          border-radius: 50px;
          padding: 12px 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(34, 139, 34, 0.3);
          z-index: 1000;
          font-size: 1.2rem;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

// Composant App principal avec AuthProvider et TranslationProvider
function App() {
  return (
    <TranslationProvider>
      <AuthProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </AuthProvider>
    </TranslationProvider>
  );
}

export default App;
