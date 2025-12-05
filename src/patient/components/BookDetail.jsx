import React from "react";
import Header from "./Header";
import { addDays, fmtDate } from "../../shared/dates";

export default function PatientBookDetail({ therapist, onBack, onBook }){
  const base = new Date();
  const slots = [
    {date:fmtDate(addDays(base,1)), time:"09:30"},
    {date:fmtDate(addDays(base,1)), time:"11:00"},
    {date:fmtDate(addDays(base,2)), time:"15:00"},
  ];
  return (
    <>
      <Header title={therapist.name} left={<button className="iconbtn" onClick={onBack}>←</button>} />
      <main>
        <div className="card" style={{padding:16}}>
          <div style={{fontWeight:700,marginBottom:4}}>{therapist.specialty}</div>
          <div className="hint">{therapist.rating.toFixed(1)} ★ • {therapist.distance}</div>
        </div>
        <div className="card" style={{padding:16,marginTop:12}}>
          <div style={{fontWeight:700,marginBottom:8}}>Available slots</div>
          <div className="list">
            {slots.map((s,idx)=>(
              <button key={idx} className="item" onClick={()=>onBook(s)}>
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
}
