import React from "react";
import Header from "./Header";
import { fmtDate, todayStr, addDays } from "../../shared/dates";

export default function PatientProfile({ user,recovery,setRecovery,onBack }){
  function simulate(){
    const start=new Date(recovery.startDate||todayStr());
    const cd=[]; const ex={...recovery.exercises};
    const L = Number(recovery.planLength||14); for(let i=0;i<L;i++){
      const d=fmtDate(addDays(start,i));
      cd.push(d);
      ex[d]=[true,true,true];
    }
    setRecovery(prev=>({...prev,completedDays:cd,exercises:ex,planLength:Number(prev.planLength||14),startDate: todayStr()}));
  }
  function resetPlan(){
    setRecovery({ startDate: todayStr(), completedDays: [], exercises: {}, petType: recovery.petType||"dog", planLength: Number(recovery.planLength||14) });
  }
  return (
    <>
      <Header title="Profile" left={<button className="iconbtn" onClick={onBack}>←</button>} />
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
}
