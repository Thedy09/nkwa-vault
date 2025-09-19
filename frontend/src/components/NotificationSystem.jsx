import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Heart,
  MessageCircle,
  UserPlus,
  Star,
  Download
} from 'lucide-react';

// Context pour les notifications
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

// Types de notifications
const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
  LIKE: 'like',
  COMMENT: 'comment',
  FOLLOW: 'follow',
  RATING: 'rating',
  DOWNLOAD: 'download'
};

// Icônes pour chaque type
const NOTIFICATION_ICONS = {
  [NOTIFICATION_TYPES.SUCCESS]: CheckCircle,
  [NOTIFICATION_TYPES.ERROR]: AlertCircle,
  [NOTIFICATION_TYPES.INFO]: Info,
  [NOTIFICATION_TYPES.WARNING]: AlertCircle,
  [NOTIFICATION_TYPES.LIKE]: Heart,
  [NOTIFICATION_TYPES.COMMENT]: MessageCircle,
  [NOTIFICATION_TYPES.FOLLOW]: UserPlus,
  [NOTIFICATION_TYPES.RATING]: Star,
  [NOTIFICATION_TYPES.DOWNLOAD]: Download
};

// Couleurs pour chaque type
const NOTIFICATION_COLORS = {
  [NOTIFICATION_TYPES.SUCCESS]: '#4CAF50',
  [NOTIFICATION_TYPES.ERROR]: '#f44336',
  [NOTIFICATION_TYPES.INFO]: '#2196F3',
  [NOTIFICATION_TYPES.WARNING]: '#FF9800',
  [NOTIFICATION_TYPES.LIKE]: '#E91E63',
  [NOTIFICATION_TYPES.COMMENT]: '#9C27B0',
  [NOTIFICATION_TYPES.FOLLOW]: '#00BCD4',
  [NOTIFICATION_TYPES.RATING]: '#FFD700',
  [NOTIFICATION_TYPES.DOWNLOAD]: '#607D8B'
};

// Provider des notifications
export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      title: 'Notification',
      message: '',
      duration: 5000,
      read: false,
      timestamp: new Date(),
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Auto-suppression après la durée spécifiée
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }
  };

  const removeNotification = (id) => {
    setNotifications(prev => {
      const notification = prev.find(n => n.id === id);
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      return prev.filter(n => n.id !== id);
    });
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);
  };

  const clearAll = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  // Méthodes de convenance pour différents types de notifications
  const showSuccess = (message, title = 'Succès') => {
    addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message
    });
  };

  const showError = (message, title = 'Erreur') => {
    addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      duration: 8000
    });
  };

  const showInfo = (message, title = 'Information') => {
    addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message
    });
  };

  const showWarning = (message, title = 'Attention') => {
    addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      duration: 6000
    });
  };

  const showLike = (userName, contentTitle) => {
    addNotification({
      type: NOTIFICATION_TYPES.LIKE,
      title: 'Nouveau Like',
      message: `${userName} a aimé "${contentTitle}"`,
      duration: 4000
    });
  };

  const showComment = (userName, contentTitle) => {
    addNotification({
      type: NOTIFICATION_TYPES.COMMENT,
      title: 'Nouveau Commentaire',
      message: `${userName} a commenté "${contentTitle}"`,
      duration: 5000
    });
  };

  const showFollow = (userName) => {
    addNotification({
      type: NOTIFICATION_TYPES.FOLLOW,
      title: 'Nouveau Follower',
      message: `${userName} vous suit maintenant`,
      duration: 4000
    });
  };

  const showRating = (userName, contentTitle, rating) => {
    addNotification({
      type: NOTIFICATION_TYPES.RATING,
      title: 'Nouvelle Note',
      message: `${userName} a noté "${contentTitle}" ${rating}/5`,
      duration: 5000
    });
  };

  const showDownload = (contentTitle) => {
    addNotification({
      type: NOTIFICATION_TYPES.DOWNLOAD,
      title: 'Téléchargement',
      message: `"${contentTitle}" a été téléchargé`,
      duration: 3000
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLike,
    showComment,
    showFollow,
    showRating,
    showDownload
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
};

// Container des notifications
const NotificationContainer = () => {
  const { notifications, unreadCount, removeNotification, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bouton de notification */}
      <motion.button
        className="notification-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Panel des notifications */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, x: 300, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <NotificationPanelHeader />
            <NotificationList />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications toast */}
      <div className="notification-toasts">
        <AnimatePresence>
          {notifications.slice(0, 3).map(notification => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>

      <style jsx>{`
        .notification-button {
          position: fixed;
          top: 2rem;
          right: 2rem;
          background: var(--african-yellow);
          color: var(--african-dark);
          border: none;
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1000;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
        }

        .notification-button:hover {
          background: var(--african-gold);
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4444;
          color: white;
          border-radius: 50%;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          font-weight: 600;
        }

        .notification-panel {
          position: fixed;
          top: 2rem;
          right: 2rem;
          width: 350px;
          max-height: 500px;
          background: rgba(0, 0, 0, 0.95);
          border-radius: 12px;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          z-index: 1001;
          overflow: hidden;
        }

        .notification-toasts {
          position: fixed;
          top: 2rem;
          left: 2rem;
          z-index: 1002;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        @media (max-width: 768px) {
          .notification-button {
            top: 1rem;
            right: 1rem;
            width: 45px;
            height: 45px;
          }

          .notification-panel {
            top: 1rem;
            right: 1rem;
            left: 1rem;
            width: auto;
          }

          .notification-toasts {
            top: 1rem;
            left: 1rem;
            right: 1rem;
          }
        }
      `}</style>
    </>
  );
};

// Header du panel
const NotificationPanelHeader = () => {
  const { unreadCount, markAllAsRead, clearAll } = useNotifications();

  return (
    <div className="panel-header">
      <h3>Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
      <div className="header-actions">
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="mark-all-read">
            Tout marquer comme lu
          </button>
        )}
        <button onClick={clearAll} className="clear-all">
          Effacer tout
        </button>
      </div>
    </div>
  );
};

// Liste des notifications
const NotificationList = () => {
  const { notifications, markAsRead, removeNotification } = useNotifications();

  return (
    <div className="notification-list">
      {notifications.length === 0 ? (
        <div className="empty-state">
          <Bell size={48} />
          <p>Aucune notification</p>
        </div>
      ) : (
        notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
            onRemove={removeNotification}
          />
        ))
      )}
    </div>
  );
};

// Item de notification
const NotificationItem = ({ notification, onMarkAsRead, onRemove }) => {
  const IconComponent = NOTIFICATION_ICONS[notification.type] || Info;
  const color = NOTIFICATION_COLORS[notification.type] || '#2196F3';

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <motion.div
      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
      onClick={handleClick}
      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      <div className="notification-icon" style={{ color }}>
        <IconComponent size={20} />
      </div>
      <div className="notification-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
        <span className="notification-time">
          {formatTime(notification.timestamp)}
        </span>
      </div>
      <button
        className="notification-close"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(notification.id);
        }}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Toast de notification
const NotificationToast = ({ notification, onRemove }) => {
  const IconComponent = NOTIFICATION_ICONS[notification.type] || Info;
  const color = NOTIFICATION_COLORS[notification.type] || '#2196F3';

  return (
    <motion.div
      className="notification-toast"
      style={{ borderLeftColor: color }}
      initial={{ opacity: 0, x: -300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -300, scale: 0.8 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="toast-icon" style={{ color }}>
        <IconComponent size={20} />
      </div>
      <div className="toast-content">
        <h4>{notification.title}</h4>
        <p>{notification.message}</p>
      </div>
      <button
        className="toast-close"
        onClick={() => onRemove(notification.id)}
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};

// Fonction utilitaire pour formater le temps
const formatTime = (timestamp) => {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  return `Il y a ${days}j`;
};

// Styles globaux
const globalStyles = `
  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .panel-header h3 {
    margin: 0;
    color: var(--african-yellow);
    font-size: 1.1rem;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
  }

  .mark-all-read,
  .clear-all {
    background: none;
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mark-all-read:hover {
    color: var(--african-yellow);
    border-color: var(--african-yellow);
  }

  .clear-all:hover {
    color: #ff6b6b;
    border-color: #ff6b6b;
  }

  .notification-list {
    max-height: 400px;
    overflow-y: auto;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .empty-state p {
    margin: 0.5rem 0 0 0;
    font-size: 0.9rem;
  }

  .notification-item {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
  }

  .notification-item.unread {
    background: rgba(255, 215, 0, 0.05);
  }

  .notification-item.unread::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--african-yellow);
  }

  .notification-icon {
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .notification-content {
    flex: 1;
    min-width: 0;
  }

  .notification-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: white;
  }

  .notification-content p {
    margin: 0 0 0.5rem 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .notification-time {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .notification-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .notification-close:hover {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }

  .notification-toast {
    background: rgba(0, 0, 0, 0.9);
    border-left: 4px solid;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 400px;
  }

  .toast-icon {
    flex-shrink: 0;
    margin-top: 0.25rem;
  }

  .toast-content {
    flex: 1;
    min-width: 0;
  }

  .toast-content h4 {
    margin: 0 0 0.25rem 0;
    font-size: 0.9rem;
    color: white;
  }

  .toast-content p {
    margin: 0;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
  }

  .toast-close {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  .toast-close:hover {
    color: #ff6b6b;
    background: rgba(255, 107, 107, 0.1);
  }
`;

// Injecter les styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = globalStyles;
  document.head.appendChild(styleSheet);
}

// Composant principal NotificationSystem
const NotificationSystem = () => {
  return null; // Ce composant est géré par le Provider
};

export default NotificationSystem;
