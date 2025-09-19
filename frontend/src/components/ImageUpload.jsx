import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

const ImageUpload = ({ 
  onImageSelect, 
  onImageRemove, 
  currentImage = null, 
  maxSize = 5, // MB
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(currentImage);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    // Vérifier le type de fichier
    if (!acceptedTypes.includes(file.type)) {
      setError(`Type de fichier non supporté. Types acceptés: ${acceptedTypes.map(type => type.split('/')[1]).join(', ')}`);
      return false;
    }

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Fichier trop volumineux. Taille maximale: ${maxSize}MB`);
      return false;
    }

    return true;
  };

  const handleFiles = (files) => {
    setError(null);
    
    if (files && files.length > 0) {
      const file = files[0];
      
      if (validateFile(file)) {
        // Créer l'URL de prévisualisation
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
        
        // Notifier le composant parent
        if (onImageSelect) {
          onImageSelect(file, imageUrl);
        }
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
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

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setError(null);
    
    if (onImageRemove) {
      onImageRemove();
    }
    
    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        style={{ display: 'none' }}
      />

      {preview ? (
        <motion.div
          className="image-preview"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <img src={preview} alt="Preview" className="preview-image" />
          <motion.button
            className="remove-button"
            onClick={handleRemove}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={16} />
          </motion.button>
        </motion.div>
      ) : (
        <motion.div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFileDialog}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="upload-content">
            <motion.div
              animate={dragActive ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Upload size={32} />
            </motion.div>
            <p className="upload-text">
              {dragActive ? 'Déposez votre image ici' : 'Cliquez ou glissez une image'}
            </p>
            <p className="upload-hint">
              PNG, JPG, GIF, WebP jusqu'à {maxSize}MB
            </p>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </motion.div>
      )}

      <style jsx>{`
        .image-upload-container {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed rgba(255, 215, 0, 0.3);
          border-radius: var(--radius-md);
          padding: var(--spacing-xl);
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
        }

        .upload-area:hover,
        .upload-area.drag-active {
          border-color: var(--african-yellow);
          background: rgba(255, 215, 0, 0.05);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .upload-text {
          font-size: 1rem;
          font-weight: 500;
          color: white;
          margin: 0;
        }

        .upload-hint {
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.6);
          margin: 0;
        }

        .image-preview {
          position: relative;
          width: 100%;
          height: 200px;
          border-radius: var(--radius-md);
          overflow: hidden;
          border: 2px solid var(--african-yellow);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-button {
          position: absolute;
          top: var(--spacing-xs);
          right: var(--spacing-xs);
          background: rgba(220, 38, 38, 0.9);
          color: white;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .remove-button:hover {
          background: rgba(220, 38, 38, 1);
          transform: scale(1.1);
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: var(--african-red);
          font-size: 0.9rem;
          margin-top: var(--spacing-sm);
          padding: var(--spacing-sm);
          background: rgba(220, 38, 38, 0.1);
          border-radius: var(--radius-sm);
          border: 1px solid rgba(220, 38, 38, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ImageUpload;


