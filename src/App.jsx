import React, { useEffect, useMemo, useState } from "react";

// Soft reset so the prototype feels fresh on reload
if (typeof window !== "undefined") {
  try {
    ["pf_user","pf_appts","pf_chat","pf_recovery"].forEach(k=>localStorage.removeItem(k));
  } catch {}
}

// THEME (orange)
const theme = {
  bg: "#FFFBF7",
  surface: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#F3E8E2",
  accent: "#F97316",
  accentSoft: "#FED7AA",
};

const css = `
  :root{
    --bg:${theme.bg};
    --surface:${theme.surface};
    --text:${theme.text};
    --muted:${theme.muted};
    --border:${theme.border};
    --accent:${theme.accent};
    --accentSoft:${theme.accentSoft};
  }
  *{box-sizing:border-box}
  .app{max-width:420px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:var(--bg)}
  header{position:sticky;top:0;background:rgba(255,255,255,.9);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--border);z-index:10}
  .hwrap{display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
  .title{font-weight:800}
  .iconbtn{width:36px;height:36px;border-radius:12px;border:1px solid var(--border);display:grid;place-items:center;background:var(--surface)}
  main{flex:1;padding:16px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:0 6px 20px rgba(2,6,23,.06)}
  .btn{height:44px;border-radius:12px;border:1px solid transparent;background:var(--accent);color:#fff;font-weight:700;display:inline-grid;place-items:center;padding:0 16px}
  .btn.secondary{background:#fff;color:var(--text);border-color:var(--border)}
  .btn.ghost{background:transparent;border-color:var(--border);color:var(--text)}
  .btn.warn{background:#fff;color:#9a3412;border-color:#fb923c}
  .btn:disabled{opacity:.6}
  .badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--border);background:#fff;color:var(--muted)}
  .badge.attn{border-color:#fb923c;color:#9a3412;background:#FFF1E6}
  .field{display:grid;gap:6px}
  .label{font-size:12px;color:var(--muted)}
  .input, select, .textarea{height:44px;border-radius:12px;border:1px solid var(--border);padding:0 12px;background:#fff;color:var(--text)}
  .textarea{height:88px;padding:10px 12px}
  .row{display:flex;gap:12px}
  .stack{display:grid;gap:12px}
  .center{display:grid;place-items:center}
  .logo{width:96px;height:96px;border-radius:28px;background:linear-gradient(135deg,var(--accentSoft),var(--accent));display:grid;place-items:center;color:#fff;font-weight:800;font-size:28px;box-shadow:0 10px 30px rgba(249,115,22,.25)}
  .pet{width:120px;height:120px;border-radius:999px;background:#FFF7ED;display:grid;place-items:center;font-size:56px;border:1px solid var(--border);cursor:pointer}
  .stat{display:grid;gap:6px}
  .bar{height:12px;border-radius:999px;background:#FFEAD5;overflow:hidden}
  .bar>span{display:block;height:100%;background:var(--accent)}
  .tabs{position:sticky;bottom:0;background:rgba(255,255,255,.98);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid var(--border)}
  .tabbar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}
  .tab{height:44px;border-radius:12px;border:1px solid var(--border);background:#fff;display:grid;place-items:center;font-size:12px;color:var(--muted)}
  .tab.active{background:var(--accent);color:#fff;border-color:transparent;font-weight:700}
  .hint{font-size:12px;color:var(--muted)}
  .list{display:grid;gap:8px}
  .item{padding:10px 12px;border-radius:12px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;background:#fff}
  .grid7{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .day{height:42px;border-radius:10px;border:1px solid var(--border);display:grid;place-items:center;background:#fff;font-size:12px;position:relative}
`;

// utils
const fmtDate = (d)=>d.toISOString().slice(0,10);
const todayStr = ()=>fmtDate(new Date());
function startOfMonth(date){return new Date(date.getFullYear(),date.getMonth(),1);}
function endOfMonth(date){return new Date(date.getFullYear(),date.getMonth()+1,0);}
function addMonths(date,n){return new Date(date.getFullYear(),date.getMonth()+n,1);}
function addDays(date,n){const d=new Date(date);d.setDate(d.getDate()+n);return d;}
function getMonthCells(base){
  const s=startOfMonth(base), e=endOfMonth(base); const cells=[];
  for(let i=0;i<s.getDay();i++) cells.push(null);
  for(let d=1;d<=e.getDate();d++) cells.push(new Date(base.getFullYear(),base.getMonth(),d));
  while(cells.length%7!==0) cells.push(null);
  return cells;
}
const clamp = (n,min=0,max=100)=>Math.max(min,Math.min(max,n));

// local storage hook
const LS = { user:"pf_user", appts:"pf_appts", chat:"pf_chat", recovery:"pf_recovery" };
const useLS = (key, init) => {
  const [v,setV] = useState(()=>{
    try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):init;}catch{return init;}
  });
  useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(v));}catch{}},[key,v]);
  return [v,setV];
};

// patient mock therapists
const THERAPISTS = [
  { id:"t1", name:"Dr. Maya Chen", rating:4.9, distance:"0.8 km", specialty:"Sports rehab" },
  { id:"t2", name:"Alexei Morozov", rating:4.8, distance:"1.2 km", specialty:"Post‑injury recovery" },
  { id:"t3", name:"Laura García", rating:4.7, distance:"2.0 km", specialty:"Back & shoulder" },
  { id:"t4", name:"Sam O’Connor", rating:4.6, distance:"1.5 km", specialty:"Knee & ankle" },
  { id:"t5", name:"Haruka Tanaka", rating:4.9, distance:"0.6 km", specialty:"Athletic training" },
];

const DAILY_EXERCISES = [
  "Gentle warm-up (5 min)",
  "Mobility drills (5 min)",
  "Light strength work (5 min)",
];

// doctor mock base
const BASE_DOCTOR_CLIENTS = [
  { id:"c1", name:"Emma Johnson", injury:"Knee ACL", progress:72, missedDays:0, new:true,  feelBad:false },
  { id:"c2", name:"David Kim",  injury:"Lumbar strain", progress:55, missedDays:2, new:false, feelBad:false }, // alert: skipped days
  { id:"c3", name:"Lucas Meyer", injury:"Shoulder impingement", progress:40, missedDays:0, new:false, feelBad:false },
  { id:"c4", name:"Sara Lee",   injury:"Lower back", progress:100, missedDays:0, new:false, feelBad:false },  // finished
  { id:"c5", name:"Noah Schmidt", injury:"Ankle sprain", progress:20, missedDays:0, new:true, feelBad:false },
  { id:"c6", name:"Chloe Martin", injury:"Patellofemoral pain", progress:35, missedDays:1, new:false, feelBad:true }, // alert: feels unwell
];

const DOCTOR_APPTS = [
  { id:"a1", clientId:"c1", date: todayStr(), time:"10:00", type:"Follow-up" },
  { id:"a2", clientId:"c2", date: todayStr(), time:"11:30", type:"Mobility session" },
  { id:"a3", clientId:"c3", date: fmtDate(addDays(new Date(),1)), time:"09:00", type:"Initial assessment" },
  { id:"a4", clientId:"c4", date: fmtDate(addDays(new Date(),3)), time:"15:00", type:"Re-evaluation" },
  { id:"a5", clientId:"c5", date: fmtDate(addDays(new Date(),2)), time:"16:00", type:"Initial assessment" },
  { id:"a6", clientId:"c6", date: fmtDate(addDays(new Date(),1)), time:"14:30", type:"Pain review" },
];

const INITIAL_DOCTOR_UNAVAIL = [
  { id:"u1", date: todayStr(), start:"08:00", end:"09:00", label:"Admin time" },
  { id:"u2", date: fmtDate(addDays(new Date(),2)), start:"12:00", end:"13:00", label:"Lunch" },
];

const EXERCISE_LIBRARY = ["Quad sets","Glute bridge","Step-downs"];

const INITIAL_DOCTOR_PLANS = [
  {
    id:"p1",
    injury:"Knee injury (ACL)",
    duration:"14 days",
    description:"Early ACL rehab: quad sets, bridges, step-downs.",
    days:[
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    ],
  },
  {
    id:"p2",
    injury:"Lower back pain",
    duration:"21 days",
    description:"Core stability and hip mobility focus.",
    days:[
      {exercises:[EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2],EXERCISE_LIBRARY[0]]},
      {exercises:[EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    ],
  },
];

// icons
const Icon = {
  profile:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 21c1.8-3.7 5-5.5 8-5.5s6.2 1.8 8 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  home:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.6"/></svg>),
  cal:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><rect x="3" y="5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.6"/><path d="M7 3v4M17 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  book:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 1-2-2V4Z" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
  chat:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 5V6Z" stroke="currentColor" strokeWidth="1.6"/></svg>),
  users:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.6"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.6"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.6"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.6"/></svg>),
  plan:(p)=>(<svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}><path d="M6 4h9l3 3v13H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6"/><path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>),
};

// Splash + role
function Splash({ onDone }){
  useEffect(()=>{const t=setTimeout(onDone,700);return()=>clearTimeout(t);},[onDone]);
  return(
    <div className="center" style={{minHeight:"100vh",padding:24}}>
      <style>{css}</style>
      <div className="stack" style={{placeItems:"center"}}>
        <div className="logo">PF</div>
        <div style={{fontWeight:800,fontSize:22}}>PocketFit</div>
        <div className="hint">Loading…</div>
      </div>
    </div>
  );
}
function RoleChoice({ onPatient,onDoctor }){
  return(
    <div style={{padding:16}}>
      <div className="stack" style={{gap:20}}>
        <div className="center" style={{marginTop:24}}>
          <div className="logo" style={{width:72,height:72,fontSize:22}}>PF</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:20}}>Welcome to PocketFit</div>
          <div className="hint">Choose how you want to use the app.</div>
        </div>
        <div className="stack">
          <button className="btn" onClick={onPatient}>I&apos;m a patient</button>
          <button className="btn secondary" onClick={onDoctor}>I&apos;m a doctor</button>
        </div>
      </div>
    </div>
  );
}

// PATIENT SIDE
const PatientRegister = ({ onSubmit }) => {
  const [name,setName]=useState(""); const [age,setAge]=useState("");
  const [injury,setInjury]=useState(""); const [needsTherapist,setNeedsTherapist]=useState("yes");
  const [planStatus,setPlanStatus]=useState("needs");
  const [weight,setWeight]=useState(""); const [height,setHeight]=useState(""); const [sportArea,setSportArea]=useState("");

  function handle(e){
    e.preventDefault();
    onSubmit({
      id:crypto.randomUUID(),
      name,age,injury,needsTherapist,planStatus,weight,height,sportArea,
      createdAt:new Date().toISOString(),
    });
  }
  return(
    <div style={{padding:16}}>
      <div className="stack" style={{gap:16}}>
        <div className="center" style={{marginTop:16}}>
          <div className="logo" style={{width:72,height:72,fontSize:22}}>PF</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:20}}>Create your profile</div>
          <div className="hint">A few details to personalise your recovery.</div>
        </div>
        <form onSubmit={handle} className="stack">
          <div className="field"><div className="label">Name</div><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div className="row">
            <div className="field" style={{flex:1}}><div className="label">Age</div><input className="input" type="number" value={age} onChange={e=>setAge(e.target.value)} required/></div>
            <div className="field" style={{flex:1}}><div className="label">Weight (kg)</div><input className="input" type="number" value={weight} onChange={e=>setWeight(e.target.value)}/></div>
          </div>
          <div className="row">
            <div className="field" style={{flex:1}}><div className="label">Height (cm)</div><input className="input" type="number" value={height} onChange={e=>setHeight(e.target.value)}/></div>
            <div className="field" style={{flex:1}}><div className="label">Sport area</div><input className="input" value={sportArea} onChange={e=>setSportArea(e.target.value)}/></div>
          </div>
          <div className="field"><div className="label">Type of injury</div><input className="input" value={injury} onChange={e=>setInjury(e.target.value)}/></div>
          <div className="field">
            <div className="label">Do you need a therapist?</div>
            <div className="row">
              <button type="button" className={`btn ${needsTherapist==="yes"?"":"secondary"}`} onClick={()=>setNeedsTherapist("yes")}>Yes</button>
              <button type="button" className={`btn ${needsTherapist==="no"?"":"secondary"}`} onClick={()=>setNeedsTherapist("no")}>No</button>
            </div>
          </div>
          <div className="field">
            <div className="label">Plan</div>
            <select className="input" value={planStatus} onChange={e=>setPlanStatus(e.target.value)}>
              <option value="needs">I need a plan</option>
              <option value="has">I already have one</option>
            </select>
          </div>
          <button className="btn" style={{marginTop:4}}>Continue to home</button>
        </form>
      </div>
    </div>
  );
};

const PatientHome = ({ user,recovery,setRecovery,goProfile }) => {
  const today = todayStr(); const planLength=14;
  const completedDays = Array.isArray(recovery.completedDays)?recovery.completedDays:[];
  const progress = clamp((completedDays.length/planLength)*100);
  const map = recovery.exercises || {}; const list = map[today] || [false,false,false];
  const doneToday = list.every(Boolean);
  const petType = recovery.petType || "dog";
  const petEmoji = petType==="cat"?"🐈":petType==="panda"?"🐼":"🐕";

  function toggle(i){
    setRecovery(prev=>{
      const m=prev.exercises||{};
      const l=m[today]?[...m[today]]:[false,false,false];
      l[i]=!l[i];
      const nm={...m,[today]:l};
      const cd=new Set(prev.completedDays||[]);
      if(l.every(Boolean)) cd.add(today);
      return {...prev,exercises:nm,completedDays:Array.from(cd)};
    });
  }
  function cyclePet(){
    const order=["dog","cat","panda"];
    const idx=order.indexOf(petType);
    const next=order[(idx+1+order.length)%order.length];
    setRecovery(prev=>({...prev,petType:next}));
  }

  return(
    <>
      <header>
        <div className="hwrap">
          <div className="title">PocketFit</div>
          <button className="iconbtn" onClick={goProfile}>{Icon.profile({})}</button>
        </div>
      </header>
      <main>
        <div className="card" style={{padding:16}}>
          <div className="center" style={{marginBottom:8}}>
            <div className="pet" style={{transform:`scale(${0.7+(progress/100)*0.8})`}} onClick={cyclePet}>
              {petEmoji}
            </div>
          </div>
          <div className="center"><div className="hint">Tap to switch: dog → cat → panda</div></div>
          <div className="stack" style={{gap:8,marginTop:8}}>
            <div className="stat">
              <div className="row" style={{justifyContent:"space-between"}}>
                <span className="hint">Recovery progress</span>
                <span className="hint">{Math.round(progress)}%</span>
              </div>
              <div className="bar"><span style={{width:`${progress}%`}}/></div>
            </div>
            <div className="hint">{doneToday?"Achievement unlocked – your pet grows!":"Complete all exercises today to grow your pet."}</div>
          </div>

          <div className="stack" style={{marginTop:16}}>
            <div style={{fontWeight:700}}>Today&apos;s plan</div>
            {DAILY_EXERCISES.map((label,idx)=>{
              const done=list[idx];
              return(
                <button key={idx} className="item" onClick={()=>toggle(idx)}
                  style={{justifyContent:"space-between",background:done?"var(--accentSoft)":"#fff",borderColor:done?"var(--accent)":"var(--border)"}}>
                  <span>{label}</span>
                  <span style={{width:24,height:24,borderRadius:999,border:"1px solid var(--border)",background:done?"var(--accent)":"#fff",color:done?"#fff":"var(--muted)",display:"grid",placeItems:"center"}}>
                    {done?"✓":""}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
};

const PatientCalendar = ({ appointments,recovery }) => {
  const [month,setMonth]=useState(startOfMonth(new Date()));
  const [selected,setSelected]=useState(todayStr());
  const cells = useMemo(()=>getMonthCells(month),[month]);
  const apptMap = useMemo(()=>{
    const map=new Map();
    appointments.forEach(a=>{map.set(a.date,(map.get(a.date)||0)+1);});
    return map;
  },[appointments]);
  const planDays = useMemo(()=>new Set(recovery.completedDays||[]),[recovery.completedDays]);
  const selectedAppts = appointments.filter(a=>a.date===selected);
  const selectedExercises = (recovery.exercises||{})[selected] || [false,false,false];

  const allDone = selectedExercises.every(Boolean);

  return(
    <>
      <header><div className="hwrap"><div className="title">Calendar</div><div style={{width:36}}/></div></header>
      <main>
        <div className="stack" style={{gap:12}}>
          <div className="card" style={{padding:12}}>
            <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
              <button className="btn ghost" onClick={()=>setMonth(addMonths(month,-1))}>◀</button>
              <div style={{fontWeight:700}}>{month.toLocaleString(undefined,{month:"long",year:"numeric"})}</div>
              <button className="btn ghost" onClick={()=>setMonth(addMonths(month,1))}>▶</button>
            </div>
            <div className="grid7" style={{marginTop:8,color:"var(--muted)"}}>
              {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(d=>(<div key={d} className="center hint" style={{height:24}}>{d}</div>))}
            </div>
            <div className="grid7">
              {cells.map((d,i)=>{
                if(!d) return <div key={i}/>;
                const ds=fmtDate(d);
                const sel=ds===selected;
                const hasAppt=(apptMap.get(ds)||0)>0;
                const inPlan=planDays.has(ds);
                return(
                  <button key={i} className="day" onClick={()=>setSelected(ds)}
                    style={{background:sel?"var(--accentSoft)":"#fff",borderColor:sel?"var(--accent)":"var(--border)"}}>
                    {d.getDate()}
                    <div style={{position:"absolute",bottom:4,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
                      {inPlan && <span style={{width:6,height:6,borderRadius:999,background:"#FDBA74"}}/>}
                      {hasAppt && <span style={{width:6,height:6,borderRadius:999,background:"var(--accent)"}}/>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{padding:12}}>
            <div style={{fontWeight:700,marginBottom:8}}>Today&apos;s overview ({selected})</div>
            {selectedAppts.length===0 && <div className="hint">No appointments booked.</div>}
            {selectedAppts.length>0 && (
              <div className="list" style={{marginBottom:8}}>
                {selectedAppts.map(a=>(
                  <div key={a.id} className="item">
                    <div>
                      <div style={{fontWeight:700}}>{a.time} • {a.therapistName}</div>
                      <div className="hint">{a.type}</div>
                    </div>
                    <span className="badge">Appointment</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{padding:12}}>
            <div style={{fontWeight:700,marginBottom:8}}>Program overview for this day</div>
            <div className="list">
              {DAILY_EXERCISES.map((label,idx)=>{
                const done = selectedExercises[idx];
                return(
                  <div key={idx} className="item" style={{background:done?"var(--accentSoft)":"#fff",borderColor:done?"var(--accent)":"var(--border)"}}>
                    <span>{label}</span>
                    <span style={{width:24,height:24,borderRadius:999,border:"1px solid var(--border)",background:done?"var(--accent)":"#fff",color:done?"#fff":"var(--muted)",display:"grid",placeItems:"center"}}>
                      {done?"✓":""}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="hint" style={{marginTop:4}}>
              {allDone
                ? "All exercises completed for this day – your pet should have grown."
                : "Finish all three exercises to count this day as completed in your recovery plan."}
            </div>
          </div>
        </div>
      </main>
    </>
  );
};


const PatientBookList = ({ onSelectTherapist }) => (
  <>
    <header><div className="hwrap"><div className="title">Find a therapist</div><div style={{width:36}}/></div></header>
    <main>
      <div className="card" style={{padding:16}}>
        <div className="hint" style={{marginBottom:8}}>Mock list of nearby physiotherapists.</div>
        <div className="list">
          {THERAPISTS.map(t=>(
            <button key={t.id} className="item" onClick={()=>onSelectTherapist(t)} style={{alignItems:"flex-start"}}>
              <div>
                <div style={{fontWeight:700}}>{t.name}</div>
                <div className="hint">{t.specialty}</div>
                <div className="hint" style={{marginTop:4}}>{t.rating.toFixed(1)} ★ • {t.distance}</div>
              </div>
              <span className="badge">View slots</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  </>
);

const PatientBookDetail = ({ therapist, onBack, onBook }) => {
  const base = new Date();
  const slots = [
    {date:fmtDate(addDays(base,1)), time:"09:30"},
    {date:fmtDate(addDays(base,1)), time:"11:00"},
    {date:fmtDate(addDays(base,2)), time:"15:00"},
  ];
  function book(s){ onBook({...s, therapistId:therapist.id, therapistName:therapist.name, type:"Online session"}); }
  return(
    <>
      <header>
        <div className="hwrap">
          <button className="iconbtn" onClick={onBack}>←</button>
          <div className="title">{therapist.name}</div>
          <div style={{width:36}}/>
        </div>
      </header>
      <main>
        <div className="card" style={{padding:16}}>
          <div style={{fontWeight:700,marginBottom:4}}>{therapist.specialty}</div>
          <div className="hint">{therapist.rating.toFixed(1)} ★ • {therapist.distance}</div>
        </div>
        <div className="card" style={{padding:16,marginTop:12}}>
          <div style={{fontWeight:700,marginBottom:8}}>Available slots</div>
          <div className="list">
            {slots.map((s,idx)=>(
              <button key={idx} className="item" onClick={()=>book(s)}>
                <div>
                  <div style={{fontWeight:700}}>{s.date}</div>
                  <div className="hint">{s.time}</div>
                </div>
                <span className="badge">Book</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

const PatientChat = () => {
  const [messages,setMessages]=useLS(LS.chat,[
    {id:"1",who:"assistant",text:"Hi! I am the PocketFit assistant."},
    {id:"2",who:"you",text:"What should I do today?"},
    {id:"3",who:"assistant",text:"Light mobility plus your three daily exercises is perfect."},
  ]);
  const [text,setText]=useState("");
  const MAX=40;
  function send(){
    const t=text.trim(); if(!t) return;
    setMessages(m=>[...m,{id:crypto.randomUUID(),who:"you",text:t},{id:crypto.randomUUID(),who:"assistant",text:"Thanks, this is a demo reply based on your question."}]);
    setText("");
  }
  return(
    <>
      <header><div className="hwrap"><div className="title">Assistant</div><div style={{width:36}}/></div></header>
      <main>
        <div className="card" style={{padding:12}}>
          <div className="list">
            {messages.map(m=>(
              <div key={m.id} className="item" style={{justifyContent:m.who==="you"?"flex-end":"flex-start"}}>
                <div style={{background:m.who==="you"?"var(--accent)":"#fff",color:m.who==="you"?"#fff":"var(--text)",padding:"8px 12px",borderRadius:12,border:"1px solid var(--border)"}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="row" style={{marginTop:12}}>
            <input className="input" value={text} onChange={e=>setText(e.target.value.slice(0,MAX))} placeholder="Ask (max 40 chars)"/>
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      </main>
    </>
  );
};

const PatientProfile = ({ user,recovery,setRecovery }) => {
  function simulate(){
    const start=new Date(recovery.startDate||todayStr());
    const cd=[]; const ex={...recovery.exercises};
    for(let i=0;i<14;i++){
      const d=fmtDate(addDays(start,i));
      cd.push(d);
      ex[d]=[true,true,true];
    }
    setRecovery(prev=>({...prev,completedDays:cd,exercises:ex}));
  }
  function resetPlan(){
    setRecovery({ startDate: todayStr(), completedDays: [], exercises: {}, petType: recovery.petType||"dog" });
  }
  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={()=>window.location.reload()}>←</button><div className="title">Profile</div><div style={{width:36}}/></div></header>
      <main>
        <div className="card" style={{padding:16}}>
          <div className="list">
            <div className="item"><span className="hint">Name</span><span>{user?.name||"—"}</span></div>
            <div className="item"><span className="hint">Age</span><span>{user?.age||"—"}</span></div>
            <div className="item"><span className="hint">Injury</span><span>{user?.injury||"—"}</span></div>
          </div>
          <div className="stack" style={{marginTop:16}}>
            <button className="btn secondary" onClick={simulate}>Simulate finished plan</button>
            <button className="btn ghost" onClick={resetPlan}>Reset plan</button>
          </div>
        </div>
      </main>
    </>
  );
};

const PatientBottomNav = ({ nav,setNav,setPage }) => {
  const items=[
    {id:"home",label:"Home",icon:Icon.home},
    {id:"calendar",label:"Calendar",icon:Icon.cal},
    {id:"book",label:"Book",icon:Icon.book},
    {id:"chat",label:"Chat",icon:Icon.chat},
  ];
  function go(id){
    setNav(id);
    if(id==="home") setPage("home");
    if(id==="calendar") setPage("calendar");
    if(id==="book") setPage("book-list");
    if(id==="chat") setPage("chat");
  }
  return(
    <nav className="tabs">
      <div className="tabbar">
        {items.map(it=>(
          <button key={it.id} className={`tab ${nav===it.id?"active":""}`} onClick={()=>go(it.id)}>
            <div style={{display:"grid",placeItems:"center",gap:4}}>
              {it.icon({})}
              <div>{it.label}</div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
};

// DOCTOR SIDE
function DoctorNav({ doctorNav,setDoctorNav,setPage }){
  const items=[
    {id:"doctor-home",label:"Home",icon:Icon.home},
    {id:"doctor-calendar",label:"Calendar",icon:Icon.cal},
    {id:"doctor-clients",label:"Clients",icon:Icon.users},
    {id:"doctor-plans",label:"Plans",icon:Icon.plan},
  ];
  function go(id){setDoctorNav(id);setPage(id);}
  return(
    <nav className="tabs">
      <div className="tabbar">
        {items.map(it=>(
          <button key={it.id} className={`tab ${doctorNav===it.id?"active":""}`} onClick={()=>go(it.id)}>
            <div style={{display:"grid",placeItems:"center",gap:4}}>{it.icon({})}<div>{it.label}</div></div>
          </button>
        ))}
      </div>
    </nav>
  );
}

function DoctorLogin({ onSubmit,onBack }){
  const [name,setName]=useState("");
  function submit(e){e.preventDefault();const n=name.trim();if(!n)return;onSubmit({name:n,rating:4.8,pfBookings:128,specialty:"Sports rehabilitation",location:"Paris 11e"});}
  return(
    <div style={{padding:16}}>
      <div className="stack" style={{gap:16}}>
        <button className="iconbtn" onClick={onBack}>←</button>
        <div>
          <div style={{fontWeight:800,fontSize:20}}>Physiotherapist sign-in</div>
          <div className="hint">Enter your name to continue.</div>
        </div>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <div className="label">Your name</div>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="John Smith"/>
          </div>
          <button className="btn">Continue</button>
        </form>
      </div>
    </div>
  );
}

function DoctorHome({ doctor,clients,openProfile,openClientFromHome }){
  const alerts = clients.filter(c=>(c.missedDays||0)>=2 || c.feelBad);
  const apptsToday = DOCTOR_APPTS.filter(a=>a.date===todayStr()).map(a=>({...a,client:clients.find(c=>c.id===a.clientId)}));
  const firstName = doctor.name.split(" ")[0];

  return(
    <>
      <header>
        <div className="hwrap">
          <div className="title">Pocketfit • Physiotherapist</div>
          <button className="iconbtn" onClick={openProfile}>{Icon.profile({})}</button>
        </div>
      </header>
      <main>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:18,fontWeight:700}}>Welcome, Dr. {firstName}</div>
          <div className="hint">Here is an overview of today&apos;s caseload.</div>
        </div>

        {alerts.length>0 && (
          <div className="card" style={{padding:12,borderColor:"#fb923c"}}>
            <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontWeight:800}}>Alerts</div>
                <div className="hint">{alerts.length} client(s) require attention</div>
              </div>
            </div>
            <div className="list" style={{marginTop:8}}>
              {alerts.map(c=>(
                <div key={c.id} className="item">
                  <div>
                    <div style={{fontWeight:700}}>{c.name}</div>
                    <div className="hint">{c.feelBad?"I feel bad":"Skipped "+c.missedDays+" days"} • {c.injury}</div>
                  </div>
                  <button className="btn warn" onClick={()=>openClientFromHome(c)}>Review now</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{padding:16,marginTop:12}}>
          <div style={{fontWeight:800,marginBottom:8}}>Today</div>
          {apptsToday.length===0 ? (
            <div className="hint">No appointments today.</div>
          ):(
            <div className="list">
              {apptsToday.map(a=>(
                <div key={a.id} className="item">
                  <div>
                    <div style={{fontWeight:700}}>{a.time} • {a.client?.name||"Unknown"}</div>
                    <div className="hint">{a.type}</div>
                  </div>
                  <button className="btn secondary" onClick={()=>openClientFromHome(a.client)}>Open client</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

function DoctorProfilePage({ doctor,goBack }){
  const stars = Math.round(doctor.rating);
  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={goBack}>←</button><div className="title">Therapist profile</div><div style={{width:36}}/></div></header>
      <main>
        <div className="card" style={{padding:16}}>
          <div className="list">
            <div className="item"><span className="hint">Name</span><span>{doctor.name}</span></div>
            <div className="item"><span className="hint">Star rating</span><span>{"★".repeat(stars)} {doctor.rating.toFixed(1)}</span></div>
            <div className="item"><span className="hint">Appointments via PocketFit</span><span>{doctor.pfBookings}</span></div>
            <div className="item"><span className="hint">Specialty</span><span>{doctor.specialty}</span></div>
            <div className="item"><span className="hint">Location</span><span>{doctor.location}</span></div>
          </div>
        </div>
      </main>
    </>
  );
}

function DoctorCalendarPage({ clients,unavail,setUnavail,openClientFromCalendar }){
  const [month,setMonth]=useState(startOfMonth(new Date()));
  const [selected,setSelected]=useState(todayStr());
  const [date,setDate]=useState(todayStr());
  const [startT,setStartT]=useState("13:00");
  const [endT,setEndT]=useState("14:00");
  const cells = useMemo(()=>getMonthCells(month),[month]);
  const appts = DOCTOR_APPTS.map(a=>({...a,client:clients.find(c=>c.id===a.clientId)}));
  const apptMap = useMemo(()=>{
    const m=new Map();
    appts.forEach(a=>{m.set(a.date,(m.get(a.date)||0)+1);});
    return m;
  },[appts]);
  const unavailMap = useMemo(()=>{
    const m=new Map();
    unavail.forEach(u=>{m.set(u.date,(m.get(u.date)||0)+1);});
    return m;
  },[unavail]);

  const selectedAppts = appts.filter(a=>a.date===selected);

  function addUnavail(){
    const u={id:crypto.randomUUID(),date,start:startT,end:endT,label:"Unavailable"};
    setUnavail(prev=>[...prev,u]);
  }
  function removeUnavail(id){setUnavail(prev=>prev.filter(u=>u.id!==id));}

  return(
    <>
      <header><div className="hwrap"><div className="title">Calendar</div><div style={{width:36}}/></div></header>
      <main>
        <div className="stack" style={{gap:12}}>
          <div className="card" style={{padding:12}}>
            <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
              <button className="btn ghost" onClick={()=>setMonth(addMonths(month,-1))}>◀</button>
              <div style={{fontWeight:700}}>{month.toLocaleString(undefined,{month:"long",year:"numeric"})}</div>
              <button className="btn ghost" onClick={()=>setMonth(addMonths(month,1))}>▶</button>
            </div>
            <div className="grid7" style={{marginTop:8,color:"var(--muted)"}}>
              {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map(d=>(<div key={d} className="center hint" style={{height:24}}>{d}</div>))}
            </div>
            <div className="grid7">
              {cells.map((d,i)=>{
                if(!d) return <div key={i}/>;
                const ds=fmtDate(d);
                const sel=ds===selected;
                const hasA=(apptMap.get(ds)||0)>0;
                const hasU=(unavailMap.get(ds)||0)>0;
                return(
                  <button key={i} className="day" onClick={()=>setSelected(ds)}
                    style={{background:sel?"var(--accentSoft)":"#fff",borderColor:sel?"var(--accent)":"var(--border)"}}>
                    {d.getDate()}
                    <div style={{position:"absolute",bottom:4,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
                      {hasU && <span style={{width:6,height:6,borderRadius:999,background:"#FDBA74"}}/>}
                      {hasA && <span style={{width:6,height:6,borderRadius:999,background:"var(--accent)"}}/>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="card" style={{padding:12}}>
            <div style={{fontWeight:800,marginBottom:8}}>Appointments on {selected}</div>
            {selectedAppts.length===0 ? <div className="hint">No appointments.</div> :
              <div className="list">
                {selectedAppts.map(a=>(
                  <div key={a.id} className="item">
                    <div>
                      <div style={{fontWeight:700}}>{a.time} • {a.client?.name||"—"}</div>
                      <div className="hint">{a.type}</div>
                    </div>
                    <button className="btn secondary" onClick={()=>openClientFromCalendar(a.client)}>Open</button>
                  </div>
                ))}
              </div>
            }
          </div>

          <div className="card" style={{padding:16}}>
            <div style={{fontWeight:800,marginBottom:8}}>Unavailability</div>
            <div className="row">
              <input className="input" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
              <input className="input" type="time" value={startT} onChange={e=>setStartT(e.target.value)}/>
              <input className="input" type="time" value={endT} onChange={e=>setEndT(e.target.value)}/>
              <button className="btn" onClick={addUnavail}>Add</button>
            </div>
            <div className="list" style={{marginTop:12}}>
              {unavail.length===0 && <div className="hint">No blocked times.</div>}
              {unavail.map(u=>(
                <div key={u.id} className="item">
                  <div>
                    <div style={{fontWeight:700}}>{u.date} • {u.start}–{u.end}</div>
                    <div className="hint">{u.label}</div>
                  </div>
                  <button className="btn ghost" onClick={()=>removeUnavail(u.id)}>Remove</button>
                </div>
              ))}
            </div>
            <div className="hint" style={{marginTop:6}}>Clients cannot book inside these slots in the final product.</div>
          </div>
        </div>
      </main>
    </>
  );
}

function DoctorClientsPage({ clients,setSearch,search,openClientFromClients }){
  function nextApptFor(id){
    const future = DOCTOR_APPTS.filter(a=>a.clientId===id).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
    return future[0]||null;
  }
  const decorated = clients.map(c=>({...c,next:nextApptFor(c.id)}));
  const filtered = decorated.filter(c=>c.name.toLowerCase().includes(search.toLowerCase()));
  const sorted = filtered.sort((a,b)=>{
    if(a.next && b.next) return (a.next.date+a.next.time).localeCompare(b.next.date+b.next.time);
    if(a.next && !b.next) return -1;
    if(!a.next && b.next) return 1;
    return a.name.localeCompare(b.name);
  });
  return(
    <>
      <header><div className="hwrap"><div className="title">Clients</div><div style={{width:36}}/></div></header>
      <main>
        <div className="card" style={{padding:16}}>
          <div className="row" style={{marginBottom:12}}>
            <input className="input" placeholder="Search by name" value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1}}/>
          </div>
          <div className="list">
            {sorted.map(c=>(
              <button key={c.id} className="item" onClick={()=>openClientFromClients(c)} style={{justifyContent:"space-between"}}>
                <div>
                  <div style={{fontWeight:700}}>
                    {c.name} {c.new && <span className="badge">new</span>}
                  </div>
                  <div className="hint">{c.injury}</div>
                </div>
                <div style={{display:"grid",gap:6,justifyItems:"end"}}>
                  <div className="badge">Progress {c.progress}%</div>
                  {(c.missedDays>=2 || c.feelBad) && <div className="badge attn">{c.feelBad?"Feels bad":"Skipped "+c.missedDays+" days"}</div>}
                  <div className="hint">{c.next?`Next: ${c.next.date} ${c.next.time}`:"Inactive"}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}


function PerPatientPlan({ client, plans, assignPlanToClient }) {
  const hasExisting = !!client.plan;
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(plans[0]?.id || "");
  const [custom, setCustom] = useState(
    client.plan || {
      name: plans[0]?.injury || "Custom plan",
      notes: "",
      days: [
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
      ],
    }
  );

  function assignTemplate() {
    const t = plans.find((p) => p.id === selectedTemplate);
    const baseDays = t?.days || custom.days;
    const plan = {
      name: t?.injury || "Custom plan",
      notes: `Template: ${t?.injury || "Custom"}`,
      days: baseDays,
    };
    assignPlanToClient(client.id, plan);
    setCustom(plan);
    // after assigning -> open & go into edit mode
    setExpanded(true);
    setEditing(true);
  }

  function save() {
    const plan = {
      ...custom,
      name: custom.name || client.plan?.name || "Custom plan",
    };
    assignPlanToClient(client.id, plan);
    setCustom(plan);
    // after save -> roll up
    setEditing(false);
    setExpanded(false);
  }

  const effectiveName = custom.name || client.plan?.name || "Assigned plan";

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Assigned program</div>

      {/* No program yet: choose template and assign */}
      {!hasExisting && !expanded && !editing && (
        <div className="stack">
          <div className="row">
            <select
              className="input"
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              style={{ flex: 1 }}
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.injury} ({p.duration})
                </option>
              ))}
            </select>
            <button className="btn" type="button" onClick={assignTemplate}>
              Assign program
            </button>
          </div>
          <div className="hint">You can customise per client after assigning.</div>
        </div>
      )}

      {/* Summary bar when a program exists */}
      {(hasExisting || expanded) && (
        <div className="item" style={{ marginTop: 8, marginBottom: 8 }}>
          <div>
            <div className="hint">Current program</div>
            <div style={{ fontWeight: 700 }}>{effectiveName}</div>
          </div>
          <div className="row">
            <button
              className="btn secondary"
              type="button"
              onClick={() => {
                setExpanded((e) => !e);
                setEditing(false);
              }}
            >
              View
            </button>
            <button
              className="btn"
              type="button"
              onClick={() => {
                setExpanded(true);
                setEditing(true);
              }}
            >
              Edit
            </button>
          </div>
        </div>
      )}

      {/* Details: view or edit */}
      {expanded && (
        <div className="stack" style={{ marginTop: 8 }}>
          <div className="field">
            <div className="label">Notes</div>
            <textarea
              className="textarea"
              value={custom.notes || ""}
              onChange={(e) =>
                setCustom((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              readOnly={!editing}
            />
          </div>

          {custom.days.slice(0, 3).map((d, idx) => (
            <div key={idx} className="stack">
              <div style={{ fontWeight: 700 }}>Day {idx + 1}</div>
              {Array.from({ length: 3 }).map((_, exIdx) => (
                <div key={exIdx} className="field">
                  <div className="label">Exercise {exIdx + 1}</div>
                  <select
                    className="input"
                    value={d.exercises[exIdx]}
                    disabled={!editing}
                    onChange={(e) => {
                      const v = e.target.value;
                      const copy = { ...custom };
                      const arr = [...copy.days];
                      const inner = [...arr[idx].exercises];
                      inner[exIdx] = v;
                      arr[idx] = { ...arr[idx], exercises: inner };
                      copy.days = arr;
                      setCustom(copy);
                    }}
                  >
                    {EXERCISE_LIBRARY.map((x) => (
                      <option key={x} value={x}>
                        {x}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          ))}

          {editing && (
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn" type="button" onClick={save}>
                Save
              </button>
            </div>
          )}

          {!editing && (
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button
                className="btn secondary"
                type="button"
                onClick={() => setExpanded(false)}
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function DoctorClientDetail({ client,notesById,setNotesById,goBack,plans,assignPlanToClient,setPageToChat }){
  if(!client){
    return(
      <>
        <header><div className="hwrap"><button className="iconbtn" onClick={goBack}>←</button><div className="title">Client</div><div style={{width:36}}/></div></header>
        <main><div className="card" style={{padding:16}}><div className="hint">No client selected.</div></div></main>
      </>
    );
  }
  const history = DOCTOR_APPTS.filter(a=>a.clientId===client.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+b.date));
  const next = history.find(a=>(a.date+a.time)>=(todayStr()+"00:00"))||null;
  const missed = client.missedDays||0;
  const notes = notesById[client.id] || "";

  function saveNotes(v){setNotesById(prev=>({...prev,[client.id]:v}));}

  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={goBack}>←</button><div className="title">{client.name}</div><div style={{width:36}}/></div></header>
      <main>
        <div className="stack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div className="list">
              <div className="item"><span className="hint">Injury</span><span>{client.injury}</span></div>
              <div className="item"><span className="hint">Program progress</span><span>{client.progress}%</span></div>
              {(missed>=2 || client.feelBad) && (
                <div className="item"><span className="hint">Alert</span><span className="badge attn">{client.feelBad?"Feels bad":"Skipped "+missed+" days"}</span></div>
              )}
            </div>
          </div>

          <div className="card" style={{padding:16}}>
            <div className="field">
              <div className="label">General notes</div>
              <textarea className="textarea" value={notes} onChange={e=>saveNotes(e.target.value)} placeholder="Session notes, red flags, adjustments…"/>
            </div>
          </div>

          <div className="card" style={{padding:16}}>
            <div style={{fontWeight:800,marginBottom:8}}>Appointments</div>
            <div className="list">
              <div className="item"><span className="hint">Next</span><span>{next?`${next.date} • ${next.time} • ${next.type}`:"—"}</span></div>
              <div className="item" style={{alignItems:"flex-start"}}>
                <span className="hint">History</span>
                <div style={{display:"grid",gap:6}}>
                  {history.map(h=>(<div key={h.id} className="badge">{h.date} {h.time} • {h.type}</div>))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <button className="btn secondary" onClick={()=>{/* stub call */}}>Call client</button>
            <button className="btn" onClick={setPageToChat}>Go to chat</button>
          </div>

          <PerPatientPlan client={client} plans={plans} assignPlanToClient={assignPlanToClient}/>
        </div>
      </main>
    </>
  );
}

function DoctorClientChat({ client,goBack }){
  const messages=[
    {id:"1",who:"physio",text:`Hi ${client?.name||"client"}, how is the knee today?`},
    {id:"2",who:"client",text:"A bit sore after stairs but okay at rest."},
    {id:"3",who:"physio",text:"Understood. Reduce step-downs by one set and keep the rest similar."},
  ];
  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={goBack}>←</button><div className="title">Chat with {client?.name||"client"}</div><div style={{width:36}}/></div></header>
      <main>
        <div className="card" style={{padding:12}}>
          <div className="list">
            {messages.map(m=>(
              <div key={m.id} className="item" style={{justifyContent:m.who==="physio"?"flex-start":"flex-end"}}>
                <div style={{background:m.who==="physio"?"#fff":"var(--accent)",color:m.who==="physio"?"var(--text)":"#fff",padding:"8px 12px",borderRadius:12,border:"1px solid var(--border)"}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="hint" style={{marginTop:8}}>Static mock chat for demo.</div>
        </div>
      </main>
    </>
  );
}

function DoctorPlansPage({ plans,setPage,setEditingPlanId }){
  return(
    <>
      <header><div className="hwrap"><div className="title">Plans</div><div style={{width:36}}/></div></header>
      <main>
        <div className="stack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div style={{fontWeight:800,marginBottom:8}}>Templates</div>
            <div className="list">
              {plans.map(p=>(
                <button key={p.id} className="item" onClick={()=>{setEditingPlanId(p.id);setPage("doctor-plan-edit");}} style={{alignItems:"flex-start"}}>
                  <div>
                    <div style={{fontWeight:700}}>{p.injury}</div>
                    <div className="hint">{p.duration}</div>
                    <div className="hint" style={{marginTop:4}}>{p.description}</div>
                  </div>
                  <span className="badge">Edit</span>
                </button>
              ))}
            </div>
          </div>
          <div className="row" style={{justifyContent:"flex-end"}}>
            <button className="btn" onClick={()=>setPage("doctor-plan-builder")}>New plan</button>
          </div>
        </div>
      </main>
    </>
  );
}

function DoctorPlanBuilder({ setPage,addTemplate }){
  const [injury,setInjury]=useState(""); const [notes,setNotes]=useState(""); const length=3;
  const [days,setDays]=useState([
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
  ]);
  function save(e){
    e.preventDefault();
    const plan={id:crypto.randomUUID(),injury:injury||"Custom plan",duration:`${length} days`,description:notes,days};
    addTemplate(plan); setPage("doctor-plans");
  }
  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={()=>setPage("doctor-plans")}>←</button><div className="title">Individual plan</div><div style={{width:36}}/></div></header>
      <main>
        <form onSubmit={save} className="stack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div className="stack">
              <div className="field"><div className="label">Injury type</div><input className="input" value={injury} onChange={e=>setInjury(e.target.value)} placeholder="e.g. Knee"/></div>
              <div className="field"><div className="label">Notes</div><textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Short description"/></div>
              <div className="field"><div className="label">Length</div><input className="input" value={length} readOnly/></div>
            </div>
          </div>
          {days.map((d,idx)=>(
            <div key={idx} className="card" style={{padding:16}}>
              <div style={{fontWeight:800,marginBottom:8}}>Day {idx+1}</div>
              {Array.from({length:3}).map((_,exIdx)=>(
                <div key={exIdx} className="field">
                  <div className="label">Exercise {exIdx+1}</div>
                  <select className="input" value={d.exercises[exIdx]} onChange={e=>{
                    const v=e.target.value; const arr=[...days]; const inner=[...arr[idx].exercises]; inner[exIdx]=v; arr[idx]={...arr[idx],exercises:inner}; setDays(arr);
                  }}>
                    {EXERCISE_LIBRARY.map(x=>(<option key={x} value={x}>{x}</option>))}
                  </select>
                </div>
              ))}
            </div>
          ))}
          <div className="row" style={{justifyContent:"flex-end"}}><button className="btn" type="submit">Save</button></div>
        </form>
      </main>
    </>
  );
}

function DoctorPlanEdit({ plans,setPlans,editingPlanId,setPage }){
  const plan = plans.find(p=>p.id===editingPlanId);
  const [injury,setInjury]=useState(plan?.injury||"");
  const [notes,setNotes]=useState(plan?.description||"");
  const [days,setDays]=useState(plan?.days||[
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
  ]);

  function save(e){
    e.preventDefault();
    setPlans(prev=>prev.map(p=>p.id===editingPlanId?{...p,injury,description:notes,days}:p));
    setPage("doctor-plans");
  }

  if(!plan){
    return(
      <>
        <header><div className="hwrap"><button className="iconbtn" onClick={()=>setPage("doctor-plans")}>←</button><div className="title">Edit plan</div><div style={{width:36}}/></div></header>
        <main><div className="card" style={{padding:16}}><div className="hint">Plan not found.</div></div></main>
      </>
    );
  }

  return(
    <>
      <header><div className="hwrap"><button className="iconbtn" onClick={()=>setPage("doctor-plans")}>←</button><div className="title">Edit plan</div><div style={{width:36}}/></div></header>
      <main>
        <form onSubmit={save} className="stack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div className="stack">
              <div className="field"><div className="label">Injury type</div><input className="input" value={injury} onChange={e=>setInjury(e.target.value)}/></div>
              <div className="field"><div className="label">Notes</div><textarea className="textarea" value={notes} onChange={e=>setNotes(e.target.value)}/></div>
            </div>
          </div>
          {days.map((d,idx)=>(
            <div key={idx} className="card" style={{padding:16}}>
              <div style={{fontWeight:800,marginBottom:8}}>Day {idx+1}</div>
              {Array.from({length:3}).map((_,exIdx)=>(
                <div key={exIdx} className="field">
                  <div className="label">Exercise {exIdx+1}</div>
                  <select className="input" value={d.exercises[exIdx]} onChange={e=>{
                    const v=e.target.value; const arr=[...days]; const inner=[...arr[idx].exercises]; inner[exIdx]=v; arr[idx]={...arr[idx],exercises:inner}; setDays(arr);
                  }}>
                    {EXERCISE_LIBRARY.map(x=>(<option key={x} value={x}>{x}</option>))}
                  </select>
                </div>
              ))}
            </div>
          ))}
          <div className="row" style={{justifyContent:"flex-end"}}><button className="btn" type="submit">Save</button></div>
        </form>
      </main>
    </>
  );
}

// ROOT APP
export default function App(){
  const [page,setPage]=useState("splash");
  const [role,setRole]=useState(null);

  // patient
  const [user,setUser]=useLS(LS.user,null);
  const [recovery,setRecovery]=useLS(LS.recovery,{ startDate: todayStr(), completedDays: [], exercises: {}, petType:"dog" });
  const [patientNav,setPatientNav]=useState("home");
  const [patientAppts,setPatientAppts]=useLS(LS.appts,[
    {id:"p1",date:todayStr(),time:"09:30",therapistId:"t1",therapistName:"Dr. Maya Chen",type:"Check-in"},
  ]);
  const [selectedTherapist,setSelectedTherapist]=useState(null);

  // doctor
  const [doctor,setDoctor]=useState(null);
  const [doctorNav,setDoctorNav]=useState("doctor-home");
  const [doctorClients,setDoctorClients]=useState(BASE_DOCTOR_CLIENTS);
  const [doctorSelectedClient,setDoctorSelectedClient]=useState(null);
  const [doctorNotes,setDoctorNotes]=useState({});
  const [doctorUnavail,setDoctorUnavail]=useState(INITIAL_DOCTOR_UNAVAIL);
  const [doctorPlans,setDoctorPlans]=useState(INITIAL_DOCTOR_PLANS);
  const [doctorClientSearch,setDoctorClientSearch]=useState("");
  const [editingPlanId,setEditingPlanId]=useState(null);
  const [doctorBackTarget,setDoctorBackTarget]=useState("doctor-home");

  // handlers
  function handleRegister(p){setUser(p);setRole("patient");setPage("home");setPatientNav("home");}
  function handleDoctorLogin(info){setDoctor(info);setRole("doctor");setPage("doctor-home");setDoctorNav("doctor-home");}

  function assignPlanToClient(clientId,plan){
    setDoctorClients(prev=>prev.map(c=>c.id===clientId?{...c,plan}:c));
    setDoctorSelectedClient(prev=>prev && prev.id===clientId?{...prev,plan}:prev);
  }
  function addTemplate(plan){setDoctorPlans(prev=>[...prev,plan]);}

  // open client with proper back target
  function openClient(fromPage, client){
    if(!client) return;
    setDoctorBackTarget(fromPage);
    setDoctorSelectedClient(client);
    setPage("doctor-client-detail");
  }

  const showPatientNav = role==="patient" && page!=="register" && page!=="splash" && page!=="role";
  const showDoctorNav = role==="doctor" && page!=="doctor-login" && page!=="splash" && page!=="role";

  return(
    <div className="app">
      <style>{css}</style>

      {page==="splash" && <Splash onDone={()=>setPage("role")}/>}
      {page==="role" && <RoleChoice onPatient={()=>{setRole("patient");setPage("register");}} onDoctor={()=>{setRole("doctor");setPage("doctor-login");}}/>}

      {/* PATIENT */}
      {role==="patient" && page==="register" && <PatientRegister onSubmit={handleRegister}/>}
      {role==="patient" && page==="home" && <PatientHome user={user} recovery={recovery} setRecovery={setRecovery} goProfile={()=>setPage("profile")}/>}
      {role==="patient" && page==="calendar" && <PatientCalendar appointments={patientAppts} recovery={recovery}/>}
      {role==="patient" && page==="book-list" && <PatientBookList onSelectTherapist={(t)=>{setSelectedTherapist(t);setPage("book-detail");}}/>}
      {role==="patient" && page==="book-detail" && selectedTherapist && (
        <PatientBookDetail therapist={selectedTherapist} onBack={()=>setPage("book-list")} onBook={(slot)=>{
          setPatientAppts(prev=>[...prev,{id:crypto.randomUUID(),...slot}]);
          setPage("calendar");
          setPatientNav("calendar");
        }}/>
      )}
      {role==="patient" && page==="chat" && <PatientChat/>}
      {role==="patient" && page==="profile" && <PatientProfile user={user} recovery={recovery} setRecovery={setRecovery}/>}

      {/* DOCTOR */}
      {role==="doctor" && page==="doctor-login" && <DoctorLogin onSubmit={handleDoctorLogin} onBack={()=>{setRole(null);setPage("role");}}/>}
      {role==="doctor" && page==="doctor-home" && doctor && (
        <DoctorHome
          doctor={doctor}
          clients={doctorClients}
          openProfile={()=>setPage("doctor-profile")}
          openClientFromHome={(c)=>openClient("doctor-home",c)}
        />
      )}
      {role==="doctor" && page==="doctor-profile" && doctor && <DoctorProfilePage doctor={doctor} goBack={()=>setPage("doctor-home")}/>}
      {role==="doctor" && page==="doctor-calendar" && (
        <DoctorCalendarPage
          clients={doctorClients}
          unavail={doctorUnavail}
          setUnavail={setDoctorUnavail}
          openClientFromCalendar={(c)=>openClient("doctor-calendar",c)}
        />
      )}
      {role==="doctor" && page==="doctor-clients" && (
        <DoctorClientsPage
          clients={doctorClients}
          search={doctorClientSearch}
          setSearch={setDoctorClientSearch}
          openClientFromClients={(c)=>openClient("doctor-clients",c)}
        />
      )}
      {role==="doctor" && page==="doctor-client-detail" && (
        <DoctorClientDetail
          client={doctorSelectedClient}
          notesById={doctorNotes}
          setNotesById={setDoctorNotes}
          goBack={()=>setPage(doctorBackTarget)}
          plans={doctorPlans}
          assignPlanToClient={assignPlanToClient}
          setPageToChat={()=>setPage("doctor-client-chat")}
        />
      )}
      {role==="doctor" && page==="doctor-client-chat" && (
        <DoctorClientChat client={doctorSelectedClient} goBack={()=>setPage("doctor-client-detail")}/>
      )}
      {role==="doctor" && page==="doctor-plans" && (
        <DoctorPlansPage plans={doctorPlans} setPage={setPage} setEditingPlanId={setEditingPlanId}/>
      )}
      {role==="doctor" && page==="doctor-plan-builder" && (
        <DoctorPlanBuilder setPage={setPage} addTemplate={addTemplate}/>
      )}
      {role==="doctor" && page==="doctor-plan-edit" && (
        <DoctorPlanEdit plans={doctorPlans} setPlans={setDoctorPlans} editingPlanId={editingPlanId} setPage={setPage}/>
      )}

      {showPatientNav && <PatientBottomNav nav={patientNav} setNav={setPatientNav} setPage={setPage}/>}
      {showDoctorNav && <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage}/>}
    </div>
  );
}
