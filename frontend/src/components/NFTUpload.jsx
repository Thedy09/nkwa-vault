import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image, X, Star, Tag, MapPin, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const NFTUpload = ({ onUploadSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    culture: '',
    country: '',
    tags: '',
    source: '',
    license: 'CC0'
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('L\'image doit faire moins de 10MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image');
        return;
      }

      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleImageRemove = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedImage) {
      setError('Veuillez sélectionner une image');
      return;
    }

    if (!formData.name || !formData.description) {
      setError('Le nom et la description sont requis');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedImage);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('culture', formData.culture);
      formDataToSend.append('country', formData.country);
      formDataToSend.append('tags', formData.tags);
      formDataToSend.append('source', formData.source);
      formDataToSend.append('license', formData.license);

      const response = await fetch(`${API_BASE_URL}/api/museum/nft`, {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('NFT créé avec succès !');
        setTimeout(() => {
          onUploadSuccess?.(data.data);
          onClose?.();
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la création du NFT');
      }
    } catch (err) {
      console.error('Erreur upload NFT:', err);
      setError('Erreur de connexion');
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.div
      className="nft-upload-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="upload-content">
        <div className="upload-header">
          <h2>Créer un NFT</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          <div className="form-section">
            <h3>Image du NFT</h3>
            <div className="image-upload-area">
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button
                    type="button"
                    className="remove-image"
                    onClick={handleImageRemove}
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="image-upload-label">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="image-input"
                  />
                  <div className="upload-placeholder">
                    <Image size={48} />
                    <p>Cliquez pour sélectionner une image</p>
                    <span>PNG, JPG, GIF jusqu'à 10MB</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Informations du NFT</h3>
            
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Ex: Masque Gouro - Côte d'Ivoire"
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Décrivez l'objet culturel..."
                rows="3"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Culture</label>
                <input
                  type="text"
                  name="culture"
                  value={formData.culture}
                  onChange={handleInputChange}
                  placeholder="Ex: Gouro, Ashanti, Bambara"
                />
              </div>

              <div className="form-group">
                <label>Pays</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  placeholder="Ex: Côte d'Ivoire, Ghana, Mali"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tags (séparés par des virgules)</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Ex: masque, bois, rituel, cérémonie"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Source</label>
                <input
                  type="text"
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  placeholder="Ex: Musée du Quai Branly"
                />
              </div>

              <div className="form-group">
                <label>Licence</label>
                <select
                  name="license"
                  value={formData.license}
                  onChange={handleInputChange}
                >
                  <option value="CC0">CC0 - Domaine public</option>
                  <option value="CC-BY">CC-BY - Attribution</option>
                  <option value="CC-BY-SA">CC-BY-SA - Partage</option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {success && (
            <div className="success-message">
              <CheckCircle size={16} />
              {success}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
              disabled={uploading}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="submit-btn"
              disabled={uploading || !selectedImage}
            >
              {uploading ? (
                <>
                  <div className="spinner"></div>
                  Création...
                </>
              ) : (
                <>
                  <Star size={16} />
                  Créer le NFT
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        .nft-upload-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }

        .upload-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .upload-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem 2rem 1rem;
          border-bottom: 1px solid #eee;
        }

        .upload-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background 0.3s ease;
        }

        .close-btn:hover {
          background: #f0f0f0;
        }

        .upload-form {
          padding: 2rem;
        }

        .form-section {
          margin-bottom: 2rem;
        }

        .form-section h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
        }

        .image-upload-area {
          border: 2px dashed #ddd;
          border-radius: 10px;
          padding: 2rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .image-upload-area:hover {
          border-color: #667eea;
          background: #f8f9ff;
        }

        .image-upload-label {
          cursor: pointer;
          display: block;
        }

        .image-input {
          display: none;
        }

        .upload-placeholder {
          color: #666;
        }

        .upload-placeholder p {
          margin: 1rem 0 0.5rem 0;
          font-weight: 500;
        }

        .upload-placeholder span {
          font-size: 0.9rem;
          color: #999;
        }

        .image-preview {
          position: relative;
          display: inline-block;
        }

        .image-preview img {
          max-width: 200px;
          max-height: 200px;
          border-radius: 10px;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          top: -10px;
          right: -10px;
          background: #ff6b6b;
          color: white;
          border: none;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 0.8rem;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .success-message {
          background: #efe;
          color: #3c3;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #eee;
        }

        .cancel-btn,
        .submit-btn {
          padding: 0.8rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #666;
        }

        .cancel-btn:hover {
          background: #e0e0e0;
        }

        .submit-btn {
          background: linear-gradient(45deg, #667eea, #764ba2);
          color: white;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .nft-upload-modal {
            padding: 1rem;
          }

          .upload-content {
            max-height: 95vh;
          }

          .upload-header,
          .upload-form {
            padding: 1.5rem;
          }

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

export default NFTUpload;
