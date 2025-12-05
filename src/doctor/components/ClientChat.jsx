import React from "react";
import Header from "./Header";
export default function DoctorClientChat({ client,goBack }){
  const messages=[
    {id:"1",who:"physio",text:`Hi ${client?.name||"client"}, how is the knee today?`},
    {id:"2",who:"client",text:"A bit sore after stairs but okay at rest."},
    {id:"3",who:"physio",text:"Understood. Reduce step-downs by one set and keep the rest similar."},
  ];
  return (
    <>
      <Header title={`Chat with ${client?.name||"client"}`} left={<button className="iconbtn" onClick={goBack}>←</button>} />
      <main>
        <div className="card" style={{padding:12}}>
          <div className="list">
            {messages.map(m=>(
              <div key={m.id} className="item" style={{justifyContent:m.who==="physio"?"flex-start":"flex-end"}}>
                <div style={{background:m.who==="physio"?"#fff":"var(--accent)",color:m.who==="physio"?"var(--text)":"#fff",padding:"8px 12px",borderRadius:12,border:"1px solid var(--border)"}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="hint" style={{marginTop:8}}>Static mock chat for demo.</div>
        </div>
      </main>
    </>
  );
}
