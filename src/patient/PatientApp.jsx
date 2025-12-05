import React, { useState, useEffect } from "react";
import { useLS, LS_KEYS } from "../shared/hooks";
import { todayStr } from "../shared/dates";

import Home from "./components/Home.jsx";
import Calendar from "./components/Calendar.jsx";
import BookList from "./components/BookList.jsx";
import BookDetail from "./components/BookDetail.jsx";
import Chat from "./components/Chat.jsx";
import Profile from "./components/Profile.jsx";
import TodayProgram from "./components/TodayProgram.jsx";
import BottomNav from "./components/BottomNav.jsx";

export default function PatientApp(){
  const [user,setUser]=useLS(LS_KEYS.user,null);
  const [recovery,setRecovery]=useLS(LS_KEYS.recovery,{ startDate: todayStr(), completedDays: [], exercises: {}, petType:"kangaroo" });
  const [patientNav,setPatientNav]=useState("home");
  const [patientAppts,setPatientAppts]=useLS(LS_KEYS.appts,[
    {id:"p1",date:todayStr(),time:"09:30",therapistId:"t1",therapistName:"Dr. Maya Chen",type:"Check-in"},
  ]);
  const [page,setPage]=useState("home");
  const [selectedTherapist,setSelectedTherapist]=useState(null);


  // Clear any legacy persisted recovery from older builds to guarantee a clean start on reload
  useEffect(()=>{
    try { localStorage.removeItem('pf_recovery'); sessionStorage.removeItem('pf_recovery'); } catch {}
  }, []);

  // Ensure user is populated from localStorage if available
  useEffect(()=>{
    if(!user){
      try { const raw = localStorage.getItem('pf_user'); if(raw){ setUser(JSON.parse(raw)); } } catch {}
    }
  }, [user, setUser]);
  return (
    <div className="app">
      {page==="home" && <Home user={user} recovery={recovery} setRecovery={setRecovery} goProfile={()=>setPage("profile")} onViewAll={()=>setPage("program")} />}
      {page==="calendar" && <Calendar appointments={patientAppts} recovery={recovery} />}
      {page==="book-list" && <BookList onSelect={(t)=>{setSelectedTherapist(t);setPage("book-detail");}}/>}
      {page==="book-detail" && selectedTherapist && (
        <BookDetail
          therapist={selectedTherapist}
          onBack={()=>setPage("book-list")}
          onBook={(slot)=>{
            setPatientAppts(prev=>[...prev,{id:crypto.randomUUID(),...slot}]);
            setPage("calendar");
            setPatientNav("calendar");
          }}
        />
      )}
      {page==="chat" && <Chat/>}
      {page==="program" && <TodayProgram recovery={recovery} setRecovery={setRecovery} onBack={()=>setPage("home")} />}
      {page==="profile" && <Profile user={user} recovery={recovery} setRecovery={setRecovery} onBack={()=>setPage("home")} />}

      <BottomNav nav={patientNav} setNav={setPatientNav} setPage={setPage}/>
    </div>
  );
}
