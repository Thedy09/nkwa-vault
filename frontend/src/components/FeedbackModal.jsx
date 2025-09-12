import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, MessageCircle, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import axios from 'axios';

export default function FeedbackModal({ isOpen, onClose }) {
  const [feedback, setFeedback] = useState({
    rating: 0,
    category: 'general',
    message: '',
    email: '',
    name: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'general', label: 'Général', icon: MessageCircle },
    { value: 'ui', label: 'Interface', icon: ThumbsUp },
    { value: 'features', label: 'Fonctionnalités', icon: Star },
    { value: 'bug', label: 'Bug', icon: ThumbsDown },
    { value: 'suggestion', label: 'Suggestion', icon: MessageCircle }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Envoyer le feedback (simulation pour l'instant)
      console.log('Feedback envoyé:', feedback);
      
      // Simuler l'envoi
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setSubmitted(false);
        setFeedback({ rating: 0, category: 'general', message: '', email: '', name: '' });
      }, 2000);
    } catch (error) {
      console.error('Erreur envoi feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="feedback-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="feedback-modal"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="feedback-header">
            <h3>💬 Votre avis sur Nkwa Vault</h3>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          {submitted ? (
            <motion.div
              className="feedback-success"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
            >
              <div className="success-icon">✅</div>
              <h4>Merci pour votre feedback !</h4>
              <p>Vos retours nous aident à améliorer Nkwa Vault</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              {/* Note */}
              <div className="feedback-group">
                <label>Note générale</label>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star ${feedback.rating >= star ? 'active' : ''}`}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                    >
                      <Star size={24} fill="currentColor" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Catégorie */}
              <div className="feedback-group">
                <label>Type de feedback</label>
                <div className="category-buttons">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        className={`category-btn ${feedback.category === cat.value ? 'active' : ''}`}
                        onClick={() => setFeedback({ ...feedback, category: cat.value })}
                      >
                        <Icon size={16} />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message */}
              <div className="feedback-group">
                <label>Votre message</label>
                <textarea
                  value={feedback.message}
                  onChange={(e) => setFeedback({ ...feedback, message: e.target.value })}
                  placeholder="Dites-nous ce que vous pensez de Nkwa Vault..."
                  rows={4}
                  required
                />
              </div>

              {/* Informations optionnelles */}
              <div className="feedback-row">
                <div className="feedback-group">
                  <label>Nom (optionnel)</label>
                  <input
                    type="text"
                    value={feedback.name}
                    onChange={(e) => setFeedback({ ...feedback, name: e.target.value })}
                    placeholder="Votre nom"
                  />
                </div>
                <div className="feedback-group">
                  <label>Email (optionnel)</label>
                  <input
                    type="email"
                    value={feedback.email}
                    onChange={(e) => setFeedback({ ...feedback, email: e.target.value })}
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Bouton d'envoi */}
              <motion.button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting || !feedback.message}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Envoyer le feedback
                  </>
                )}
              </motion.button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


