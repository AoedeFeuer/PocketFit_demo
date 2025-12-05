import React from "react";
import Header from "./Header";
import { Icon } from "../../common/icons";
import { todayStr } from "../../shared/dates";
import { DOCTOR_APPTS } from "../../shared/data";

export default function DoctorHome({ doctor,clients,openProfile,openClientFromHome }){
  const alerts = clients.filter(c=>(c.missedDays||0)>=2 || c.feelBad);
  const apptsToday = DOCTOR_APPTS.filter(a=>a.date===todayStr()).map(a=>({...a,client:clients.find(c=>c.id===a.clientId)}));
  const firstName = doctor.name.split(" ")[0];
  return (
    <>
      <Header title="Pocketfit • Physiotherapist" right={<button className="iconbtn" onClick={openProfile}>⚙</button>} />
      <main>
        <div style={{marginBottom:12}}>
          <div style={{fontSize:18,fontWeight:700}}>Welcome, Dr. {firstName}</div>
          <div className="hint">Here is an overview of today's caseload.</div>
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
