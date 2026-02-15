import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../contexts/TranslationContext';
import {
  Brain, 
  Lightbulb, 
  BookOpen, 
  Globe, 
  Tag, 
  Send, 
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  HelpCircle,
  Info
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const RiddleForm = ({ onClose, onSuccess }) => {
  const { user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    hint: '',
    explanation: '',
    culturalContext: '',
    category: 'other',
    difficulty: 'medium',
    language: 'fr',
    region: '',
    country: '',
    tags: [],
    keywords: []
  });

  const [tagInput, setTagInput] = useState('');
  const [keywordInput, setKeywordInput] = useState('');

  const categories = [
    { value: 'nature', label: t('nature') },
    { value: 'animals', label: t('animals') },
    { value: 'family', label: t('family') },
    { value: 'wisdom', label: t('wisdom') },
    { value: 'community', label: t('community') },
    { value: 'history', label: t('history') },
    { value: 'traditions', label: t('traditions') },
    { value: 'other', label: t('other') }
  ];

  const difficulties = [
    { value: 'easy', label: t('easy') },
    { value: 'medium', label: t('medium') },
    { value: 'hard', label: t('hard') }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !formData.keywords.includes(keywordInput.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keywordInput.trim()]
      }));
      setKeywordInput('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      setError('Vous devez être connecté pour soumettre une devinette');
      return;
    }

    if (!formData.question.trim() || !formData.answer.trim()) {
      setError('La question et la réponse sont obligatoires');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/riddles`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('acv_token') || ''}`
          }
        }
      );

      if (response.data.success) {
        setSuccess('Devinette soumise avec succès ! Elle sera examinée avant publication.');
        setTimeout(() => {
          onSuccess?.();
          onClose?.();
        }, 2000);
      } else {
        setError(response.data.message || 'Erreur lors de la soumission');
      }
    } catch (error) {
      console.error('Erreur soumission devinette:', error);
      setError(error.response?.data?.message || 'Erreur lors de la soumission de la devinette');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated()) {
    return (
      <motion.div 
        className="riddle-form-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-required">
          <div className="auth-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Authentification Requise</h3>
          <p>Vous devez être connecté pour soumettre une devinette.</p>
          <motion.button
            className="btn btn-primary"
            onClick={() => window.location.href = '/#login'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Se connecter
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="riddle-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="riddle-form-header">
        <div className="form-icon">
          <Brain size={32} />
        </div>
        <div className="form-title">
          <h2>Ajouter une Devinette</h2>
          <p>Partagez votre devinette africaine avec la communauté</p>
        </div>
        {onClose && (
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        )}
      </div>

      {error && (
        <motion.div 
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <AlertCircle size={20} />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div 
          className="success-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <CheckCircle size={20} />
          {success}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="riddle-form">
        {/* Question */}
        <div className="form-group">
          <label htmlFor="question" className="form-label">
            <Brain size={20} />
            Question de la devinette *
          </label>
          <textarea
            id="question"
            name="question"
            value={formData.question}
            onChange={handleChange}
            placeholder="Ex: Je suis grand et fort, je porte des feuilles vertes..."
            className="form-textarea"
            rows={3}
            maxLength={500}
            required
          />
          <div className="char-count">{formData.question.length}/500</div>
        </div>

        {/* Réponse */}
        <div className="form-group">
          <label htmlFor="answer" className="form-label">
            <CheckCircle size={20} />
            Réponse *
          </label>
          <input
            type="text"
            id="answer"
            name="answer"
            value={formData.answer}
            onChange={handleChange}
            placeholder="Ex: L'arbre"
            className="form-input"
            maxLength={200}
            required
          />
          <div className="char-count">{formData.answer.length}/200</div>
        </div>

        {/* Indice */}
        <div className="form-group">
          <label htmlFor="hint" className="form-label">
            <Lightbulb size={20} />
            Indice (optionnel)
          </label>
          <input
            type="text"
            id="hint"
            name="hint"
            value={formData.hint}
            onChange={handleChange}
            placeholder="Ex: On me trouve dans la forêt"
            className="form-input"
            maxLength={300}
          />
          <div className="char-count">{formData.hint.length}/300</div>
        </div>

        {/* Explication */}
        <div className="form-group">
          <label htmlFor="explanation" className="form-label">
            <BookOpen size={20} />
            Explication (optionnel)
          </label>
          <textarea
            id="explanation"
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            placeholder="Expliquez pourquoi c'est la bonne réponse..."
            className="form-textarea"
            rows={2}
            maxLength={1000}
          />
          <div className="char-count">{formData.explanation.length}/1000</div>
        </div>

        {/* Contexte culturel */}
        <div className="form-group">
          <label htmlFor="culturalContext" className="form-label">
            <Globe size={20} />
            Contexte culturel (optionnel)
          </label>
          <textarea
            id="culturalContext"
            name="culturalContext"
            value={formData.culturalContext}
            onChange={handleChange}
            placeholder="Contexte culturel, origine, signification..."
            className="form-textarea"
            rows={2}
            maxLength={1000}
          />
          <div className="char-count">{formData.culturalContext.length}/1000</div>
        </div>

        {/* Catégorie et Difficulté */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              <Tag size={20} />
              Catégorie
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="difficulty" className="form-label">
              <HelpCircle size={20} />
              Difficulté
            </label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="form-select"
            >
              {difficulties.map(diff => (
                <option key={diff.value} value={diff.value}>
                  {diff.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Région et Pays */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="region" className="form-label">
              <Globe size={20} />
              Région
            </label>
            <input
              type="text"
              id="region"
              name="region"
              value={formData.region}
              onChange={handleChange}
              placeholder="Ex: Afrique de l'Ouest"
              className="form-input"
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="country" className="form-label">
              <Globe size={20} />
              Pays
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Ex: Sénégal"
              className="form-input"
              maxLength={100}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="form-group">
          <label className="form-label">
            <Tag size={20} />
            Tags
          </label>
          <div className="tag-input-container">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              placeholder="Ajouter un tag..."
              className="form-input"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="btn btn-secondary btn-small"
            >
              Ajouter
            </button>
          </div>
          <div className="tags-list">
            {formData.tags.map((tag, index) => (
              <span key={index} className="tag">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="tag-remove"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Mots-clés */}
        <div className="form-group">
          <label className="form-label">
            <Info size={20} />
            Mots-clés
          </label>
          <div className="keyword-input-container">
            <input
              type="text"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddKeyword())}
              placeholder="Ajouter un mot-clé..."
              className="form-input"
            />
            <button
              type="button"
              onClick={handleAddKeyword}
              className="btn btn-secondary btn-small"
            >
              Ajouter
            </button>
          </div>
          <div className="keywords-list">
            {formData.keywords.map((keyword, index) => (
              <span key={index} className="keyword">
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="keyword-remove"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Boutons */}
        <div className="form-actions">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Annuler
            </button>
          )}
          <motion.button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            whileHover={{ scale: loading ? 1 : 1.05 }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinning" />
                Soumission...
              </>
            ) : (
              <>
                <Send size={20} />
                Soumettre la devinette
              </>
            )}
          </motion.button>
        </div>
      </form>

      <style jsx>{`
        .riddle-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-lg);
          background: var(--african-black);
          border-radius: 16px;
          border: 1px solid var(--african-yellow);
        }

        .riddle-form-header {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          margin-bottom: var(--spacing-lg);
          position: relative;
        }

        .form-icon {
          color: var(--african-yellow);
        }

        .form-title h2 {
          color: white;
          margin: 0;
          font-size: 1.5rem;
        }

        .form-title p {
          color: var(--text-muted);
          margin: 0;
          font-size: 0.9rem;
        }

        .close-btn {
          position: absolute;
          top: 0;
          right: 0;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 8px;
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .close-btn:hover {
          background: var(--african-red);
          color: white;
        }

        .auth-required {
          text-align: center;
          padding: var(--spacing-xl);
        }

        .auth-icon {
          color: var(--african-yellow);
          margin-bottom: var(--spacing-md);
        }

        .auth-required h3 {
          color: white;
          margin-bottom: var(--spacing-sm);
        }

        .auth-required p {
          color: var(--text-muted);
          margin-bottom: var(--spacing-lg);
        }

        .riddle-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--spacing-md);
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .form-input,
        .form-textarea,
        .form-select {
          background: var(--african-dark);
          border: 1px solid var(--african-green);
          border-radius: 8px;
          padding: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .char-count {
          text-align: right;
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .tag-input-container,
        .keyword-input-container {
          display: flex;
          gap: var(--spacing-sm);
        }

        .tags-list,
        .keywords-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-sm);
        }

        .tag,
        .keyword {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          background: var(--african-green);
          color: var(--african-black);
          padding: 4px 8px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .tag-remove,
        .keyword-remove {
          background: none;
          border: none;
          color: var(--african-black);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .tag-remove:hover,
        .keyword-remove:hover {
          background: var(--african-red);
          color: white;
        }

        .form-actions {
          display: flex;
          gap: var(--spacing-md);
          justify-content: flex-end;
          margin-top: var(--spacing-lg);
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }

        .btn-primary {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .btn-primary:hover:not(:disabled) {
          background: #FFA500;
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--african-green);
          color: var(--african-black);
        }

        .btn-secondary:hover {
          background: #228B22;
          transform: translateY(-2px);
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message,
        .success-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: 12px;
          border-radius: 8px;
          font-weight: 500;
          margin-bottom: var(--spacing-md);
        }

        .error-message {
          background: rgba(220, 20, 60, 0.1);
          color: var(--african-red);
          border: 1px solid var(--african-red);
        }

        .success-message {
          background: rgba(50, 205, 50, 0.1);
          color: var(--african-green);
          border: 1px solid var(--african-green);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
          
          .form-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default RiddleForm;
