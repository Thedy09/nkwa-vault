import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Image, 
  Music, 
  Video, 
  FileText, 
  Play, 
  Pause,
  Volume2,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

const MediaUpload = ({ 
  onMediaChange, 
  initialMedia = [], 
  maxFiles = 10,
  acceptedTypes = ['image/*', 'audio/*', 'video/*', 'application/pdf'],
  maxSize = 100 * 1024 * 1024 // 100MB
}) => {
  const [media, setMedia] = useState(initialMedia);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Types de médias supportés
  const mediaTypes = {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    audio: ['mp3', 'wav', 'ogg', 'm4a'],
    video: ['mp4', 'mov', 'avi', 'webm'],
    document: ['pdf', 'doc', 'docx', 'txt']
  };

  // Obtenir l'icône selon le type de média
  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={20} />;
      case 'audio': return <Music size={20} />;
      case 'video': return <Video size={20} />;
      case 'document': return <FileText size={20} />;
      default: return <FileText size={20} />;
    }
  };

  // Obtenir la couleur selon le type de média
  const getMediaColor = (type) => {
    switch (type) {
      case 'image': return 'var(--african-green)';
      case 'audio': return 'var(--african-yellow)';
      case 'video': return 'var(--african-red)';
      case 'document': return 'var(--african-gold)';
      default: return 'var(--african-black)';
    }
  };

  // Valider un fichier
  const validateFile = (file) => {
    const errors = [];
    
    // Vérifier la taille
    if (file.size > maxSize) {
      errors.push(`Le fichier ${file.name} est trop volumineux (max ${Math.round(maxSize / 1024 / 1024)}MB)`);
    }

    // Vérifier le type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isValidType = Object.values(mediaTypes).flat().includes(fileExtension);
    
    if (!isValidType) {
      errors.push(`Le type de fichier ${fileExtension} n'est pas supporté`);
    }

    return errors;
  };

  // Déterminer le type de média
  const getMediaType = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (mediaTypes.image.includes(extension)) return 'image';
    if (mediaTypes.audio.includes(extension)) return 'audio';
    if (mediaTypes.video.includes(extension)) return 'video';
    if (mediaTypes.document.includes(extension)) return 'document';
    
    return 'document';
  };

  // Créer un objet URL pour la prévisualisation
  const createPreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  // Gérer la sélection de fichiers
  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    const newMedia = [];
    const newErrors = [];

    // Vérifier la limite de fichiers
    if (media.length + fileArray.length > maxFiles) {
      newErrors.push(`Maximum ${maxFiles} fichiers autorisés`);
      setErrors(newErrors);
      return;
    }

    fileArray.forEach(file => {
      const fileErrors = validateFile(file);
      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        const mediaType = getMediaType(file);
        const previewUrl = createPreviewUrl(file);
        
        newMedia.push({
          id: Date.now() + Math.random(),
          file,
          type: mediaType,
          name: file.name,
          size: file.size,
          preview: previewUrl,
          uploading: false,
          uploaded: false,
          error: null
        });
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
    }

    if (newMedia.length > 0) {
      const updatedMedia = [...media, ...newMedia];
      setMedia(updatedMedia);
      onMediaChange?.(updatedMedia);
    }
  }, [media, maxFiles, maxSize]);

  // Gérer le drag & drop
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
      handleFiles(e.dataTransfer.files);
    }
  };

  // Gérer le clic sur la zone d'upload
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Supprimer un média
  const removeMedia = (id) => {
    const updatedMedia = media.filter(item => {
      if (item.id === id && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return item.id !== id;
    });
    setMedia(updatedMedia);
    onMediaChange?.(updatedMedia);
  };

  // Formater la taille de fichier
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Obtenir la durée d'un média (pour audio/vidéo)
  const getMediaDuration = (file) => {
    return new Promise((resolve) => {
      if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
        const media = document.createElement(file.type.startsWith('audio/') ? 'audio' : 'video');
        media.onloadedmetadata = () => {
          resolve(Math.round(media.duration));
        };
        media.onerror = () => resolve(0);
        media.src = URL.createObjectURL(file);
      } else {
        resolve(0);
      }
    });
  };

  return (
    <div className="media-upload">
      {/* Zone d'upload */}
      <motion.div
        className={`upload-zone ${dragActive ? 'drag-active' : ''} ${uploading ? 'uploading' : ''}`}
        onClick={handleClick}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <div className="upload-content">
          <motion.div
            className="upload-icon"
            animate={{ rotate: uploading ? 360 : 0 }}
            transition={{ duration: 2, repeat: uploading ? Infinity : 0 }}
          >
            {uploading ? <Loader2 size={48} /> : <Upload size={48} />}
          </motion.div>
          
          <h3>Glissez vos médias ici</h3>
          <p>ou cliquez pour sélectionner des fichiers</p>
          
          <div className="upload-info">
            <p>Types supportés: Images, Audio, Vidéo, Documents</p>
            <p>Taille max: {Math.round(maxSize / 1024 / 1024)}MB par fichier</p>
            <p>Maximum: {maxFiles} fichiers</p>
          </div>
        </div>
      </motion.div>

      {/* Messages d'erreur */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            className="upload-errors"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {errors.map((error, index) => (
              <div key={index} className="error-item">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            ))}
            <button
              className="clear-errors"
              onClick={() => setErrors([])}
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste des médias */}
      <AnimatePresence>
        {media.length > 0 && (
          <motion.div
            className="media-list"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <h4>Médias sélectionnés ({media.length})</h4>
            
            <div className="media-grid">
              {media.map((item) => (
                <motion.div
                  key={item.id}
                  className="media-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="media-preview">
                    {item.type === 'image' && (
                      <img src={item.preview} alt={item.name} />
                    )}
                    {item.type === 'video' && (
                      <video src={item.preview} muted />
                    )}
                    {item.type === 'audio' && (
                      <div className="audio-preview">
                        <Music size={32} />
                      </div>
                    )}
                    {item.type === 'document' && (
                      <div className="document-preview">
                        <FileText size={32} />
                      </div>
                    )}
                  </div>

                  <div className="media-info">
                    <div className="media-header">
                      <div className="media-type" style={{ color: getMediaColor(item.type) }}>
                        {getMediaIcon(item.type)}
                        <span>{item.type}</span>
                      </div>
                      <button
                        className="remove-media"
                        onClick={() => removeMedia(item.id)}
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="media-details">
                      <h5>{item.name}</h5>
                      <p>{formatFileSize(item.size)}</p>
                    </div>

                    <div className="media-status">
                      {item.uploading && (
                        <div className="uploading-status">
                          <Loader2 size={16} className="spinner" />
                          <span>Upload...</span>
                        </div>
                      )}
                      {item.uploaded && (
                        <div className="uploaded-status">
                          <CheckCircle size={16} />
                          <span>Uploadé</span>
                        </div>
                      )}
                      {item.error && (
                        <div className="error-status">
                          <AlertCircle size={16} />
                          <span>Erreur</span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .media-upload {
          width: 100%;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 215, 0, 0.3);
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
          margin-bottom: var(--spacing-md);
        }

        .upload-zone:hover {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.05);
        }

        .upload-zone.drag-active {
          border-color: var(--african-green);
          background: rgba(50, 205, 50, 0.1);
          transform: scale(1.02);
        }

        .upload-zone.uploading {
          border-color: var(--african-gold);
          background: rgba(255, 165, 0, 0.1);
        }

        .upload-content h3 {
          margin: var(--spacing-sm) 0;
          color: var(--african-yellow);
          font-size: 1.2rem;
        }

        .upload-content p {
          margin: var(--spacing-xs) 0;
          opacity: 0.8;
        }

        .upload-info {
          margin-top: var(--spacing-md);
          font-size: 0.9rem;
          opacity: 0.7;
        }

        .upload-info p {
          margin: var(--spacing-xs) 0;
        }

        .upload-errors {
          background: rgba(220, 20, 60, 0.1);
          border: 1px solid var(--african-red);
          border-radius: var(--radius-sm);
          padding: var(--spacing-sm);
          margin-bottom: var(--spacing-md);
          position: relative;
        }

        .error-item {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--african-red);
          font-size: 0.9rem;
          margin-bottom: var(--spacing-xs);
        }

        .error-item:last-child {
          margin-bottom: 0;
        }

        .clear-errors {
          position: absolute;
          top: var(--spacing-xs);
          right: var(--spacing-xs);
          background: none;
          border: none;
          color: var(--african-red);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
        }

        .clear-errors:hover {
          background: rgba(220, 20, 60, 0.1);
        }

        .media-list {
          margin-top: var(--spacing-md);
        }

        .media-list h4 {
          margin-bottom: var(--spacing-md);
          color: var(--african-yellow);
        }

        .media-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--spacing-md);
        }

        .media-item {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .media-item:hover {
          border-color: var(--african-yellow);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
        }

        .media-preview {
          width: 100%;
          height: 120px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }

        .media-preview img,
        .media-preview video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .audio-preview,
        .document-preview {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--african-yellow);
        }

        .media-info {
          padding: var(--spacing-sm);
        }

        .media-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: var(--spacing-xs);
        }

        .media-type {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .remove-media {
          background: none;
          border: none;
          color: var(--african-red);
          cursor: pointer;
          padding: var(--spacing-xs);
          border-radius: var(--radius-sm);
          transition: all 0.3s ease;
        }

        .remove-media:hover {
          background: rgba(220, 20, 60, 0.1);
        }

        .media-details h5 {
          margin: 0 0 var(--spacing-xs) 0;
          font-size: 0.9rem;
          color: white;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .media-details p {
          margin: 0;
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .media-status {
          margin-top: var(--spacing-xs);
        }

        .uploading-status,
        .uploaded-status,
        .error-status {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          font-size: 0.8rem;
        }

        .uploading-status {
          color: var(--african-gold);
        }

        .uploaded-status {
          color: var(--african-green);
        }

        .error-status {
          color: var(--african-red);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .media-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
          
          .upload-zone {
            padding: var(--spacing-md);
          }
        }
      `}</style>
    </div>
  );
};

export default MediaUpload;


