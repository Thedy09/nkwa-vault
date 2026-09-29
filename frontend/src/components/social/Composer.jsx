import React, { useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { CATEGORIES, createPost, errorMessage, mediaUrl, uploadMedia } from '../../social/api';

export default function Composer({ onCreated, onRequireAuth }) {
  const { user, isAuthenticated } = useAuth();
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('quotidien');
  const [origin, setOrigin] = useState('');
  const [media, setMedia] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadMedia(file);
      const kind = uploaded.kind || (file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'image');
      setMedia({ url: uploaded.url, kind, preview: mediaUrl(uploaded.url), name: file.name });
    } catch (err) {
      setError(errorMessage(err, 'Média refusé'));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    if (!body.trim()) return;
    setBusy(true);
    setError('');
    try {
      const post = await createPost({
        body: body.trim(),
        category,
        origin: origin.trim(),
        imageUrl: media?.kind === 'image' ? media.url : null,
        videoUrl: media?.kind === 'video' ? media.url : null,
        audioUrl: media?.kind === 'audio' ? media.url : null,
        posterUrl: media?.kind === 'image' ? media.url : null
      });
      setBody('');
      setOrigin('');
      setMedia(null);
      setCategory('quotidien');
      onCreated?.(post);
    } catch (err) {
      setError(errorMessage(err, 'Publication impossible'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="composer" onSubmit={submit}>
      <textarea
        rows={3}
        maxLength={2000}
        value={body}
        placeholder={user ? `Quoi de neuf, ${user.name.split(' ')[0]} ?` : 'Connectez-vous pour publier un conte, un proverbe, une image…'}
        onChange={(event) => setBody(event.target.value)}
        onFocus={() => {
          if (!isAuthenticated()) onRequireAuth?.();
        }}
      />
      <div className="composer-row">
        <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Catégorie">
          {CATEGORIES.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        <input
          value={origin}
          onChange={(event) => setOrigin(event.target.value)}
          placeholder="Origine, peuple, ville"
          maxLength={80}
        />
        <label className="ghost-btn file-btn">
          <ImagePlus size={16} /> Média
          <input
            type="file"
            accept="image/png,image/jpeg,image/gif,image/webp,video/mp4,video/webm,video/quicktime,audio/mpeg,audio/wav,audio/ogg,audio/aac,audio/mp4"
            onChange={onFile}
          />
        </label>
        <button className="primary-btn" type="submit" disabled={busy || !body.trim()}>
          {busy ? 'Envoi…' : 'Publier'}
        </button>
      </div>
      {media?.kind === 'image' ? <img className="preview-image" src={media.preview} alt="Aperçu" /> : null}
      {media?.kind === 'video' ? <video className="preview-image" src={media.preview} controls muted /> : null}
      {media?.kind === 'audio' ? <audio src={media.preview} controls /> : null}
      {error ? <p className="error-text">{error}</p> : null}
    </form>
  );
}
