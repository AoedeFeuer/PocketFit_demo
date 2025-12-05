import React, { useMemo, useState } from "react";
import Header from "./Header";
import { fmtDate, todayStr, addMonths, getMonthCells, startOfMonth } from "../../shared/dates";
import { DAILY_EXERCISES } from "../../shared/data";

export default function PatientCalendar({ appointments,recovery }){
  const [month,setMonth]=useState(startOfMonth(new Date()));
  const [selected,setSelected]=useState(todayStr());
  const cells = useMemo(()=>getMonthCells(month),[month]);
  const apptMap = useMemo(()=>{
    const map=new Map();
    appointments.forEach(a=>{map.set(a.date,(map.get(a.date)||0)+1);});
    return map;
  },[appointments]);
  const planDays = useMemo(()=>new Set(recovery.completedDays||[]),[recovery.completedDays]);
  const planLength = Number(recovery?.planLength ?? 14);
  const planStartDate = recovery?.startDate ? new Date(recovery.startDate) : new Date();
  const planEndDate = new Date(+planStartDate);
  planEndDate.setDate(planStartDate.getDate() + (planLength - 1));
  const planStartStr = fmtDate(planStartDate);
  const planEndStr   = fmtDate(planEndDate);
  const isPlanDay = (ds) => ds >= planStartStr && ds <= planEndStr;
  const selectedAppts = appointments.filter(a=>a.date===selected);
  const selectedExercises = (recovery.exercises||{})[selected] || [false,false,false];
  const allDone = selectedExercises.every(Boolean);

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
                const hasAppt=(apptMap.get(ds)||0)>0;
                const inPlan=isPlanDay(ds);
                return(
                  <button key={i} className="day" onClick={()=>setSelected(ds)}
                    style={{background:sel?"var(--accentSoft)":"#fff",borderColor:sel?"var(--accent)":"var(--border)"}}>
                    {d.getDate()}
                    <div style={{position:"absolute",bottom:4,left:"50%",transform:"translateX(-50%)",display:"flex",gap:4}}>
		      {inPlan && <span className="dot plan" title="Program day" />}
                      {hasAppt && <span className="dot appt" title="Appointment" />}
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
}
