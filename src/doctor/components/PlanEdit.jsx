import React, { useState } from "react";
import Header from "./Header";
import { EXERCISE_LIBRARY } from "../../shared/data";

export default function DoctorPlanEdit({ plans,setPlans,editingPlanId,setPage }){
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
    return (
      <>
        <Header title="Edit plan" left={<button className="iconbtn" onClick={()=>setPage("doctor-plans")}>←</button>} />
        <main><div className="card" style={{padding:16}}><div className="hint">Plan not found.</div></div></main>
      </>
    );
  }

  return (
    <>
      <Header title="Edit plan" left={<button className="iconbtn" onClick={()=>setPage("doctor-plans")}>←</button>} />
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
