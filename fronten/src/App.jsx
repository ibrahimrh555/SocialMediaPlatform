import { useState, useEffect, createContext, useContext } from "react";
import LandingPage from './LandingPage';

// ─── API ─────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:8000/api";

const api = {
  token: null,

  setToken(t) { this.token = t; },

  async req(method, path, body = null) {
    const headers = { "Content-Type": "application/json" };
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;
    const res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw data;
    return data;
  },

  get: (path) => api.req("GET", path),
  post: (path, body) => api.req("POST", path, body),
  patch: (path, body) => api.req("PATCH", path, body),
  delete: (path) => api.req("DELETE", path),
};

// ─── Auth Context ─────────────────────────────────────────────────────────────

const AuthContext = createContext(null);
function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const savedUser = localStorage.getItem("user");
    if (token && savedUser) {
      api.setToken(token);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const data = await api.post("/auth/login/", { username, password });
    api.setToken(data.access);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const register = async (payload) => {
    const data = await api.post("/auth/register/", payload);
    api.setToken(data.access);
    localStorage.setItem("access_token", data.access);
    localStorage.setItem("refresh_token", data.refresh);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data;
  };

  const logout = () => {
    api.post("/auth/logout/", { refresh: localStorage.getItem("refresh_token") }).catch(() => {});
    api.setToken(null);
    localStorage.clear();
    setUser(null);
  };

  const updateUser = (updated) => {
    setUser(updated);
    localStorage.setItem("user", JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Icons ───────────────────────────────────────────────────────────────────

const Icon = ({ d, size = 20, fill = "none", strokeWidth = 1.8 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const Icons = {
  Home: () => <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />,
  Explore: () => <Icon d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 0L8 8l4 4 4-4-4-4zm0 20l-4-6 4-4 4 4-4 6z" />,
  Heart: ({ filled }) => <Icon d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill={filled ? "currentColor" : "none"} />,
  Comment: () => <Icon d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />,
  User: () => <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8z" />,
  Plus: () => <Icon d="M12 5v14M5 12h14" strokeWidth={2} />,
  Search: () => <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />,
  X: () => <Icon d="M18 6L6 18M6 6l12 12" strokeWidth={2} />,
  Send: () => <Icon d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />,
  Trash: () => <Icon d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />,
  Edit: () => <Icon d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />,
  Image: () => <Icon d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 10a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM21 15l-5-5L5 21" />,
  LogOut: () => <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  Back: () => <Icon d="M19 12H5M12 5l-7 7 7 7" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function Avatar({ user, size = 40, onClick }) {
  const initials = (user?.display_name || user?.username || "?").slice(0, 2).toUpperCase();
  const colors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#10b981", "#8b5cf6"];
  const color = colors[(user?.username?.charCodeAt(0) || 0) % colors.length];

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username}
        onClick={onClick}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", cursor: onClick ? "pointer" : "default", flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size, borderRadius: "50%",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 700, fontSize: size * 0.36, cursor: onClick ? "pointer" : "default",
        flexShrink: 0, fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  app: {
    minHeight: "100vh",
    background: "#0a0a0f",
    color: "#f0f0f5",
    fontFamily: "'DM Sans', 'Inter', sans-serif",
    display: "flex",
  },
  sidebar: {
    width: 240,
    borderRight: "1px solid #1a1a2e",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    position: "sticky",
    top: 0,
    height: "100vh",
    background: "#0d0d18",
  },
  logo: {
    fontSize: 22,
    fontWeight: 800,
    background: "linear-gradient(135deg, #a78bfa, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    padding: "8px 12px 20px",
    letterSpacing: "-0.5px",
  },
  navItem: (active) => ({
    display: "flex", alignItems: "center", gap: 12,
    padding: "10px 12px", borderRadius: 12, cursor: "pointer",
    color: active ? "#a78bfa" : "#9999bb",
    background: active ? "rgba(167,139,250,0.12)" : "transparent",
    fontWeight: active ? 600 : 400,
    fontSize: 15,
    transition: "all 0.15s",
    border: "none", width: "100%", textAlign: "left",
  }),
  main: {
    flex: 1,
    maxWidth: 640,
    borderRight: "1px solid #1a1a2e",
    minHeight: "100vh",
  },
  rightPanel: {
    width: 320,
    padding: "24px 20px",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },
  header: {
    padding: "16px 20px",
    borderBottom: "1px solid #1a1a2e",
    fontSize: 18,
    fontWeight: 700,
    position: "sticky",
    top: 0,
    background: "rgba(10,10,15,0.9)",
    backdropFilter: "blur(12px)",
    zIndex: 10,
  },
  postCard: {
    padding: "16px 20px",
    borderBottom: "1px solid #1a1a2e",
    transition: "background 0.15s",
  },
  btn: (variant = "primary", size = "md") => ({
    padding: size === "sm" ? "5px 14px" : "9px 20px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: size === "sm" ? 13 : 14,
    background: variant === "primary"
      ? "linear-gradient(135deg, #a78bfa, #ec4899)"
      : variant === "ghost"
      ? "transparent"
      : variant === "outline"
      ? "transparent"
      : "#1a1a2e",
    color: variant === "outline" ? "#a78bfa" : "#fff",
    border: variant === "outline" ? "1px solid #a78bfa" : "none",
    transition: "all 0.15s",
    display: "inline-flex", alignItems: "center", gap: 6,
  }),
  input: {
    background: "#13131f",
    border: "1px solid #1e1e30",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f0f0f5",
    fontSize: 14,
    width: "100%",
    outline: "none",
    boxSizing: "border-box",
  },
  textarea: {
    background: "#13131f",
    border: "1px solid #1e1e30",
    borderRadius: 10,
    padding: "10px 14px",
    color: "#f0f0f5",
    fontSize: 14,
    width: "100%",
    outline: "none",
    resize: "none",
    boxSizing: "border-box",
    fontFamily: "'DM Sans', sans-serif",
  },
  card: {
    background: "#13131f",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    border: "1px solid #1e1e30",
  },
  tag: {
    background: "rgba(167,139,250,0.15)",
    color: "#a78bfa",
    padding: "2px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 500,
  },
};

// ─── Post Composer ────────────────────────────────────────────────────────────

function PostComposer({ onPost }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    try {
      const post = await api.post("/posts/", { content, image_url: imageUrl });
      setContent("");
      setImageUrl("");
      setShowImageInput(false);
      onPost?.(post);
    } catch (e) {
      setError("Failed to post. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a2e" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar user={user} size={42} />
        <div style={{ flex: 1 }}>
          <textarea
            style={{ ...S.textarea, minHeight: 72, marginBottom: 8 }}
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={1000}
          />
          {showImageInput && (
            <input
              style={{ ...S.input, marginBottom: 8 }}
              placeholder="Image URL (optional)"
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
            />
          )}
          {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 8 }}>{error}</p>}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              style={{ ...S.btn("ghost"), color: "#9999bb", padding: "6px 8px" }}
              onClick={() => setShowImageInput(v => !v)}
            >
              <Icons.Image />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#666" }}>{content.length}/1000</span>
              <button style={S.btn("primary")} onClick={submit} disabled={!content.trim() || loading}>
                {loading ? "Posting…" : "Post"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

function PostCard({ post: initialPost, onNavigate }) {
  const { user } = useAuth();
  const [post, setPost] = useState(initialPost);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingComments, setLoadingComments] = useState(false);

  const toggleLike = async () => {
    try {
      const res = await api.post(`/posts/${post.id}/like/`);
      setPost(p => ({ ...p, is_liked: res.liked, likes_count: res.likes_count }));
    } catch {}
  };

  const loadComments = async () => {
    if (showComments) { setShowComments(false); return; }
    setLoadingComments(true);
    try {
      const data = await api.get(`/posts/${post.id}/comments/`);
      setComments(data);
      setShowComments(true);
    } catch {}
    setLoadingComments(false);
  };

  const addComment = async () => {
    if (!commentText.trim()) return;
    try {
      const c = await api.post(`/posts/${post.id}/comments/`, { content: commentText });
      setComments(prev => [...prev, c]);
      setCommentText("");
      setPost(p => ({ ...p, comments_count: p.comments_count + 1 }));
    } catch {}
  };

  const deleteComment = async (cId) => {
    try {
      await api.delete(`/posts/${post.id}/comments/${cId}/`);
      setComments(prev => prev.filter(c => c.id !== cId));
      setPost(p => ({ ...p, comments_count: p.comments_count - 1 }));
    } catch {}
  };

  const deletePost = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}/`);
    } catch {}
  };

  return (
    <div style={S.postCard}>
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar user={post.author} size={42} onClick={() => onNavigate("profile", post.author.username)} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <span
              style={{ fontWeight: 700, fontSize: 15, cursor: "pointer" }}
              onClick={() => onNavigate("profile", post.author.username)}
            >
              {post.author.display_name || post.author.username}
            </span>
            <span style={{ color: "#666", fontSize: 13 }}>@{post.author.username}</span>
            <span style={{ color: "#444", fontSize: 12, marginLeft: "auto" }}>{timeAgo(post.created_at)}</span>
            {user?.username === post.author.username && (
              <button style={{ ...S.btn("ghost"), color: "#666", padding: 4 }} onClick={deletePost}>
                <Icons.Trash />
              </button>
            )}
          </div>

          <p style={{ margin: "0 0 10px", lineHeight: 1.5, fontSize: 15, color: "#ddd", whiteSpace: "pre-wrap" }}>
            {post.content}
          </p>

          {post.image_url && (
            <img
              src={post.image_url}
              alt="post"
              style={{ width: "100%", borderRadius: 12, marginBottom: 10, maxHeight: 400, objectFit: "cover" }}
              onError={e => e.target.style.display = "none"}
            />
          )}

          {post.tags?.length > 0 && (
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {post.tags.map(t => <span key={t} style={S.tag}>#{t}</span>)}
            </div>
          )}

          <div style={{ display: "flex", gap: 20 }}>
            <button
              style={{ ...S.btn("ghost"), color: post.is_liked ? "#ec4899" : "#9999bb", padding: "6px 0", gap: 6, fontSize: 13 }}
              onClick={toggleLike}
            >
              <Icons.Heart filled={post.is_liked} />
              {post.likes_count}
            </button>
            <button
              style={{ ...S.btn("ghost"), color: "#9999bb", padding: "6px 0", gap: 6, fontSize: 13 }}
              onClick={loadComments}
            >
              <Icons.Comment />
              {post.comments_count}
            </button>
          </div>

          {showComments && (
            <div style={{ marginTop: 12, borderTop: "1px solid #1a1a2e", paddingTop: 12 }}>
              {loadingComments && <p style={{ color: "#666", fontSize: 13 }}>Loading…</p>}
              {comments.map(c => (
                <div key={c.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <Avatar user={c.author} size={28} />
                  <div style={{ flex: 1, background: "#0d0d18", borderRadius: 10, padding: "8px 12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>@{c.author.username}</span>
                      {user?.username === c.author.username && (
                        <button style={{ ...S.btn("ghost"), color: "#666", padding: 0 }} onClick={() => deleteComment(c.id)}>
                          <Icons.X />
                        </button>
                      )}
                    </div>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: "#ccc" }}>{c.content}</p>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Avatar user={user} size={28} />
                <div style={{ flex: 1, display: "flex", gap: 8 }}>
                  <input
                    style={{ ...S.input, fontSize: 13 }}
                    placeholder="Write a comment…"
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addComment()}
                  />
                  <button style={{ ...S.btn("primary", "sm") }} onClick={addComment}>
                    <Icons.Send />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Feed Page ────────────────────────────────────────────────────────────────

function FeedPage({ onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const data = await api.get("/me/feed/");
      setPosts(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadFeed(); }, []);

  return (
    <div>
      <div style={S.header}>Home</div>
      <PostComposer onPost={post => setPosts(prev => [post, ...prev])} />
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading feed…</div>
      ) : posts.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#666" }}>
          <p style={{ fontSize: 16, marginBottom: 8 }}>Your feed is empty</p>
          <p style={{ fontSize: 14 }}>Follow people to see their posts here</p>
        </div>
      ) : (
        posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)
      )}
    </div>
  );
}

// ─── Explore Page ─────────────────────────────────────────────────────────────

function ExplorePage({ onNavigate }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    api.get("/explore/").then(setPosts).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const search = async () => {
    if (!query.trim()) { setSearchResults(null); return; }
    setSearching(true);
    try {
      const res = await api.get(`/search/?q=${encodeURIComponent(query)}`);
      setSearchResults(res);
    } catch {}
    setSearching(false);
  };

  return (
    <div>
      <div style={S.header}>Explore</div>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <input
              style={{ ...S.input, paddingLeft: 40 }}
              placeholder="Search users or posts…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && search()}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#666" }}>
              <Icons.Search />
            </span>
          </div>
          <button style={S.btn("primary", "sm")} onClick={search}>Search</button>
          {searchResults && <button style={S.btn("outline", "sm")} onClick={() => { setSearchResults(null); setQuery(""); }}>Clear</button>}
        </div>
      </div>

      {searching && <div style={{ padding: 20, textAlign: "center", color: "#666" }}>Searching…</div>}

      {searchResults ? (
        <div>
          {searchResults.users?.length > 0 && (
            <div>
              <div style={{ padding: "12px 20px", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Users</div>
              {searchResults.users.map(u => (
                <UserRow key={u.id} user={u} onNavigate={onNavigate} />
              ))}
            </div>
          )}
          {searchResults.posts?.length > 0 && (
            <div>
              <div style={{ padding: "12px 20px", color: "#666", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>Posts</div>
              {searchResults.posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)}
            </div>
          )}
          {searchResults.users?.length === 0 && searchResults.posts?.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "#666" }}>No results for "{query}"</div>
          )}
        </div>
      ) : (
        loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading…</div>
        ) : (
          posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)
        )
      )}
    </div>
  );
}

// ─── User Row ─────────────────────────────────────────────────────────────────

function UserRow({ user: u, onNavigate, showFollow = true }) {
  const { user: me } = useAuth();
  const [following, setFollowing] = useState(u.is_following);
  const [loading, setLoading] = useState(false);

  const toggleFollow = async (e) => {
    e.stopPropagation();
    if (loading || u.username === me?.username) return;
    setLoading(true);
    try {
      const res = await api.post(`/users/${u.username}/follow/`);
      setFollowing(res.following);
    } catch {}
    setLoading(false);
  };

  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #1a1a2e" }}
      onClick={() => onNavigate("profile", u.username)}
    >
      <Avatar user={u} size={44} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{u.display_name || u.username}</div>
        <div style={{ color: "#666", fontSize: 13 }}>@{u.username}</div>
        {u.bio && <div style={{ color: "#9999bb", fontSize: 12, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.bio}</div>}
      </div>
      {showFollow && u.username !== me?.username && (
        <button style={S.btn(following ? "secondary" : "primary", "sm")} onClick={toggleFollow}>
          {following ? "Unfollow" : "Follow"}
        </button>
      )}
    </div>
  );
}

// ─── Profile Page ─────────────────────────────────────────────────────────────

function ProfilePage({ username, onNavigate }) {
  const { user: me, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("posts");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const isSelf = me?.username === username;

  useEffect(() => {
    setLoading(true);
    setTab("posts");
    Promise.all([
      api.get(`/users/${username}/`),
      api.get(`/users/${username}/posts/`),
    ]).then(([prof, ps]) => {
      setProfile(prof);
      setPosts(ps);
      setIsFollowing(prof.is_following);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [username]);

  const loadFollowers = async () => {
    const data = await api.get(`/users/${username}/followers/`);
    setFollowers(data);
  };

  const loadFollowing = async () => {
    const data = await api.get(`/users/${username}/following/`);
    setFollowing(data);
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t === "followers") loadFollowers();
    if (t === "following") loadFollowing();
  };

  const toggleFollow = async () => {
    try {
      const res = await api.post(`/users/${username}/follow/`);
      setIsFollowing(res.following);
      setProfile(p => ({ ...p, followers_count: res.followers_count }));
    } catch {}
  };

  const saveEdit = async () => {
    try {
      const res = await api.patch("/me/", editForm);
      setProfile(res);
      if (isSelf) updateUser(res);
      setEditing(false);
    } catch {}
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>Loading…</div>;
  if (!profile) return <div style={{ padding: 40, textAlign: "center", color: "#666" }}>User not found</div>;

  return (
    <div>
      <div style={{ ...S.header, display: "flex", alignItems: "center", gap: 12 }}>
        <button style={{ ...S.btn("ghost"), padding: 6 }} onClick={() => onNavigate("feed")}>
          <Icons.Back />
        </button>
        @{username}
      </div>

      {/* Profile header */}
      <div style={{ padding: "24px 20px", borderBottom: "1px solid #1a1a2e" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <Avatar user={profile} size={80} />
          {isSelf ? (
            <button style={S.btn("outline")} onClick={() => { setEditing(true); setEditForm({ display_name: profile.display_name, bio: profile.bio, avatar_url: profile.avatar_url, website: profile.website, location: profile.location }); }}>
              <Icons.Edit /> Edit Profile
            </button>
          ) : (
            <button style={S.btn(isFollowing ? "secondary" : "primary")} onClick={toggleFollow}>
              {isFollowing ? "Unfollow" : "Follow"}
            </button>
          )}
        </div>

        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 4 }}>{profile.display_name || profile.username}</div>
        <div style={{ color: "#666", fontSize: 14, marginBottom: 8 }}>@{profile.username}</div>
        {profile.bio && <p style={{ fontSize: 14, color: "#ccc", marginBottom: 12, lineHeight: 1.5 }}>{profile.bio}</p>}
        {profile.location && <div style={{ color: "#666", fontSize: 13, marginBottom: 8 }}>📍 {profile.location}</div>}
        {profile.website && (
          <a href={profile.website} style={{ color: "#a78bfa", fontSize: 13, textDecoration: "none" }} target="_blank" rel="noopener noreferrer">
            🔗 {profile.website}
          </a>
        )}

        <div style={{ display: "flex", gap: 24, marginTop: 16 }}>
          <div style={{ cursor: "pointer" }} onClick={() => handleTabChange("posts")}>
            <span style={{ fontWeight: 700 }}>{profile.posts_count}</span>
            <span style={{ color: "#666", fontSize: 13, marginLeft: 4 }}>Posts</span>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => handleTabChange("followers")}>
            <span style={{ fontWeight: 700 }}>{profile.followers_count}</span>
            <span style={{ color: "#666", fontSize: 13, marginLeft: 4 }}>Followers</span>
          </div>
          <div style={{ cursor: "pointer" }} onClick={() => handleTabChange("following")}>
            <span style={{ fontWeight: 700 }}>{profile.following_count}</span>
            <span style={{ color: "#666", fontSize: 13, marginLeft: 4 }}>Following</span>
          </div>
        </div>
      </div>

      {/* Edit modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#0d0d18", borderRadius: 16, padding: 24, width: 400, border: "1px solid #1e1e30" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 18 }}>Edit Profile</span>
              <button style={{ ...S.btn("ghost"), padding: 4 }} onClick={() => setEditing(false)}><Icons.X /></button>
            </div>
            {[
              { key: "display_name", label: "Display Name", placeholder: "Your name" },
              { key: "bio", label: "Bio", placeholder: "Tell us about yourself", textarea: true },
              { key: "avatar_url", label: "Avatar URL", placeholder: "https://..." },
              { key: "location", label: "Location", placeholder: "City, Country" },
              { key: "website", label: "Website", placeholder: "https://yoursite.com" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 4 }}>{f.label}</label>
                {f.textarea ? (
                  <textarea
                    style={{ ...S.textarea, minHeight: 80 }}
                    value={editForm[f.key] || ""}
                    onChange={e => setEditForm(v => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                ) : (
                  <input
                    style={S.input}
                    value={editForm[f.key] || ""}
                    onChange={e => setEditForm(v => ({ ...v, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <button style={{ ...S.btn("outline"), flex: 1 }} onClick={() => setEditing(false)}>Cancel</button>
              <button style={{ ...S.btn("primary"), flex: 1 }} onClick={saveEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid #1a1a2e" }}>
        {["posts", "followers", "following"].map(t => (
          <button
            key={t}
            style={{
              flex: 1, padding: "14px 0", border: "none", background: "transparent",
              color: tab === t ? "#a78bfa" : "#666",
              fontWeight: tab === t ? 700 : 400,
              borderBottom: tab === t ? "2px solid #a78bfa" : "2px solid transparent",
              cursor: "pointer", fontSize: 14, textTransform: "capitalize",
            }}
            onClick={() => handleTabChange(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "posts" && posts.map(p => <PostCard key={p.id} post={p} onNavigate={onNavigate} />)}
      {tab === "followers" && followers.map(u => <UserRow key={u.id} user={u} onNavigate={onNavigate} />)}
      {tab === "following" && following.map(u => <UserRow key={u.id} user={u} onNavigate={onNavigate} />)}
    </div>
  );
}

// ─── Auth Screen ──────────────────────────────────────────────────────────────

function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "", display_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      if (mode === "login") {
        await login(form.username, form.password);
      } else {
        await register(form);
      }
    } catch (e) {
      setError(Object.values(e).flat()[0] || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0f", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: 400, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✦</div>
          <h1 style={{
            fontSize: 32, fontWeight: 900, margin: 0,
            background: "linear-gradient(135deg, #a78bfa, #ec4899)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Pulse
          </h1>
          <p style={{ color: "#666", marginTop: 8, fontSize: 15 }}>
            {mode === "login" ? "Welcome back" : "Join the community"}
          </p>
        </div>

        <div style={{ background: "#0d0d18", borderRadius: 20, padding: 32, border: "1px solid #1e1e30" }}>
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Display Name</label>
              <input style={S.input} placeholder="Your name" value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Username</label>
            <input style={S.input} placeholder="username" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
          </div>
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Email</label>
              <input style={S.input} placeholder="you@example.com" type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Password</label>
            <input style={S.input} placeholder="••••••••" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          {mode === "register" && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: "#888", display: "block", marginBottom: 6 }}>Confirm Password</label>
              <input style={S.input} placeholder="••••••••" type="password" value={form.password2}
                onChange={e => setForm(f => ({ ...f, password2: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          )}
          {mode === "login" && (
            <div style={{ marginBottom: 20 }}>
              <input style={S.input} placeholder="••••••••" type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()} />
            </div>
          )}
          {error && <p style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <button
            style={{ ...S.btn("primary"), width: "100%", justifyContent: "center", padding: "12px 0", borderRadius: 12, fontSize: 16 }}
            onClick={submit} disabled={loading}
          >
            {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <p style={{ textAlign: "center", color: "#666", fontSize: 14, marginTop: 16 }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span style={{ color: "#a78bfa", cursor: "pointer" }} onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(""); }}>
              {mode === "login" ? "Sign up" : "Sign in"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Suggested Panel ─────────────────────────────────────────────────────────

function SuggestedPanel({ onNavigate }) {
  const { user, logout } = useAuth();
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    api.get("/suggested/").then(setSuggested).catch(() => {});
  }, []);

  return (
    <div>
      {/* Me card */}
      <div style={{ ...S.card, display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => onNavigate("profile", user?.username)}>
        <Avatar user={user} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{user?.display_name || user?.username}</div>
          <div style={{ color: "#666", fontSize: 13 }}>@{user?.username}</div>
        </div>
        <button style={{ ...S.btn("ghost"), color: "#666", padding: 6 }} onClick={e => { e.stopPropagation(); logout(); }}>
          <Icons.LogOut />
        </button>
      </div>

      {suggested.length > 0 && (
        <div style={S.card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Suggested</div>
          {suggested.map(u => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <Avatar user={u} size={36} onClick={() => onNavigate("profile", u.username)} />
              <div style={{ flex: 1, minWidth: 0, cursor: "pointer" }} onClick={() => onNavigate("profile", u.username)}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{u.display_name || u.username}</div>
                <div style={{ color: "#666", fontSize: 12 }}>@{u.username}</div>
              </div>
              <FollowButton username={u.username} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FollowButton({ username }) {
  const { user: me } = useAuth();
  const [following, setFollowing] = useState(false);
  const toggle = async (e) => {
    e.stopPropagation();
    const res = await api.post(`/users/${username}/follow/`);
    setFollowing(res.following);
  };
  if (username === me?.username) return null;
  return (
    <button style={S.btn(following ? "secondary" : "primary", "sm")} onClick={toggle}>
      {following ? "Unfollow" : "Follow"}
    </button>
  );
}

// ─── App Shell ────────────────────────────────────────────────────────────────

function AppShell() {
  const { user } = useAuth();
  const [page, setPage] = useState("feed");
  const [pageParam, setPageParam] = useState(null);

  const navigate = (p, param = null) => {
    setPage(p);
    setPageParam(param);
  };

  const navItems = [
    { id: "feed", label: "Home", icon: <Icons.Home /> },
    { id: "explore", label: "Explore", icon: <Icons.Explore /> },
    { id: "profile", label: "Profile", icon: <Icons.User />, param: user?.username },
  ];

  const renderPage = () => {
    switch (page) {
      case "feed": return <FeedPage onNavigate={navigate} />;
      case "explore": return <ExplorePage onNavigate={navigate} />;
      case "profile": return <ProfilePage username={pageParam || user?.username} onNavigate={navigate} />;
      default: return <FeedPage onNavigate={navigate} />;
    }
  };

  return (
    <div style={S.app}>
      {/* Sidebar */}
      <nav style={S.sidebar}>
        <div style={S.logo}>✦ Pulse</div>
        {navItems.map(item => (
          <button
            key={item.id}
            style={S.navItem(page === item.id && (item.id !== "profile" || pageParam === user?.username))}
            onClick={() => navigate(item.id, item.param || null)}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Main content */}
      <main style={S.main}>
        {renderPage()}
      </main>

      {/* Right panel */}
      <aside style={S.rightPanel}>
        <SuggestedPanel onNavigate={navigate} />
      </aside>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showAuth, setShowAuth] = useState(false);   // ← ajoute useState

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex",
        alignItems: "center", justifyContent: "center", color: "#666" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✦</div>
          <div>Loading Pulse…</div>
        </div>
      </div>
    );
  }

  if (user) return <AppShell />;

  // Affiche la landing page d'abord, l'auth ensuite
  if (showAuth) return <AuthScreen />;
  return <LandingPage onGetStarted={() => setShowAuth(true)} />;
}