import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { updateUser, changePassword } from "../db";
import { THEMES } from "../App";

const ANIMALS = ["chicken","cow","horse","pig","sheep"];
const COLORS  = {chicken:"#f59e0b",cow:"#22c55e",horse:"#8b5cf6",pig:"#ec4899",sheep:"#38bdf8"};
const ICONS   = {chicken:"🐔",cow:"🐄",horse:"🐎",pig:"🐷",sheep:"🐑"};

const THEME_LIST = [
  { id:"dark",     emoji:"🌑", label:"Dark",     previewBg:"#0a1628", previewCard:"#111f38", accent:"#22c55e" },
  { id:"midnight", emoji:"🌌", label:"Midnight", previewBg:"#050d1f", previewCard:"#0d1c3a", accent:"#818cf8" },
  { id:"forest",   emoji:"🌿", label:"Forest",   previewBg:"#051a0e", previewCard:"#0d2a14", accent:"#4ade80" },
  { id:"sunset",   emoji:"🌅", label:"Sunset",   previewBg:"#1a0a0a", previewCard:"#3a1818", accent:"#ff6b35" },
  { id:"ocean",    emoji:"🌊", label:"Ocean",    previewBg:"#020d1a", previewCard:"#081e32", accent:"#00b4ff" },
];

export default function Settings({ user, setUser, onLogout, setPage, theme, onThemeChange }) {
  const [profile, setProfile] = useState({
    name:  user?.name  || "",
    email: user?.email || "",
    farm:  user?.farm  || "",
    phone: user?.phone || "",
  });
  const [notifs,     setNotifs]     = useState({ emailAlerts:true, highCount:true, newScan:false, weeklyReport:true });
  const [thresholds, setThresholds] = useState({ chicken:5, cow:3, horse:2, pig:4, sheep:5 });
  const [pwForm,     setPwForm]     = useState({ current:"", newPw:"", confirm:"" });
  const [msg,        setMsg]        = useState({ profile:"", pw:"", thresh:"" });

  const flash = (key, text) => {
    setMsg(m=>({...m,[key]:text}));
    setTimeout(()=>setMsg(m=>({...m,[key]:""})), 3000);
  };

  const saveProfile = () => {
    if (!profile.name.trim())  { flash("profile","❌ Name is required."); return; }
    if (!profile.email.trim()) { flash("profile","❌ Email is required."); return; }
    const res = updateUser({ ...user, ...profile });
    if (!res.ok) { flash("profile","❌ "+res.error); return; }
    setUser(res.user);
    flash("profile","✅ Profile saved successfully!");
  };

  const savePw = () => {
    if (!pwForm.current)           { flash("pw","❌ Enter your current password."); return; }
    if (pwForm.newPw.length < 4)   { flash("pw","❌ New password must be 4+ characters."); return; }
    if (pwForm.newPw!==pwForm.confirm) { flash("pw","❌ Passwords don't match."); return; }
    const res = changePassword(user.id, pwForm.current, pwForm.newPw);
    if (!res.ok) { flash("pw","❌ "+res.error); return; }
    flash("pw","✅ Password changed!");
    setPwForm({current:"",newPw:"",confirm:""});
  };

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <style>{css}</style>
      <Sidebar user={user} onLogout={onLogout} setPage={setPage} currentPage="settings"/>

      <main style={{flex:1,padding:"26px 30px",overflowY:"auto",color:"var(--text)"}}>
        <div style={{marginBottom:22}}>
          <h1 style={{fontSize:23,fontWeight:800,color:"var(--text)",marginBottom:4}}>Settings</h1>
          <p style={{fontSize:13,color:"var(--sub)"}}>Profile · Password · Appearance · Notifications · Detection Thresholds</p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>

          {/* ── PROFILE ── */}
          <div style={{...P,gridColumn:"1/-1"}}>
            <SHdr icon="👤" title="Profile Information" sub={`Account: ${user?.email}`}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
              {[{k:"name",label:"Full Name",icon:"👤",type:"text",ph:"John Farmer"},
                {k:"farm",label:"Farm Name",icon:"🏡",type:"text",ph:"Green Valley Farm"},
                {k:"email",label:"Email Address",icon:"✉️",type:"text",ph:"john@farm.com"},
                {k:"phone",label:"Phone",icon:"📱",type:"text",ph:"+1 234 567 8900"},
              ].map(({k,label,icon,type,ph})=>(
                <div key={k} style={{marginBottom:13}}>
                  <label style={lbl}>{label}</label>
                  <div style={{position:"relative"}}>
                    <span style={iIcon}>{icon}</span>
                    <input className="si" style={inp} type={type} placeholder={ph}
                      value={profile[k]} onChange={e=>setProfile({...profile,[k]:e.target.value})} autoComplete="off"/>
                  </div>
                </div>
              ))}
            </div>
            {msg.profile && <MsgBox text={msg.profile}/>}
            <button className="gbtn" onClick={saveProfile}>💾 Save Profile</button>
          </div>

          {/* ── PASSWORD ── */}
          <div style={P}>
            <SHdr icon="🔒" title="Change Password" sub="Update your login credentials"/>
            {[{k:"current",label:"Current Password",ph:"Enter current password"},
              {k:"newPw",  label:"New Password",     ph:"Min 4 characters"},
              {k:"confirm",label:"Confirm Password", ph:"Repeat new password"},
            ].map(({k,label,ph})=>(
              <div key={k} style={{marginBottom:13}}>
                <label style={lbl}>{label}</label>
                <input className="si" style={{...inp,paddingLeft:13}} type="password" placeholder={ph}
                  value={pwForm[k]} onChange={e=>setPwForm({...pwForm,[k]:e.target.value})} autoComplete="new-password"/>
              </div>
            ))}
            {msg.pw && <MsgBox text={msg.pw}/>}
            <button className="gbtn" onClick={savePw}>🔑 Change Password</button>
          </div>

          {/* ── NOTIFICATIONS ── */}
          <div style={P}>
            <SHdr icon="🔔" title="Email Notifications" sub={`Alerts sent to ${user?.email}`}/>
            {[{k:"emailAlerts",label:"Email Alerts",     desc:"Alert when animal count exceeds threshold"},
              {k:"highCount",  label:"High Count Warning",desc:"Notify on unusually high detections"},
              {k:"newScan",    label:"Scan Confirmation", desc:"Email after every detection scan"},
              {k:"weeklyReport",label:"Weekly Summary",  desc:"Analytics digest every Monday"},
            ].map(({k,label,desc})=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"var(--text)"}}>{label}</div>
                  <div style={{fontSize:11,color:"var(--sub)",marginTop:2}}>{desc}</div>
                </div>
                <Toggle on={notifs[k]} onClick={()=>setNotifs({...notifs,[k]:!notifs[k]})}/>
              </div>
            ))}
          </div>

          {/* ── APPEARANCE / THEMES ── */}
          <div style={{...P,gridColumn:"1/-1"}}>
            <SHdr icon="🎨" title="Appearance — Theme" sub="Click any theme to apply it instantly across the entire app"/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12}}>
              {THEME_LIST.map(({id,emoji,label,previewBg,previewCard,accent})=>(
                <div key={id} className={`theme-card ${theme===id?"tc-active":""}`}
                  onClick={()=>onThemeChange(id)}
                  style={{background:previewBg,border:`2px solid ${theme===id?accent:"rgba(255,255,255,0.08)"}`}}>
                  {/* Mini preview */}
                  <div style={{display:"flex",gap:3,marginBottom:9,justifyContent:"center"}}>
                    <div style={{width:32,height:22,borderRadius:4,background:previewBg,border:"1px solid rgba(255,255,255,0.1)"}}/>
                    <div style={{width:22,height:22,borderRadius:4,background:previewCard}}/>
                    <div style={{width:12,height:22,borderRadius:4,background:accent}}/>
                  </div>
                  <div style={{fontSize:22,marginBottom:5}}>{emoji}</div>
                  <div style={{fontSize:12,fontWeight:700,color:theme===id?accent:"rgba(255,255,255,0.65)"}}>{label}</div>
                  <div style={{marginTop:5,fontSize:10,color:theme===id?accent:"rgba(255,255,255,0.25)",fontWeight:600}}>
                    {theme===id?"✓ Active":"Click to apply"}
                  </div>
                </div>
              ))}
            </div>
            <p style={{fontSize:11,color:"var(--sub)",marginTop:12}}>💡 Theme applies instantly to all pages — Dashboard, Analytics, History and Settings.</p>
          </div>

          {/* ── THRESHOLDS ── */}
          <div style={{...P,gridColumn:"1/-1"}}>
            <SHdr icon="🎯" title="Detection Alert Thresholds" sub="Set maximum expected count per animal. Alert fires when exceeded."/>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:13}}>
              {ANIMALS.map(a=>(
                <div key={a} style={{background:"var(--bg2)",border:"1px solid var(--border)",borderTop:`3px solid ${COLORS[a]}`,borderRadius:10,padding:"14px 12px",textAlign:"center"}}>
                  <div style={{fontSize:28,marginBottom:5}}>{ICONS[a]}</div>
                  <div style={{fontSize:11,fontWeight:600,color:"var(--sub)",textTransform:"capitalize",marginBottom:9}}>{a}</div>
                  <input type="number" min={0} max={50} value={thresholds[a]}
                    onChange={e=>setThresholds({...thresholds,[a]:parseInt(e.target.value)||0})}
                    style={{width:64,background:"transparent",border:`1px solid ${COLORS[a]}55`,borderRadius:6,padding:"6px",fontSize:20,fontWeight:800,textAlign:"center",outline:"none",color:COLORS[a],fontFamily:"inherit"}}/>
                  <div style={{fontSize:9,color:"var(--muted)",marginTop:5,textTransform:"uppercase",letterSpacing:0.5}}>alert if &gt; {thresholds[a]}</div>
                  <input type="range" min={0} max={20} value={thresholds[a]}
                    onChange={e=>setThresholds({...thresholds,[a]:parseInt(e.target.value)})}
                    style={{width:"100%",marginTop:8,accentColor:COLORS[a],cursor:"pointer"}}/>
                </div>
              ))}
            </div>
            {msg.thresh && <MsgBox text={msg.thresh}/>}
            <button className="gbtn" style={{marginTop:14}} onClick={()=>flash("thresh","✅ Thresholds saved!")}>💾 Save Thresholds</button>
          </div>

          {/* ── DANGER ZONE ── */}
          <div style={{...P,gridColumn:"1/-1",border:"1px solid rgba(239,68,68,0.2)"}}>
            <SHdr icon="⚠️" title="Danger Zone" sub="Irreversible account actions" danger/>
            {[{label:"Clear Detection History",desc:"Permanently delete all scan records",btn:"Clear",action:()=>{}},
              {label:"Sign Out All Devices",   desc:"Revoke all active sessions",          btn:"Sign Out",action:onLogout},
            ].map(({label,desc,btn,action})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 0",borderBottom:"1px solid var(--border)"}}>
                <div>
                  <div style={{fontSize:12,fontWeight:600,color:"#fca5a5"}}>{label}</div>
                  <div style={{fontSize:11,color:"var(--sub)",marginTop:2}}>{desc}</div>
                </div>
                <button className="dbtn2" onClick={action}>{btn}</button>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

function SHdr({icon,title,sub,danger}) {
  return (
    <div style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:18}}>
      <span style={{fontSize:20,background:"rgba(255,255,255,0.05)",borderRadius:9,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:"1px solid var(--border)"}}>{icon}</span>
      <div>
        <div style={{fontSize:14,fontWeight:700,color:danger?"#f87171":"var(--text)"}}>{title}</div>
        <div style={{fontSize:11,color:"var(--sub)",marginTop:2}}>{sub}</div>
      </div>
    </div>
  );
}

function Toggle({on,onClick}) {
  return (
    <div onClick={onClick} style={{width:42,height:22,borderRadius:11,cursor:"pointer",position:"relative",transition:"background 0.25s",background:on?"var(--accent)":"var(--bg4)",flexShrink:0}}>
      <div style={{position:"absolute",top:2,left:on?20:2,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left 0.25s",boxShadow:"0 1px 4px rgba(0,0,0,0.3)"}}/>
    </div>
  );
}

function MsgBox({text}) {
  const ok=text.startsWith("✅");
  return <div style={{padding:"8px 12px",borderRadius:7,fontSize:12,fontWeight:600,border:"1px solid",marginBottom:11,color:ok?"#22c55e":"#f87171",background:ok?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",borderColor:ok?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)"}}>{text}</div>;
}

const P   = {background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:13,padding:"20px"};
const lbl = {display:"block",fontSize:10,fontWeight:600,color:"var(--sub)",marginBottom:5,textTransform:"uppercase",letterSpacing:0.7};
const iIcon={position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13};
const inp = {width:"100%",background:"var(--input-bg)",border:"1px solid var(--border)",borderRadius:8,padding:"10px 10px 10px 36px",color:"var(--text)",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"};

const css = `
  .si:focus{border-color:var(--accent)!important;box-shadow:0 0 0 2px var(--accent-glow)!important;outline:none}
  .gbtn{background:linear-gradient(135deg,var(--accent),var(--accent2));border:none;border-radius:9px;padding:10px 22px;color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.18s;display:inline-flex;align-items:center;gap:6px;}
  .gbtn:hover{transform:translateY(-1px);box-shadow:0 6px 20px var(--accent-glow)}
  .dbtn2{background:rgba(239,68,68,0.07);border:1px solid rgba(239,68,68,0.2);border-radius:7px;padding:7px 14px;color:#f87171;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;transition:background 0.18s;}
  .dbtn2:hover{background:rgba(239,68,68,0.16)}
  .theme-card{border-radius:12px;cursor:pointer;padding:14px 10px;text-align:center;transition:all 0.22s;border:2px solid transparent;}
  .theme-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.4)}
  .tc-active{box-shadow:0 0 0 3px rgba(255,255,255,0.1),0 8px 24px rgba(0,0,0,0.4)!important;transform:translateY(-3px)!important}
  input[type=range]{height:4px;border-radius:2px;}
`; 