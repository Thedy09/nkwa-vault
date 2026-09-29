import React, { useEffect } from 'react';
import { categoryLabel } from '../../social/api';

function articleTitle(article) {
  const explicit = String(article?.title || '').trim();
  if (explicit) return explicit;
  return String(article?.body || article?.description || 'Article').split('\n')[0].slice(0, 140);
}

export default function ArticleReader({ article, onClose }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!article) return null;
  const title = articleTitle(article);
  const body = String(article.body || article.description || '').replace(/^[^\n]+\n+/, '');

  return (
    <div className="article-reader" role="dialog" aria-modal="true" aria-label={title} data-testid="article-reader">
      <button className="article-reader-backdrop" type="button" aria-label="Fermer" onClick={onClose} />
      <article className="article-sheet">
        <button className="article-close" type="button" onClick={onClose} aria-label="Fermer l'article">×</button>
        <div className="chip-row">
          <span className="chip">{categoryLabel(article.category)}</span>
          {article.origin ? <span className="chip">{article.origin}</span> : null}
        </div>
        <h2>{title}</h2>
        {article.authorName || article.author?.name ? (
          <p className="muted">{article.authorName || article.author.name}</p>
        ) : null}
        <p className="article-summary">{body || article.body}</p>
        <p className="source-credit" data-testid="article-source">
          {article.sourceTitle || 'Source'}
          {article.sourceUrl ? <span> · {article.sourceUrl}</span> : null}
        </p>
      </article>
    </div>
  );
}
