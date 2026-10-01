const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

function resolveDbPath() {
  if (process.env.SOCIAL_DB_PATH) {
    return process.env.SOCIAL_DB_PATH;
  }
  if (process.env.NODE_ENV === 'test') {
    return ':memory:';
  }
  if (process.env.VERCEL) {
    return '/tmp/nkwa-social.db';
  }
  return path.join(__dirname, '../../data/nkwa-social.db');
}

function resolveUploadDir() {
  const configured = process.env.SOCIAL_UPLOAD_DIR;
  const dir = configured
    || (process.env.VERCEL
      ? '/tmp/nkwa-uploads'
      : path.join(__dirname, '../../data/uploads'));
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function openDatabase() {
  const dbPath = resolveDbPath();
  if (dbPath !== ':memory:') {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }

  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON');
  try {
    db.exec('PRAGMA journal_mode = WAL');
  } catch (_) {
    // Le mode mémoire des tests ne passe pas toujours en WAL.
  }
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      bio TEXT NOT NULL DEFAULT '',
      avatar TEXT,
      country TEXT NOT NULL DEFAULT '',
      role TEXT NOT NULL DEFAULT 'USER',
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'quotidien',
      origin TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS likes (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS follows (
      follower_id TEXT NOT NULL,
      following_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (follower_id, following_id),
      FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bookmarks (
      user_id TEXT NOT NULL,
      post_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, post_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      type TEXT NOT NULL,
      post_id TEXT,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      sender_id TEXT NOT NULL,
      recipient_id TEXT NOT NULL,
      body TEXT NOT NULL,
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id, created_at ASC);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_messages_pair ON messages(sender_id, recipient_id, created_at);

    CREATE TABLE IF NOT EXISTS wisdom_games (
      id TEXT PRIMARY KEY,
      post_id TEXT NOT NULL UNIQUE,
      game_key TEXT NOT NULL UNIQUE,
      kind TEXT NOT NULL,
      prompt TEXT NOT NULL,
      answer TEXT NOT NULL,
      hint TEXT,
      explanation TEXT,
      choices TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wisdom_attempts (
      user_id TEXT NOT NULL,
      game_id TEXT NOT NULL,
      correct INTEGER NOT NULL DEFAULT 0,
      revealed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      PRIMARY KEY (user_id, game_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (game_id) REFERENCES wisdom_games(id) ON DELETE CASCADE
    );
  `);

  const postColumns = db.prepare('PRAGMA table_info(posts)').all().map((column) => column.name);
  if (!postColumns.includes('source_url')) {
    db.exec('ALTER TABLE posts ADD COLUMN source_url TEXT');
  }
  if (!postColumns.includes('source_title')) {
    db.exec('ALTER TABLE posts ADD COLUMN source_title TEXT');
  }
  if (!postColumns.includes('video_url')) {
    db.exec('ALTER TABLE posts ADD COLUMN video_url TEXT');
  }
  if (!postColumns.includes('audio_url')) {
    db.exec('ALTER TABLE posts ADD COLUMN audio_url TEXT');
  }
  if (!postColumns.includes('poster_url')) {
    db.exec('ALTER TABLE posts ADD COLUMN poster_url TEXT');
  }
  if (!postColumns.includes('language')) {
    db.exec('ALTER TABLE posts ADD COLUMN language TEXT');
  }
  if (!postColumns.includes('translations')) {
    db.exec('ALTER TABLE posts ADD COLUMN translations TEXT');
  }
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_posts_source_url ON posts(source_url) WHERE source_url IS NOT NULL');

  const gameColumns = db.prepare('PRAGMA table_info(wisdom_games)').all().map((column) => column.name);
  if (!gameColumns.includes('language')) {
    db.exec('ALTER TABLE wisdom_games ADD COLUMN language TEXT');
  }
  if (!gameColumns.includes('translations')) {
    db.exec('ALTER TABLE wisdom_games ADD COLUMN translations TEXT');
  }

  return db;
}

const db = openDatabase();

module.exports = {
  db,
  resolveUploadDir
};
