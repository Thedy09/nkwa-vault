const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { resolveUploadDir } = require('../social/db');
const social = require('../social/service');

const router = express.Router();
const uploadDir = resolveUploadDir();

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDir),
    filename: (_req, file, callback) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      callback(null, `${crypto.randomUUID()}${ext}`);
    }
  }),
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mime = file.mimetype || '';
    const image = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) && mime.startsWith('image/');
    const video = ['.mp4', '.webm', '.mov', '.ogg'].includes(ext) && mime.startsWith('video/');
    const audio = ['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.webm'].includes(ext) && mime.startsWith('audio/');
    if (!image && !video && !audio) {
      callback(new social.HttpError(400, 'Format de média non pris en charge'));
      return;
    }
    callback(null, true);
  }
});

function asyncHandler(handler) {
  return (req, res, next) => {
    try {
      Promise.resolve(handler(req, res, next)).catch(next);
    } catch (error) {
      next(error);
    }
  };
}

function sendData(res, data, message = 'OK', status = 200) {
  res.status(status).json({ success: true, message, data });
}

function parsePage(req) {
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 50);
  const offset = Math.min(Math.max(Number.parseInt(req.query.offset, 10) || 0, 0), 5000);
  return { limit, offset };
}

router.get('/health', (_req, res) => {
  const summary = social.inboxSummary(null);
  sendData(res, {
    ready: true,
    members: summary.members,
    posts: summary.posts
  });
});

router.post('/auth/register', asyncHandler(async (req, res) => {
  const result = social.registerUser({
    name: req.body?.name,
    email: req.body?.email,
    password: req.body?.password
  });
  sendData(res, result, 'Inscription réussie', 201);
}));

router.post('/auth/login', asyncHandler(async (req, res) => {
  const result = social.loginUser({
    email: req.body?.email,
    password: req.body?.password
  });
  sendData(res, result, 'Connexion réussie');
}));

router.get('/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { user: social.getMe(req.user.id) });
}));

router.put('/auth/me', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { user: social.updateProfile(req.user.id, req.body || {}) }, 'Profil mis à jour');
}));

router.get('/reels', optionalAuth, asyncHandler(async (req, res) => {
  const { limit } = parsePage(req);
  sendData(res, {
    posts: social.listReels({ viewerId: req.user?.id || null, limit })
  });
}));

router.get('/feed', optionalAuth, asyncHandler(async (req, res) => {
  const { limit, offset } = parsePage(req);
  const mode = req.query.mode === 'following' ? 'following' : 'discover';
  const posts = social.listPosts({
    viewerId: req.user?.id || null,
    mode,
    limit,
    offset,
    category: req.query.category || null
  });
  sendData(res, { posts, limit, offset });
}));

router.get('/explore', optionalAuth, asyncHandler(async (req, res) => {
  const { limit, offset } = parsePage(req);
  const q = String(req.query.q || '').trim().slice(0, 80);
  const posts = social.listPosts({
    viewerId: req.user?.id || null,
    limit,
    offset,
    category: req.query.category || null,
    q,
    heritage: String(req.query.heritage || '') === '1'
  });
  const users = q ? social.searchUsers(q, req.user?.id || null, 8) : [];
  sendData(res, { posts, users, limit, offset });
}));

router.get('/community', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, social.community(req.user?.id || null));
}));

router.get('/posts/:id', optionalAuth, asyncHandler(async (req, res) => {
  const post = social.getPostById(req.params.id, req.user?.id || null);
  if (!post) {
    res.status(404).json({ success: false, message: 'Publication introuvable' });
    return;
  }
  sendData(res, { post, comments: social.listComments(post.id) });
}));

router.post('/posts', authenticateToken, asyncHandler(async (req, res) => {
  const post = social.createPost(req.user.id, {
    body: req.body?.body,
    category: req.body?.category,
    origin: req.body?.origin,
    imageUrl: req.body?.imageUrl,
    sourceUrl: req.body?.sourceUrl,
    sourceTitle: req.body?.sourceTitle
  });
  sendData(res, { post }, 'Publication envoyée', 201);
}));

router.delete('/posts/:id', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, social.deletePost(req.user.id, req.params.id), 'Publication supprimée');
}));

router.post('/posts/:id/like', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { post: social.setLike(req.user.id, req.params.id, true) });
}));

router.delete('/posts/:id/like', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { post: social.setLike(req.user.id, req.params.id, false) });
}));

router.get('/posts/:id/comments', asyncHandler(async (req, res) => {
  sendData(res, { comments: social.listComments(req.params.id) });
}));

router.post('/posts/:id/comments', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { comments: social.addComment(req.user.id, req.params.id, req.body?.body) }, 'Commentaire publié', 201);
}));

router.delete('/comments/:id', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { comments: social.deleteComment(req.user.id, req.params.id) }, 'Commentaire supprimé');
}));

router.post('/posts/:id/bookmark', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { post: social.setBookmark(req.user.id, req.params.id, true) });
}));

router.delete('/posts/:id/bookmark', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { post: social.setBookmark(req.user.id, req.params.id, false) });
}));

router.get('/bookmarks', authenticateToken, asyncHandler(async (req, res) => {
  const { limit, offset } = parsePage(req);
  const posts = social.listPosts({
    viewerId: req.user.id,
    bookmarkedBy: req.user.id,
    limit,
    offset
  });
  sendData(res, { posts });
}));

router.get('/users/:username', optionalAuth, asyncHandler(async (req, res) => {
  const row = social.getUserRowByUsername(req.params.username);
  if (!row) {
    res.status(404).json({ success: false, message: 'Membre introuvable' });
    return;
  }
  const { limit, offset } = parsePage(req);
  sendData(res, {
    user: social.toPublicUser(row, req.user?.id || null),
    posts: social.listPosts({
      viewerId: req.user?.id || null,
      username: row.username,
      limit,
      offset
    })
  });
}));

router.get('/users/:username/followers', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, { users: social.listRelations(req.params.username, 'followers', req.user?.id || null) });
}));

router.get('/users/:username/following', optionalAuth, asyncHandler(async (req, res) => {
  sendData(res, { users: social.listRelations(req.params.username, 'following', req.user?.id || null) });
}));

router.post('/users/:username/follow', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { user: social.setFollow(req.user.id, req.params.username, true) });
}));

router.delete('/users/:username/follow', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { user: social.setFollow(req.user.id, req.params.username, false) });
}));

router.get('/notifications', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { notifications: social.listNotifications(req.user.id) });
}));

router.post('/notifications/read', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { notifications: social.markNotificationsRead(req.user.id) });
}));

router.get('/inbox', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, social.inboxSummary(req.user.id));
}));

router.get('/messages', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, { conversations: social.getConversations(req.user.id) });
}));

router.get('/messages/:username', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, social.getThread(req.user.id, req.params.username));
}));

router.post('/messages/:username', authenticateToken, asyncHandler(async (req, res) => {
  sendData(res, social.sendMessage(req.user.id, req.params.username, req.body?.body), 'Message envoyé', 201);
}));

router.post('/media', authenticateToken, (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      next(error.status ? error : new social.HttpError(400, error.message || 'Image refusée'));
      return;
    }
    if (!req.file) {
      next(new social.HttpError(400, 'Aucun média reçu'));
      return;
    }
    const mime = req.file.mimetype || '';
    const kind = mime.startsWith('video/') ? 'video' : mime.startsWith('audio/') ? 'audio' : 'image';
    sendData(res, {
      url: `/api/social/media/${req.file.filename}`,
      filename: req.file.filename,
      kind
    }, 'Média enregistré', 201);
  });
});

router.get('/media/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ success: false, message: 'Média introuvable' });
    return;
  }
  res.sendFile(filePath);
});

router.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) {
    console.error('Erreur réseau social:', error);
  }
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Erreur interne du réseau social' : error.message
  });
});

module.exports = router;
