import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import {
  addComment,
  bookmarkPost,
  categoryLabel,
  deleteComment,
  deletePost,
  errorMessage,
  getComments,
  likePost,
  mediaUrl,
  timeAgo,
  unbookmarkPost,
  unlikePost
} from '../../social/api';
import { reelKind, reelLabel } from '../../social/reels';

export default function PostCard({ post, onChange, onDelete, onOpenProfile, onOpenReel, onRequireAuth }) {
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const ensureAuth = () => {
    if (isAuthenticated()) return true;
    onRequireAuth?.();
    return false;
  };

  const replace = (next) => onChange?.(next);

  const toggleLike = async () => {
    if (!ensureAuth()) return;
    const previous = post;
    const liked = !post.liked;
    replace({ ...post, liked, likeCount: post.likeCount + (liked ? 1 : -1) });
    try {
      replace(liked ? await likePost(post.id) : await unlikePost(post.id));
    } catch (err) {
      replace(previous);
      setError(errorMessage(err, 'Impossible de mettre à jour le j\'aime'));
    }
  };

  const toggleBookmark = async () => {
    if (!ensureAuth()) return;
    const previous = post;
    replace({ ...post, bookmarked: !post.bookmarked });
    try {
      replace(post.bookmarked ? await unbookmarkPost(post.id) : await bookmarkPost(post.id));
    } catch (err) {
      replace(previous);
      setError(errorMessage(err, 'Impossible d\'enregistrer la publication'));
    }
  };

  const openComments = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setComments(await getComments(post.id));
      } catch (err) {
        setError(errorMessage(err, 'Commentaires indisponibles'));
      }
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!ensureAuth() || !draft.trim()) return;
    setBusy(true);
    setError('');
    try {
      const next = await addComment(post.id, draft.trim());
      setComments(next);
      setDraft('');
      replace({ ...post, commentCount: next.length });
    } catch (err) {
      setError(errorMessage(err, 'Commentaire refusé'));
    } finally {
      setBusy(false);
    }
  };

  const removeComment = async (id) => {
    try {
      const next = await deleteComment(id);
      setComments(next);
      replace({ ...post, commentCount: next.length });
    } catch (err) {
      setError(errorMessage(err, 'Suppression impossible'));
    }
  };

  const removePost = async () => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    try {
      await deletePost(post.id);
      onDelete?.(post.id);
    } catch (err) {
      setError(errorMessage(err, 'Suppression impossible'));
    }
  };

  const canDelete = user && (user.id === post.author.id || user.role === 'ADMIN');
  const kind = reelKind(post);
  const poster = mediaUrl(post.posterUrl || post.imageUrl);

  return (
    <article className="post-card">
      <header className="post-top">
        <button className="person-btn" onClick={() => onOpenProfile(post.author.username)} type="button">
          <img className="avatar" src={mediaUrl(post.author.avatar)} alt="" />
        </button>
        <div>
          <button className="person-btn person-name" onClick={() => onOpenProfile(post.author.username)} type="button">
            {post.author.name}
          </button>
          <div className="muted">
            @{post.author.username}
            {post.author.country ? ` · ${post.author.country}` : ''}
            {' · '}
            {timeAgo(post.createdAt)}
          </div>
        </div>
      </header>

      <div className="chip-row" style={{ marginTop: 10 }}>
        <span className="chip">{categoryLabel(post.category)}</span>
        {post.origin ? <span className="chip">{post.origin}</span> : null}
      </div>

      <p className="post-body">{post.body}</p>
      {post.sourceUrl ? (
        <p className="source-line">
          <a href={post.sourceUrl} target="_blank" rel="noreferrer noopener">
            {post.sourceTitle || 'Lire la source'}
          </a>
        </p>
      ) : null}
      {kind ? (
        <button className={`reel-tile reel-tile-${kind}`} type="button" onClick={() => onOpenReel?.(post)}>
          {poster ? (
            <img
              src={poster}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <span className="reel-rail-fallback" />
          )}
          <span className="reel-tile-play" aria-hidden="true">▶</span>
          <span className="reel-tile-label">{reelLabel(kind)}</span>
        </button>
      ) : null}

      <div className="post-actions">
        <button className={`icon-btn ${post.liked ? 'liked' : ''}`} type="button" onClick={toggleLike}>
          <Heart size={16} /> {post.likeCount}
        </button>
        <button className={`icon-btn ${open ? 'active' : ''}`} type="button" onClick={openComments}>
          <MessageCircle size={16} /> {post.commentCount}
        </button>
        <button className={`icon-btn ${post.bookmarked ? 'active' : ''}`} type="button" onClick={toggleBookmark}>
          <Bookmark size={16} />
        </button>
        {canDelete ? (
          <button className="icon-btn" type="button" onClick={removePost}>
            <Trash2 size={16} />
          </button>
        ) : null}
      </div>

      {error ? <p className="error-text">{error}</p> : null}

      {open ? (
        <div className="comments">
          {comments.map((comment) => (
            <div className="comment" key={comment.id}>
              <img className="avatar" src={mediaUrl(comment.author.avatar)} alt="" />
              <div>
                <button className="person-btn person-name" type="button" onClick={() => onOpenProfile(comment.author.username)}>
                  {comment.author.name}
                </button>
                <span className="muted"> · {timeAgo(comment.createdAt)}</span>
                <p>{comment.body}</p>
                {user && (user.id === comment.author.id || user.role === 'ADMIN') ? (
                  <button className="text-btn muted" type="button" onClick={() => removeComment(comment.id)}>
                    Supprimer
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          <form className="comment-form" onSubmit={submitComment}>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Écrire un commentaire"
              maxLength={500}
            />
            <button className="primary-btn" type="submit" disabled={busy || !draft.trim()}>
              Publier
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
