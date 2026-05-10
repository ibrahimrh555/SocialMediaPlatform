import { useState } from "react";

const S = {
  hero: {
    padding: "72px 40px 56px",
    textAlign: "center",
    background: "#0a0a0f",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "#13131f",
    border: "1px solid #1e1e30",
    borderRadius: 20,
    padding: "5px 14px",
    fontSize: 12,
    color: "#9999bb",
    marginBottom: 28,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#1D9E75",
  },
  h1: {
    fontSize: 52,
    fontWeight: 800,
    lineHeight: 1.12,
    color: "#f0f0f5",
    marginBottom: 16,
    letterSpacing: "-1.5px",
    fontFamily: "'DM Sans', sans-serif",
  },
  h1Span: {
    background: "linear-gradient(135deg, #a78bfa, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroP: {
    fontSize: 17,
    color: "#9999bb",
    lineHeight: 1.65,
    maxWidth: 480,
    margin: "0 auto 36px",
  },
  ctaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #a78bfa, #ec4899)",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 26px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  btnGhost: {
    background: "transparent",
    color: "#f0f0f5",
    border: "1px solid #1e1e30",
    borderRadius: 12,
    padding: "12px 26px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'DM Sans', sans-serif",
  },
  statsRow: {
    display: "flex",
    justifyContent: "center",
    gap: 48,
    padding: "20px 40px 52px",
    flexWrap: "wrap",
    background: "#0a0a0f",
  },
  stat: { textAlign: "center" },
  statNum: {
    fontSize: 26,
    fontWeight: 800,
    color: "#f0f0f5",
    fontFamily: "'DM Sans', sans-serif",
  },
  statLabel: { fontSize: 13, color: "#666", marginTop: 2 },
  divider: { height: 1, background: "#1a1a2e", margin: "0 0" },
  section: {
    padding: "52px 40px",
    background: "#0d0d18",
  },
  sectionTitle: {
    fontSize: 13,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 24,
    textAlign: "center",
  },
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 16,
  },
  featCard: {
    background: "#13131f",
    border: "1px solid #1e1e30",
    borderRadius: 16,
    padding: 20,
  },
  featTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: "#f0f0f5",
    marginBottom: 6,
    fontFamily: "'DM Sans', sans-serif",
  },
  featDesc: { fontSize: 13, color: "#888", lineHeight: 1.55 },
  previewWrap: {
    padding: "0 40px 52px",
    background: "#0d0d18",
  },
  phoneFrame: {
    background: "#13131f",
    border: "1px solid #1e1e30",
    borderRadius: 20,
    padding: 16,
    maxWidth: 400,
    margin: "0 auto",
  },
  postCard: {
    background: "#0a0a0f",
    border: "1px solid #1a1a2e",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  postHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  postAuthor: { fontSize: 14, fontWeight: 700, color: "#f0f0f5" },
  postTime: { fontSize: 11, color: "#555" },
  postContent: {
    fontSize: 13,
    color: "#ccc",
    lineHeight: 1.55,
    marginBottom: 10,
  },
  postActions: { display: "flex", gap: 18 },
  tagRow: { display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" },
  tag: {
    background: "rgba(167,139,250,0.15)",
    color: "#a78bfa",
    fontSize: 11,
    padding: "2px 10px",
    borderRadius: 20,
    fontWeight: 500,
  },
  ctaBottom: {
    padding: "52px 40px",
    textAlign: "center",
    background: "#0a0a0f",
    borderTop: "1px solid #1a1a2e",
  },
  ctaBottomH2: {
    fontSize: 30,
    fontWeight: 800,
    color: "#f0f0f5",
    marginBottom: 10,
    fontFamily: "'DM Sans', sans-serif",
  },
  ctaBottomP: {
    fontSize: 15,
    color: "#888",
    marginBottom: 28,
    lineHeight: 1.6,
  },
  footer: {
    padding: "24px 40px",
    background: "#0a0a0f",
    borderTop: "1px solid #1a1a2e",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
  },
  footerLogo: {
    fontSize: 18,
    fontWeight: 900,
    background: "linear-gradient(135deg, #a78bfa, #ec4899)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    fontFamily: "'DM Sans', sans-serif",
  },
  footerText: { fontSize: 13, color: "#555" },
};

function Avatar({ initials, color }) {
  const colors = {
    purple: { bg: "rgba(167,139,250,0.2)", text: "#a78bfa" },
    teal: { bg: "rgba(29,158,117,0.2)", text: "#1D9E75" },
    coral: { bg: "rgba(216,90,48,0.2)", text: "#f97316" },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%",
      background: c.bg, color: c.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 12, fontWeight: 700, flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {initials}
    </div>
  );
}

function FeatureIcon({ icon, color }) {
  const colors = {
    purple: { bg: "rgba(167,139,250,0.15)", text: "#a78bfa" },
    teal: { bg: "rgba(29,158,117,0.15)", text: "#1D9E75" },
    coral: { bg: "rgba(236,72,153,0.15)", text: "#ec4899" },
    blue: { bg: "rgba(59,130,246,0.15)", text: "#60a5fa" },
  };
  const c = colors[color] || colors.purple;
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: c.bg, color: c.text,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 20, marginBottom: 14,
    }}>
      {icon}
    </div>
  );
}

function PostAction({ icon, count, liked }) {
  const [active, setActive] = useState(liked || false);
  const [n, setN] = useState(count);
  return (
    <button
      onClick={() => { setActive(v => !v); setN(x => active ? x - 1 : x + 1); }}
      style={{
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 5,
        fontSize: 12, color: active ? "#ec4899" : "#666",
        fontFamily: "'DM Sans', sans-serif", padding: 0,
        transition: "color 0.15s",
      }}
    >
      {icon} {n}
    </button>
  );
}

export default function LandingPage({ onGetStarted }) {
  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', 'Inter', sans-serif" }}>

      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", borderBottom: "1px solid #1a1a2e",
        background: "rgba(10,10,15,0.95)", backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ ...S.footerLogo, fontSize: 22 }}>✦ Pulse</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{ ...S.btnGhost, padding: "8px 20px", fontSize: 14 }} onClick={onGetStarted}>
            Sign in
          </button>
          <button style={{ ...S.btnPrimary, padding: "8px 20px", fontSize: 14 }} onClick={onGetStarted}>
            Get started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.badge}>
          <span style={S.badgeDot} />
          Now live — join the community
        </div>
        <h1 style={S.h1}>
          Where ideas become<br />
          <span style={S.h1Span}>conversations</span>
        </h1>
        <p style={S.heroP}>
          Pulse is a social platform built for genuine connections.
          Share posts, follow people you love, and join a community that actually listens.
        </p>
        <div style={S.ctaRow}>
          <button style={S.btnPrimary} onClick={onGetStarted}>
            ✦ Get started free
          </button>
          <button style={S.btnGhost} onClick={onGetStarted}>
            ▶ See how it works
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={S.statsRow}>
        {[
          { num: "12k+", label: "Active users" },
          { num: "48k+", label: "Posts published" },
          { num: "200k+", label: "Connections made" },
          { num: "4.9 ★", label: "User rating" },
        ].map(s => (
          <div key={s.label} style={S.stat}>
            <div style={S.statNum}>{s.num}</div>
            <div style={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={S.divider} />

      {/* Features */}
      <div style={S.section}>
        <div style={S.sectionTitle}>Everything you need</div>
        <div style={S.featGrid}>
          {[
            { icon: "👤", color: "purple", title: "Rich profiles", desc: "Showcase your bio, location, and links. Your profile, your story." },
            { icon: "♥", color: "coral", title: "Likes & follows", desc: "Like posts, follow creators, and build your own personal feed." },
            { icon: "💬", color: "teal", title: "Live comments", desc: "Join the conversation with threaded comments on every post." },
            { icon: "🔭", color: "blue", title: "Explore & search", desc: "Discover people and posts that match your interests instantly." },
          ].map(f => (
            <div key={f.title} style={S.featCard}>
              <FeatureIcon icon={f.icon} color={f.color} />
              <div style={S.featTitle}>{f.title}</div>
              <div style={S.featDesc}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.divider} />

      {/* App Preview */}
      <div style={{ ...S.previewWrap, paddingTop: 48 }}>
        <div style={{ ...S.sectionTitle, marginBottom: 20, paddingTop: 4 }}>App preview</div>
        <div style={S.phoneFrame}>

          {/* Post 1 */}
          <div style={S.postCard}>
            <div style={S.postHeader}>
              <Avatar initials="BR" color="purple" />
              <div>
                <div style={S.postAuthor}>Brahim R.</div>
                <div style={S.postTime}>2 min ago</div>
              </div>
            </div>
            <div style={S.tagRow}>
              <span style={S.tag}>#design</span>
              <span style={S.tag}>#ux</span>
            </div>
            <p style={S.postContent}>
              Just launched our new dashboard — cleaner, faster, and finally dark mode!
              Took 3 weeks but worth every late night ✦
            </p>
            {/* Mini image placeholder */}
            <div style={{
              width: "100%", height: 110, borderRadius: 10,
              background: "rgba(167,139,250,0.1)", marginBottom: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "1px solid rgba(167,139,250,0.2)",
            }}>
              <span style={{ fontSize: 28 }}>🖥️</span>
            </div>
            <div style={S.postActions}>
              <PostAction icon="♥" count={24} liked={true} />
              <PostAction icon="💬" count={8} />
            </div>
          </div>

          {/* Post 2 */}
          <div style={S.postCard}>
            <div style={S.postHeader}>
              <Avatar initials="SL" color="teal" />
              <div>
                <div style={S.postAuthor}>Sara L.</div>
                <div style={S.postTime}>15 min ago</div>
              </div>
            </div>
            <p style={S.postContent}>
              MongoDB + Django combo is underrated. Fast to set up, super flexible schema.
              Highly recommend for side projects 🚀
            </p>
            <div style={S.postActions}>
              <PostAction icon="♥" count={11} />
              <PostAction icon="💬" count={3} />
            </div>
          </div>

          {/* Post 3 */}
          <div style={{ ...S.postCard, marginBottom: 0 }}>
            <div style={S.postHeader}>
              <Avatar initials="KM" color="coral" />
              <div>
                <div style={S.postAuthor}>Karim M.</div>
                <div style={S.postTime}>1h ago</div>
              </div>
            </div>
            <div style={S.tagRow}>
              <span style={S.tag}>#react</span>
            </div>
            <p style={S.postContent}>
              Hot take: useEffect is fine. You just have to actually understand it before using it everywhere.
            </p>
            <div style={S.postActions}>
              <PostAction icon="♥" count={57} liked={true} />
              <PostAction icon="💬" count={19} />
            </div>
          </div>

        </div>
      </div>

      <div style={S.divider} />

      {/* CTA Bottom */}
      <div style={S.ctaBottom}>
        <h2 style={S.ctaBottomH2}>Ready to join Pulse?</h2>
        <p style={S.ctaBottomP}>
          Create your profile in seconds.<br />No ads, no noise — just people and ideas.
        </p>
        <button style={S.btnPrimary} onClick={onGetStarted}>
          ✦ Create your account
        </button>
      </div>

      {/* Footer */}
      <div style={S.footer}>
        <div style={S.footerLogo}>✦ Pulse</div>
        <div style={S.footerText}>© 2026 Pulse. Built with Django + React + MongoDB.</div>
        <div style={{ display: "flex", gap: 20 }}>
          {["About", "Privacy", "Terms"].map(l => (
            <span key={l} style={{ fontSize: 13, color: "#555", cursor: "pointer" }}>{l}</span>
          ))}
        </div>
      </div>

    </div>
  );
}