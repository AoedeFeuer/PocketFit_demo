import React from "react";
import { Icon } from "../../common/icons";
export default function PatientBottomNav({ nav,setNav,setPage }){
  const items=[
    {id:"home",label:"Home",icon:Icon.home},
    {id:"calendar",label:"Calendar",icon:Icon.cal},
    {id:"book",label:"Book",icon:Icon.book},
    {id:"chat",label:"Chat",icon:Icon.chat},
  ];
  function go(id){
    setNav(id);
    if(id==="home") setPage("home");
    if(id==="calendar") setPage("calendar");
    if(id==="book") setPage("book-list");
    if(id==="chat") setPage("chat");
  }
  return (
    <nav className="tabs">
      <div className="tabbar">
        {items.map(it=>(
          <button key={it.id} className={`tab ${nav===it.id?"active":""}`} onClick={()=>go(it.id)}>
            <div style={{display:"grid",placeItems:"center",gap:4}}>
              {it.icon({})}
              <div>{it.label}</div>
            </div>
          </button>
        ))}
      </div>
    </nav>
  );
}
