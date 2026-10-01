const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const CATEGORIES = ['quotidien', 'conte', 'proverbe', 'musique', 'art', 'devinette'];
const HERITAGE_CATEGORIES = ['conte', 'proverbe', 'musique', 'art', 'devinette'];
const AVATAR_COLORS = ['#FFD700', '#228B22', '#DC143C', '#B8860B', '#20B2AA', '#F4A460', '#C71585'];

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function hoursAgo(hours) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function createId() {
  return crypto.randomUUID();
}

function makeAvatar(name, index = 0) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const initial = [...String(name || '?').trim()][0]?.toUpperCase() || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="128" height="128" rx="64" fill="${color}"/><text x="64" y="82" text-anchor="middle" font-family="Arial,sans-serif" font-size="58" font-weight="700" fill="#1a1a1a">${initial}</text></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function slugify(value) {
  const base = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 16);
  return base || 'membre';
}

function clampText(value, max) {
  return String(value || '').trim().slice(0, max);
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeSourceUrl(value) {
  if (!value) return null;
  const url = String(value).trim();
  if (!/^https:\/\//i.test(url)) return null;
  return url.slice(0, 500);
}

function sanitizeMediaUrl(value) {
  if (!value) return null;
  const url = String(value).trim();
  if (url.startsWith('/api/social/media/')) {
    return url.slice(0, 300);
  }
  if (/^https?:\/\//i.test(url)) {
    return url.slice(0, 500);
  }
  return null;
}

function signToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

function getUserRowById(id) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}

function getUserRowByEmail(email) {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(normalizeEmail(email));
}

function getUserRowByUsername(username) {
  return db.prepare('SELECT * FROM users WHERE username = ?').get(String(username || '').toLowerCase());
}

function countForUser(table, column, userId) {
  const row = db.prepare(`SELECT COUNT(*) AS count FROM ${table} WHERE ${column} = ?`).get(userId);
  return Number(row?.count || 0);
}

function toPublicUser(row, viewerId = null) {
  if (!row) return null;
  const likes = db.prepare(`
    SELECT COUNT(*) AS count
    FROM likes l
    JOIN posts p ON p.id = l.post_id
    WHERE p.author_id = ?
  `).get(row.id);

  return {
    id: row.id,
    username: row.username,
    name: row.name,
    bio: row.bio || '',
    avatar: row.avatar,
    country: row.country || '',
    role: row.role,
    createdAt: row.created_at,
    followedByMe: viewerId
      ? Boolean(db.prepare('SELECT 1 AS ok FROM follows WHERE follower_id = ? AND following_id = ?').get(viewerId, row.id))
      : false,
    stats: {
      posts: countForUser('posts', 'author_id', row.id),
      followers: countForUser('follows', 'following_id', row.id),
      following: countForUser('follows', 'follower_id', row.id),
      likes: Number(likes?.count || 0)
    }
  };
}

function toPrivateUser(row) {
  const pub = toPublicUser(row, row.id);
  return {
    ...pub,
    email: row.email,
    isActive: Boolean(row.is_active)
  };
}

function createNotification({ userId, actorId, type, postId = null, createdAt = null }) {
  if (!userId || !actorId || userId === actorId) return;
  db.prepare(`
    INSERT INTO notifications (id, user_id, actor_id, type, post_id, read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(createId(), userId, actorId, type, postId, createdAt || nowIso());
}

const POST_SELECT = `
  SELECT
    p.id, p.body, p.category, p.origin, p.image_url, p.video_url, p.audio_url, p.poster_url,
    p.source_url, p.source_title, p.created_at, p.author_id,
    u.username, u.name, u.avatar, u.country,
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
    (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
    CASE WHEN ? IS NULL THEN 0 ELSE EXISTS(SELECT 1 FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) END AS liked,
    CASE WHEN ? IS NULL THEN 0 ELSE EXISTS(SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = ?) END AS bookmarked,
    CASE WHEN ? IS NULL THEN 0 ELSE EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.following_id = p.author_id) END AS followed
  FROM posts p
  JOIN users u ON u.id = p.author_id
`;

function mapPost(row) {
  return {
    id: row.id,
    body: row.body,
    category: row.category,
    origin: row.origin || '',
    imageUrl: row.image_url || null,
    videoUrl: row.video_url || null,
    audioUrl: row.audio_url || null,
    posterUrl: row.poster_url || null,
    sourceUrl: row.source_url || null,
    sourceTitle: row.source_title || null,
    createdAt: row.created_at,
    likeCount: Number(row.like_count || 0),
    commentCount: Number(row.comment_count || 0),
    liked: Boolean(Number(row.liked)),
    bookmarked: Boolean(Number(row.bookmarked)),
    author: {
      id: row.author_id,
      username: row.username,
      name: row.name,
      avatar: row.avatar,
      country: row.country || '',
      followedByMe: Boolean(Number(row.followed))
    }
  };
}

function normalizeAnswer(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function answerForms(answer) {
  return String(answer || '')
    .split('|')
    .map((part) => normalizeAnswer(part))
    .filter(Boolean);
}

function answersMatch(answer, guess) {
  const normalized = normalizeAnswer(guess);
  return Boolean(normalized) && answerForms(answer).includes(normalized);
}

function displayAnswer(answer) {
  return String(answer || '').split('|')[0].trim();
}

function parseChoices(raw) {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch (_) {
    return [];
  }
}

function toPublicGame(row, viewerId) {
  if (!row) return null;
  const attempt = viewerId
    ? db.prepare('SELECT correct, revealed FROM wisdom_attempts WHERE user_id = ? AND game_id = ?').get(viewerId, row.id)
    : null;
  const unlocked = Boolean(attempt && (Number(attempt.correct) === 1 || Number(attempt.revealed) === 1));
  return {
    id: row.id,
    postId: row.post_id,
    key: row.game_key,
    kind: row.kind,
    prompt: row.prompt,
    hint: row.hint || '',
    choices: parseChoices(row.choices),
    attempted: Boolean(attempt),
    correct: Boolean(attempt && Number(attempt.correct) === 1),
    revealed: Boolean(attempt && Number(attempt.revealed) === 1),
    answer: unlocked ? displayAnswer(row.answer) : null,
    explanation: unlocked ? (row.explanation || '') : null
  };
}

function attachGames(posts, viewerId) {
  if (!posts.length) return posts;
  const ids = posts.map((post) => post.id);
  const rows = db.prepare(
    `SELECT * FROM wisdom_games WHERE post_id IN (${ids.map(() => '?').join(',')})`
  ).all(...ids);
  const byPost = new Map(rows.map((row) => [row.post_id, toPublicGame(row, viewerId)]));
  return posts.map((post) => ({
    ...post,
    game: byPost.get(post.id) || null
  }));
}

function getPostById(postId, viewerId = null) {
  const row = db.prepare(`${POST_SELECT} WHERE p.id = ?`).get(
    viewerId, viewerId, viewerId, viewerId, viewerId, viewerId, postId
  );
  return row ? attachGames([mapPost(row)], viewerId)[0] : null;
}

function listPosts({ viewerId = null, mode = 'discover', limit = 20, offset = 0, category = null, q = null, username = null, bookmarkedBy = null, heritage = false, games = false }) {
  const where = [];
  const params = [viewerId, viewerId, viewerId, viewerId, viewerId, viewerId];

  if (mode === 'following') {
    if (!viewerId) {
      return [];
    }
    where.push(`(p.author_id = ? OR EXISTS (SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.following_id = p.author_id))`);
    params.push(viewerId, viewerId);
  }

  if (category && CATEGORIES.includes(category)) {
    where.push('p.category = ?');
    params.push(category);
  } else if (heritage) {
    where.push(`p.category IN (${HERITAGE_CATEGORIES.map(() => '?').join(',')})`);
    params.push(...HERITAGE_CATEGORIES);
  }

  if (games) {
    where.push('EXISTS (SELECT 1 FROM wisdom_games wg WHERE wg.post_id = p.id)');
  }

  if (username) {
    where.push('u.username = ?');
    params.push(String(username).toLowerCase());
  }

  if (bookmarkedBy) {
    where.push('EXISTS (SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = ?)');
    params.push(bookmarkedBy);
  }

  if (q) {
    const like = `%${String(q).replace(/[%_]/g, '')}%`;
    where.push('(p.body LIKE ? OR p.origin LIKE ? OR u.name LIKE ? OR u.username LIKE ? OR IFNULL(p.source_title, \'\') LIKE ?)');
    params.push(like, like, like, like, like);
  }

  const sql = `
    ${POST_SELECT}
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY p.created_at DESC
    LIMIT ? OFFSET ?
  `;
  params.push(limit, offset);
  return attachGames(db.prepare(sql).all(...params).map(mapPost), viewerId);
}

function allocateUsername(name) {
  const base = slugify(name);
  let candidate = base;
  let index = 0;
  while (getUserRowByUsername(candidate)) {
    index += 1;
    candidate = `${base}${index}`.slice(0, 20);
  }
  return candidate;
}

function registerUser({ name, email, password }) {
  const cleanName = clampText(name, 60);
  const cleanEmail = normalizeEmail(email);
  const cleanPassword = String(password || '');

  if (cleanName.length < 2) {
    throw new HttpError(400, 'Le nom doit contenir au moins 2 caractères');
  }
  if (!isValidEmail(cleanEmail)) {
    throw new HttpError(400, 'Adresse email invalide');
  }
  if (cleanPassword.length < 6) {
    throw new HttpError(400, 'Le mot de passe doit contenir au moins 6 caractères');
  }
  if (getUserRowByEmail(cleanEmail)) {
    throw new HttpError(409, 'Un compte existe déjà avec cet email');
  }

  const user = {
    id: createId(),
    username: allocateUsername(cleanName),
    email: cleanEmail,
    password_hash: bcrypt.hashSync(cleanPassword, 10),
    name: cleanName,
    bio: '',
    avatar: makeAvatar(cleanName, db.prepare('SELECT COUNT(*) AS count FROM users').get().count),
    country: '',
    role: 'USER',
    is_active: 1,
    created_at: nowIso()
  };

  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, name, bio, avatar, country, role, is_active, created_at)
    VALUES (@id, @username, @email, @password_hash, @name, @bio, @avatar, @country, @role, @is_active, @created_at)
  `).run(user);

  const row = getUserRowById(user.id);
  return { user: toPrivateUser(row), token: signToken(row) };
}

function loginUser({ email, password }) {
  const row = getUserRowByEmail(email);
  if (!row || !bcrypt.compareSync(String(password || ''), row.password_hash)) {
    throw new HttpError(401, 'Email ou mot de passe incorrect');
  }
  if (!row.is_active) {
    throw new HttpError(403, 'Ce compte est désactivé');
  }
  return { user: toPrivateUser(row), token: signToken(row) };
}

function getMe(userId) {
  const row = getUserRowById(userId);
  if (!row) throw new HttpError(404, 'Utilisateur introuvable');
  return toPrivateUser(row);
}

function updateProfile(userId, payload) {
  const row = getUserRowById(userId);
  if (!row) throw new HttpError(404, 'Utilisateur introuvable');

  const name = payload.name !== undefined ? clampText(payload.name, 60) : row.name;
  const bio = payload.bio !== undefined ? clampText(payload.bio, 280) : row.bio;
  const country = payload.country !== undefined ? clampText(payload.country, 60) : row.country;
  const avatar = payload.avatar !== undefined ? (sanitizeMediaUrl(payload.avatar) || row.avatar) : row.avatar;

  if (name.length < 2) {
    throw new HttpError(400, 'Le nom doit contenir au moins 2 caractères');
  }

  db.prepare('UPDATE users SET name = ?, bio = ?, country = ?, avatar = ? WHERE id = ?')
    .run(name, bio, country, avatar, userId);

  return toPrivateUser(getUserRowById(userId));
}

function requireUser(userId) {
  const row = getUserRowById(userId);
  if (!row || !row.is_active) {
    throw new HttpError(401, 'Authentification requise');
  }
  return row;
}

function createPost(authorId, payload) {
  const author = requireUser(authorId);
  const body = clampText(payload.body, 2000);
  const category = CATEGORIES.includes(payload.category) ? payload.category : 'quotidien';
  const origin = clampText(payload.origin, 80);
  const imageUrl = sanitizeMediaUrl(payload.imageUrl);
  const videoUrl = sanitizeMediaUrl(payload.videoUrl);
  const audioUrl = sanitizeMediaUrl(payload.audioUrl);
  const posterUrl = sanitizeMediaUrl(payload.posterUrl);
  const sourceUrl = sanitizeSourceUrl(payload.sourceUrl);
  const sourceTitle = clampText(payload.sourceTitle, 140);
  if (body.length < 1) {
    throw new HttpError(400, 'Le message ne peut pas être vide');
  }

  const id = createId();
  const createdAt = payload.createdAt || nowIso();
  db.prepare(`
    INSERT INTO posts (
      id, author_id, body, category, origin, image_url, video_url, audio_url, poster_url,
      source_url, source_title, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id, author.id, body, category, origin, imageUrl, videoUrl, audioUrl, posterUrl,
    sourceUrl, sourceTitle, createdAt
  );

  return getPostById(id, author.id);
}

function listReels({ viewerId = null, limit = 18 } = {}) {
  const rows = db.prepare(`
    ${POST_SELECT}
    WHERE p.video_url IS NOT NULL OR p.audio_url IS NOT NULL OR p.image_url IS NOT NULL
    ORDER BY
      CASE WHEN p.video_url IS NOT NULL OR p.audio_url IS NOT NULL THEN 0 ELSE 1 END,
      p.created_at DESC
    LIMIT ?
  `).all(viewerId, viewerId, viewerId, viewerId, viewerId, viewerId, Math.min(Math.max(Number(limit) || 18, 1), 40));
  return attachGames(rows.map(mapPost), viewerId);
}

function wisdomScore(userId) {
  if (!userId) {
    return { correct: 0, streak: 0, played: 0 };
  }
  const rows = db.prepare(
    'SELECT correct FROM wisdom_attempts WHERE user_id = ? ORDER BY created_at DESC, game_id DESC'
  ).all(userId);
  let streak = 0;
  for (const row of rows) {
    if (Number(row.correct) === 1) streak += 1;
    else break;
  }
  return {
    correct: rows.filter((row) => Number(row.correct) === 1).length,
    streak,
    played: rows.length
  };
}

function getGameByPostId(postId, viewerId = null) {
  const row = db.prepare('SELECT * FROM wisdom_games WHERE post_id = ?').get(postId);
  return toPublicGame(row, viewerId);
}

function saveWisdomAttempt(userId, gameId, { correct, revealed }) {
  const existing = db.prepare(
    'SELECT correct, revealed FROM wisdom_attempts WHERE user_id = ? AND game_id = ?'
  ).get(userId, gameId);
  const nextCorrect = (correct || Number(existing?.correct) === 1) ? 1 : 0;
  const nextRevealed = (revealed || Number(existing?.revealed) === 1) ? 1 : 0;
  if (existing) {
    db.prepare(
      'UPDATE wisdom_attempts SET correct = ?, revealed = ?, created_at = ? WHERE user_id = ? AND game_id = ?'
    ).run(nextCorrect, nextRevealed, nowIso(), userId, gameId);
  } else {
    db.prepare(
      'INSERT INTO wisdom_attempts (user_id, game_id, correct, revealed, created_at) VALUES (?, ?, ?, ?, ?)'
    ).run(userId, gameId, nextCorrect, nextRevealed, nowIso());
  }
}

function submitWisdomAttempt(userId, postId, payload = {}) {
  const user = requireUser(userId);
  const game = db.prepare('SELECT * FROM wisdom_games WHERE post_id = ?').get(postId);
  if (!game) throw new HttpError(404, 'Jeu introuvable');

  const existing = db.prepare(
    'SELECT correct, revealed FROM wisdom_attempts WHERE user_id = ? AND game_id = ?'
  ).get(user.id, game.id);
  const reveal = Boolean(payload.reveal);

  if (reveal) {
    saveWisdomAttempt(user.id, game.id, { correct: false, revealed: true });
    const publicGame = toPublicGame(game, user.id);
    return {
      accepted: true,
      correct: publicGame.correct,
      revealed: true,
      game: publicGame,
      score: wisdomScore(user.id)
    };
  }

  if (existing && Number(existing.correct) === 1) {
    return {
      accepted: true,
      correct: true,
      revealed: Number(existing.revealed) === 1,
      game: toPublicGame(game, user.id),
      score: wisdomScore(user.id)
    };
  }

  const guess = clampText(payload.answer, 200);
  if (!guess) throw new HttpError(400, 'Propose une réponse');

  if (!answersMatch(game.answer, guess)) {
    saveWisdomAttempt(user.id, game.id, { correct: false, revealed: false });
    return {
      accepted: false,
      correct: false,
      revealed: Boolean(existing && Number(existing.revealed) === 1),
      game: toPublicGame(game, user.id),
      score: wisdomScore(user.id)
    };
  }

  saveWisdomAttempt(user.id, game.id, { correct: true, revealed: false });
  return {
    accepted: true,
    correct: true,
    revealed: Boolean(existing && Number(existing.revealed) === 1),
    game: toPublicGame(game, user.id),
    score: wisdomScore(user.id)
  };
}

function deletePost(userId, postId) {
  const user = requireUser(userId);
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!row) throw new HttpError(404, 'Publication introuvable');
  if (row.author_id !== user.id && user.role !== 'ADMIN') {
    throw new HttpError(403, 'Vous ne pouvez pas supprimer cette publication');
  }
  db.prepare('DELETE FROM posts WHERE id = ?').run(postId);
  return { deleted: true };
}

function setLike(userId, postId, liked) {
  const user = requireUser(userId);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) throw new HttpError(404, 'Publication introuvable');

  if (liked) {
    const info = db.prepare('INSERT OR IGNORE INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)')
      .run(user.id, postId, nowIso());
    if (info.changes) {
      createNotification({ userId: post.author_id, actorId: user.id, type: 'like', postId });
    }
  } else {
    db.prepare('DELETE FROM likes WHERE user_id = ? AND post_id = ?').run(user.id, postId);
  }

  return getPostById(postId, user.id);
}

function addComment(userId, postId, body) {
  const user = requireUser(userId);
  const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(postId);
  if (!post) throw new HttpError(404, 'Publication introuvable');
  const text = clampText(body, 500);
  if (!text) throw new HttpError(400, 'Le commentaire ne peut pas être vide');

  const id = createId();
  const createdAt = nowIso();
  db.prepare('INSERT INTO comments (id, post_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(id, postId, user.id, text, createdAt);
  createNotification({ userId: post.author_id, actorId: user.id, type: 'comment', postId, createdAt });
  return listComments(postId);
}

function deleteComment(userId, commentId) {
  const user = requireUser(userId);
  const comment = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId);
  if (!comment) throw new HttpError(404, 'Commentaire introuvable');
  if (comment.author_id !== user.id && user.role !== 'ADMIN') {
    throw new HttpError(403, 'Vous ne pouvez pas supprimer ce commentaire');
  }
  db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  return listComments(comment.post_id);
}

function listComments(postId) {
  const rows = db.prepare(`
    SELECT c.id, c.body, c.created_at, c.post_id, u.id AS author_id, u.username, u.name, u.avatar
    FROM comments c
    JOIN users u ON u.id = c.author_id
    WHERE c.post_id = ?
    ORDER BY c.created_at ASC
  `).all(postId);

  return rows.map((row) => ({
    id: row.id,
    postId: row.post_id,
    body: row.body,
    createdAt: row.created_at,
    author: {
      id: row.author_id,
      username: row.username,
      name: row.name,
      avatar: row.avatar
    }
  }));
}

function setFollow(followerId, username, shouldFollow) {
  const follower = requireUser(followerId);
  const target = getUserRowByUsername(username);
  if (!target) throw new HttpError(404, 'Membre introuvable');
  if (target.id === follower.id) {
    throw new HttpError(400, 'Vous ne pouvez pas vous suivre vous-même');
  }

  if (shouldFollow) {
    const info = db.prepare('INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)')
      .run(follower.id, target.id, nowIso());
    if (info.changes) {
      createNotification({ userId: target.id, actorId: follower.id, type: 'follow' });
    }
  } else {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').run(follower.id, target.id);
  }

  return toPublicUser(getUserRowById(target.id), follower.id);
}

function setBookmark(userId, postId, saved) {
  const user = requireUser(userId);
  const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
  if (!post) throw new HttpError(404, 'Publication introuvable');
  if (saved) {
    db.prepare('INSERT OR IGNORE INTO bookmarks (user_id, post_id, created_at) VALUES (?, ?, ?)').run(user.id, postId, nowIso());
  } else {
    db.prepare('DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?').run(user.id, postId);
  }
  return getPostById(postId, user.id);
}

function searchUsers(q, viewerId, limit = 8) {
  const like = `%${String(q || '').replace(/[%_]/g, '')}%`;
  const rows = q
    ? db.prepare(`
        SELECT * FROM users
        WHERE is_active = 1 AND (username LIKE ? OR name LIKE ? OR country LIKE ?)
        ORDER BY name ASC
        LIMIT ?
      `).all(like, like, like, limit)
    : db.prepare('SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC LIMIT ?').all(limit);

  return rows.map((row) => toPublicUser(row, viewerId));
}

function listRelations(username, kind, viewerId) {
  const user = getUserRowByUsername(username);
  if (!user) throw new HttpError(404, 'Membre introuvable');
  const sql = kind === 'followers'
    ? `SELECT u.* FROM follows f JOIN users u ON u.id = f.follower_id WHERE f.following_id = ? ORDER BY f.created_at DESC`
    : `SELECT u.* FROM follows f JOIN users u ON u.id = f.following_id WHERE f.follower_id = ? ORDER BY f.created_at DESC`;
  return db.prepare(sql).all(user.id).map((row) => toPublicUser(row, viewerId));
}

function listNotifications(userId) {
  requireUser(userId);
  const rows = db.prepare(`
    SELECT n.id, n.type, n.post_id, n.read, n.created_at, u.username, u.name, u.avatar
    FROM notifications n
    JOIN users u ON u.id = n.actor_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT 50
  `).all(userId);

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    postId: row.post_id,
    read: Boolean(row.read),
    createdAt: row.created_at,
    actor: {
      username: row.username,
      name: row.name,
      avatar: row.avatar
    }
  }));
}

function markNotificationsRead(userId) {
  requireUser(userId);
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
  return listNotifications(userId);
}

function inboxSummary(userId) {
  if (!userId || !getUserRowById(userId)) {
    return { notifications: 0, messages: 0, members: countMembers(), posts: countPosts() };
  }
  const notifications = db.prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read = 0').get(userId);
  const messages = db.prepare('SELECT COUNT(*) AS count FROM messages WHERE recipient_id = ? AND read = 0').get(userId);
  return {
    notifications: Number(notifications?.count || 0),
    messages: Number(messages?.count || 0),
    members: countMembers(),
    posts: countPosts()
  };
}

function countMembers() {
  return Number(db.prepare('SELECT COUNT(*) AS count FROM users').get().count || 0);
}

function countPosts() {
  return Number(db.prepare('SELECT COUNT(*) AS count FROM posts').get().count || 0);
}

function community(viewerId) {
  const suggestions = db.prepare(`
    SELECT u.*,
      (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followers
    FROM users u
    WHERE u.is_active = 1
      AND (? IS NULL OR u.id != ?)
      AND (? IS NULL OR NOT EXISTS (
        SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.following_id = u.id
      ))
    ORDER BY followers DESC, u.created_at ASC
    LIMIT 5
  `).all(viewerId, viewerId, viewerId, viewerId);

  const trending = db.prepare(`
    SELECT p.category AS category, COUNT(*) AS count
    FROM posts p
    GROUP BY p.category
    ORDER BY count DESC
  `).all();

  return {
    members: countMembers(),
    posts: countPosts(),
    suggestions: suggestions.map((row) => toPublicUser(row, viewerId)),
    trending: trending.map((row) => ({ category: row.category, count: Number(row.count) }))
  };
}

function sendMessage(senderId, username, body) {
  const sender = requireUser(senderId);
  const recipient = getUserRowByUsername(username);
  if (!recipient) throw new HttpError(404, 'Membre introuvable');
  if (recipient.id === sender.id) throw new HttpError(400, 'Vous ne pouvez pas vous écrire à vous-même');
  const text = clampText(body, 1000);
  if (!text) throw new HttpError(400, 'Le message ne peut pas être vide');

  const id = createId();
  const createdAt = nowIso();
  db.prepare(`
    INSERT INTO messages (id, sender_id, recipient_id, body, read, created_at)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run(id, sender.id, recipient.id, text, createdAt);
  createNotification({ userId: recipient.id, actorId: sender.id, type: 'message', createdAt });
  return getThread(sender.id, recipient.username);
}

function getConversations(userId) {
  const user = requireUser(userId);
  const rows = db.prepare(`
    SELECT * FROM messages
    WHERE sender_id = ? OR recipient_id = ?
    ORDER BY created_at DESC
    LIMIT 1000
  `).all(user.id, user.id);

  const grouped = new Map();
  for (const row of rows) {
    const otherId = row.sender_id === user.id ? row.recipient_id : row.sender_id;
    if (!grouped.has(otherId)) {
      grouped.set(otherId, { otherId, lastBody: row.body, lastAt: row.created_at, unread: 0 });
    }
    if (row.recipient_id === user.id && !row.read) {
      grouped.get(otherId).unread += 1;
    }
  }

  return [...grouped.values()].map((item) => ({
    user: toPublicUser(getUserRowById(item.otherId), user.id),
    lastBody: item.lastBody,
    lastAt: item.lastAt,
    unread: item.unread
  }));
}

function getThread(userId, username) {
  const user = requireUser(userId);
  const other = getUserRowByUsername(username);
  if (!other) throw new HttpError(404, 'Membre introuvable');

  db.prepare('UPDATE messages SET read = 1 WHERE recipient_id = ? AND sender_id = ? AND read = 0')
    .run(user.id, other.id);

  const rows = db.prepare(`
    SELECT * FROM messages
    WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
    ORDER BY created_at ASC
  `).all(user.id, other.id, other.id, user.id);

  return {
    user: toPublicUser(other, user.id),
    messages: rows.map((row) => ({
      id: row.id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      body: row.body,
      read: Boolean(row.read),
      createdAt: row.created_at,
      mine: row.sender_id === user.id
    }))
  };
}

function insertSeedUser(user) {
  db.prepare(`
    INSERT INTO users (id, username, email, password_hash, name, bio, avatar, country, role, is_active, created_at)
    VALUES (@id, @username, @email, @password_hash, @name, @bio, @avatar, @country, @role, 1, @created_at)
  `).run(user);
}

function ensureSeeded() {
  const existing = db.prepare('SELECT COUNT(*) AS count FROM users').get();
  if (Number(existing.count) > 0) return;

  const people = [
    {
      username: 'admin',
      email: 'admin@acv.africa',
      password: 'admin123',
      name: 'Équipe Nkwa',
      role: 'ADMIN',
      country: 'Afrique',
      bio: 'Le compte officiel de Nkwa. On garde la mémoire vivante, ensemble.'
    },
    {
      username: 'amina',
      email: 'demo@nkwa.africa',
      password: 'demo123',
      name: 'Amina Diallo',
      role: 'USER',
      country: 'Sénégal',
      bio: 'Je collecte des devinettes wolof et des histoires de famille à Saint-Louis.'
    },
    {
      username: 'aisha',
      email: 'aisha.diallo@nkwa.africa',
      password: 'nkwa2026',
      name: 'Aïsha Diallo',
      role: 'USER',
      country: 'Sénégal',
      bio: 'Journaliste culturelle. Les marchés, les griots et les proverbes du quotidien.'
    },
    {
      username: 'kofi',
      email: 'kofi.mensah@nkwa.africa',
      password: 'nkwa2026',
      name: 'Kofi Mensah',
      role: 'USER',
      country: 'Ghana',
      bio: 'Tisserand et conteur ashanti. Le kente se lit comme un livre.'
    },
    {
      username: 'ama',
      email: 'ama.kone@nkwa.africa',
      password: 'nkwa2026',
      name: 'Ama Koné',
      role: 'USER',
      country: 'Côte d\'Ivoire',
      bio: 'Je raconte Anansi comme ma grand-mère me le racontait à Bouaké.'
    },
    {
      username: 'chinedu',
      email: 'chinedu.okafor@nkwa.africa',
      password: 'nkwa2026',
      name: 'Chinedu Okafor',
      role: 'USER',
      country: 'Nigeria',
      bio: 'Enseignant à Enugu. Proverbes igbo, musique highlife et mémoire du village.'
    },
    {
      username: 'fatou',
      email: 'fatou.ba@nkwa.africa',
      password: 'nkwa2026',
      name: 'Fatou Ba',
      role: 'USER',
      country: 'Mali',
      bio: 'Musicienne. Le djembé et les chants de griots mandingues.'
    },
    {
      username: 'zola',
      email: 'zola.ndlovu@nkwa.africa',
      password: 'nkwa2026',
      name: 'Zola Ndlovu',
      role: 'USER',
      country: 'Afrique du Sud',
      bio: 'J\'archive les cassettes isicathamiya de ma grand-mère à Durban.'
    }
  ];

  const ids = {};
  people.forEach((person, index) => {
    const id = createId();
    ids[person.username] = id;
    insertSeedUser({
      id,
      username: person.username,
      email: person.email,
      password_hash: bcrypt.hashSync(person.password, 8),
      name: person.name,
      bio: person.bio,
      avatar: makeAvatar(person.name, index),
      country: person.country,
      role: person.role,
      created_at: hoursAgo(24 * 40 - index)
    });
  });

  const posts = [
    {
      author: 'admin',
      category: 'quotidien',
      origin: 'Nkwa',
      hours: 30,
      body: 'Bienvenue sur Nkwa. Ici on ne collectionne pas le patrimoine derrière une vitrine : on le discute, on le corrige, on le transmet. Présentez-vous, suivez un griot, envoyez un message.'
    },
    {
      author: 'ama',
      category: 'conte',
      origin: 'Ghana · Ashanti',
      hours: 26,
      imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=1200&q=80',
      body: 'Anansi voulait garder toute la sagesse du monde dans une calebasse. Il a grimpé à l\'arbre avec le pot devant lui, et c\'est son fils qui lui a dit de le porter dans le dos. Une fois en haut, Anansi a compris : la sagesse qui ne circule pas n\'est plus de la sagesse. Il a cassé la calebasse.\n\nChez vous, qui raconte encore Anansi ?'
    },
    {
      author: 'kofi',
      category: 'art',
      origin: 'Ghana · Ashanti',
      hours: 22,
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80',
      body: 'Un pagne kente ne se choisit pas seulement pour ses couleurs. Le jaune parle de royauté, le vert de renouveau, le noir des ancêtres. Ma mère disait : « si tu portes un motif, tu portes une phrase ». Aujourd\'hui je tisse un motif pour un mariage à Kumasi.'
    },
    {
      author: 'aisha',
      category: 'proverbe',
      origin: 'Sénégal · Wolof',
      hours: 18,
      body: 'Au marché ce matin, une vendeuse de poisson m\'a lancé : « Garab guy lem du damm » — l\'arbre qui plie ne casse pas.\n\nElle parlait du prix, moi j\'y ai entendu toute la semaine. La souplesse n\'est pas une faiblesse. Qui d\'autre a reçu un proverbe à la place d\'une réponse ?'
    },
    {
      author: 'chinedu',
      category: 'proverbe',
      origin: 'Nigeria · Igbo',
      hours: 16,
      body: '« Otu onye anaghi azu nwa. » Il faut tout un village pour élever un enfant.\n\nÀ Enugu, les voisins corrigent encore les enfants dans la rue, et les parents disent merci. Je me demande jusqu\'où cette phrase tient dans une grande ville. Dites-moi comment ça se passe chez vous.'
    },
    {
      author: 'fatou',
      category: 'musique',
      origin: 'Mali · Mandingue',
      hours: 12,
      imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
      body: 'Trois rythmes de djembé avant le chant : appel, réponse, puis le récit. Mon oncle griot ne commence jamais une généalogie sans ce triangle-là. Si vous avez un enregistrement de famille, même une cassette abîmée, écrivez-moi. On peut l\'écouter ensemble.'
    },
    {
      author: 'amina',
      category: 'devinette',
      origin: 'Sénégal · Wolof',
      hours: 8,
      body: 'Devinette de ma tante, à résoudre sans tricher : qu\'est-ce qui a des dents mais ne mord pas ?\n\nJe donne la réponse en commentaire ce soir. En attendant, posez les vôtres.'
    },
    {
      author: 'zola',
      category: 'musique',
      origin: 'Afrique du Sud · Zoulou',
      hours: 6,
      imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a5d4?auto=format&fit=crop&w=1200&q=80',
      body: 'J\'ai numérisé deux cassettes isicathamiya cette semaine. Les voix sont un peu voilées, les applaudissements du salon sont encore là. Ma grand-mère chantait avec quatre voisines chaque dimanche. Si quelqu\'un archive la même chose à Durban ou à Johannesburg, je veux comparer nos notes.'
    },
    {
      author: 'ama',
      category: 'conte',
      origin: 'Cameroun · Bamiléké',
      hours: 4,
      body: 'La tortue a défié l\'éléphant à la course et a placé ses sœurs le long du chemin. À chaque cri de l\'éléphant, une tortue répondait « je suis déjà devant ». L\'histoire ne dit pas que la force est inutile. Elle dit que celui qui court seul contre une communauté a déjà perdu.'
    },
    {
      author: 'fatou',
      category: 'quotidien',
      origin: 'Mali',
      hours: 2,
      body: 'Répétition ce soir à Bamako. On reprend un chant de griot sur les ancêtres, pas pour le spectacle : pour que les plus jeunes entendent les noms. Qui veut le texte en français et en bambara ? Je le posterai demain.'
    }
  ];

  const postIds = {};
  posts.forEach((post) => {
    const id = createId();
    postIds[post.author + post.hours] = id;
    db.prepare(`
      INSERT INTO posts (id, author_id, body, category, origin, image_url, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      ids[post.author],
      post.body,
      post.category,
      post.origin,
      post.imageUrl || null,
      hoursAgo(post.hours)
    );
  });

  const riddlePostId = postIds.amina8;
  const anansiPostId = postIds.ama26;
  const kentePostId = postIds.kofi22;
  const proverbPostId = postIds.aisha18;

  const follows = [
    ['amina', 'aisha'],
    ['amina', 'kofi'],
    ['amina', 'ama'],
    ['amina', 'fatou'],
    ['aisha', 'amina'],
    ['aisha', 'kofi'],
    ['kofi', 'ama'],
    ['kofi', 'fatou'],
    ['ama', 'kofi'],
    ['ama', 'aisha'],
    ['chinedu', 'amina'],
    ['chinedu', 'aisha'],
    ['fatou', 'zola'],
    ['fatou', 'kofi'],
    ['zola', 'fatou'],
    ['zola', 'amina'],
    ['admin', 'ama']
  ];

  follows.forEach(([follower, following]) => {
    db.prepare('INSERT INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)')
      .run(ids[follower], ids[following], hoursAgo(20));
  });

  const likes = [
    ['kofi', anansiPostId],
    ['aisha', anansiPostId],
    ['amina', anansiPostId],
    ['fatou', anansiPostId],
    ['ama', kentePostId],
    ['zola', kentePostId],
    ['chinedu', proverbPostId],
    ['kofi', proverbPostId],
    ['aisha', riddlePostId],
    ['ama', riddlePostId],
    ['fatou', riddlePostId]
  ];

  likes.forEach(([username, postId]) => {
    db.prepare('INSERT INTO likes (user_id, post_id, created_at) VALUES (?, ?, ?)').run(ids[username], postId, hoursAgo(3));
  });

  const comments = [
    [anansiPostId, 'kofi', 'Chez nous on ajoute que le fils d\'Anansi rit encore. La sagesse vient souvent d\'en bas.'],
    [anansiPostId, 'amina', 'Ma grand-mère le termine en disant que chaque personne en a ramassé un morceau. C\'est pour ça qu\'on doit se parler.'],
    [riddlePostId, 'aisha', 'Un peigne. Et j\'en ajoute une : plus on m\'enlève, plus je grandis. Qui suis-je ?'],
    [riddlePostId, 'ama', 'Pour la tienne Aïsha : un trou. Et la réponse de la tante d\'Amina, je la garde pour ce soir.'],
    [proverbPostId, 'chinedu', 'Au Nigeria on dit aussi que le bâton qui reste dans l\'eau n\'est pas un crocodile. Il faut regarder avant de plier.'],
    [kentePostId, 'zola', 'Les couleurs ont la même fonction que nos chants : elles disent qui entre dans la pièce.']
  ];

  comments.forEach(([postId, username, body]) => {
    db.prepare('INSERT INTO comments (id, post_id, author_id, body, created_at) VALUES (?, ?, ?, ?, ?)')
      .run(createId(), postId, ids[username], body, hoursAgo(2));
  });

  db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, post_id, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
    .run(createId(), ids.amina, ids.aisha, 'comment', riddlePostId, hoursAgo(2));
  db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, post_id, read, created_at) VALUES (?, ?, ?, ?, ?, 0, ?)')
    .run(createId(), ids.amina, ids.ama, 'like', riddlePostId, hoursAgo(3));
  db.prepare('INSERT INTO notifications (id, user_id, actor_id, type, post_id, read, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)')
    .run(createId(), ids.amina, ids.zola, 'follow', null, hoursAgo(10));

  const messages = [
    ['aisha', 'amina', 'Amina, tu as la version wolof complète de la devinette du peigne ? Je prépare un papier sur les devinettes de marché.'],
    ['amina', 'aisha', 'Oui. Ma tante dit : « Lan la am bëñ waaye du màtt ? » Réponse : « Peigne ». Je t\'envoie aussi deux variantes de Saint-Louis.'],
    ['fatou', 'zola', 'Tes cassettes m\'intéressent. J\'ai un chant mandingue enregistré sur le même type de bande. On se fait une écoute ?'],
    ['zola', 'fatou', 'Avec plaisir. Je poste un extrait cette semaine, et on compare les silences autant que les voix.']
  ];

  messages.forEach(([from, to, body], index) => {
    db.prepare('INSERT INTO messages (id, sender_id, recipient_id, body, read, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(createId(), ids[from], ids[to], body, index < 2 ? 1 : 0, hoursAgo(5 - index));
  });
}

function ensureReels() {
  const reels = [
    {
      id: 'reel-sabar',
      author: 'fatou',
      category: 'musique',
      origin: 'Sénégal',
      hours: 0.3,
      videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5c/Senegalese_Dance.webm',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Senegalese_Dance.webm/960px--Senegalese_Dance.webm.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Senegalese_Dance.webm',
      sourceTitle: 'Danse sénégalaise · Wikimedia Commons',
      body: 'Danse sénégalaise : sabar, épaules et pieds qui répondent au tambour. Ouvre le reel pour la regarder ici.'
    },
    {
      id: 'reel-kumpo',
      author: 'amina',
      category: 'conte',
      origin: 'Sénégal · Casamance',
      hours: 0.5,
      videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Dans_van_de_Kumpo_in_Bagaya.webm',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Dans_van_de_Kumpo_in_Bagaya.webm/250px--Dans_van_de_Kumpo_in_Bagaya.webm.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dans_van_de_Kumpo_in_Bagaya.webm',
      sourceTitle: 'Danse du Kumpo à Bagaya · Wikimedia Commons',
      body: 'Le Kumpo sort à Bagaya. Le masque danse, le village répond. Le film s\'ouvre dans l\'application.'
    },
    {
      id: 'reel-femmes-bagaya',
      author: 'aisha',
      category: 'art',
      origin: 'Sénégal · Diola',
      hours: 0.7,
      videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d1/Dans_van_de_vrouwen_in_Bagaya.webm',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Dans_van_de_vrouwen_in_Bagaya.webm/250px--Dans_van_de_vrouwen_in_Bagaya.webm.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Dans_van_de_vrouwen_in_Bagaya.webm',
      sourceTitle: 'Danse des femmes de Bagaya · Wikimedia Commons',
      body: 'Danse des femmes à Bagaya. Les pas racontent autant que les chants. Lecture dans Nkwa, pas dans un autre onglet.'
    },
    {
      id: 'reel-laamb',
      author: 'kofi',
      category: 'art',
      origin: 'Sénégal · Laamb',
      hours: 0.9,
      videoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Laamb_Fever.webm',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Laamb_Fever.webm/960px--Laamb_Fever.webm.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Laamb_Fever.webm',
      sourceTitle: 'Laamb · Wikimedia Commons',
      body: 'Laamb, la lutte sénégalaise : le sable, l\'entrée, la clameur. Appuie pour ouvrir la vidéo ici.'
    },
    {
      id: 'reel-accralate',
      author: 'ama',
      category: 'musique',
      origin: 'Ghana · Accra',
      hours: 1.1,
      audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Accralate_%28ISRC_USUAN1100341%29.mp3',
      posterUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Madou_Jemb%C3%A9%2C_musicien_de_rue.jpg/960px-Madou_Jemb%C3%A9%2C_musicien_de_rue.jpg',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Accralate_(ISRC_USUAN1100341).mp3',
      sourceTitle: 'Accralate · Wikimedia Commons',
      body: 'Accralate, un air d\'Accra. Le chant se lit comme un reel : ouvre-le pour l\'écouter sans quitter la page.'
    }
  ];

  const findUser = db.prepare('SELECT id FROM users WHERE username = ?');
  const findReel = db.prepare('SELECT id FROM posts WHERE id = ? OR source_url = ?');
  const insert = db.prepare(`
    INSERT INTO posts (
      id, author_id, body, category, origin, image_url, video_url, audio_url, poster_url,
      source_url, source_title, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  reels.forEach((reel) => {
    const author = findUser.get(reel.author);
    if (!author || findReel.get(reel.id, reel.sourceUrl)) return;
    insert.run(
      reel.id,
      author.id,
      reel.body,
      reel.category,
      reel.origin,
      reel.posterUrl,
      reel.videoUrl || null,
      reel.audioUrl || null,
      reel.posterUrl,
      reel.sourceUrl,
      reel.sourceTitle,
      hoursAgo(reel.hours)
    );
  });
}

function ensureCulturalPost(post) {
  const author = db.prepare('SELECT id FROM users WHERE username = ?').get(post.author);
  if (!author) return null;
  const existing = db.prepare('SELECT id FROM posts WHERE id = ?').get(post.id);
  if (existing) {
    db.prepare(`
      UPDATE posts
      SET body = ?, category = ?, origin = ?, source_url = ?, source_title = ?, author_id = ?
      WHERE id = ?
    `).run(
      post.body,
      post.category,
      post.origin,
      post.sourceUrl || null,
      post.sourceTitle || null,
      author.id,
      post.id
    );
    return existing.id;
  }
  if (post.sourceUrl) {
    const bySource = db.prepare('SELECT id FROM posts WHERE source_url = ?').get(post.sourceUrl);
    if (bySource) return bySource.id;
  }
  db.prepare(`
    INSERT INTO posts (
      id, author_id, body, category, origin, image_url, video_url, audio_url, poster_url,
      source_url, source_title, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    post.id,
    author.id,
    post.body,
    post.category,
    post.origin,
    null,
    null,
    null,
    null,
    post.sourceUrl || null,
    post.sourceTitle || null,
    hoursAgo(post.hours)
  );
  return post.id;
}

function ensureWisdomGames() {
  const games = [
    {
      id: 'game-wolof-peigne',
      key: 'wolof-peigne',
      kind: 'riddle',
      prompt: 'Lan la am bëñ, waaye du màtt ?',
      answer: 'Un peigne|peigne',
      hint: 'On le passe dans les cheveux, le matin.',
      explanation: 'Dans les devinettes wolof, les dents qui ne mordent pas désignent le peigne. La formule se dit souvent au marché comme à la maison.',
      choices: ['Un peigne', 'Un crocodile', 'Le mil', 'La lune'],
      post: {
        id: 'wisdom-wolof-peigne',
        author: 'amina',
        category: 'devinette',
        origin: 'Sénégal · Wolof',
        hours: 1.25,
        body: 'Devinette wolof à jouer dans le fil. Lis l\'énigme, choisis une réponse, demande l\'indice, ou révèle l\'explication. La solution reste cachée tant que tu n\'as pas trouvé.'
      }
    },
    {
      id: 'game-akan-table',
      key: 'akan-table',
      kind: 'riddle',
      prompt: 'Mewɔ nan nnan, nanso mintumi nnante. J\'ai quatre jambes, et pourtant je ne marche pas.',
      answer: 'Une table|table',
      hint: 'Elle reste à la maison et porte ce qu\'on pose dessus.',
      explanation: 'Devinette akan courante : les jambes ne suffisent pas à faire un marcheur. La réponse attendue est la table.',
      choices: ['Une table', 'Un cheval', 'Anansi', 'Le pagne'],
      post: {
        id: 'wisdom-akan-table',
        author: 'kofi',
        category: 'devinette',
        origin: 'Ghana · Akan',
        hours: 1.4,
        body: 'Une devinette akan que ma mère posait avant le repas. Joue-la ici : quatre appuis, aucun pas.'
      }
    },
    {
      id: 'game-bambara-tambour',
      key: 'bambara-tambour',
      kind: 'riddle',
      prompt: 'Mun ye min ye, a bɛ kuma nka a tɛ tulo ye ? Qu\'est-ce qui parle sans avoir d\'oreilles ?',
      answer: 'Le djembé|djembe|djembé|tambour',
      hint: 'On le frappe pour appeler la danse.',
      explanation: 'Dans les devinettes mandingues, le tambour parle : il appelle, répond et raconte, sans oreilles pour entendre.',
      choices: ['Le djembé', 'Le vent', 'Le baobab', 'La calebasse'],
      post: {
        id: 'wisdom-bambara-tambour',
        author: 'fatou',
        category: 'devinette',
        origin: 'Mali · Bambara',
        hours: 1.55,
        body: 'Devinette bambara de la cour des griots. La réponse ne s\'écrit pas sous l\'énigme : il faut la proposer.'
      }
    },
    {
      id: 'game-wolof-souplesse',
      key: 'wolof-souplesse',
      kind: 'proverb',
      prompt: 'Garab guy lem du damm. Quel sens choisis-tu ?',
      answer: 'Qui sait plier ne se brise pas',
      hint: 'On le dit à quelqu\'un qui refuse de céder un peu.',
      explanation: 'Proverbe wolof : la souplesse évite la rupture. Il circule au marché autant que dans les conseils de famille.',
      choices: [
        'Qui sait plier ne se brise pas',
        'L\'arbre trop droit tombe toujours le premier jour',
        'Le vent ne casse que les jeunes pousses',
        'Il faut couper avant la saison des pluies'
      ],
      post: {
        id: 'wisdom-wolof-souplesse',
        author: 'aisha',
        category: 'proverbe',
        origin: 'Sénégal · Wolof',
        hours: 1.7,
        body: 'Un proverbe wolof entendu au marché, à jouer plutôt qu\'à seulement lire. Choisis le sens, puis ouvre l\'explication.'
      }
    },
    {
      id: 'game-akan-enseigner',
      key: 'akan-enseigner',
      kind: 'proverb',
      prompt: 'Obi nnim a, obi kyere. Quel conseil ce proverbe donne-t-il ?',
      answer: 'Si l\'un ignore, un autre enseigne',
      hint: 'Deux personnes, un savoir qui doit circuler.',
      explanation: 'Proverbe akan : personne n\'est tenu de tout savoir si la communauté peut enseigner. La sagesse se passe de main en main.',
      choices: [
        'Si l\'un ignore, un autre enseigne',
        'Chacun garde son secret',
        'Le silence vaut mieux que la parole',
        'Le chef décide seul'
      ],
      post: {
        id: 'wisdom-akan-enseigner',
        author: 'kofi',
        category: 'proverbe',
        origin: 'Ghana · Akan',
        hours: 1.85,
        body: 'Proverbe akan à résoudre ensemble. Le texte est public, le sens juste se gagne en jouant.'
      }
    },
    {
      id: 'game-yoruba-caractere',
      key: 'yoruba-caractere',
      kind: 'proverb',
      prompt: 'Ìwà l\'ẹwà. Que place ce proverbe au-dessus du reste ?',
      answer: 'Le caractère|caractère|caractere',
      hint: 'Ce n\'est ni l\'or ni l\'apparence.',
      explanation: '« Ìwà l\'ẹwà » se traduit souvent par « le caractère est la beauté ». Le proverbe yoruba juge une personne à sa conduite.',
      choices: ['Le caractère', 'L\'or', 'La vitesse', 'Le pagne'],
      post: {
        id: 'wisdom-yoruba-caractere',
        author: 'chinedu',
        category: 'proverbe',
        origin: 'Nigeria · Yoruba',
        hours: 2.05,
        body: 'Proverbe yoruba que je donne à mes élèves avant de corriger un devoir. Joue-le : une seule des quatre réponses tient.'
      }
    }
  ];

  const findGame = db.prepare('SELECT id FROM wisdom_games WHERE id = ? OR game_key = ? OR post_id = ?');
  const insertGame = db.prepare(`
    INSERT INTO wisdom_games (
      id, post_id, game_key, kind, prompt, answer, hint, explanation, choices, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const updateGame = db.prepare(`
    UPDATE wisdom_games
    SET post_id = ?, game_key = ?, kind = ?, prompt = ?, answer = ?, hint = ?, explanation = ?, choices = ?
    WHERE id = ?
  `);

  games.forEach((game) => {
    const postId = ensureCulturalPost(game.post);
    if (!postId) return;
    const choices = JSON.stringify(game.choices);
    const existing = findGame.get(game.id, game.key, postId);
    if (existing) {
      updateGame.run(
        postId,
        game.key,
        game.kind,
        game.prompt,
        game.answer,
        game.hint,
        game.explanation,
        choices,
        existing.id
      );
      return;
    }
    insertGame.run(
      game.id,
      postId,
      game.key,
      game.kind,
      game.prompt,
      game.answer,
      game.hint,
      game.explanation,
      choices,
      hoursAgo(game.post.hours)
    );
  });
}

function ensureHeritageArticles() {
  const articles = [
    {
      id: 'article-kankurang',
      author: 'amina',
      category: 'conte',
      origin: 'Sénégal et Gambie · Mandingue',
      hours: 2.4,
      sourceUrl: 'https://ich.unesco.org/en/RL/kankurang-manding-initiatory-rite-00143',
      sourceTitle: 'UNESCO · Rite initiatique du Kankurang',
      body: 'Le Kankurang, rite des fibres et de la parole\n\nEn Casamance et en Gambie, le Kankurang accompagne l\'initiation mandingue. Le masque de feuilles et d\'écorces sort avec les circoncis, rappelle l\'ordre du village et écarte ce qui menace la transmission. Danse, fouet et chant font partie du même récit. L\'UNESCO inscrit ce rite au patrimoine culturel immatériel.'
    },
    {
      id: 'article-ifa',
      author: 'chinedu',
      category: 'conte',
      origin: 'Nigeria · Yoruba',
      hours: 2.6,
      sourceUrl: 'https://ich.unesco.org/en/RL/ifa-divination-system-00146',
      sourceTitle: 'UNESCO · Système divinatoire Ifa',
      body: 'Ifa, une bibliothèque dite à voix haute\n\nIfa est un système de divination yoruba porté par les babalawo. Les signes, les odu, organisent un vaste corpus de poèmes qui conseillent, soignent et racontent l\'origine des choses. On n\'y cherche pas une réponse unique : on relie une personne à une mémoire commune. Le système est reconnu par l\'UNESCO.'
    },
    {
      id: 'article-gelede',
      author: 'aisha',
      category: 'art',
      origin: 'Bénin, Nigeria, Togo · Yoruba',
      hours: 2.8,
      sourceUrl: 'https://ich.unesco.org/en/RL/oral-heritage-of-gelede-00002',
      sourceTitle: 'UNESCO · Patrimoine oral du Gèlèdè',
      body: 'Gèlèdè, masques pour les mères\n\nLe Gèlèdè honore les mères et la puissance féminine chez les Yoruba du Bénin, du Nigeria et du Togo. Masques, chants et danses rappellent que la communauté tient par celles qui donnent la vie et gardent l\'équilibre. C\'est un patrimoine oral autant que visuel, inscrit par l\'UNESCO.'
    },
    {
      id: 'article-sosso-bala',
      author: 'fatou',
      category: 'musique',
      origin: 'Guinée · Mandingue',
      hours: 3.05,
      sourceUrl: 'https://ich.unesco.org/en/RL/the-cultural-space-of-the-sosso-bala-00009',
      sourceTitle: 'UNESCO · L\'espace culturel du sosso-bala',
      body: 'Le sosso-bala, archive de bois et de son\n\nLe sosso-bala est un balafon sacré lié à Soundiata Keïta et à l\'histoire du Mali. L\'instrument, le répertoire et la charge de le jouer se transmettent dans une famille de griots en Guinée. Ce n\'est pas un simple concert : c\'est une archive sonore. L\'UNESCO en protège l\'espace culturel.'
    },
    {
      id: 'article-manden',
      author: 'kofi',
      category: 'proverbe',
      origin: 'Mali · Mandingue',
      hours: 3.25,
      sourceUrl: 'https://ich.unesco.org/en/RL/manden-charter-proclaimed-in-kurukan-fuga-00290',
      sourceTitle: 'UNESCO · Charte du Manden, proclamée à Kurukan Fuga',
      body: 'La charte du Manden, dite avant d\'être écrite\n\nLa charte du Manden, proclamée à Kurukan Fuga, énonce des devoirs : respect de la vie, place des femmes, entraide, rôle des griots. Elle circule encore par la parole plus que par un seul manuscrit. On peut la lire comme un socle de proverbes politiques. L\'UNESCO la reconnaît comme patrimoine immatériel.'
    },
    {
      id: 'article-aka',
      author: 'zola',
      category: 'musique',
      origin: 'Centrafrique · Aka',
      hours: 3.45,
      sourceUrl: 'https://ich.unesco.org/en/RL/polyphonic-singing-of-the-aka-pygmies-of-central-africa-00082',
      sourceTitle: 'UNESCO · Chant polyphonique des pygmées Aka',
      body: 'Les voix aka, qui entrent l\'une après l\'autre\n\nLes Aka de Centrafrique pratiquent un chant polyphonique où chaque voix entre, se décale et répond. La musique accompagne la chasse, les rituels et le quotidien. Personne ne porte la mélodie seul. L\'UNESCO inscrit ce chant au patrimoine oral de l\'humanité.'
    }
  ];

  articles.forEach((article) => ensureCulturalPost(article));
}

ensureSeeded();
ensureReels();
ensureWisdomGames();
ensureHeritageArticles();

module.exports = {
  CATEGORIES,
  HttpError,
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  createPost,
  deletePost,
  getPostById,
  listPosts,
  listReels,
  getGameByPostId,
  submitWisdomAttempt,
  wisdomScore,
  setLike,
  addComment,
  deleteComment,
  listComments,
  setFollow,
  setBookmark,
  searchUsers,
  listRelations,
  listNotifications,
  markNotificationsRead,
  inboxSummary,
  community,
  sendMessage,
  getConversations,
  getThread,
  getUserRowByUsername,
  toPublicUser
};
