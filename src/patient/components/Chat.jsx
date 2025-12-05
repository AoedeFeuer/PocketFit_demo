import React, { useState } from "react";
import Header from "./Header";
import { useLS, LS_KEYS } from "../../shared/hooks";

export default function PatientChat(){
  const [messages,setMessages]=useLS(LS_KEYS.chat,[
    {id:"1",who:"assistant",text:"Hi! I’m your personal PocketFit Assistant—here to explain app features, share non-medical tips, and help match you with the best physiotherapist for you (no medical advice)."},
    {id:"2",who:"you",text:"What should I do today?"},
    {id:"3",who:"assistant",text:"Light mobility plus your three daily exercises is perfect."},
  ]);
  const [text,setText]=useState("");
  const MAX=40;
  function send(){
    const t=text.trim(); if(!t) return;
    setMessages(m=>[...m,{id:crypto.randomUUID(),who:"you",text:t},{id:crypto.randomUUID(),who:"assistant",text:"Thanks, this is a demo reply based on your question."}]);
    setText("");
  }
  return (
    <>
      <Header title="Assistant" />
      <main>
        <div className="card" style={{padding:12}}>
          <div className="list">
            {messages.map(m=>(
              <div key={m.id} className="item" style={{justifyContent:m.who==="you"?"flex-end":"flex-start"}}>
                <div style={{background:m.who==="you"?"var(--accent)":"#fff",color:m.who==="you"?"#fff":"var(--text)",padding:"8px 12px",borderRadius:12,border:"1px solid var(--border)"}}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="row" style={{marginTop:12}}>
            <input className="input" value={text} onChange={e=>setText(e.target.value.slice(0,MAX))} placeholder="Ask (max 40 chars)"/>
            <button className="btn" onClick={send}>Send</button>
          </div>
        </div>
      </main>
    </>
  );
}
