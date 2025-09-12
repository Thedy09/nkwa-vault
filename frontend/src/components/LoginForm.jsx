import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Loader2
} from 'lucide-react';

const LoginForm = ({ onSwitchToRegister, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Effacer l'erreur quand l'utilisateur tape
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      onClose?.(); // Fermer le modal si fourni
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <motion.div 
      className="auth-form"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="auth-header">
        <h2 className="auth-title">
          <LogIn size={32} />
          Connexion
        </h2>
        <p className="auth-subtitle">
          Accédez à votre compte African Culture Vault
        </p>
      </div>

      <form onSubmit={handleSubmit} className="auth-form-content">
        {error && (
          <motion.div 
            className="auth-error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertCircle size={20} />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="input-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <Mail size={20} />
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
        </div>

        <div className="input-group">
          <label htmlFor="password">Mot de passe</label>
          <div className="input-with-icon">
            <Lock size={20} />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Votre mot de passe"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <motion.button
          type="submit"
          className="btn btn-primary btn-large auth-submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? (
            <>
              <Loader2 size={20} className="spinner" />
              Connexion...
            </>
          ) : (
            <>
              <LogIn size={20} />
              Se connecter
            </>
          )}
        </motion.button>

        <div className="auth-switch">
          <p>Pas encore de compte ?</p>
          <button
            type="button"
            className="auth-link"
            onClick={onSwitchToRegister}
            disabled={loading}
          >
            Créer un compte
          </button>
        </div>
      </form>

      <style jsx>{`
        .auth-form {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          max-width: 400px;
          width: 100%;
          box-shadow: var(--shadow-xl);
        }

        .auth-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .auth-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
          color: var(--african-yellow);
        }

        .auth-subtitle {
          opacity: 0.8;
          font-size: 1rem;
        }

        .auth-form-content {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-md);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(220, 20, 60, 0.1);
          border: 1px solid var(--african-red);
          border-radius: var(--radius-sm);
          color: var(--african-red);
          font-size: 0.9rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .input-group label {
          font-weight: 500;
          color: var(--african-yellow);
          font-size: 0.9rem;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-with-icon svg:first-child {
          position: absolute;
          left: var(--spacing-sm);
          color: var(--african-yellow);
          z-index: 1;
        }

        .input-with-icon input {
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-sm) var(--spacing-sm) calc(var(--spacing-sm) + 24px);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-family: inherit;
          transition: all 0.3s ease;
        }

        .input-with-icon input:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .input-with-icon input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .password-toggle:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .auth-submit {
          width: 100%;
          margin-top: var(--spacing-md);
        }

        .auth-switch {
          text-align: center;
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .auth-switch p {
          margin-bottom: var(--spacing-sm);
          opacity: 0.8;
        }

        .auth-link {
          background: none;
          border: none;
          color: var(--african-yellow);
          cursor: pointer;
          font-family: inherit;
          font-size: 1rem;
          font-weight: 500;
          text-decoration: underline;
          transition: all 0.3s ease;
        }

        .auth-link:hover {
          color: var(--african-gold);
        }

        .auth-link:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </motion.div>
  );
};

export default LoginForm;


