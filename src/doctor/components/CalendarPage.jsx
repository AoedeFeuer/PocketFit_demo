import React, { useMemo, useState } from "react";
import Header from "./Header";
import { fmtDate, todayStr, addMonths, getMonthCells, startOfMonth } from "../../shared/dates";
import { DOCTOR_APPTS } from "../../shared/data";

export default function DoctorCalendarPage({ clients,unavail,setUnavail,openClientFromCalendar }){
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

  return (
    <>
      <Header title="Calendar" />
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
