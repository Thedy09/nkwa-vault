import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Download, 
  X,
  Image,
  Music,
  Video,
  FileText,
  RotateCcw
} from 'lucide-react';

const MediaPreview = ({ 
  media, 
  isOpen, 
  onClose, 
  currentIndex = 0,
  onIndexChange 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const mediaRef = useRef(null);
  const progressRef = useRef(null);

  const currentMedia = media[currentIndex];

  // Gérer la lecture/pause
  const togglePlayPause = () => {
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.pause();
      } else {
        mediaRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Gérer le son
  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Gérer le temps de lecture
  const handleTimeUpdate = () => {
    if (mediaRef.current) {
      setCurrentTime(mediaRef.current.currentTime);
    }
  };

  // Gérer la durée
  const handleLoadedMetadata = () => {
    if (mediaRef.current) {
      setDuration(mediaRef.current.duration);
    }
  };

  // Gérer la fin de lecture
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // Gérer le clic sur la barre de progression
  const handleProgressClick = (e) => {
    if (mediaRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const clickTime = (clickX / width) * duration;
      
      mediaRef.current.currentTime = clickTime;
      setCurrentTime(clickTime);
    }
  };

  // Gérer le plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mediaRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Gérer les touches clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case ' ':
          e.preventDefault();
          if (currentMedia?.type === 'video' || currentMedia?.type === 'audio') {
            togglePlayPause();
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) {
            onIndexChange(currentIndex - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < media.length - 1) {
            onIndexChange(currentIndex + 1);
          }
          break;
        case 'f':
        case 'F':
          if (currentMedia?.type === 'video') {
            toggleFullscreen();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, currentIndex, media.length, currentMedia?.type]);

  // Gérer le changement de média
  useEffect(() => {
    if (mediaRef.current) {
      setIsPlaying(false);
      setCurrentTime(0);
      setImageLoaded(false);
    }
  }, [currentIndex]);

  // Gérer le plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!isOpen || !currentMedia) return null;

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getMediaIcon = (type) => {
    switch (type) {
      case 'image': return <Image size={24} />;
      case 'audio': return <Music size={24} />;
      case 'video': return <Video size={24} />;
      case 'document': return <FileText size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const getMediaColor = (type) => {
    switch (type) {
      case 'image': return 'var(--african-green)';
      case 'audio': return 'var(--african-yellow)';
      case 'video': return 'var(--african-red)';
      case 'document': return 'var(--african-gold)';
      default: return 'var(--african-black)';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="media-preview-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="media-preview-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="media-preview-header">
            <div className="media-info">
              <div 
                className="media-type-icon"
                style={{ color: getMediaColor(currentMedia.type) }}
              >
                {getMediaIcon(currentMedia.type)}
              </div>
              <div className="media-details">
                <h3>{currentMedia.name}</h3>
                <p>{currentMedia.type} • {Math.round(currentMedia.size / 1024 / 1024 * 100) / 100} MB</p>
              </div>
            </div>
            
            <div className="media-actions">
              {currentMedia.type === 'document' && (
                <a
                  href={currentMedia.url || currentMedia.preview}
                  download={currentMedia.name}
                  className="action-btn"
                >
                  <Download size={20} />
                </a>
              )}
              
              {(currentMedia.type === 'video' || currentMedia.type === 'audio') && (
                <button
                  className="action-btn"
                  onClick={toggleFullscreen}
                >
                  <Maximize2 size={20} />
                </button>
              )}
              
              <button
                className="action-btn close-btn"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Media Content */}
          <div className="media-content">
            {currentMedia.type === 'image' && (
              <motion.img
                ref={mediaRef}
                src={currentMedia.url || currentMedia.preview}
                alt={currentMedia.name}
                className="preview-image"
                initial={{ opacity: 0 }}
                animate={{ opacity: imageLoaded ? 1 : 0 }}
                onLoad={() => setImageLoaded(true)}
                onClick={togglePlayPause}
              />
            )}

            {currentMedia.type === 'video' && (
              <motion.video
                ref={mediaRef}
                src={currentMedia.url || currentMedia.preview}
                className="preview-video"
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
                onClick={togglePlayPause}
                muted={isMuted}
              />
            )}

            {currentMedia.type === 'audio' && (
              <div className="preview-audio">
                <div className="audio-visualizer">
                  <Music size={64} />
                </div>
                <audio
                  ref={mediaRef}
                  src={currentMedia.url || currentMedia.preview}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleEnded}
                  muted={isMuted}
                />
              </div>
            )}

            {currentMedia.type === 'document' && (
              <div className="preview-document">
                <div className="document-icon">
                  <FileText size={64} />
                </div>
                <p>Document: {currentMedia.name}</p>
                <a
                  href={currentMedia.url || currentMedia.preview}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-document-btn"
                >
                  Ouvrir le document
                </a>
              </div>
            )}
          </div>

          {/* Controls */}
          {(currentMedia.type === 'video' || currentMedia.type === 'audio') && (
            <div className="media-controls">
              <button
                className="control-btn play-pause"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>

              <div className="time-info">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>

              <div 
                className="progress-bar"
                ref={progressRef}
                onClick={handleProgressClick}
              >
                <div 
                  className="progress-fill"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <button
                className="control-btn mute"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          )}

          {/* Navigation */}
          {media.length > 1 && (
            <div className="media-navigation">
              <button
                className="nav-btn prev"
                onClick={() => onIndexChange(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                <RotateCcw size={20} />
              </button>
              
              <span className="nav-info">
                {currentIndex + 1} / {media.length}
              </span>
              
              <button
                className="nav-btn next"
                onClick={() => onIndexChange(Math.min(media.length - 1, currentIndex + 1))}
                disabled={currentIndex === media.length - 1}
              >
                <RotateCcw size={20} style={{ transform: 'scaleX(-1)' }} />
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>

      <style jsx>{`
        .media-preview-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: var(--spacing-md);
        }

        .media-preview-container {
          background: rgba(26, 26, 26, 0.95);
          border-radius: var(--radius-lg);
          max-width: 90vw;
          max-height: 90vh;
          width: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        }

        .media-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--spacing-md);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .media-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }

        .media-type-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
        }

        .media-details h3 {
          margin: 0 0 var(--spacing-xs) 0;
          color: white;
          font-size: 1.1rem;
        }

        .media-details p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
        }

        .media-actions {
          display: flex;
          gap: var(--spacing-sm);
        }

        .action-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: var(--radius-sm);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .close-btn:hover {
          background: var(--african-red);
        }

        .media-content {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          min-height: 400px;
        }

        .preview-image,
        .preview-video {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          cursor: pointer;
        }

        .preview-audio {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          color: white;
        }

        .audio-visualizer {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          background: var(--gradient-primary);
          border-radius: 50%;
          color: var(--african-black);
        }

        .preview-document {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--spacing-md);
          color: white;
          text-align: center;
        }

        .document-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          background: var(--african-gold);
          border-radius: var(--radius-lg);
          color: var(--african-black);
        }

        .view-document-btn {
          padding: var(--spacing-sm) var(--spacing-md);
          background: var(--african-yellow);
          color: var(--african-black);
          text-decoration: none;
          border-radius: var(--radius-sm);
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .view-document-btn:hover {
          background: var(--african-gold);
          transform: translateY(-2px);
        }

        .media-controls {
          display: flex;
          align-items: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .control-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .control-btn:hover {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: var(--spacing-xs);
          color: white;
          font-size: 0.9rem;
          min-width: 100px;
        }

        .progress-bar {
          flex: 1;
          height: 4px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: var(--african-yellow);
          border-radius: 2px;
          transition: width 0.1s ease;
        }

        .media-navigation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-md);
          padding: var(--spacing-md);
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .nav-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nav-btn:hover:not(:disabled) {
          background: var(--african-yellow);
          color: var(--african-black);
        }

        .nav-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .nav-info {
          color: white;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .media-preview-container {
            max-width: 95vw;
            max-height: 95vh;
          }
          
          .media-preview-header {
            padding: var(--spacing-sm);
          }
          
          .media-details h3 {
            font-size: 1rem;
          }
          
          .media-content {
            min-height: 300px;
          }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default MediaPreview;


