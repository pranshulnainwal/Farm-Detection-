import { useState, useEffect, useRef } from "react";
import { loginUser } from "../db";

export default function Login({ onLogin, onGoSignup }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const formRef = useRef(null);

  // Clear any browser autofill after mount
  useEffect(() => {
    const t = setTimeout(() => { setName(""); setEmail(""); setPassword(""); }, 80);
    return () => clearTimeout(t);
  }, []);

  const validEmail = email.length>0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handle = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())  { setError("Please enter your name."); return; }
    if (!validEmail)   { setError("Please enter a valid email address."); return; }
    if (!password)     { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = loginUser({ email, password });
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      onLogin(res.user);
    }, 700);
  };

  return (
    <div style={s.bg}>
      <style>{css}</style>

      {/* Left hero */}
      <div style={s.left}>
        <div style={s.brand}><span style={{fontSize:36}}>🐄</span><span style={s.brandTxt}>FarmVision</span></div>
        <h1 style={s.h1}>Smart Livestock<br/><span style={s.green}>Detection AI</span></h1>
        <p style={s.sub}>Real-time AI detection for 🐔 Chicken · 🐄 Cow · 🐎 Horse · 🐷 Pig · 🐑 Sheep — powered by YOLOv8.</p>

        <div style={s.statsRow}>
          {[["99.2%","Accuracy"],["5","Species"],["<50ms","Speed"],["Live","Camera"]].map(([v,l])=>(
            <div key={l} style={s.statBox}>
              <div style={s.statV}>{v}</div>
              <div style={s.statL}>{l}</div>
            </div>
          ))}
        </div>

        <div style={s.animalRow}>
          {["🐔","🐄","🐎","🐷","🐑"].map((a,i)=>(
            <span key={i} className="fa" style={{...s.aBadge, animationDelay:`${i*0.2}s`}}>{a}</span>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={s.right}>
        <div style={s.card}>
          <h2 style={s.cardTitle}>Welcome Back</h2>
          <p style={s.cardSub}>Sign in to your farm dashboard</p>

          <form ref={formRef} onSubmit={handle} autoComplete="off" style={{marginTop:24}}>
            <input type="text"     style={{display:"none"}} autoComplete="username"/>
            <input type="password" style={{display:"none"}} autoComplete="current-password"/>

            <Field label="Your Name"      icon="👤" value={name}     onChange={e=>setName(e.target.value)}     type="text"     placeholder="John Farmer"        name="nm_x"/>
            <Field label="Email Address"  icon="✉️" value={email}    onChange={e=>setEmail(e.target.value)}    type="text"     placeholder="john@example.com"   name="em_x" inputMode="email" showTick={email?validEmail:null}/>
            <Field label="Password"       icon="🔒" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Your password"      name="pw_x" autoComplete="new-password"/>

            {error && <div style={s.err}>{error}</div>}

            <button className="sbtn" type="submit" disabled={loading} style={s.btn}>
              {loading ? <><Spin/> Signing in...</> : "Sign In →"}
            </button>
          </form>

          <p style={s.sw}>No account? <button onClick={onGoSignup} style={s.lnk}>Create free account</button></p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, value, onChange, type, placeholder, name, inputMode, showTick, autoComplete }) {
  return (
    <div style={{marginBottom:17}}>
      <label style={s.lbl}>{label}</label>
      <div style={{position:"relative"}}>
        <span style={s.iIcon}>{icon}</span>
        <input className="fi" style={s.inp} type={type} placeholder={placeholder}
          autoComplete={autoComplete||"off"} name={name} inputMode={inputMode}
          value={value} onChange={onChange} required/>
        {showTick!==null && showTick!==undefined && value &&
          <span style={{position:"absolute",right:10,top:"50%",transform:"translateY(-50%)",fontSize:13}}>{showTick?"✅":"❌"}</span>}
      </div>
    </div>
  );
}

function Spin() { return <span className="spin">⟳</span>; }

const s = {
  bg:{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',sans-serif",background:"#0a1628"},
  left:{flex:1,background:"linear-gradient(135deg,#0d4f3c,#1a7a5e,#0a3d2e)",padding:"56px 52px",display:"flex",flexDirection:"column",justifyContent:"center"},
  right:{width:460,background:"#0d1e35",display:"flex",alignItems:"center",justifyContent:"center",padding:"36px"},
  brand:{display:"flex",alignItems:"center",gap:10,marginBottom:44},
  brandTxt:{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:1},
  h1:{fontSize:"clamp(32px,4vw,52px)",fontWeight:900,color:"#fff",lineHeight:1.12,marginBottom:18},
  green:{color:"#4ade80"},
  sub:{fontSize:14,color:"rgba(255,255,255,0.68)",lineHeight:1.75,marginBottom:36,maxWidth:420},
  statsRow:{display:"flex",gap:14,marginBottom:40,flexWrap:"wrap"},
  statBox:{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"13px 18px",border:"1px solid rgba(255,255,255,0.14)"},
  statV:{fontSize:20,fontWeight:800,color:"#4ade80"},
  statL:{fontSize:10,color:"rgba(255,255,255,0.55)",textTransform:"uppercase",letterSpacing:0.5,marginTop:2},
  animalRow:{display:"flex",gap:10},
  aBadge:{fontSize:28,background:"rgba(255,255,255,0.1)",borderRadius:"50%",width:52,height:52,display:"flex",alignItems:"center",justifyContent:"center",border:"1px solid rgba(255,255,255,0.18)",animation:"float 3s ease-in-out infinite"},
  card:{background:"#111f38",borderRadius:18,padding:"40px 36px",width:"100%",maxWidth:370,border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"},
  cardTitle:{fontSize:24,fontWeight:800,color:"#fff",marginBottom:5},
  cardSub:{fontSize:13,color:"#6b8cad"},
  lbl:{display:"block",fontSize:11,fontWeight:600,color:"#8aaccc",marginBottom:6,textTransform:"uppercase",letterSpacing:0.8},
  iIcon:{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14},
  inp:{width:"100%",background:"#0d1e35",border:"1px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"12px 34px 12px 38px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit"},
  err:{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.3)",borderRadius:8,padding:"9px 13px",fontSize:12,color:"#f87171",marginBottom:14},
  btn:{width:"100%",background:"linear-gradient(135deg,#16a34a,#22c55e)",border:"none",borderRadius:9,padding:"13px",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,fontFamily:"inherit"},
  sw:{textAlign:"center",fontSize:13,color:"#6b8cad",marginTop:20},
  lnk:{background:"none",border:"none",color:"#4ade80",cursor:"pointer",fontWeight:700,fontSize:13,padding:0,fontFamily:"inherit"},
};

const css = `
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  .fa{display:flex}
  .spin{display:inline-block;animation:spin 0.8s linear infinite}
  .fi:focus{border-color:#22c55e!important;box-shadow:0 0 0 3px rgba(34,197,94,0.15)!important;outline:none}
  .sbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 24px rgba(34,197,94,0.35);transition:all 0.2s}
  .sbtn:disabled{opacity:0.7;cursor:not-allowed}
`;