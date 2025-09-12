import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  LogOut, 
  Settings, 
  Crown, 
  Shield,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const UserProfile = () => {
  const { user, logout, isAdmin, isModerator } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const getRoleIcon = () => {
    if (isAdmin()) return <Crown size={16} />;
    if (isModerator()) return <Shield size={16} />;
    return <User size={16} />;
  };

  const getRoleText = () => {
    if (isAdmin()) return 'Administrateur';
    if (isModerator()) return 'Modérateur';
    return 'Utilisateur';
  };

  const getRoleColor = () => {
    if (isAdmin()) return 'var(--african-gold)';
    if (isModerator()) return 'var(--african-green)';
    return 'var(--african-yellow)';
  };

  return (
    <div className="user-profile">
      <motion.button
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="user-avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="user-info">
          <span className="user-name">{user.name}</span>
          <span className="user-role" style={{ color: getRoleColor() }}>
            {getRoleIcon()}
            {getRoleText()}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={16} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="user-profile-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="user-profile-header">
              <div className="user-avatar-large">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h3 className="user-name-large">{user.name}</h3>
                <p className="user-email">{user.email}</p>
                <div className="user-role-badge" style={{ backgroundColor: getRoleColor() }}>
                  {getRoleIcon()}
                  {getRoleText()}
                </div>
              </div>
            </div>

            <div className="user-profile-actions">
              <button className="profile-action">
                <Settings size={16} />
                Paramètres
              </button>
              <button className="profile-action" onClick={logout}>
                <LogOut size={16} />
                Déconnexion
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .user-profile {
          position: relative;
        }

        .user-profile-trigger {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
        }

        .user-profile-trigger:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: var(--african-yellow);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: var(--african-black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.2rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .user-role {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.8rem;
          opacity: 0.8;
        }

        .user-profile-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: var(--spacing-sm);
          background: rgba(26, 26, 26, 0.95);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-xl);
          min-width: 280px;
          z-index: 1000;
        }

        .user-profile-header {
          padding: var(--spacing-lg);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-avatar-large {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: var(--gradient-primary);
          color: var(--african-black);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.5rem;
          margin: 0 auto var(--spacing-md);
        }

        .user-details {
          text-align: center;
        }

        .user-name-large {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: var(--spacing-xs);
          color: white;
        }

        .user-email {
          font-size: 0.9rem;
          opacity: 0.7;
          margin-bottom: var(--spacing-sm);
        }

        .user-role-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-xs) var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
          color: white;
        }

        .user-profile-actions {
          padding: var(--spacing-sm);
        }

        .profile-action {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          width: 100%;
          padding: var(--spacing-sm) var(--spacing-md);
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
          font-family: inherit;
          text-align: left;
        }

        .profile-action:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .profile-action:last-child {
          color: var(--african-red);
        }

        .profile-action:last-child:hover {
          background: rgba(220, 20, 60, 0.1);
        }

        @media (max-width: 768px) {
          .user-profile-trigger {
            min-width: auto;
            padding: var(--spacing-xs);
          }

          .user-info {
            display: none;
          }

          .user-profile-dropdown {
            right: -10px;
            left: -10px;
            min-width: auto;
          }
        }
      `}</style>
    </div>
  );
};

export default UserProfile;


