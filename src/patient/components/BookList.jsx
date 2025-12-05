import React from "react";
import Header from "./Header";
import { THERAPISTS } from "../../shared/data";

export default function PatientBookList({ onSelect }){
  return (
    <>
      <Header title="Find a therapist" />
      <main>
        <div className="card" style={{padding:16}}>
          <div className="hint" style={{marginBottom:8}}>Mock list of nearby physiotherapists.</div>
          <div className="list">
            {THERAPISTS.map(t=>(
              <button key={t.id} className="item" onClick={()=>onSelect(t)} style={{alignItems:"flex-start"}}>
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
}
