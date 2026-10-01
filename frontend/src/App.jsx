import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TranslationProvider, useTranslation } from './contexts/TranslationContext';
import { NotificationProvider } from './components/NotificationSystem';
import SocialApp from './pages/SocialApp';
import AuthModal from './components/AuthModal';
import { 
  Menu, 
  X, 
  LogIn, 
  LogOut,
  User, 
  Globe
} from 'lucide-react';
import Logo from './components/Logo';

// Composant principal avec authentification
const AppContent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, language, changeLanguage, getSupportedLanguages, isTranslating } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);

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

  const openAuth = () => {
    setAuthModalOpen(true);
    setSidebarOpen(false);
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
            <Logo size={36} animated={false} />
            <span className="wordmark">Nkwa</span>
          </div>

          {/* Desktop Navigation */}
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
                  <span>{user?.name || user?.username || t('guestUser')}</span>
                  <button className="logout-button" type="button" onClick={logout} aria-label="Se déconnecter">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <motion.button
                  className="auth-button"
                  onClick={openAuth}
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
            <span className="wordmark">Nkwa</span>
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
                <span>{user?.name || user?.username || t('guestUser')}</span>
                <button className="logout-button" type="button" onClick={logout}>
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                className="sidebar-auth-button"
                onClick={openAuth}
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
        key={user?.id || 'guest'}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <SocialApp onRequireAuth={openAuth} />
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
              <span className="wordmark">Nkwa</span>
            </div>
            <p className="footer-description">
              {t('footerDesc')}
            </p>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Nkwa. {t('allRightsReserved')}.</p>
          </div>
        </div>
      </motion.footer>

            <AuthModal
              isOpen={authModalOpen}
              onClose={() => setAuthModalOpen(false)}
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
          background: rgba(18, 22, 20, 0.94);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(198, 161, 91, 0.28);
          padding: 10px 0;
        }

        .navbar .container {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--paper);
        }

        .wordmark {
          font-size: 1.55rem;
          line-height: 1;
          color: var(--paper);
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
          background: transparent;
          border: 1px solid var(--line);
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
          border: 1px solid var(--gold);
          border-radius: var(--radius-sm);
          background: transparent;
          color: var(--african-yellow);
          font-family: inherit;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .auth-button:hover {
          background: var(--gold);
          color: #1a1610;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          color: var(--african-yellow);
          font-weight: 500;
        }

        .logout-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
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
          color: var(--paper);
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
          border: 1px solid var(--gold);
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
          background: var(--gold);
          color: #1a1610;
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
          color: var(--paper);
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
