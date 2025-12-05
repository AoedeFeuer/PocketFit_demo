import React, { useEffect, useState } from "react";
import PatientApp from "./patient/PatientApp.jsx";
import DoctorApp from "./doctor/DoctorApp.jsx";
import logo from "./assets/logo.png";

function Splash({ onDone }){
  useEffect(()=>{const t=setTimeout(onDone,500);return()=>clearTimeout(t);},[onDone]);
  return (
    <div className="center" style={{minHeight:"100vh",padding:24}}>
      <div className="stack" style={{placeItems:"center"}}>
	<div className="logo">PF</div>
        <div style={{fontWeight:800,fontSize:22}}>PocketFit</div>
        <div className="hint">Loading…</div>
      </div>
    </div>
  );
}

function RoleChoice({ onPatient,onDoctor }){
  return (
    <div style={{padding:16}}>
      <div className="stack" style={{gap:20}}>
        <div className="center" style={{marginTop:24}}>
	  <img src={logo} alt="PocketFit" className="brandMark" />
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:20}}>Welcome to PocketFit</div>
          <div className="hint">Choose how you want to use the app.</div>
        </div>
        <div className="stack">
          <button className="btn" onClick={onPatient}>I'm a patient</button>
          <button className="btn secondary" onClick={onDoctor}>I'm a doctor</button>
        </div>
      </div>
    </div>
  );
}


function PatientRegister({ onSubmit }) {
  // ⬇️ Prefilled demo values
  const [name, setName]         = useState("Emma Johnson");
  const [age, setAge]           = useState(29);
  const [weight, setWeight]     = useState(64);
  const [height, setHeight]     = useState(170);
  const [sportArea, setSportArea] = useState("Running");
  const [injury, setInjury]     = useState("Knee ACL sprain");

  function handle(e){
    e.preventDefault();
    onSubmit({
      id: crypto.randomUUID(),
      name, age, injury,
      weight, height, sportArea,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div style={{padding:16}}>
      <div className="stack" style={{gap:16}}>
        <div className="center" style={{marginTop:16}}>
  	<img src={logo} alt="PocketFit" className="brandMark" /></div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontWeight:800,fontSize:20}}>Create your profile</div>
          <div className="hint">A few details to personalise your recovery.</div>
        </div>
        <form onSubmit={handle} className="stack">
          <div className="field"><div className="label">Name</div><input className="input" value={name} onChange={e=>setName(e.target.value)} required/></div>
          <div className="row">
            <div className="field" style={{flex:1}}><div className="label">Age</div><input className="input" type="number" value={age} onChange={e=>setAge(e.target.value)} required/></div>
            <div className="field" style={{flex:1}}><div className="label">Weight (kg)</div><input className="input" type="number" value={weight} onChange={e=>setWeight(e.target.value)}/></div>
          </div>
          <div className="row">
            <div className="field" style={{flex:1}}><div className="label">Height (cm)</div><input className="input" type="number" value={height} onChange={e=>setHeight(e.target.value)}/></div>
            <div className="field" style={{flex:1}}><div className="label">Sport area</div><input className="input" value={sportArea} onChange={e=>setSportArea(e.target.value)}/></div>
          </div>
          <div className="field"><div className="label">Type of injury</div><input className="input" value={injury} onChange={e=>setInjury(e.target.value)}/></div>
          
	  <button className="btn" style={{marginTop:4}}>Continue to home</button>
        </form>
      </div>
    //</div>
  );
}

function DoctorLogin({ onSubmit,onBack }){
  const [name,setName]=useState("");
  function submit(e){e.preventDefault();const n=name.trim();if(!n)return;onSubmit({name:n,rating:4.8,pfBookings:128,specialty:"Sports rehabilitation",location:"Paris 11e"});}
  return (
    <div style={{padding:16}}>
      <div className="stack" style={{gap:16}}>
        <button className="iconbtn" onClick={onBack}>←</button>
        <div>
          <div style={{fontWeight:800,fontSize:20}}>Physiotherapist sign-in</div>
          <div className="hint">Enter your name to continue.</div>
        </div>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <div className="label">Your name</div>
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="John Smith"/>
          </div>
          <button className="btn">Continue</button>
        </form>
      </div>
    </div>
  );
}

export default function App(){
  const [page,setPage]=useState("splash");
  const [role,setRole]=useState(null);
  const [doctor,setDoctor]=useState(null);
  const [patientRegistered,setPatientRegistered]=useState(false);
  const showPatientApp = role==="patient" && patientRegistered;
  const showDoctorApp = role==="doctor" && !!doctor;

  //useEffect(() => {
  // try {
    //localStorage.removeItem('pf_recovery');
  //  sessionStorage.removeItem('pf_recovery');
  // } catch {}
  //}, []);
  useEffect(() => {
   try {
    const kill = (k) =>
      k.startsWith("pf_") ||
      k.includes("recovery") ||
      k.includes("appts") ||
      k.includes("chat");
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && kill(k)) localStorage.removeItem(k);
    }
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const k = sessionStorage.key(i);
      if (k && kill(k)) sessionStorage.removeItem(k);
    }
   } catch {}
  }, []);

  return (
    <div className="app">
      {page==="splash" && <Splash onDone={()=>setPage("role")}/>}
      {page==="role" && <RoleChoice onPatient={()=>{setRole("patient");setPage("patient-register");}} onDoctor={()=>{setRole("doctor");setPage("doctor-login");}}/>}
      {role==="patient" && page==="patient-register" && (
        <PatientRegister onSubmit={(user)=>{ try{ localStorage.setItem("pf_user", JSON.stringify(user)); }catch{} setPatientRegistered(true); setPage("patient-app"); }}/>
      )}
      {role==="doctor" && page==="doctor-login" && (
        <DoctorLogin onSubmit={(info)=>{setDoctor(info);setPage("doctor-app");}} onBack={()=>{setRole(null);setPage("role");}}/>
      )}

      {showPatientApp && page==="patient-app" && <PatientApp/>}
      {showDoctorApp && page==="doctor-app" && <DoctorApp doctor={doctor}/>}
    </div>
  );
}
