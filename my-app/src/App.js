import { useState, useEffect } from "react";
import Login     from "./pages/Login";
import Signup    from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import History   from "./pages/History";
import Settings  from "./pages/Settings";
import { getSession, logoutUser } from "./db";

/* ================= THEMES ================= */

export const THEMES = {
  dark: {
    bg:"#0a1628",bg2:"#0d1e35",bg3:"#111f38",bg4:"#1e3a5a",
    border:"rgba(255,255,255,0.07)",text:"#e0f0ff",sub:"#4a6a8a",muted:"#2a4a6a",
    accent:"#22c55e",accentGlow:"rgba(34,197,94,0.22)",
    accent2:"#38bdf8",accent2Glow:"rgba(56,189,248,0.18)",inputBg:"#070f1e",
    name:"Dark"
  },
  midnight: {
    bg:"#050d1f",bg2:"#08152e",bg3:"#0d1c3a",bg4:"#162d55",
    border:"rgba(100,150,255,0.1)",text:"#d0e8ff",sub:"#3a5880",muted:"#1e3a60",
    accent:"#818cf8",accentGlow:"rgba(129,140,248,0.22)",
    accent2:"#60a5fa",accent2Glow:"rgba(96,165,250,0.18)",inputBg:"#040b1a",
    name:"Midnight"
  }
};

/* ================= THEME APPLY ================= */

export function applyTheme(name) {
  const t = THEMES[name] || THEMES.dark;
  const r = document.documentElement.style;

  Object.entries({
    "--bg":t.bg,"--bg2":t.bg2,"--bg3":t.bg3,"--bg4":t.bg4,
    "--border":t.border,"--text":t.text,"--sub":t.sub,"--muted":t.muted,
    "--accent":t.accent,"--accent-glow":t.accentGlow,
    "--accent2":t.accent2,"--accent2-glow":t.accent2Glow,
    "--input-bg":t.inputBg,
  }).forEach(([k,v]) => r.setProperty(k,v));

  document.body.style.background = t.bg;
  document.body.style.margin = "0";
  document.body.style.fontFamily = "'Segoe UI', sans-serif";
}

/* ================= APP ================= */

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark");
  const [detectionHistory, setDetectionHistory] = useState([]);

  /* Restore session */
  useEffect(() => {
    const session = getSession();
    if (session) {
      setUser(session);
      setPage("dashboard");
    }

    const savedHistory = localStorage.getItem("detectionHistory");
    if (savedHistory) {
      setDetectionHistory(JSON.parse(savedHistory));
    }
  }, []);

  /* Persist history */
  useEffect(() => {
    localStorage.setItem(
      "detectionHistory",
      JSON.stringify(detectionHistory)
    );
  }, [detectionHistory]);

  /* Apply theme */
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  /* ================= HANDLERS ================= */

  const handleLogin = (u) => {
    setUser(u);
    setPage("dashboard");
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setPage("login");
    setDetectionHistory([]);
    localStorage.removeItem("detectionHistory");
  };

  const addDetection = (result) => {
    setDetectionHistory(prev =>
      [result, ...prev].slice(0, 200)
    );
  };

  const sharedProps = {
  user,
  setPage,
  onLogout: handleLogout,
  detectionHistory,
  addDetection,
  theme,
  onThemeChange: setTheme,
  currentPage: page   // ✅ REQUIRED
};
  /* ================= ROUTING ================= */

  switch (page) {
    case "login":
      return <Login onLogin={handleLogin} onGoSignup={() => setPage("signup")} />;

    case "signup":
      return <Signup onSignup={handleLogin} onGoLogin={() => setPage("login")} />;

    case "dashboard":
      return <Dashboard {...sharedProps} />;

    case "analytics":
      return <Analytics {...sharedProps} />;

    case "history":
      return <History {...sharedProps} />;

    case "settings":
      return <Settings {...sharedProps} />;

    default:
      return <Login onLogin={handleLogin} onGoSignup={() => setPage("signup")} />;
  }
}