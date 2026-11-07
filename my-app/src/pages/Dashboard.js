import { useState, useRef } from "react";
import Sidebar from "../components/Sidebar";

/* ================= CONSTANTS ================= */

const ANIMALS = ["chicken","cow","horse","pig","sheep"];

const COLORS = {
  chicken:"#f59e0b",
  cow:"#22c55e",
  horse:"#8b5cf6",
  pig:"#ec4899",
  sheep:"#38bdf8"
};

const ICONS = {
  chicken:"🐔",
  cow:"🐄",
  horse:"🐎",
  pig:"🐷",
  sheep:"🐑"
};

const API_URL = "http://127.0.0.1:5000";

/* ================= API ================= */

async function uploadToBackend(file) {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) throw new Error(`Backend error ${res.status}`);
  return res.json();
}

/* ================= DONUT ================= */

function DonutChart({ counts }) {
  const total = Object.values(counts).reduce((a,b)=>a+b,0) || 1;
  const R = 52, cx = 80, cy = 80, C = 2*Math.PI*R;
  let cum = 0;

  const segs = ANIMALS.map(a=>{
    const p = (counts[a]||0)/total;
    const d = C*p;
    const off = C*(1-cum);
    cum += p;
    return {a,p,d,off};
  }).filter(s=>s.p>0);

  return (
    <div style={{display:"flex",alignItems:"center",gap:20}}>
      <svg width={160} height={160}>
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--bg4)" strokeWidth={20}/>
        {segs.map(s=>(
          <circle key={s.a} cx={cx} cy={cy} r={R} fill="none"
            stroke={COLORS[s.a]} strokeWidth={20}
            strokeDasharray={`${s.d} ${C-s.d}`}
            strokeDashoffset={s.off}
            style={{transform:"rotate(-90deg)",transformOrigin:`${cx}px ${cy}px`}}
          />
        ))}
        <text x={cx} y={cy-6} textAnchor="middle" fill="var(--text)" fontSize={22} fontWeight={800}>
          {Object.values(counts).reduce((a,b)=>a+b,0)}
        </text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="var(--sub)" fontSize={10}>
          TOTAL
        </text>
      </svg>

      <div style={{flex:1,display:"flex",flexDirection:"column",gap:9}}>
        {ANIMALS.map(a=>{
          const max = Math.max(...Object.values(counts),1);
          return (
            <div key={a} style={{display:"flex",alignItems:"center",gap:8}}>
              <span>{ICONS[a]}</span>
              <span style={{fontSize:11,color:"var(--sub)",width:60}}>{a}</span>
              <div style={{flex:1,height:6,background:"var(--bg4)",borderRadius:3}}>
                <div style={{height:"100%",background:COLORS[a],width:`${(counts[a]/max)*100}%`}}/>
              </div>
              <span style={{fontWeight:800,color:counts[a]?COLORS[a]:"var(--muted)"}}>
                {counts[a]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ================= DASHBOARD ================= */

export default function Dashboard({user,onLogout,setPage,detectionHistory,addDetection}) {

  const [tab,setTab] = useState("image");
  const [counts,setCounts] = useState({chicken:0,cow:0,horse:0,pig:0,sheep:0});
  const [status,setStatus] = useState("idle");
  const [preview,setPreview] = useState(null);
  const [fileName,setFileName] = useState("");
  const fileRef = useRef();

  const onFile = e => {
    const f = e.target.files[0];
    if(!f) return;
    setFileName(f.name);
    setPreview(URL.createObjectURL(f));
    setCounts({chicken:0,cow:0,horse:0,pig:0,sheep:0});
    setStatus("idle");
  };

  const detect = async () => {
    if(status==="detecting" || tab==="live") return;
    if(!fileRef.current?.files[0]) return;

    try {
      setStatus("detecting");
      const file = fileRef.current.files[0];
      const res = await uploadToBackend(file);

      const record = {
        id: crypto.randomUUID(),
        timestamp: new Date().toLocaleString(),
        source: tab,
        fileName: file.name,
        counts: res.counts,
        total: Object.values(res.counts).reduce((a,b)=>a+b,0)
      };

      setCounts(res.counts);
      addDetection(record);          // ⭐ FIXED
      setStatus("done");

    } catch(err) {
      setStatus("error");
      alert(err.message);
    }
  };

  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const topA = Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <Sidebar user={user} onLogout={onLogout} setPage={setPage} currentPage="dashboard"/>

      <main style={{flex:1,padding:30,color:"var(--text)"}}>

        <h1>Detection Dashboard</h1>
        <p style={{color:"var(--sub)"}}>Welcome {user?.name}</p>

        {/* ================= TABS ================= */}
        <div style={{display:"flex",gap:6,marginBottom:15}}>
          {["image","video","live"].map(t=>(
            <button key={t} onClick={()=>{setTab(t);setPreview(null);setFileName("");setCounts({chicken:0,cow:0,horse:0,pig:0,sheep:0});}}
              style={{padding:"6px 14px",borderRadius:8,border:"1px solid var(--border)",color:tab===t?"var(--accent)":"var(--sub)"}}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>

        {/* ================= INPUT ================= */}
        <div className="drop" onClick={()=>tab!=="live"&&fileRef.current?.click()}>
          {tab==="live" ? (
            <img src={`${API_URL}/video_feed`} alt="Live" style={{width:"100%",borderRadius:10}}/>
          ) : preview ? (
            tab==="image"
              ? <img src={preview} alt="" style={{maxHeight:180}}/>
              : <video src={preview} controls style={{maxHeight:180}}/>
          ) : (
            <p>Click to upload {tab}</p>
          )}
          <input ref={fileRef} type="file" accept={tab==="image"?"image/*":"video/*"} style={{display:"none"}} onChange={onFile}/>
        </div>

        <button onClick={detect} disabled={status==="detecting"||tab==="live"} style={{marginTop:12}}>
          {status==="detecting"?"Detecting...":"Detect Animals"}
        </button>

        {/* ================= RESULT ================= */}
        {status==="done" && (
          <>
            <h3>{total} animals detected</h3>
            <DonutChart counts={counts}/>
            <button onClick={()=>setPage("analytics")}>View Analytics →</button>
          </>
        )}

      </main>
    </div>
  );
}