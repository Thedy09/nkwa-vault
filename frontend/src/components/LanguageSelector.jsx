import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/TranslationContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

const LanguageSelector = () => {
  const { language, changeLanguage, getSupportedLanguages, isTranslating } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const languages = getSupportedLanguages();
  const currentLanguage = languages.find(lang => lang.code === language);

  const handleLanguageChange = async (langCode) => {
    await changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="language-selector">
      <motion.button
        className="language-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={isTranslating}
      >
        <Globe size={16} />
        <span className="language-flag">{currentLanguage?.flag}</span>
        <span className="language-name">{currentLanguage?.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="language-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                className={`language-option ${language === lang.code ? 'active' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
                whileHover={{ backgroundColor: 'rgba(255, 215, 0, 0.1)' }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="language-flag">{lang.flag}</span>
                <span className="language-name">{lang.name}</span>
                {language === lang.code && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check size={16} />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isTranslating && (
        <motion.div
          className="translating-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="translating-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            🌍
          </motion.div>
          <span>Translating...</span>
        </motion.div>
      )}

      <style jsx>{`
        .language-selector {
          position: relative;
          display: inline-block;
        }

        .language-button {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-sm) var(--spacing-md);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: inherit;
          font-size: 0.9rem;
          min-width: 120px;
        }

        .language-button:hover {
          background: rgba(255, 215, 0, 0.1);
          border-color: var(--african-yellow);
        }

        .language-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .language-flag {
          font-size: 1.2rem;
        }

        .language-name {
          flex: 1;
          text-align: left;
        }

        .language-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--gradient-dark);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          box-shadow: var(--shadow-xl);
          z-index: 1000;
          max-height: 300px;
          overflow-y: auto;
          margin-top: var(--spacing-xs);
        }

        .language-option {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm) var(--spacing-md);
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          font-family: inherit;
          font-size: 0.9rem;
          width: 100%;
          text-align: left;
        }

        .language-option:hover {
          background: rgba(255, 215, 0, 0.1);
        }

        .language-option.active {
          background: rgba(255, 215, 0, 0.2);
          color: var(--african-yellow);
        }

        .translating-indicator {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--gradient-dark);
          border: 1px solid var(--african-yellow);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          margin-top: var(--spacing-xs);
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.8rem;
          color: var(--african-yellow);
        }

        .translating-spinner {
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .language-button {
            min-width: 100px;
            padding: var(--spacing-xs) var(--spacing-sm);
          }
          
          .language-name {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LanguageSelector;

