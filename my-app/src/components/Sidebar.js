export default function Sidebar({
  user = {},
  onLogout = () => {},
  setPage = () => {},
  currentPage = "dashboard",
}) {
  const nav = [
    { id: "dashboard", icon: "🏠", label: "Dashboard" },
    { id: "analytics", icon: "📊", label: "Analytics" },
    { id: "history",   icon: "📁", label: "History" },
    { id: "settings",  icon: "⚙️", label: "Settings" },
  ];

  return (
    <aside style={s.root}>
      <style>{css}</style>

      <div>
        {/* LOGO */}
        <div style={s.logo}>
          <span style={{ fontSize: 30 }}>🐄</span>
          <div>
            <div style={s.logoName}>FarmVision</div>
            <div style={s.logoTag}>AI Detection</div>
          </div>
        </div>

        {/* USER CARD */}
        <div style={s.userCard}>
          <div style={s.avatar}>
            {(user?.name?.[0] || "F").toUpperCase()}
          </div>

          <div style={{ flex: 1, overflow: "hidden" }}>
            <div style={s.uName}>{user?.name || "Farmer"}</div>
            <div style={s.uEmail}>{user?.email || ""}</div>
          </div>

          <div style={s.onlineDot} title="Online" />
        </div>

        {/* NAVIGATION */}
        <nav style={s.nav}>
          {nav.map(({ id, icon, label }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => setPage(id)}
                className={`nb ${active ? "nb-active" : ""}`}
                style={{
                  borderLeft: `3px solid ${
                    active ? "var(--accent)" : "transparent"
                  }`,
                }}
                aria-current={active ? "page" : undefined}
              >
                <span style={{ fontSize: 17 }}>{icon}</span>
                <span>{label}</span>
                {active && <span style={s.activeDot} />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM */}
      <div style={s.bottom}>
        <div style={s.sysStatus}>
          <span style={s.greenDot} />
          <span style={s.sysText}>System Online</span>
        </div>

        <button className="logout-btn" onClick={onLogout}>
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}

/* ================= STYLES ================= */

const s = {
  root: {
    width: 240,
    minWidth: 240,
    background: "var(--bg2)",
    borderRight: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "22px 0 14px",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "0 20px 18px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 14,
  },
  logoName: {
    fontSize: 16,
    fontWeight: 800,
    color: "var(--text)",
  },
  logoTag: {
    fontSize: 9,
    color: "var(--sub)",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "11px 13px",
    margin: "0 12px 14px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    border: "1px solid var(--border)",
    position: "relative",
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "linear-gradient(135deg,var(--accent),var(--accent2))",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
    color: "#fff",
  },
  uName: {
    fontSize: 12,
    fontWeight: 700,
    color: "var(--text)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  uEmail: {
    fontSize: 10,
    color: "var(--sub)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  onlineDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "var(--accent)",
    boxShadow: "0 0 6px var(--accent)",
  },
  nav: {
    padding: "0 12px",
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  activeDot: {
    marginLeft: "auto",
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "var(--accent)",
  },
  bottom: {
    padding: "0 12px 8px",
  },
  sysStatus: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    padding: "9px 13px",
    marginBottom: 8,
    background: "rgba(255,255,255,0.03)",
    borderRadius: 8,
    border: "1px solid var(--border)",
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "var(--accent)",
    boxShadow: "0 0 6px var(--accent)",
  },
  sysText: {
    fontSize: 11,
    color: "var(--accent)",
  },
};

const css = `
.nb{
  display:flex;
  align-items:center;
  gap:10px;
  padding:10px 13px;
  border-radius:8px;
  font-size:13px;
  cursor:pointer;
  font-weight:600;
  border:none;
  width:100%;
  background:transparent;
  color:var(--sub);
  font-family:inherit;
  transition:all .18s;
}
.nb:hover{
  background:rgba(255,255,255,.05);
  color:var(--text);
}
.nb-active{
  background:rgba(255,255,255,.06);
  color:var(--accent);
}
.logout-btn{
  width:100%;
  background:rgba(239,68,68,.07);
  border:1px solid rgba(239,68,68,.18);
  border-radius:8px;
  padding:9px;
  color:#f87171;
  font-size:12px;
  font-weight:600;
  cursor:pointer;
}
.logout-btn:hover{
  background:rgba(239,68,68,.14);
}
`;