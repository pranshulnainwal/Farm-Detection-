import { useState, useEffect, useRef } from "react";
import { registerUser } from "../db";

export default function Signup({ onSignup, onGoLogin }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [farm,     setFarm]     = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const formRef = useRef();

  // Defeat browser autofill
  useEffect(() => {
    const t = setTimeout(() => {
      setName(""); setEmail(""); setFarm("");
      setPhone(""); setPassword(""); setConfirm("");
    }, 80);
    return () => clearTimeout(t);
  }, []);

  const validEmail  = email.length>0  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwMatch     = confirm.length>0 && password===confirm;

  const handle = (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim())        { setError("Please enter your full name."); return; }
    if (!validEmail)         { setError("Please enter a valid email address."); return; }
    if (password.length < 4) { setError("Password must be at least 4 characters."); return; }
    if (password !== confirm) { setError("Passwords don't match."); return; }
    setLoading(true);
    setTimeout(() => {
      const res = registerUser({ name, email, farm, phone, password });
      setLoading(false);
      if (!res.ok) { setError(res.error); return; }
      setDone(true);
      setTimeout(() => onSignup(res.user), 1800);
    }, 800);
  };

  return (
    <div style={s.bg}>
      <style>{css}</style>

      {/* Left hero */}
      <div style={s.left}>
        <div style={s.brand}><span style={{fontSize:34}}>🌿</span><span style={s.brandTxt}>FarmVision</span></div>
        <h1 style={s.h1}>Monitor Your Farm<br/><span style={s.blue}>With AI Power</span></h1>
        <p style={s.sub}>Join thousands of farmers using real-time AI to track and analyse their livestock.</p>
        <div style={s.features}>
          {[
            ["🎯","Real-time Detection","Instant identification from images, video & live camera"],
            ["📊","Live Analytics","Charts & trends update automatically from every detection"],
            ["📁","Full History","Every detection saved with timestamp, counts & media"],
            ["🔔","Smart Settings","Customize alerts, thresholds & notification preferences"],
          ].map(([icon,title,desc])=>(
            <div key={title} style={s.fRow}>
              <span style={s.fIcon}>{icon}</span>
              <div><div style={s.fTitle}>{title}</div><div style={s.fSub}>{desc}</div></div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div style={s.right}>
        <div style={s.card}>
          {done ? (
            <div style={{textAlign:"center",padding:"28px 0"}}>
              <div style={{fontSize:56,marginBottom:14}}>✅</div>
              <h2 style={{fontSize:20,fontWeight:800,color:"#fff",marginBottom:10}}>Account Created!</h2>
              <p style={{fontSize:13,color:"#6b8cad",lineHeight:1.7}}>
                Welcome, <strong style={{color:"#38bdf8"}}>{name}</strong>!<br/>
                Saved as <strong style={{color:"#38bdf8"}}>{email}</strong>
              </p>
              <div style={{marginTop:20,height:4,background:"rgba(255,255,255,0.08)",borderRadius:2,overflow:"hidden"}}>
                <div className="bfb"/>
              </div>
              <p style={{fontSize:11,color:"#4a6a8a",marginTop:10}}>Taking you to dashboard...</p>
            </div>
          ) : (
            <>
              <h2 style={s.cardTitle}>Create Account</h2>
              <p style={s.cardSub}>Free forever — no credit card needed</p>

              <form ref={formRef} onSubmit={handle} autoComplete="off" style={{marginTop:20}}>
                {/* Honey-pot inputs to trick browser autofill */}
                <input type="text"     style={{display:"none"}} autoComplete="username"/>
                <input type="password" style={{display:"none"}} autoComplete="new-password"/>

                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 14px"}}>

                  <div style={s.field}>
                    <label style={s.lbl}>Full Name *</label>
                    <Inp icon="👤" value={name}     onChange={e=>setName(e.target.value)}     type="text"     placeholder="John Farmer"         name="nm_x"/>
                  </div>
                  <div style={s.field}>
                    <label style={s.lbl}>Farm Name</label>
                    <Inp icon="🏡" value={farm}     onChange={e=>setFarm(e.target.value)}     type="text"     placeholder="Green Valley Farm"   name="fn_x"/>
                  </div>
                  <div style={{...s.field,gridColumn:"1/-1"}}>
                    <label style={s.lbl}>Email Address *</label>
                    <Inp icon="✉️" value={email}    onChange={e=>setEmail(e.target.value)}    type="text"     placeholder="john@example.com"    name="em_x" inputMode="email" tick={email?(validEmail?"✅":"❌"):null}/>
                  </div>
                  <div style={{...s.field,gridColumn:"1/-1"}}>
                    <label style={s.lbl}>Phone (optional)</label>
                    <Inp icon="📱" value={phone}    onChange={e=>setPhone(e.target.value)}    type="text"     placeholder="+1 234 567 8900"     name="ph_x" inputMode="tel"/>
                  </div>
                  <div style={s.field}>
                    <label style={s.lbl}>Password *</label>
                    <Inp icon="🔒" value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Min 4 characters"    name="pw_x" ac="new-password"/>
                  </div>
                  <div style={s.field}>
                    <label style={s.lbl}>Confirm Password *</label>
                    <Inp icon="🔑" value={confirm}  onChange={e=>setConfirm(e.target.value)}  type="password" placeholder="Repeat password"     name="cp_x" ac="new-password" tick={confirm?(pwMatch?"✅":"❌"):null}/>
                  </div>

                </div>

                {error && <div style={s.err}>{error}</div>}

                <button className="bbtn" type="submit" disabled={loading} style={s.btn}>
                  {loading ? <><span className="spin">⟳</span> Creating account...</> : "🚀 Create My Account"}
                </button>
              </form>

              <p style={s.sw}>Already have account? <button onClick={onGoLogin} style={s.lnk}>Sign in</button></p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Inp({ icon, value, onChange, type, placeholder, name, inputMode, tick, ac }) {
  return (
    <div style={{position:"relative"}}>
      <span style={{position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>{icon}</span>
      <input className="si" type={type} placeholder={placeholder} autoComplete={ac||"off"}
        name={name} inputMode={inputMode} value={value} onChange={onChange} required={name!=="ph_x"}
        style={{width:"100%",background:"#0d1e35",border:"1px solid rgba(255,255,255,0.09)",borderRadius:8,padding:"10px 32px 10px 34px",color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
      {tick && <span style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>{tick}</span>}
    </div>
  );
}

const s = {
  bg:{display:"flex",minHeight:"100vh",fontFamily:"'Segoe UI',sans-serif",background:"#0a1628"},
  left:{flex:1,background:"linear-gradient(135deg,#1a3a5c,#0d5c8a,#0a2a45)",padding:"52px 48px",display:"flex",flexDirection:"column",justifyContent:"center"},
  right:{width:500,background:"#0d1e35",display:"flex",alignItems:"center",justifyContent:"center",padding:"32px"},
  brand:{display:"flex",alignItems:"center",gap:10,marginBottom:36},
  brandTxt:{fontSize:22,fontWeight:800,color:"#fff",letterSpacing:1},
  h1:{fontSize:"clamp(28px,3.5vw,46px)",fontWeight:900,color:"#fff",lineHeight:1.12,marginBottom:16},
  blue:{color:"#38bdf8"},
  sub:{fontSize:14,color:"rgba(255,255,255,0.62)",lineHeight:1.7,marginBottom:32,maxWidth:400},
  features:{display:"flex",flexDirection:"column",gap:18},
  fRow:{display:"flex",gap:14,alignItems:"flex-start"},
  fIcon:{fontSize:22,background:"rgba(255,255,255,0.09)",borderRadius:9,width:42,height:42,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid rgba(255,255,255,0.13)"},
  fTitle:{fontSize:13,fontWeight:700,color:"#fff",marginBottom:3},
  fSub:{fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5},
  card:{background:"#111f38",borderRadius:18,padding:"36px 32px",width:"100%",maxWidth:420,border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"},
  cardTitle:{fontSize:22,fontWeight:800,color:"#fff",marginBottom:4},
  cardSub:{fontSize:12,color:"#6b8cad"},
  field:{marginBottom:14},
  lbl:{display:"block",fontSize:10,fontWeight:600,color:"#8aaccc",marginBottom:5,textTransform:"uppercase",letterSpacing:0.7},
  err:{background:"rgba(239,68,68,0.09)",border:"1px solid rgba(239,68,68,0.25)",borderRadius:7,padding:"8px 12px",fontSize:12,color:"#f87171",marginBottom:12},
  btn:{width:"100%",background:"linear-gradient(135deg,#0ea5e9,#38bdf8)",border:"none",borderRadius:9,padding:"12px",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginTop:4,fontFamily:"inherit"},
  sw:{textAlign:"center",fontSize:12,color:"#6b8cad",marginTop:16},
  lnk:{background:"none",border:"none",color:"#38bdf8",cursor:"pointer",fontWeight:700,fontSize:12,padding:0,fontFamily:"inherit"},
};

const css = `
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes bfb{from{width:0}to{width:100%}}
  .spin{display:inline-block;animation:spin 0.8s linear infinite}
  .si:focus{border-color:#38bdf8!important;box-shadow:0 0 0 3px rgba(56,189,248,0.13)!important;outline:none}
  .bbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 8px 22px rgba(14,165,233,0.35);transition:all 0.2s}
  .bbtn:disabled{opacity:0.7;cursor:not-allowed}
  .bfb{height:100%;background:linear-gradient(90deg,#0ea5e9,#38bdf8);border-radius:2px;animation:bfb 1.8s linear forwards}
`;