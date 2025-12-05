import React from "react";
import Header from "./Header";
export default function DoctorPlansPage({ plans,setPage,setEditingPlanId }){
  return (
    <>
      <Header title="Plans" />
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
