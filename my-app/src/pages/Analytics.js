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

/* ================= EMPTY ================= */

function Empty(){
  return(
    <div style={{textAlign:"center",padding:"25px",color:"#777"}}>
      No detection data yet. Run detection first.
    </div>
  );
}

/* ================= BAR CHART ================= */

function BarChart({data=[]}){

  if(!data.length) return <Empty/>;

  const max = Math.max(
    ...ANIMALS.flatMap(a => data.map(d => d[a] || 0)),
    1
  );

  return(
    <div style={{display:"flex",alignItems:"flex-end",height:160,gap:8}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,textAlign:"center"}}>
          <div style={{display:"flex",gap:2,alignItems:"flex-end",height:130}}>
            {ANIMALS.map(a=>(
              <div
                key={a}
                title={`${a}: ${d[a]||0}`}
                style={{
                  flex:1,
                  background:COLORS[a],
                  height:`${((d[a]||0)/max)*100}%`,
                  borderRadius:"3px 3px 0 0"
                }}
              />
            ))}
          </div>
          <div style={{fontSize:10,marginTop:4}}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ================= LINE CHART ================= */

function LineChart({data=[]}){

  if(!data.length) return <Empty/>;

  const max = Math.max(
    ...ANIMALS.flatMap(a => data.map(d => d?.[a] || 0)),
    1
  );

  const width = 400;
  const height = 140;
  const pad = 20;

  const getPoints = (animal) =>
    data.map((d,i)=>({
      x: pad + (i/(data.length-1 || 1))*(width-pad*2),
      y: height-pad-((d[animal]||0)/max)*(height-pad*2)
    }));

  return(
    <svg viewBox={`0 0 ${width} ${height}`} style={{width:"100%"}}>
      {ANIMALS.map(a=>{
        const pts = getPoints(a);
        const line = pts.map((p,i)=>`${i===0?"M":"L"}${p.x},${p.y}`).join(" ");
        return (
          <path
            key={a}
            d={line}
            fill="none"
            stroke={COLORS[a]}
            strokeWidth="2"
          />
        );
      })}
    </svg>
  );
}

/* ================= ANALYTICS ================= */

export default function Analytics({
  user,
  onLogout,
  setPage,
  detectionHistory = []
}){

  /* ---------- TOTAL COUNTS ---------- */

  const totals = {
    chicken:0,
    cow:0,
    horse:0,
    pig:0,
    sheep:0
  };

  detectionHistory.forEach(r=>{
    ANIMALS.forEach(a=>{
      totals[a] += r.counts?.[a] || 0;
    });
  });

  const grandTotal = Object.values(totals).reduce((a,b)=>a+b,0);

  /* ---------- CHART DATA ---------- */

  const lineData = detectionHistory
    .slice(-10)
    .map((r,i)=>({
      label: `#${i+1}`,
      ...(r.counts || {})
    }));

  /* ---------- STATS ---------- */

  const stats = ANIMALS.map(a=>({
    name: a,
    total: totals[a],
    avg: detectionHistory.length
      ? (totals[a]/detectionHistory.length).toFixed(1)
      : 0,
    max: detectionHistory.length
      ? Math.max(...detectionHistory.map(r=>r.counts?.[a]||0))
      : 0,
    pct: grandTotal
      ? ((totals[a]/grandTotal)*100).toFixed(1)
      : 0
  }));

  /* ================= RENDER ================= */

  return(
    <div style={{display:"flex",minHeight:"100vh",background:"#0f172a",color:"white"}}>

      <Sidebar
        user={user}
        onLogout={onLogout}
        setPage={setPage}
        currentPage="analytics"
      />

      <main style={{flex:1,padding:30}}>

        <h1 style={{fontSize:26,fontWeight:700,marginBottom:20}}>
          Analytics Dashboard
        </h1>

        <p style={{marginBottom:25,color:"#aaa"}}>
          {detectionHistory.length} scans • {grandTotal} animals detected
        </p>

        {/* ================= SUMMARY ================= */}

        <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:15,marginBottom:30}}>
          {stats.map(s=>(
            <div
              key={s.name}
              style={{
                background:"#1e293b",
                padding:15,
                borderRadius:10,
                borderTop:`3px solid ${COLORS[s.name]}`
              }}
            >
              <div style={{fontSize:28}}>{ICONS[s.name]}</div>
              <div style={{fontSize:22,fontWeight:700,color:COLORS[s.name]}}>
                {s.total}
              </div>
              <div style={{fontSize:12,marginBottom:6}}>
                {s.name}
              </div>
              <div style={{fontSize:11,color:"#aaa"}}>Avg: {s.avg}</div>
              <div style={{fontSize:11,color:"#aaa"}}>Max: {s.max}</div>
              <div style={{fontSize:11,color:"#aaa"}}>Share: {s.pct}%</div>
            </div>
          ))}
        </div>

        {/* ================= CHARTS ================= */}

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          <div style={{background:"#1e293b",padding:20,borderRadius:10}}>
            <h3 style={{marginBottom:10}}>Bar Chart</h3>
            <BarChart data={lineData}/>
          </div>

          <div style={{background:"#1e293b",padding:20,borderRadius:10}}>
            <h3 style={{marginBottom:10}}>Trend Chart</h3>
            <LineChart data={lineData}/>
          </div>
        </div>

        {/* ================= HISTORY ================= */}

        <div style={{marginTop:30,background:"#1e293b",padding:20,borderRadius:10}}>
          <h3 style={{marginBottom:15}}>Detection History</h3>

          {detectionHistory.length === 0 ? <Empty/> : (
            <div style={{display:"grid",gap:10}}>
              {detectionHistory.map((r,i)=>(
                <div key={r.id || i} style={{background:"#0f172a",padding:12,borderRadius:6}}>
                  <div style={{fontSize:12,color:"#aaa"}}>{r.timestamp}</div>
                  <div style={{fontWeight:600}}>
                    {r.source?.toUpperCase()} • {r.total} animals
                  </div>
                  <div style={{marginTop:5,fontSize:12}}>
                    {ANIMALS.map(a =>
                      r.counts?.[a] > 0 && (
                        <span key={a} style={{marginRight:10,color:COLORS[a]}}>
                          {ICONS[a]} {r.counts[a]}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}