import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import ImageUpload from './ImageUpload';
import { 
  Upload, 
  FileText, 
  Music, 
  Image, 
  Video, 
  MapPin, 
  User, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  X,
  Eye,
  Shield,
} from 'lucide-react';

export default function UploadForm({ userId }) {
  const { user, isAuthenticated } = useAuth();
  const [file, setFile] = useState(null);
  const [media, setMedia] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [meta, setMeta] = useState({ 
    title: '', 
    description: '', 
    content: '',
    category: '', 
    subcategory: '',
    country: '',
    region: '',
    language: 'français',
    originalLanguage: '',
    tags: '',
    source: '',
    culturalSignificance: '',
    difficulty: 'moyen',
    ageGroup: 'tout-public',
    location: '', 
    author_name: '' 
  });
  const [status, setStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [authStatus, setAuthStatus] = useState(null);
  const [canContribute, setCanContribute] = useState(false);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    checkAuthentication();
  }, [isAuthenticated]);

  const checkAuthentication = async () => {
    if (!isAuthenticated) {
      setAuthStatus('not_authenticated');
      setCanContribute(true); // Permettre la contribution même sans auth pour le mode démo
      return;
    }

    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/upload/check-auth`);
      if (response.data.success) {
        setAuthStatus('authenticated');
        setCanContribute(response.data.data.canContribute);
      } else {
        setAuthStatus('error');
        setCanContribute(true); // Permettre la contribution en mode démo
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
      setAuthStatus('error');
      setCanContribute(true); // Permettre la contribution en mode démo
    }
  };

  const categories = [
    { value: 'conte', label: 'Conte & Légende', icon: FileText, color: 'var(--african-yellow)' },
    { value: 'proverbe', label: 'Proverbe', icon: FileText, color: 'var(--african-green)' },
    { value: 'chanson', label: 'Chant & Musique', icon: Music, color: 'var(--african-red)' },
    { value: 'danse', label: 'Danse', icon: Music, color: 'var(--african-gold)' },
    { value: 'artisanat', label: 'Art & Artisanat', icon: Image, color: 'var(--african-earth)' },
    { value: 'histoire', label: 'Histoire', icon: FileText, color: 'var(--african-black)' },
    { value: 'tradition', label: 'Tradition', icon: FileText, color: 'var(--african-gold)' }
  ];

  const difficulties = [
    { value: 'facile', label: 'Facile' },
    { value: 'moyen', label: 'Moyen' },
    { value: 'difficile', label: 'Difficile' }
  ];

  const ageGroups = [
    { value: 'tout-public', label: 'Tout public' },
    { value: 'enfants', label: 'Enfants' },
    { value: 'adolescents', label: 'Adolescents' },
    { value: 'adultes', label: 'Adultes' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!meta.title.trim()) newErrors.title = 'Le titre est requis';
    if (!meta.description.trim()) newErrors.description = 'La description est requise';
    if (!meta.category) newErrors.category = 'La catégorie est requise';
    if (!meta.location.trim()) newErrors.location = 'La localisation est requise';
    if (!meta.author_name.trim()) newErrors.author_name = 'Le nom de l\'auteur est requis';
    if (!file) newErrors.file = 'Un fichier est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const handleImageSelect = (file, previewUrl) => {
    setSelectedImage(file);
    setImagePreview(previewUrl);
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setErrors(prev => ({ ...prev, file: '' }));
    }
  };

  const getFileIcon = (file) => {
    if (!file) return Upload;
    if (file.type.startsWith('audio/')) return Music;
    if (file.type.startsWith('video/')) return Video;
    if (file.type.startsWith('image/')) return Image;
    return FileText;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const submit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setStatus('Veuillez corriger les erreurs ci-dessous');
      return;
    }

    const fd = new FormData();
    fd.append('media', file);
    if (selectedImage) {
      fd.append('image', selectedImage);
    }
    Object.keys(meta).forEach(k => fd.append(k, meta[k]));
    fd.append('collector_id', userId);
    
    setIsUploading(true);
    setStatus('Téléchargement en cours...');
    
    try {
      const res = await axios.post((process.env.REACT_APP_API_URL || 'http://localhost:4000') + '/upload', fd);
      setStatus('Succès ! Contribution ID: ' + res.data.contributionId);
      setMeta({ title: '', description: '', category: '', location: '', author_name: '' });
      setFile(null);
      setErrors({});
    } catch (err) {
      setStatus('Erreur: ' + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const selectedCategory = categories.find(cat => cat.value === meta.category);

  return (
    <motion.div 
      className="upload-form-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="upload-header">
        <h2 className="upload-title">
          <Upload size={32} />
          Partager Votre Patrimoine
        </h2>
        <p className="upload-subtitle">
          Contribuez à la préservation de la culture africaine en partageant vos trésors culturels
        </p>
      </div>

      {/* Avertissement d'authentification */}
      {authStatus === 'not_authenticated' && (
        <motion.div 
          className="auth-warning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="warning-icon">
            <AlertCircle size={32} />
          </div>
          <h3>Mode Démo - Contribution Sans Authentification</h3>
          <p>Vous contribuez en mode démo. Pour une contribution authentifiée et sauvegardée sur la blockchain, veuillez vous connecter.</p>
          <motion.button 
            className="btn btn-secondary"
            onClick={() => window.location.href = '/#login'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield size={20} />
            Se connecter pour une contribution authentifiée
          </motion.button>
        </motion.div>
      )}

      {authStatus === 'error' && (
        <motion.div 
          className="auth-error"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Erreur d'authentification</h3>
          <p>Impossible de vérifier votre authentification. Veuillez vous reconnecter.</p>
          <motion.button 
            className="btn btn-secondary"
            onClick={checkAuthentication}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Réessayer
          </motion.button>
        </motion.div>
      )}

      {!canContribute && authStatus === 'authenticated' && (
        <motion.div 
          className="auth-warning"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-icon">
            <AlertCircle size={48} />
          </div>
          <h3>Compte en attente de vérification</h3>
          <p>Votre compte doit être vérifié avant de pouvoir contribuer.</p>
          <p>Vérifiez votre email ou contactez l'administrateur.</p>
        </motion.div>
      )}

      {canContribute && (
        <motion.div 
          className="auth-success"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="auth-icon">
            <CheckCircle size={48} />
          </div>
          <h3>Authentification validée</h3>
          <p>Votre contribution sera authentifiée et sauvegardée sur la blockchain.</p>
          <p><strong>Auteur :</strong> {user?.name} | <strong>Statut :</strong> Vérifié</p>
        </motion.div>
      )}

      {canContribute && (
        <form onSubmit={submit} className="upload-form">
        <div className="form-grid">
          {/* Title */}
          <div className="input-group">
            <label htmlFor="title">Titre *</label>
            <input
              id="title"
              type="text"
              placeholder="Donnez un titre à votre contribution"
              value={meta.title}
              onChange={e => {
                setMeta({ ...meta, title: e.target.value });
                setErrors(prev => ({ ...prev, title: '' }));
              }}
              className={errors.title ? 'error' : ''}
            />
            {errors.title && <span className="error-message">{errors.title}</span>}
          </div>

          {/* Category */}
          <div className="input-group">
            <label htmlFor="category">Catégorie *</label>
            <div className="category-selector">
              {categories.map(category => (
                <motion.button
                  key={category.value}
                  type="button"
                  className={`category-option ${meta.category === category.value ? 'selected' : ''}`}
                  onClick={() => {
                    setMeta({ ...meta, category: category.value });
                    setErrors(prev => ({ ...prev, category: '' }));
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -2,
                    boxShadow: `0 5px 15px ${category.color}30`
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={meta.category === category.value ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      `0 0 0 ${category.color}40`,
                      `0 5px 20px ${category.color}60`,
                      `0 0 0 ${category.color}40`
                    ]
                  } : {}}
                  transition={{ 
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200
                  }}
                >
                  <category.icon size={20} style={{ color: category.color }} />
                  <span>{category.label}</span>
                </motion.button>
              ))}
            </div>
            {errors.category && <span className="error-message">{errors.category}</span>}
          </div>

          {/* Description */}
          <div className="input-group full-width">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              placeholder="Décrivez votre contribution en détail..."
              value={meta.description}
              onChange={e => {
                setMeta({ ...meta, description: e.target.value });
                setErrors(prev => ({ ...prev, description: '' }));
              }}
              className={errors.description ? 'error' : ''}
              rows={4}
            />
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>

          {/* Contenu */}
          <div className="input-group full-width">
            <label htmlFor="content">Contenu *</label>
            <textarea
              id="content"
              placeholder="Le texte complet du conte, proverbe, paroles de chanson..."
              value={meta.content}
              onChange={e => {
                setMeta({ ...meta, content: e.target.value });
                setErrors(prev => ({ ...prev, content: '' }));
              }}
              className={errors.content ? 'error' : ''}
              rows={6}
            />
            {errors.content && <span className="error-message">{errors.content}</span>}
          </div>

          {/* Upload d'image */}
          <div className="input-group full-width">
            <label>Image d'illustration</label>
            <ImageUpload
              onImageSelect={handleImageSelect}
              onImageRemove={handleImageRemove}
              currentImage={imagePreview}
              maxSize={5}
              className="image-upload-field"
            />
            {errors.image && <span className="error-message">{errors.image}</span>}
          </div>

          {/* Médias */}
          <div className="input-group full-width">
            <label>Médias (optionnel)</label>
            <div className="file-upload">
              <input
                type="file"
                id="media-upload"
                multiple
                accept="image/*,video/*,audio/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="media-upload" className="file-upload-label">
                <Upload size={20} />
                <span>Choisir des fichiers</span>
              </label>
            </div>
            {media.length > 0 && (
              <div className="media-actions">
                <div className="media-count">
                  <Eye size={16} />
                  {media.length} fichier(s) sélectionné(s)
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          <div className="input-group">
            <label htmlFor="location">Localisation *</label>
            <div className="input-with-icon">
              <MapPin size={20} />
              <input
                id="location"
                type="text"
                placeholder="Pays, région, ville..."
                value={meta.location}
                onChange={e => {
                  setMeta({ ...meta, location: e.target.value });
                  setErrors(prev => ({ ...prev, location: '' }));
                }}
                className={errors.location ? 'error' : ''}
              />
            </div>
            {errors.location && <span className="error-message">{errors.location}</span>}
          </div>

          {/* Author */}
          <div className="input-group">
            <label htmlFor="author">Auteur *</label>
            <div className="input-with-icon">
              <User size={20} />
              <input
                id="author"
                type="text"
                placeholder="Nom de l'auteur ou du collecteur"
                value={meta.author_name}
                onChange={e => {
                  setMeta({ ...meta, author_name: e.target.value });
                  setErrors(prev => ({ ...prev, author_name: '' }));
                }}
                className={errors.author_name ? 'error' : ''}
              />
            </div>
            {errors.author_name && <span className="error-message">{errors.author_name}</span>}
          </div>

          {/* Pays et Région */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="country">Pays *</label>
              <input
                id="country"
                type="text"
                placeholder="Pays d'origine"
                value={meta.country}
                onChange={e => {
                  setMeta({ ...meta, country: e.target.value });
                  setErrors(prev => ({ ...prev, country: '' }));
                }}
                className={errors.country ? 'error' : ''}
              />
              {errors.country && <span className="error-message">{errors.country}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="region">Région</label>
              <input
                id="region"
                type="text"
                placeholder="Région, état, province..."
                value={meta.region}
                onChange={e => setMeta({ ...meta, region: e.target.value })}
              />
            </div>
          </div>

          {/* Langues */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="language">Langue de présentation *</label>
              <select
                id="language"
                value={meta.language}
                onChange={e => setMeta({ ...meta, language: e.target.value })}
              >
                <option value="français">Français</option>
                <option value="anglais">Anglais</option>
                <option value="arabe">Arabe</option>
                <option value="portugais">Portugais</option>
                <option value="espagnol">Espagnol</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="originalLanguage">Langue originale</label>
              <input
                id="originalLanguage"
                type="text"
                placeholder="Wolof, Bambara, Yoruba..."
                value={meta.originalLanguage}
                onChange={e => setMeta({ ...meta, originalLanguage: e.target.value })}
              />
            </div>
          </div>

          {/* Tags et Source */}
          <div className="input-group full-width">
            <label htmlFor="tags">Tags</label>
            <input
              id="tags"
              type="text"
              placeholder="amitié, sagesse, animaux, famille... (séparés par des virgules)"
              value={meta.tags}
              onChange={e => setMeta({ ...meta, tags: e.target.value })}
            />
          </div>

          <div className="input-group full-width">
            <label htmlFor="source">Source</label>
            <input
              id="source"
              type="text"
              placeholder="Collection familiale, livre, enregistrement..."
              value={meta.source}
              onChange={e => setMeta({ ...meta, source: e.target.value })}
            />
          </div>

          {/* Difficulté et Âge */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="difficulty">Difficulté</label>
              <select
                id="difficulty"
                value={meta.difficulty}
                onChange={e => setMeta({ ...meta, difficulty: e.target.value })}
              >
                {difficulties.map(diff => (
                  <option key={diff.value} value={diff.value}>{diff.label}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="ageGroup">Public cible</label>
              <select
                id="ageGroup"
                value={meta.ageGroup}
                onChange={e => setMeta({ ...meta, ageGroup: e.target.value })}
              >
                {ageGroups.map(age => (
                  <option key={age.value} value={age.value}>{age.label}</option>
                ))}
      </select>
            </div>
          </div>

          {/* Signification culturelle */}
          <div className="input-group full-width">
            <label htmlFor="culturalSignificance">Signification culturelle</label>
            <textarea
              id="culturalSignificance"
              placeholder="Expliquez l'importance culturelle de cette contribution..."
              value={meta.culturalSignificance}
              onChange={e => setMeta({ ...meta, culturalSignificance: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        {/* File Upload */}
        <div className="input-group full-width">
          <label>Fichier *</label>
          <div
            className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${errors.file ? 'error' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="audio/*,video/*,image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            
            {file ? (
              <div className="file-preview">
                <div className="file-info">
                  {React.createElement(getFileIcon(file), { size: 24 })}
                  <div>
                    <p className="file-name">{file.name}</p>
                    <p className="file-size">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="remove-file"
                  onClick={() => setFile(null)}
                >
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="file-upload-content">
                <Upload size={48} />
                <p>Glissez-déposez votre fichier ici ou cliquez pour sélectionner</p>
                <p className="file-types">Audio, Vidéo, Image acceptés</p>
              </div>
            )}
          </div>
          {errors.file && <span className="error-message">{errors.file}</span>}
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          className="btn btn-primary btn-large submit-btn"
          disabled={isUploading}
          whileHover={{ 
            scale: isUploading ? 1 : 1.05,
            y: isUploading ? 0 : -3,
            boxShadow: isUploading ? "none" : "0 15px 35px rgba(255, 215, 0, 0.4)"
          }}
          whileTap={{ scale: isUploading ? 1 : 0.95 }}
          animate={isUploading ? {
            scale: [1, 1.02, 1],
            boxShadow: [
              "0 0 0 rgba(255, 215, 0, 0.2)",
              "0 5px 20px rgba(255, 215, 0, 0.4)",
              "0 0 0 rgba(255, 215, 0, 0.2)"
            ]
          } : {}}
          transition={{ 
            duration: 1,
            repeat: isUploading ? Infinity : 0,
            ease: "easeInOut"
          }}
        >
          {isUploading ? (
            <>
              <Loader2 size={20} className="spinner" />
              Téléchargement...
            </>
          ) : (
            <>
              <Upload size={20} />
              Partager ma Contribution
            </>
          )}
        </motion.button>

        {/* Status Message */}
        {status && (
          <motion.div 
            className={`status-message ${status.includes('Succès') ? 'success' : status.includes('Erreur') ? 'error' : 'info'}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {status.includes('Succès') ? <CheckCircle size={20} /> : 
             status.includes('Erreur') ? <AlertCircle size={20} /> : 
             <Loader2 size={20} className="spinner" />}
            <span>{status}</span>
          </motion.div>
        )}
    </form>
      )}


      <style jsx>{`
        .upload-form-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--spacing-xl);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .upload-header {
          text-align: center;
          margin-bottom: var(--spacing-xl);
        }

        .upload-title {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-sm);
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: var(--spacing-sm);
          color: var(--african-yellow);
        }

        .upload-subtitle {
          font-size: 1.1rem;
          opacity: 0.8;
          line-height: 1.6;
        }

        .upload-form {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-lg);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: var(--spacing-lg);
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-xs);
        }

        .input-group label {
          font-weight: 600;
          color: var(--african-yellow);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .input-group input,
        .input-group textarea,
        .input-group select {
          padding: var(--spacing-sm);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        .input-group input:focus,
        .input-group textarea:focus,
        .input-group select:focus {
          outline: none;
          border-color: var(--african-yellow);
          box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
        }

        .input-group textarea {
          min-height: 100px;
          resize: vertical;
        }

        .category-selector {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: var(--spacing-sm);
        }

        .category-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-xs);
          padding: var(--spacing-md);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.05);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }

        .category-option:hover {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.1);
        }

        .category-option.selected {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.2);
          color: var(--african-yellow);
        }

        .category-option svg {
          width: 24px;
          height: 24px;
        }

        .file-upload-area {
          border: 2px dashed rgba(255, 255, 255, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .file-upload-area:hover {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.05);
        }

        .file-upload-area.drag-active {
          border-color: var(--african-green);
          background: rgba(34, 139, 34, 0.1);
        }

        .upload-icon {
          margin-bottom: var(--spacing-sm);
          opacity: 0.7;
        }

        .upload-text {
          font-size: 1.1rem;
          margin-bottom: var(--spacing-sm);
        }

        .upload-hint {
          font-size: 0.9rem;
          opacity: 0.6;
        }

        .file-list {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
        }

        .file-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--spacing-sm);
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
        }

        .file-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .file-name {
          font-weight: 500;
          color: white;
        }

        .file-size {
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .remove-file {
          background: none;
          border: none;
          color: var(--african-red);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
        }

        .remove-file:hover {
          background: rgba(220, 20, 60, 0.1);
        }

        .submit-btn {
          width: 100%;
          margin-top: var(--spacing-lg);
        }

        .error-message {
          color: var(--african-red);
          font-size: 0.9rem;
          margin-top: var(--spacing-xs);
          display: block;
        }

        .error {
          border-color: var(--african-red) !important;
        }

        /* Styles pour l'authentification */
        .auth-required,
        .auth-error,
        .auth-warning,
        .auth-success {
          text-align: center;
          padding: var(--spacing-xl);
          margin: var(--spacing-lg) 0;
          border-radius: var(--radius-lg);
          border: 2px solid;
        }

        .auth-required {
          background: rgba(255, 193, 7, 0.1);
          border-color: var(--african-yellow);
          color: var(--african-yellow);
        }

        .auth-error {
          background: rgba(220, 20, 60, 0.1);
          border-color: var(--african-red);
          color: var(--african-red);
        }

        .auth-warning {
          background: rgba(255, 193, 7, 0.1);
          border-color: var(--african-yellow);
          color: var(--african-yellow);
        }

        .auth-success {
          background: rgba(34, 139, 34, 0.1);
          border-color: var(--african-green);
          color: var(--african-green);
        }

        .auth-icon {
          margin-bottom: var(--spacing-md);
        }

        .auth-required h3,
        .auth-error h3,
        .auth-warning h3,
        .auth-success h3 {
          margin-bottom: var(--spacing-sm);
          font-size: 1.5rem;
        }

        .auth-required p,
        .auth-error p,
        .auth-warning p,
        .auth-success p {
          margin-bottom: var(--spacing-sm);
          opacity: 0.9;
        }

        .status-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          margin-top: var(--spacing-md);
          padding: var(--spacing-sm);
          border-radius: var(--radius-sm);
          font-weight: 500;
        }

        .status-message.success {
          background: rgba(34, 139, 34, 0.1);
          color: var(--african-green);
        }

        .status-message.error {
          background: rgba(220, 20, 60, 0.1);
          color: var(--african-red);
        }

        .status-message.info {
          background: rgba(0, 123, 255, 0.1);
          color: var(--african-blue);
        }

        @media (max-width: 768px) {
          .upload-form-container {
            padding: var(--spacing-md);
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .category-selector {
            grid-template-columns: repeat(2, 1fr);
          }

          .upload-title {
            font-size: 1.5rem;
          }
        }
        .image-upload-field {
          margin-top: var(--spacing-sm);
        }
      `}</style>
    </motion.div>
  );
}
