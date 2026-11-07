import { useState } from "react";
import Sidebar from "../components/Sidebar";

const ANIMALS = ["chicken","cow","horse","pig","sheep"];
const COLORS  = {chicken:"#f59e0b",cow:"#22c55e",horse:"#8b5cf6",pig:"#ec4899",sheep:"#38bdf8"};
const ICONS   = {chicken:"🐔",cow:"🐄",horse:"🐎",pig:"🐷",sheep:"🐑"};

export default function History({user,onLogout,setPage,detectionHistory}) {
  const [filter,setFilter]=[useState("all")[0],useState("all")[1]];
  const [sortBy,setSortBy]=useState("newest");
  const [search,setSearch]=useState("");
  const [filt,  setFilt  ]=useState("all");

  let records=[...detectionHistory];
  if(filt!=="all") records=records.filter(r=>r.source===filt);
  if(search) records=records.filter(r=>r.fileName.toLowerCase().includes(search.toLowerCase())||ANIMALS.some(a=>a.includes(search.toLowerCase())&&r.counts[a]>0));
  if(sortBy==="oldest") records=[...records].reverse();
  if(sortBy==="most")   records=[...records].sort((a,b)=>b.total-a.total);
  if(sortBy==="least")  records=[...records].sort((a,b)=>a.total-b.total);

  const totalAnimals=detectionHistory.reduce((s,r)=>s+r.total,0);

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"var(--bg)"}}>
      <style>{css}</style>
      <Sidebar user={user} onLogout={onLogout} setPage={setPage} currentPage="history"/>
      <main style={{flex:1,padding:"26px 30px",overflowY:"auto",color:"var(--text)"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <h1 style={{fontSize:23,fontWeight:800,color:"var(--text)",marginBottom:4}}>Detection History</h1>
            <p style={{fontSize:13,color:"var(--sub)"}}>{detectionHistory.length} scans · {totalAnimals} total animals detected</p>
          </div>
          {detectionHistory.length>0&&(
            <div style={{display:"flex",gap:8}}>
              <span style={{background:"var(--accent-glow)",border:"1px solid var(--accent)",borderRadius:20,padding:"6px 12px",fontSize:11,color:"var(--accent)",fontWeight:600}}>{detectionHistory.length} records</span>
              <span style={{background:"var(--accent2-glow)",border:"1px solid var(--accent2)",borderRadius:20,padding:"6px 12px",fontSize:11,color:"var(--accent2)",fontWeight:600}}>{totalAnimals} animals</span>
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",gap:7}}>
            {[["all","All"],["image","📷 Image"],["video","🎬 Video"],["live","📡 Live"]].map(([id,label])=>(
              <button key={id} onClick={()=>setFilt(id)} className="fbtn"
                style={{background:filt===id?"var(--accent-glow)":"transparent",color:filt===id?"var(--accent)":"var(--sub)",borderColor:filt===id?"var(--accent)":"var(--border)"}}>
                {label}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:8}}>
            <input className="sinp" placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)}/>
            <select className="ssel" value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="most">Most Animals</option>
              <option value="least">Least Animals</option>
            </select>
          </div>
        </div>

        {records.length===0 ? (
          <div style={{textAlign:"center",padding:"60px 32px",color:"var(--muted)"}}>
            <div style={{fontSize:48,marginBottom:14}}>📁</div>
            <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>{detectionHistory.length===0?"No detection history yet":"No results match your filter"}</div>
            <div style={{fontSize:12}}>{detectionHistory.length===0?"Go to the Dashboard, upload media and click Detect Animals.":"Try adjusting your search or filters."}</div>
            {detectionHistory.length===0&&(
              <button className="fbtn" onClick={()=>setPage("dashboard")}
                style={{marginTop:16,padding:"10px 22px",background:"var(--accent-glow)",border:"1px solid var(--accent)",color:"var(--accent)",fontSize:13,fontWeight:700}}>
                → Go to Dashboard
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{fontSize:12,color:"var(--muted)",marginBottom:11}}>Showing {records.length} of {detectionHistory.length} records</div>
            <div style={{display:"flex",flexDirection:"column",gap:9}}>
              {records.map(r=>(
                <div key={r.id} className="hrow">
                  <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",minWidth:26,textAlign:"center"}}>#{detectionHistory.indexOf(r)+1}</div>
                  <div style={{fontSize:22,minWidth:30,textAlign:"center"}}>{r.source==="image"?"🖼️":r.source==="video"?"🎬":"📡"}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{r.fileName}</div>
                    <div style={{fontSize:10,color:"var(--sub)",marginTop:2}}>{r.timestamp} · {r.source}</div>
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",flex:2}}>
                    {ANIMALS.map(a=>r.counts[a]>0&&(
                      <span key={a} style={{fontSize:11,fontWeight:700,background:COLORS[a]+"18",border:`1px solid ${COLORS[a]}44`,borderRadius:5,padding:"3px 7px",color:COLORS[a],display:"flex",alignItems:"center",gap:3}}>
                        {ICONS[a]} {r.counts[a]}
                      </span>
                    ))}
                    {ANIMALS.every(a=>!r.counts[a])&&<span style={{fontSize:11,color:"var(--muted)"}}>No animals detected</span>}
                  </div>
                  <div style={{textAlign:"right",minWidth:48}}>
                    <div style={{fontSize:20,fontWeight:800,color:r.total>0?"var(--accent)":"var(--muted)"}}>{r.total}</div>
                    <div style={{fontSize:9,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5}}>total</div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const css=`
  .fbtn{font-size:12px;padding:7px 13px;border-radius:8px;border:1px solid;cursor:pointer;font-weight:600;transition:all 0.18s;font-family:inherit;}
  .fbtn:hover{opacity:0.82}
  .sinp{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 13px;color:var(--text);font-size:12px;outline:none;min-width:220px;font-family:inherit;}
  .sinp:focus{border-color:var(--accent2)!important;box-shadow:0 0 0 2px var(--accent2-glow)}
  .ssel{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:8px 11px;color:var(--sub);font-size:12px;outline:none;cursor:pointer;font-family:inherit;}
  .ssel option{background:var(--bg3)}
  .hrow{display:flex;align-items:center;gap:13px;padding:11px 15px;background:var(--bg3);border:1px solid var(--border);border-radius:10px;transition:all 0.18s;}
  .hrow:hover{border-color:var(--accent2)!important;background:var(--bg2)!important}
`;