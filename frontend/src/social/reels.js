import { mediaUrl } from './api';

export function reelKind(post) {
  if (!post) return null;
  if (post.videoUrl) return 'video';
  if (post.audioUrl) return 'audio';
  if (post.imageUrl) return 'image';
  return null;
}

export function reelLabel(kind) {
  if (kind === 'video') return 'Vidéo';
  if (kind === 'audio') return 'Chant';
  if (kind === 'image') return 'Image';
  if (kind === 'text') return 'Texte';
  if (kind === 'page') return 'Document';
  return 'Reel';
}

export function toReelItem(post) {
  const kind = reelKind(post);
  if (!kind) return null;
  const poster = post.posterUrl || post.imageUrl || '';
  const src = kind === 'video' ? post.videoUrl : kind === 'audio' ? post.audioUrl : post.imageUrl;
  return {
    id: post.id,
    kind,
    src: mediaUrl(src),
    poster: poster ? mediaUrl(poster) : '',
    body: post.body || '',
    origin: post.origin || '',
    author: post.author?.name || '',
    username: post.author?.username || '',
    avatar: post.author?.avatar ? mediaUrl(post.author.avatar) : '',
    credit: post.sourceTitle || ''
  };
}

export function collectReels(post, collection) {
  const items = [];
  const seen = new Set();
  const push = (entry) => {
    const reel = toReelItem(entry);
    if (!reel || seen.has(reel.id)) return;
    seen.add(reel.id);
    items.push(reel);
  };
  (collection || []).forEach(push);
  push(post);
  const index = Math.max(0, items.findIndex((item) => item.id === post.id));
  return { items, index };
}
