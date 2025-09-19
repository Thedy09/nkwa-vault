import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Users, 
  FileText,
  TrendingUp,
  Activity,
  Settings,
  Upload,
  Download,
  Search,
  Filter,
  MoreVertical
} from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsResponse = await fetch('/api/content/stats/overview');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Charger le contenu
      const contentResponse = await fetch('/api/content?limit=50');
      const contentData = await contentResponse.json();
      setContent(contentData.items || []);

    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      try {
        const response = await fetch(`/api/content/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer admin-token'
          }
        });

        if (response.ok) {
          setContent(content.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedItems.length} éléments ?`)) {
      try {
        await Promise.all(
          selectedItems.map(id => 
            fetch(`/api/content/${id}`, {
              method: 'DELETE',
              headers: {
                'Authorization': 'Bearer admin-token'
              }
            })
          )
        );
        
        setContent(content.filter(item => !selectedItems.includes(item.id)));
        setSelectedItems([]);
      } catch (error) {
        console.error('Erreur lors de la suppression en lot:', error);
      }
    }
  };

  const filteredContent = content.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'content', label: 'Contenu', icon: FileText },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard Administrateur</h1>
        <div className="header-actions">
          <button 
            className="add-button"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} />
            Ajouter du contenu
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="overview-tab"
          >
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <FileText size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.totalItems || 0}</h3>
                  <p>Total Contenu</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.totalLikes || 0}</h3>
                  <p>Total Likes</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Eye size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.totalViews || 0}</h3>
                  <p>Total Vues</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">
                  <Activity size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stats.totalReviews || 0}</h3>
                  <p>Total Commentaires</p>
                </div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-card">
                <h3>Contenu par Catégorie</h3>
                <div className="category-chart">
                  {stats.categoryStats?.map(category => (
                    <div key={category.category} className="category-item">
                      <span className="category-name">{category.category}</span>
                      <div className="category-bar">
                        <div 
                          className="category-fill"
                          style={{ 
                            width: `${(category._count.category / stats.totalItems) * 100}%` 
                          }}
                        />
                      </div>
                      <span className="category-count">{category._count.category}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <h3>Contenu Récent</h3>
                <div className="recent-items">
                  {stats.recentItems?.map(item => (
                    <div key={item.id} className="recent-item">
                      <div className="item-info">
                        <h4>{item.title}</h4>
                        <p>{item.category}</p>
                      </div>
                      <span className="item-date">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="content-tab"
          >
            <div className="content-header">
              <div className="search-container">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Rechercher du contenu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="bulk-actions">
                {selectedItems.length > 0 && (
                  <button 
                    className="bulk-delete-button"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 size={16} />
                    Supprimer ({selectedItems.length})
                  </button>
                )}
              </div>
            </div>

            <div className="content-table">
              <div className="table-header">
                <div className="table-cell checkbox">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === filteredContent.length && filteredContent.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(filteredContent.map(item => item.id));
                      } else {
                        setSelectedItems([]);
                      }
                    }}
                  />
                </div>
                <div className="table-cell">Titre</div>
                <div className="table-cell">Catégorie</div>
                <div className="table-cell">Origine</div>
                <div className="table-cell">Vues</div>
                <div className="table-cell">Likes</div>
                <div className="table-cell">Date</div>
                <div className="table-cell">Actions</div>
              </div>

              <div className="table-body">
                {filteredContent.map(item => (
                  <div key={item.id} className="table-row">
                    <div className="table-cell checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems([...selectedItems, item.id]);
                          } else {
                            setSelectedItems(selectedItems.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </div>
                    <div className="table-cell">
                      <div className="item-title">
                        <h4>{item.title}</h4>
                        <p>{item.description}</p>
                      </div>
                    </div>
                    <div className="table-cell">
                      <span className="category-badge">{item.category}</span>
                    </div>
                    <div className="table-cell">{item.origin}</div>
                    <div className="table-cell">{item.views || 0}</div>
                    <div className="table-cell">{item.likes || 0}</div>
                    <div className="table-cell">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="table-cell">
                      <div className="action-buttons">
                        <button className="action-btn view-btn">
                          <Eye size={14} />
                        </button>
                        <button className="action-btn edit-btn">
                          <Edit size={14} />
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <h3>Gestion des Utilisateurs</h3>
            <p>Fonctionnalité en cours de développement...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-tab">
            <h3>Analytics Avancées</h3>
            <p>Fonctionnalité en cours de développement...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h3>Paramètres du Système</h3>
            <p>Fonctionnalité en cours de développement...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .admin-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: white;
          padding: 2rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(45deg, #FFD700, #FFA500);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--african-yellow);
          color: var(--african-dark);
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .add-button:hover {
          background: var(--african-gold);
          transform: translateY(-2px);
        }

        .dashboard-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.7);
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 2px solid transparent;
        }

        .tab-button:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .tab-button.active {
          color: var(--african-yellow);
          border-bottom-color: var(--african-yellow);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .stat-icon {
          background: var(--african-yellow);
          color: var(--african-dark);
          padding: 1rem;
          border-radius: 8px;
        }

        .stat-content h3 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .stat-content p {
          color: rgba(255, 255, 255, 0.7);
          margin: 0;
        }

        .charts-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .chart-card {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .chart-card h3 {
          margin: 0 0 1rem 0;
          color: var(--african-yellow);
        }

        .category-chart {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .category-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-name {
          min-width: 100px;
          font-size: 0.9rem;
        }

        .category-bar {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          background: var(--african-yellow);
          transition: width 0.3s ease;
        }

        .category-count {
          min-width: 30px;
          text-align: right;
          font-size: 0.9rem;
        }

        .recent-items {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .recent-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 6px;
        }

        .item-info h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .item-info p {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .item-date {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .search-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          flex: 1;
          max-width: 400px;
        }

        .search-container input {
          background: none;
          border: none;
          color: white;
          outline: none;
          flex: 1;
        }

        .search-container input::placeholder {
          color: rgba(255, 255, 255, 0.6);
        }

        .bulk-actions {
          display: flex;
          gap: 0.5rem;
        }

        .bulk-delete-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 0, 0, 0.2);
          border: 1px solid rgba(255, 0, 0, 0.3);
          color: #ff6b6b;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .bulk-delete-button:hover {
          background: rgba(255, 0, 0, 0.3);
        }

        .content-table {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          overflow: hidden;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .table-header {
          display: grid;
          grid-template-columns: 50px 2fr 1fr 1fr 80px 80px 120px 120px;
          background: rgba(255, 255, 255, 0.1);
          padding: 1rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .table-body {
          max-height: 600px;
          overflow-y: auto;
        }

        .table-row {
          display: grid;
          grid-template-columns: 50px 2fr 1fr 1fr 80px 80px 120px 120px;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          transition: background 0.3s ease;
        }

        .table-row:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .table-cell {
          display: flex;
          align-items: center;
          font-size: 0.9rem;
        }

        .table-cell.checkbox {
          justify-content: center;
        }

        .item-title h4 {
          margin: 0 0 0.25rem 0;
          font-size: 0.9rem;
        }

        .item-title p {
          margin: 0;
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.7);
        }

        .category-badge {
          background: var(--african-yellow);
          color: var(--african-dark);
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          padding: 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .view-btn:hover {
          color: var(--african-yellow);
        }

        .edit-btn:hover {
          color: #4CAF50;
        }

        .delete-btn:hover {
          color: #ff6b6b;
        }

        @media (max-width: 768px) {
          .admin-dashboard {
            padding: 1rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .dashboard-tabs {
            flex-wrap: wrap;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .charts-section {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 50px 1fr 100px 100px;
            font-size: 0.8rem;
          }

          .table-cell:nth-child(n+5) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;




