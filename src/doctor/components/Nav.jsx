import React from "react";
import { Icon } from "../../common/icons";
export default function DoctorNav({ doctorNav,setDoctorNav,setPage }){
  const items=[
    {id:"doctor-home",label:"Home",icon:Icon.home},
    {id:"doctor-calendar",label:"Calendar",icon:Icon.cal},
    {id:"doctor-clients",label:"Clients",icon:Icon.users},
    {id:"doctor-plans",label:"Plans",icon:Icon.plan},
  ];
  function go(id){setDoctorNav(id);setPage(id);}
  return (
    <nav className="tabs">
      <div className="tabbar">
        {items.map(it=>(
          <button key={it.id} className={`tab ${doctorNav===it.id?"active":""}`} onClick={()=>go(it.id)}>
            <div style={{display:"grid",placeItems:"center",gap:4}}>{it.icon({})}<div>{it.label}</div></div>
          </button>
        ))}
      </div>
    </nav>
  );
}
