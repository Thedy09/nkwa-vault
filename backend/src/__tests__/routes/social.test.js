process.env.NODE_ENV = 'test';
process.env.REDIS_ENABLED = 'false';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SOCIAL_DB_PATH = ':memory:';

const request = require('supertest');
const app = require('../../server');

describe('Réseau social', () => {
  let token;
  let createdPostId;

  test('ouvre une communauté déjà peuplée', async () => {
    const health = await request(app).get('/api/social/health');
    expect(health.status).toBe(200);
    expect(health.body.data.members).toBeGreaterThan(1);
    expect(health.body.data.posts).toBeGreaterThan(1);

    const feed = await request(app).get('/api/social/feed');
    expect(feed.status).toBe(200);
    expect(feed.body.data.posts.length).toBeGreaterThan(0);
    expect(feed.body.data.posts[0].author.username).toBeTruthy();
  });

  test('connecte un membre, publie, aime, commente, suit et écrit', async () => {
    const login = await request(app)
      .post('/api/social/auth/login')
      .send({ email: 'demo@nkwa.africa', password: 'demo123' });

    expect(login.status).toBe(200);
    expect(login.body.data.user.username).toBe('amina');
    token = login.body.data.token;

    const created = await request(app)
      .post('/api/social/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        body: 'Nouvelle devinette de Saint-Louis : je cours sans jambes. Qui suis-je ?',
        category: 'devinette',
        origin: 'Sénégal'
      });

    expect(created.status).toBe(201);
    createdPostId = created.body.data.post.id;

    const liked = await request(app)
      .post(`/api/social/posts/${createdPostId}/like`)
      .set('Authorization', `Bearer ${token}`);
    expect(liked.body.data.post.liked).toBe(true);
    expect(liked.body.data.post.likeCount).toBe(1);

    const comment = await request(app)
      .post(`/api/social/posts/${createdPostId}/comments`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'La réponse : la rivière.' });
    expect(comment.status).toBe(201);
    expect(comment.body.data.comments).toHaveLength(1);

    const follow = await request(app)
      .post('/api/social/users/zola/follow')
      .set('Authorization', `Bearer ${token}`);
    expect(follow.status).toBe(200);
    expect(follow.body.data.user.followedByMe).toBe(true);

    const message = await request(app)
      .post('/api/social/messages/zola')
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Je veux entendre l\'extrait de cassette.' });
    expect(message.status).toBe(201);
    expect(message.body.data.messages.at(-1).body).toContain('cassette');

    const me = await request(app)
      .get('/api/social/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe('demo@nkwa.africa');

    const profile = await request(app)
      .put('/api/social/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ bio: 'Collecteuse de devinettes à Saint-Louis.' });
    expect(profile.body.data.user.bio).toContain('Saint-Louis');
  });

  test('inscrit un nouveau membre et refuse un doublon', async () => {
    const email = `nouveau.${Date.now()}@nkwa.africa`;
    const registered = await request(app)
      .post('/api/social/auth/register')
      .send({ name: 'Nouveau Membre', email, password: 'secret123' });

    expect(registered.status).toBe(201);
    expect(registered.body.data.user.username).toBeTruthy();
    expect(registered.body.data.token).toBeTruthy();

    const duplicate = await request(app)
      .post('/api/social/auth/register')
      .send({ name: 'Nouveau Membre', email, password: 'secret123' });
    expect(duplicate.status).toBe(409);
  });

  test('sert les chants et les vidéos comme des reels', async () => {
    const reels = await request(app).get('/api/social/reels');
    expect(reels.status).toBe(200);
    const posts = reels.body.data.posts;
    expect(posts.some((post) => post.videoUrl && post.videoUrl.endsWith('.webm'))).toBe(true);
    expect(posts.some((post) => post.audioUrl && post.audioUrl.endsWith('.mp3'))).toBe(true);
    expect(posts.find((post) => post.id === 'reel-sabar').posterUrl).toBeTruthy();
  });

  test('refuse une publication sans session', async () => {
    const response = await request(app)
      .post('/api/social/posts')
      .send({ body: 'Anonyme' });
    expect(response.status).toBe(401);
  });
});
