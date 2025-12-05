import React from "react";
import Header from "./Header";
import { DOCTOR_APPTS } from "../../shared/data";

export default function DoctorClientsPage({ clients,setSearch,search,openClientFromClients }){
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
  return (
    <>
      <Header title="Clients" />
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
                  {(c.missedDays>=2 || c.feelBad) && <div className="badge attn">{c.feelBad?"I feel bad":"Skipped "+c.missedDays+" days"}</div>}
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
