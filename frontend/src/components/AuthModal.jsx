import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Mail, 
  Lock, 
  User,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const AuthModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const { login, register } = useAuth();
  const { t } = useTranslation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Connexion
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setSuccess('Connexion réussie !');
          setTimeout(() => {
            onClose();
            // Rediriger vers le dashboard admin si c'est un admin
            if (result.redirectToAdmin && onLoginSuccess) {
              onLoginSuccess('admin');
            }
          }, 1000);
        } else {
          setError(result.message);
        }
      } else {
        // Inscription
        if (formData.password !== formData.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          setLoading(false);
          return;
        }
        
        const result = await register(formData.email, formData.password, formData.name);
        if (result.success) {
          setSuccess('Inscription réussie !');
          setTimeout(() => {
            onClose();
            // Rediriger vers le dashboard admin si c'est un admin
            if (result.redirectToAdmin && onLoginSuccess) {
              onLoginSuccess('admin');
            }
          }, 1000);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmPassword: ''
    });
    setError('');
    setSuccess('');
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="auth-modal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="auth-modal-header">
              <h2>
                {isLogin ? (
                  <>
                    <LogIn size={24} />
                    Connexion
                  </>
                ) : (
                  <>
                    <UserPlus size={24} />
                    Inscription
                  </>
                )}
              </h2>
              <button 
                className="close-btn"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="name">Nom complet *</label>
                  <div className="input-with-icon">
                    <User size={20} />
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Votre nom complet"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email *</label>
                <div className="input-with-icon">
                  <Mail size={20} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Mot de passe *</label>
                <div className="input-with-icon">
                  <Lock size={20} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Votre mot de passe"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
                  <div className="input-with-icon">
                    <Lock size={20} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmez votre mot de passe"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Messages */}
              {error && (
                <motion.div 
                  className="message error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle size={16} />
                  {error}
                </motion.div>
              )}

              {success && (
                <motion.div 
                  className="message success"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <CheckCircle size={16} />
                  {success}
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    {isLogin ? 'Connexion...' : 'Inscription...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                    {isLogin ? 'Se connecter' : 'S\'inscrire'}
                  </>
                )}
              </motion.button>

              {/* Toggle Mode */}
              <div className="toggle-mode">
                <p>
                  {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}
                  <button
                    type="button"
                    className="toggle-btn"
                    onClick={toggleMode}
                  >
                    {isLogin ? 'S\'inscrire' : 'Se connecter'}
                  </button>
                </p>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;

// Styles CSS
const styles = `
  .auth-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: var(--spacing-md);
  }

  .auth-modal {
    background: var(--gradient-dark);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    width: 100%;
    max-width: 450px;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 215, 0, 0.2);
  }

  .auth-modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .auth-modal-header h2 {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    color: var(--african-yellow);
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0;
  }

  .close-btn {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all 0.3s ease;
  }

  .close-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--african-yellow);
  }

  .auth-form {
    padding: var(--spacing-lg);
  }

  .input-group {
    margin-bottom: var(--spacing-md);
  }

  .input-group label {
    display: block;
    margin-bottom: var(--spacing-xs);
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-icon svg {
    position: absolute;
    left: var(--spacing-sm);
    color: var(--african-yellow);
    z-index: 1;
  }

  .input-with-icon input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) 2.5rem;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-sm);
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-family: inherit;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .input-with-icon input:focus {
    outline: none;
    border-color: var(--african-yellow);
    background: rgba(255, 255, 255, 0.1);
  }

  .input-with-icon input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .password-toggle {
    position: absolute;
    right: var(--spacing-sm);
    background: none;
    border: none;
    color: var(--african-yellow);
    cursor: pointer;
    padding: var(--spacing-xs);
    border-radius: var(--radius-sm);
    transition: all 0.3s ease;
  }

  .password-toggle:hover {
    background: rgba(255, 215, 0, 0.1);
  }

  .message {
    display: flex;
    align-items: center;
    gap: var(--spacing-xs);
    padding: var(--spacing-sm);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-md);
    font-size: 0.9rem;
  }

  .message.error {
    background: rgba(220, 38, 38, 0.1);
    color: #fca5a5;
    border: 1px solid rgba(220, 38, 38, 0.3);
  }

  .message.success {
    background: rgba(34, 197, 94, 0.1);
    color: #86efac;
    border: 1px solid rgba(34, 197, 94, 0.3);
  }

  .submit-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background: linear-gradient(135deg, var(--african-yellow), var(--african-green));
    color: var(--african-black);
    border: none;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: var(--spacing-md);
  }

  .submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
  }

  .submit-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .toggle-mode {
    text-align: center;
  }

  .toggle-mode p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
  }

  .toggle-btn {
    background: none;
    border: none;
    color: var(--african-yellow);
    cursor: pointer;
    font-weight: 600;
    text-decoration: underline;
    margin-left: var(--spacing-xs);
    transition: all 0.3s ease;
  }

  .toggle-btn:hover {
    color: var(--african-green);
  }

  @media (max-width: 480px) {
    .auth-modal {
      margin: var(--spacing-sm);
      max-height: calc(100vh - 2rem);
    }
    
    .auth-modal-header,
    .auth-form {
      padding: var(--spacing-md);
    }
  }
`;

// Injecter les styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
