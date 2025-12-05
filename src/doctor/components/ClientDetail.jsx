import React from "react";
import Header from "./Header";
import { todayStr } from "../../shared/dates";
import { DOCTOR_APPTS } from "../../shared/data";
import PerPatientPlan from "./PerPatientPlan.jsx";

export default function DoctorClientDetail({ client,notesById,setNotesById,goBack,plans,assignPlanToClient,setPageToChat }){
  if(!client){
    return (
      <>
        <Header title="Client" left={<button className="iconbtn" onClick={goBack}>←</button>} />
        <main><div className="card" style={{padding:16}}><div className="hint">No client selected.</div></div></main>
      </>
    );
  }
  const history = DOCTOR_APPTS.filter(a=>a.clientId===client.id).sort((a,b)=>(b.date+b.time).localeCompare(a.date+b.date));
  const next = history.find(a=>(a.date+a.time)>=(todayStr()+"00:00"))||null;
  const missed = client.missedDays||0;
  const notes = notesById[client.id] || "";
  function saveNotes(v){setNotesById(prev=>({...prev,[client.id]:v}));}

  return (
    <>
      <Header title={client.name} left={<button className="iconbtn" onClick={goBack}>←</button>} />
      <main>
        <div className="stack" style={{gap:12}}>
          <div className="card" style={{padding:16}}>
            <div className="list">
              <div className="item"><span className="hint">Injury</span><span>{client.injury}</span></div>
              <div className="item"><span className="hint">Program progress</span><span>{client.progress}%</span></div>
              {(missed>=2 || client.feelBad) && (
                <div className="item"><span className="hint">Alert</span><span className="badge attn">{client.feelBad?"I feel bad":"Skipped "+missed+" days"}</span></div>
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
            <button className="btn secondary" onClick={()=>{/* stub */}}>Call client</button>
            <button className="btn" onClick={setPageToChat}>Go to chat</button>
          </div>

          <PerPatientPlan client={client} plans={plans} assignPlanToClient={assignPlanToClient}/>
        </div>
      </main>
    </>
  );
}
