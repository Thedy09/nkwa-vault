import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Star,
  ThumbsUp,
  Eye,
  Download
} from 'lucide-react';

const InteractiveActions = ({ 
  item, 
  userId, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  onRate,
  showComments = true 
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà liké cet élément
    if (item.likes && userId) {
      const userLike = item.likes.find(like => like.userId === userId);
      setIsLiked(!!userLike);
    }
  }, [item.likes, userId]);

  const handleLike = async () => {
    if (!userId) {
      alert('Veuillez vous connecter pour liker ce contenu');
      return;
    }

    try {
      const response = await fetch(`/api/content/${item.id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });

      const data = await response.json();
      
      if (response.ok) {
        setIsLiked(data.liked);
        onLike && onLike(data.liked);
      }
    } catch (error) {
      console.error('Erreur lors du like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!userId) {
      alert('Veuillez vous connecter pour ajouter aux favoris');
      return;
    }

    try {
      // Simulation d'ajout aux favoris
      setIsBookmarked(!isBookmarked);
      onBookmark && onBookmark(!isBookmarked);
    } catch (error) {
      console.error('Erreur lors de l\'ajout aux favoris:', error);
    }
  };

  const handleComment = async () => {
    if (!userId) {
      alert('Veuillez vous connecter pour commenter');
      return;
    }

    if (!commentText.trim()) {
      alert('Veuillez saisir un commentaire');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/content/${item.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userId, 
          content: commentText,
          rating: userRating > 0 ? userRating : null
        })
      });

      if (response.ok) {
        setCommentText('');
        setShowCommentForm(false);
        onComment && onComment();
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: window.location.href
      });
    } else {
      // Fallback: copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papiers !');
    }
    onShare && onShare();
  };

  const handleRating = (rating) => {
    if (!userId) {
      alert('Veuillez vous connecter pour noter ce contenu');
      return;
    }

    setUserRating(rating);
    onRate && onRate(rating);
  };

  const handleDownload = () => {
    if (item.audio) {
      const link = document.createElement('a');
      link.href = item.audio;
      link.download = `${item.title}.mp3`;
      link.click();
    } else if (item.video) {
      const link = document.createElement('a');
      link.href = item.video;
      link.download = `${item.title}.mp4`;
      link.click();
    }
  };

  return (
    <div className="interactive-actions">
      <div className="actions-row">
        {/* Like Button */}
        <motion.button
          className={`action-button like-button ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{item._count?.likes || item.likes || 0}</span>
        </motion.button>

        {/* Comment Button */}
        {showComments && (
          <motion.button
            className="action-button comment-button"
            onClick={() => setShowCommentForm(!showCommentForm)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MessageCircle size={18} />
            <span>{item._count?.reviews || 0}</span>
          </motion.button>
        )}

        {/* Bookmark Button */}
        <motion.button
          className={`action-button bookmark-button ${isBookmarked ? 'bookmarked' : ''}`}
          onClick={handleBookmark}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
        </motion.button>

        {/* Share Button */}
        <motion.button
          className="action-button share-button"
          onClick={handleShare}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Share2 size={18} />
        </motion.button>

        {/* Download Button */}
        {(item.audio || item.video) && (
          <motion.button
            className="action-button download-button"
            onClick={handleDownload}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Download size={18} />
          </motion.button>
        )}
      </div>

      {/* Rating Section */}
      <div className="rating-section">
        <div className="rating-label">Notez ce contenu :</div>
        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((rating) => (
            <motion.button
              key={rating}
              className={`rating-star ${userRating >= rating ? 'active' : ''}`}
              onClick={() => handleRating(rating)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <Star size={20} fill={userRating >= rating ? 'currentColor' : 'none'} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="comment-form"
        >
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Partagez votre avis sur ce contenu..."
            className="comment-textarea"
            rows={3}
          />
          <div className="comment-actions">
            <button
              onClick={() => setShowCommentForm(false)}
              className="cancel-button"
            >
              Annuler
            </button>
            <button
              onClick={handleComment}
              disabled={isSubmitting || !commentText.trim()}
              className="submit-button"
            >
              {isSubmitting ? 'Envoi...' : 'Commenter'}
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-item">
          <Eye size={14} />
          <span>{item.views || 0} vues</span>
        </div>
        <div className="stat-item">
          <ThumbsUp size={14} />
          <span>{item.likes || 0} likes</span>
        </div>
        {item.rating && (
          <div className="stat-item">
            <Star size={14} />
            <span>{item.rating.toFixed(1)}/5</span>
          </div>
        )}
      </div>

      <style jsx>{`
        .interactive-actions {
          padding: 1rem;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 0 0 12px 12px;
        }

        .actions-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 0.9rem;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .like-button.liked {
          background: rgba(255, 0, 0, 0.2);
          border-color: #ff6b6b;
          color: #ff6b6b;
        }

        .bookmark-button.bookmarked {
          background: var(--african-yellow);
          color: var(--african-dark);
        }

        .rating-section {
          margin-bottom: 1rem;
        }

        .rating-label {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .rating-stars {
          display: flex;
          gap: 0.25rem;
        }

        .rating-star {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .rating-star.active {
          color: var(--african-yellow);
        }

        .rating-star:hover {
          color: var(--african-yellow);
        }

        .comment-form {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .comment-textarea {
          width: 100%;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.75rem;
          border-radius: 6px;
          resize: vertical;
          font-family: inherit;
          font-size: 0.9rem;
        }

        .comment-textarea:focus {
          outline: none;
          border-color: var(--african-yellow);
        }

        .comment-textarea::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .comment-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .cancel-button,
        .submit-button {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .cancel-button {
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
        }

        .cancel-button:hover {
          background: rgba(255, 0, 0, 0.3);
        }

        .submit-button {
          background: var(--african-yellow);
          border: none;
          color: var(--african-dark);
          font-weight: 600;
        }

        .submit-button:hover:not(:disabled) {
          background: var(--african-gold);
        }

        .submit-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .stats-row {
          display: flex;
          gap: 1rem;
          padding-top: 0.75rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.8rem;
        }

        @media (max-width: 768px) {
          .actions-row {
            gap: 0.5rem;
          }

          .action-button {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
          }

          .stats-row {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default InteractiveActions;





