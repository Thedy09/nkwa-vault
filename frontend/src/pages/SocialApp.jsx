import React, { useCallback, useEffect, useState } from 'react';
import {
  Bookmark,
  Compass,
  Home,
  Bell,
  Mail,
  UserRound,
  Library
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Composer from '../components/social/Composer';
import PostCard from '../components/social/PostCard';
import ReelViewer from '../components/social/ReelViewer';
import Museum from './Museum';
import {
  categoryLabel,
  errorMessage,
  followUser,
  getBookmarks,
  getCommunity,
  getConversations,
  getFeed,
  getReels,
  getInbox,
  getNotifications,
  getProfile,
  getRelations,
  getThread,
  markNotificationsRead,
  mediaUrl,
  sendMessage,
  timeAgo,
  unfollowUser,
  updateProfile,
  explore
} from '../social/api';
import { collectReels } from '../social/reels';
import '../social/social.css';

const NAV = [
  { id: 'feed', label: 'Fil', icon: Home },
  { id: 'explore', label: 'Explorer', icon: Compass },
  { id: 'archives', label: 'Archives', icon: Library },
  { id: 'notifications', label: 'Alertes', icon: Bell },
  { id: 'messages', label: 'Messages', icon: Mail },
  { id: 'saved', label: 'Enregistrés', icon: Bookmark },
  { id: 'profile', label: 'Profil', icon: UserRound }
];

function PeopleList({ users, onOpenProfile }) {
  if (!users?.length) return <p className="muted">Aucun membre.</p>;
  return users.map((person) => (
    <button className="suggestion" key={person.id} type="button" onClick={() => onOpenProfile(person.username)}>
      <span className="person">
        <img className="avatar" src={mediaUrl(person.avatar)} alt="" />
        <span>
          <strong>{person.name}</strong>
          <div className="muted">@{person.username} · {person.stats.followers} abonnés</div>
        </span>
      </span>
    </button>
  ));
}

export default function SocialApp({ onRequireAuth }) {
  const { user, isAuthenticated, updateUser } = useAuth();
  const [view, setView] = useState('feed');
  const [profileName, setProfileName] = useState(null);
  const [messageWith, setMessageWith] = useState(null);
  const [inbox, setInbox] = useState({ notifications: 0, messages: 0, members: 0, posts: 0 });
  const [community, setCommunity] = useState({ suggestions: [], trending: [], members: 0, posts: 0 });
  const [reel, setReel] = useState(null);

  const refreshInbox = useCallback(async () => {
    if (!user) return;
    try {
      setInbox(await getInbox());
    } catch (_) {
      /* le fil reste utilisable sans le compteur */
    }
  }, [user]);

  const refreshCommunity = useCallback(async () => {
    try {
      setCommunity(await getCommunity());
    } catch (_) {
      setCommunity({ suggestions: [], trending: [], members: 0, posts: 0 });
    }
  }, []);

  useEffect(() => {
    refreshCommunity();
    refreshInbox();
    const timer = setInterval(refreshInbox, 30000);
    return () => clearInterval(timer);
  }, [refreshCommunity, refreshInbox]);

  const openProfile = (username) => {
    setProfileName(username || user?.username || null);
    setView('profile');
  };

  const openMessages = (username) => {
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    setMessageWith(username || null);
    setView('messages');
  };

  const openReel = (post, collection) => {
    const next = collectReels(post, collection);
    if (next.items.length) setReel(next);
  };

  const go = (id) => {
    if ((id === 'notifications' || id === 'messages' || id === 'saved' || id === 'profile') && !isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    if (id === 'profile') setProfileName(user?.username || null);
    setView(id);
  };

  return (
    <div className="social-shell">
      <aside className="social-side">
        {NAV.map((item) => {
          const Icon = item.icon;
          const count = item.id === 'notifications' ? inbox.notifications : item.id === 'messages' ? inbox.messages : 0;
          return (
            <button key={item.id} className={`side-link ${view === item.id ? 'active' : ''}`} type="button" onClick={() => go(item.id)}>
              <Icon size={18} />
              {item.label}
              {count > 0 ? <span className="badge">{count}</span> : null}
            </button>
          );
        })}
      </aside>

      <section className="social-stream">
        {view === 'feed' && (
          <Feed
            onOpenProfile={openProfile}
            onOpenReel={openReel}
            onRequireAuth={onRequireAuth}
            community={community}
            onFollowed={refreshCommunity}
          />
        )}
        {view === 'explore' && <Explore onOpenProfile={openProfile} onOpenReel={openReel} onRequireAuth={onRequireAuth} />}
        {view === 'archives' && <Museum />}
        {view === 'notifications' && <Notifications onOpenProfile={openProfile} onRead={refreshInbox} />}
        {view === 'messages' && (
          <Messages
            initialUsername={messageWith}
            onOpenProfile={openProfile}
            onChange={refreshInbox}
          />
        )}
        {view === 'saved' && <Saved onOpenProfile={openProfile} onOpenReel={openReel} onRequireAuth={onRequireAuth} />}
        {view === 'profile' && (
          <Profile
            username={profileName || user?.username}
            onOpenProfile={openProfile}
            onOpenReel={openReel}
            onMessage={openMessages}
            onRequireAuth={onRequireAuth}
            onUpdated={updateUser}
          />
        )}
      </section>

      <aside className="social-rail">
        <Rail community={community} onOpenProfile={openProfile} onFollowed={refreshCommunity} onRequireAuth={onRequireAuth} />
      </aside>

      <nav className="social-tabs">
        {NAV.filter((item) => ['feed', 'explore', 'notifications', 'messages', 'profile'].includes(item.id)).map((item) => {
          const Icon = item.icon;
          const count = item.id === 'notifications' ? inbox.notifications : item.id === 'messages' ? inbox.messages : 0;
          return (
            <button key={item.id} className={`tab-link ${view === item.id ? 'active' : ''}`} type="button" onClick={() => go(item.id)}>
              <Icon size={18} />
              {item.label}
              {count > 0 ? <span className="badge">{count}</span> : null}
            </button>
          );
        })}
      </nav>
      {reel ? (
        <ReelViewer
          items={reel.items}
          index={reel.index}
          onClose={() => setReel(null)}
          onChangeIndex={(index) => setReel((current) => ({ ...current, index }))}
          onOpenAuthor={(username) => {
            setReel(null);
            openProfile(username);
          }}
        />
      ) : null}
    </div>
  );
}

function Rail({ community, onOpenProfile, onFollowed, onRequireAuth }) {
  const { isAuthenticated } = useAuth();
  const follow = async (username) => {
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    await followUser(username);
    onFollowed?.();
  };

  return (
    <>
      <div className="rail-block">
        <h3>{community.members || 0} membres · {community.posts || 0} publications</h3>
        <p className="muted">Un fil pour transmettre contes, proverbes, chants et nouvelles du quotidien.</p>
      </div>
      <div className="rail-block">
        <h3>À suivre</h3>
        {(community.suggestions || []).map((person) => (
          <div className="suggestion" key={person.id}>
            <button className="person-btn person" type="button" onClick={() => onOpenProfile(person.username)}>
              <img className="avatar" src={mediaUrl(person.avatar)} alt="" />
              <span>
                <strong>{person.name}</strong>
                <div className="muted">@{person.username}</div>
              </span>
            </button>
            <button className="primary-btn" type="button" onClick={() => follow(person.username)}>Suivre</button>
          </div>
        ))}
      </div>
      <div className="rail-block">
        <h3>En circulation</h3>
        <div className="chip-row">
          {(community.trending || []).map((item) => (
            <span className="chip" key={item.category}>{categoryLabel(item.category)} · {item.count}</span>
          ))}
        </div>
      </div>
    </>
  );
}

function Feed({ onOpenProfile, onRequireAuth, onOpenReel, community, onFollowed }) {
  const { isAuthenticated } = useAuth();
  const [mode, setMode] = useState(isAuthenticated() ? 'following' : 'discover');
  const [posts, setPosts] = useState([]);
  const [reels, setReels] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (nextOffset, replace) => {
    setLoading(true);
    setError('');
    try {
      const data = await getFeed({ mode, offset: nextOffset });
      setPosts((current) => replace ? data.posts : [...current, ...data.posts]);
      setOffset(nextOffset);
    } catch (err) {
      setError(errorMessage(err, 'Le fil est indisponible'));
    } finally {
      setLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    load(0, true);
  }, [load]);

  useEffect(() => {
    getReels().then((data) => setReels(data.posts || [])).catch(() => setReels([]));
  }, [posts.length]);

  const patch = (next) => setPosts((current) => current.map((item) => item.id === next.id ? next : item));

  const openMedia = (post) => {
    const pool = [...reels];
    posts.forEach((item) => {
      if (!pool.some((entry) => entry.id === item.id)) pool.push(item);
    });
    onOpenReel(post, pool);
  };

  return (
    <>
      <div className="chip-row">
        <button className={`chip ${mode === 'discover' ? 'active' : ''}`} type="button" onClick={() => setMode('discover')}>Pour vous</button>
        <button className={`chip ${mode === 'following' ? 'active' : ''}`} type="button" onClick={() => {
          if (!isAuthenticated()) {
            onRequireAuth?.();
            return;
          }
          setMode('following');
        }}>Abonnements</button>
      </div>
      <div className="mobile-only">
        <Rail community={community} onOpenProfile={onOpenProfile} onFollowed={onFollowed} onRequireAuth={onRequireAuth} />
      </div>
      {reels.length > 0 ? (
        <div className="reel-rail-wrap">
          <div className="reel-rail-title">Reels</div>
          <div className="reel-rail">
            {reels.map((post) => {
              const poster = mediaUrl(post.posterUrl || post.imageUrl);
              const kind = post.videoUrl ? 'Vidéo' : post.audioUrl ? 'Chant' : 'Image';
              return (
                <button key={post.id} className="reel-rail-card" type="button" onClick={() => openMedia(post)}>
                  {poster ? <img src={poster} alt="" /> : <span className="reel-rail-fallback" />}
                  <span className="reel-rail-kind">{kind}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      <Composer
        onRequireAuth={onRequireAuth}
        onCreated={(post) => {
          setPosts((current) => [post, ...current]);
          if (post.videoUrl || post.audioUrl || post.imageUrl) {
            setReels((current) => [post, ...current.filter((item) => item.id !== post.id)]);
          }
          onFollowed?.();
        }}
      />
      {error ? <p className="error-text">{error}</p> : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={patch}
          onDelete={(id) => setPosts((current) => current.filter((item) => item.id !== id))}
          onOpenProfile={onOpenProfile}
          onOpenReel={openMedia}
          onRequireAuth={onRequireAuth}
        />
      ))}
      {!loading && posts.length === 0 ? (
        <div className="empty-card">
          <h3>{mode === 'following' ? 'Votre fil d\'abonnements est vide' : 'Aucune publication'}</h3>
          <p className="muted">Suivez des membres ou passez sur « Pour vous » pour lire la communauté.</p>
        </div>
      ) : null}
      {posts.length >= 20 ? (
        <button className="ghost-btn" type="button" onClick={() => load(offset + 20, false)} disabled={loading}>
          {loading ? 'Chargement…' : 'Voir plus'}
        </button>
      ) : null}
    </>
  );
}

function Explore({ onOpenProfile, onOpenReel, onRequireAuth }) {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const run = useCallback(async (query, selected) => {
    try {
      const data = await explore({ q: query, category: selected });
      setPosts(data.posts);
      setUsers(data.users);
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Recherche indisponible'));
    }
  }, []);

  useEffect(() => {
    run('', '');
  }, [run]);

  return (
    <>
      <form className="search-line" onSubmit={(event) => { event.preventDefault(); run(q, category); }}>
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Chercher un membre, un conte, une ville…" />
        <button className="primary-btn" type="submit">Chercher</button>
      </form>
      <div className="chip-row">
        <button className={`chip ${category === '' ? 'active' : ''}`} type="button" onClick={() => { setCategory(''); run(q, ''); }}>Tout</button>
        {['conte', 'proverbe', 'musique', 'art', 'devinette', 'quotidien'].map((id) => (
          <button key={id} className={`chip ${category === id ? 'active' : ''}`} type="button" onClick={() => { setCategory(id); run(q, id); }}>
            {categoryLabel(id)}
          </button>
        ))}
      </div>
      {error ? <p className="error-text">{error}</p> : null}
      {users.length > 0 ? <PeopleList users={users} onOpenProfile={onOpenProfile} /> : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={(next) => setPosts((current) => current.map((item) => item.id === next.id ? next : item))}
          onDelete={(id) => setPosts((current) => current.filter((item) => item.id !== id))}
          onOpenProfile={onOpenProfile}
          onOpenReel={(post) => onOpenReel(post, posts)}
          onRequireAuth={onRequireAuth}
        />
      ))}
    </>
  );
}

function Profile({ username, onOpenProfile, onOpenReel, onMessage, onRequireAuth, onUpdated }) {
  const { user: me, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', country: '' });
  const [relations, setRelations] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!username) return;
    try {
      const next = await getProfile(username);
      setData(next);
      setForm({ name: next.user.name, bio: next.user.bio, country: next.user.country });
      setError('');
    } catch (err) {
      setError(errorMessage(err, 'Profil introuvable'));
    }
  }, [username]);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="empty-card"><p className="error-text">{error}</p></div>;
  if (!data) return <div className="empty-card">Chargement du profil…</div>;

  const profile = data.user;
  const mine = me?.username === profile.username;

  const toggleFollow = async () => {
    if (!isAuthenticated()) {
      onRequireAuth?.();
      return;
    }
    const next = profile.followedByMe ? await unfollowUser(profile.username) : await followUser(profile.username);
    setData((current) => ({ ...current, user: next }));
  };

  const save = async (event) => {
    event.preventDefault();
    const updated = await updateProfile(form);
    onUpdated?.(updated);
    setEditing(false);
    load();
  };

  const showRelations = async (kind) => {
    setRelations({ kind, users: await getRelations(profile.username, kind) });
  };

  return (
    <>
      <header className="profile-head">
        <img className="avatar-lg" src={mediaUrl(profile.avatar)} alt="" />
        <div>
          <h2>{profile.name}</h2>
          <p className="muted">@{profile.username}{profile.country ? ` · ${profile.country}` : ''}</p>
          <p>{profile.bio || 'Ce membre n\'a pas encore écrit de bio.'}</p>
          <div className="stat-row">
            <span><strong>{profile.stats.posts}</strong> publications</span>
            <button type="button" onClick={() => showRelations('followers')}><strong>{profile.stats.followers}</strong> abonnés</button>
            <button type="button" onClick={() => showRelations('following')}><strong>{profile.stats.following}</strong> abonnements</button>
          </div>
          <div className="profile-actions">
            {mine ? (
              <button className="ghost-btn" type="button" onClick={() => setEditing((value) => !value)}>Modifier le profil</button>
            ) : (
              <>
                <button className="primary-btn" type="button" onClick={toggleFollow}>
                  {profile.followedByMe ? 'Ne plus suivre' : 'Suivre'}
                </button>
                <button className="ghost-btn" type="button" onClick={() => onMessage(profile.username)}>Message</button>
              </>
            )}
          </div>
        </div>
      </header>
      {editing ? (
        <form className="profile-form composer" onSubmit={save}>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Nom" />
          <textarea rows={3} value={form.bio} maxLength={280} onChange={(event) => setForm({ ...form, bio: event.target.value })} placeholder="Bio" />
          <input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} placeholder="Pays ou région" />
          <button className="primary-btn" type="submit">Enregistrer</button>
        </form>
      ) : null}
      {relations ? (
        <div className="composer">
          <h3>{relations.kind === 'followers' ? 'Abonnés' : 'Abonnements'}</h3>
          <PeopleList users={relations.users} onOpenProfile={onOpenProfile} />
        </div>
      ) : null}
      {data.posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={(next) => setData((current) => ({
            ...current,
            posts: current.posts.map((item) => item.id === next.id ? next : item)
          }))}
          onDelete={(id) => setData((current) => ({ ...current, posts: current.posts.filter((item) => item.id !== id) }))}
          onOpenProfile={onOpenProfile}
          onOpenReel={(post) => onOpenReel(post, data.posts)}
          onRequireAuth={onRequireAuth}
        />
      ))}
    </>
  );
}

function Notifications({ onOpenProfile, onRead }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      const notifications = await getNotifications();
      if (!active) return;
      setItems(notifications);
      await markNotificationsRead();
      onRead?.();
    })();
    return () => { active = false; };
  }, [onRead]);

  const text = {
    like: 'a aimé votre publication',
    comment: 'a commenté votre publication',
    follow: 'vous suit maintenant',
    message: 'vous a envoyé un message'
  };

  return (
    <>
      <h2 className="view-title">Alertes</h2>
      {items.length === 0 ? <div className="empty-card">Aucune alerte pour le moment.</div> : null}
      {items.map((item) => (
        <button className="notice" key={item.id} type="button" onClick={() => onOpenProfile(item.actor.username)}>
          <img className="avatar" src={mediaUrl(item.actor.avatar)} alt="" />
          <span>
            <strong>{item.actor.name}</strong> {text[item.type] || 'a interagi avec vous'}
            <div className="muted">{timeAgo(item.createdAt)}{item.read ? '' : ' · nouveau'}</div>
          </span>
        </button>
      ))}
    </>
  );
}

function Messages({ initialUsername, onOpenProfile, onChange }) {
  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(initialUsername);
  const [thread, setThread] = useState(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');

  const loadList = useCallback(async () => {
    setConversations(await getConversations());
  }, []);

  const open = useCallback(async (username) => {
    setActive(username);
    setThread(await getThread(username));
    onChange?.();
    loadList();
  }, [loadList, onChange]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => {
    if (initialUsername) open(initialUsername);
  }, [initialUsername, open]);

  const submit = async (event) => {
    event.preventDefault();
    if (!active || !draft.trim()) return;
    try {
      setThread(await sendMessage(active, draft.trim()));
      setDraft('');
      setError('');
      loadList();
    } catch (err) {
      setError(errorMessage(err, 'Message non envoyé'));
    }
  };

  return (
    <div className="messages-layout">
      <div className={`conversation-list ${active ? 'hide-on-mobile-thread' : ''}`}>
        <h2 className="view-title">Messages</h2>
        {conversations.length === 0 ? <p className="muted">Aucune conversation. Écrivez depuis un profil.</p> : null}
        {conversations.map((item) => (
          <button className="conversation" key={item.user.id} type="button" onClick={() => open(item.user.username)}>
            <img className="avatar" src={mediaUrl(item.user.avatar)} alt="" />
            <span>
              <strong>{item.user.name}</strong>
              {item.unread ? <span className="badge">{item.unread}</span> : null}
              <div className="muted">{item.lastBody}</div>
            </span>
          </button>
        ))}
      </div>
      <div className="thread-panel">
        {thread ? (
          <>
            <button className="person-btn person-name" type="button" onClick={() => onOpenProfile(thread.user.username)}>
              {thread.user.name}
            </button>
            <div className="thread-log">
              {thread.messages.map((message) => (
                <div key={message.id} className={`bubble ${message.mine ? 'mine' : ''}`}>{message.body}</div>
              ))}
            </div>
            <form className="message-form" onSubmit={submit}>
              <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Écrire un message" maxLength={1000} />
              <button className="primary-btn" type="submit">Envoyer</button>
            </form>
            {error ? <p className="error-text">{error}</p> : null}
          </>
        ) : (
          <div className="empty-card">Choisissez une conversation.</div>
        )}
      </div>
    </div>
  );
}

function Saved({ onOpenProfile, onOpenReel, onRequireAuth }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    getBookmarks()
      .then(setPosts)
      .catch((err) => setError(errorMessage(err, 'Enregistrements indisponibles')));
  }, []);

  return (
    <>
      <h2 className="view-title">Enregistrés</h2>
      {error ? <p className="error-text">{error}</p> : null}
      {posts.length === 0 && !error ? <div className="empty-card">Vous n'avez encore rien enregistré.</div> : null}
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          onChange={(next) => setPosts((current) => current.map((item) => item.id === next.id ? next : item))}
          onDelete={(id) => setPosts((current) => current.filter((item) => item.id !== id))}
          onOpenProfile={onOpenProfile}
          onOpenReel={(post) => onOpenReel(post, posts)}
          onRequireAuth={onRequireAuth}
        />
      ))}
    </>
  );
}
