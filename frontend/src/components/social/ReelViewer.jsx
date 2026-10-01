import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { reelLabel } from '../../social/reels';
import LocalPassage from '../../social/LocalPassage';

export default function ReelViewer({ items, index, onClose, onChangeIndex }) {
  const item = items[index];
  const mediaRef = useRef(null);
  const touchStart = useRef(null);
  const [paused, setPaused] = useState(true);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    setPaused(true);
    const node = mediaRef.current;
    if (!node || typeof node.play !== 'function') return undefined;
    const attempt = node.play();
    if (attempt && typeof attempt.catch === 'function') {
      attempt.catch(() => setPaused(true));
    }
    return undefined;
  }, [item?.id]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const go = (delta) => {
    const next = index + delta;
    if (next < 0 || next >= items.length) return;
    onChangeIndex(next);
  };

  if (!item) return null;

  const play = () => {
    const node = mediaRef.current;
    if (!node || typeof node.play !== 'function') return;
    node.play().catch(() => setPaused(true));
  };

  return createPortal(
    <div className="reel-viewer" role="dialog" aria-modal="true" aria-label="Lecture dans l'application">
      <button className="reel-viewer-backdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <section
        className="reel-stage"
        onTouchStart={(event) => {
          touchStart.current = event.changedTouches[0].clientY;
        }}
        onTouchEnd={(event) => {
          if (touchStart.current == null) return;
          const delta = event.changedTouches[0].clientY - touchStart.current;
          touchStart.current = null;
          if (delta < -48) go(1);
          if (delta > 48) go(-1);
        }}
      >
        <button className="reel-close" type="button" onClick={onClose} aria-label="Fermer le reel">
          <X size={18} />
        </button>
        {index > 0 ? (
          <button className="reel-nav prev" type="button" onClick={() => go(-1)} aria-label="Reel précédent">
            <ChevronUp size={18} />
          </button>
        ) : null}
        {index < items.length - 1 ? (
          <button className="reel-nav next" type="button" onClick={() => go(1)} aria-label="Reel suivant">
            <ChevronDown size={18} />
          </button>
        ) : null}

        {item.kind === 'video' ? (
          <video
            key={item.id}
            ref={mediaRef}
            className="reel-fill"
            src={item.src}
            poster={item.poster || undefined}
            controls
            playsInline
            autoPlay
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
        ) : null}

        {item.kind === 'audio' ? (
          <div className="reel-audio-full" key={item.id}>
            {item.poster ? <img className="reel-fill" src={item.poster} alt="" /> : <div className="reel-audio-fallback" />}
            <audio
              ref={mediaRef}
              src={item.src}
              controls
              autoPlay
              onPlay={() => setPaused(false)}
              onPause={() => setPaused(true)}
            />
          </div>
        ) : null}

        {item.kind === 'image' ? <img className="reel-fill" src={item.src} alt="" /> : null}

        {item.kind === 'page' ? <iframe className="reel-frame" title={item.body.slice(0, 80)} src={item.src} /> : null}

        {item.kind === 'text' ? (
          <div className="reel-text-full">
            <p>{item.body}</p>
          </div>
        ) : null}

        {paused && (item.kind === 'video' || item.kind === 'audio') ? (
          <button className="reel-big-play" type="button" onClick={play} aria-label="Lire">
            ▶
          </button>
        ) : null}

        <div className="reel-caption">
          <div className="reel-caption-top">
            <span className="chip">{reelLabel(item.kind)}</span>
            <span className="muted">{index + 1} / {items.length}</span>
          </div>
          <strong>{item.author}</strong>
          {item.origin ? <div className="muted">{item.origin}</div> : null}
          {item.translations ? (
            <LocalPassage text={item.body} translations={item.translations} languageName={item.language} />
          ) : (
            <p>{item.body}</p>
          )}
          {item.credit ? <div className="muted">{item.credit}</div> : null}
        </div>
      </section>
    </div>,
    document.body
  );
}
