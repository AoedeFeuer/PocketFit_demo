import React, { useState } from "react";
import { BASE_DOCTOR_CLIENTS, INITIAL_DOCTOR_UNAVAIL, INITIAL_DOCTOR_PLANS } from "../shared/data";

import DoctorNav from "./components/Nav.jsx";
import Home from "./components/Home.jsx";
import ProfilePage from "./components/ProfilePage.jsx";
import CalendarPage from "./components/CalendarPage.jsx";
import ClientsPage from "./components/ClientsPage.jsx";
import ClientDetail from "./components/ClientDetail.jsx";
import ClientChat from "./components/ClientChat.jsx";
import PlansPage from "./components/PlansPage.jsx";
import PlanBuilder from "./components/PlanBuilder.jsx";
import PlanEdit from "./components/PlanEdit.jsx";

export default function DoctorApp({ doctor }){
  const [page,setPage]=useState("doctor-home");
  const [doctorNav,setDoctorNav]=useState("doctor-home");
  const [doctorClients,setDoctorClients]=useState(BASE_DOCTOR_CLIENTS);
  const [doctorSelectedClient,setDoctorSelectedClient]=useState(null);
  const [doctorNotes,setDoctorNotes]=useState({});
  const [doctorUnavail,setDoctorUnavail]=useState(INITIAL_DOCTOR_UNAVAIL);
  const [doctorPlans,setDoctorPlans]=useState(INITIAL_DOCTOR_PLANS);
  const [doctorClientSearch,setDoctorClientSearch]=useState("");
  const [editingPlanId,setEditingPlanId]=useState(null);
  const [doctorBackTarget,setDoctorBackTarget]=useState("doctor-home");

  function openClient(fromPage, client){
    if(!client) return;
    setDoctorBackTarget(fromPage);
    setDoctorSelectedClient(client);
    setPage("doctor-client-detail");
  }
  function assignPlanToClient(clientId,plan){
    setDoctorClients(prev=>prev.map(c=>c.id===clientId?{...c,plan}:c));
    setDoctorSelectedClient(prev=>prev && prev.id===clientId?{...prev,plan}:prev);
  }
  function addTemplate(plan){setDoctorPlans(prev=>[...prev,plan]);}

  return (
    <div className="app">
      {page==="doctor-home" && (
        <Home doctor={doctor} clients={doctorClients} openProfile={()=>setPage("doctor-profile")} openClientFromHome={(c)=>openClient("doctor-home",c)} />
      )}
      {page==="doctor-profile" && <ProfilePage doctor={doctor} goBack={()=>setPage("doctor-home")} />}
      {page==="doctor-calendar" && (
        <CalendarPage clients={doctorClients} unavail={doctorUnavail} setUnavail={setDoctorUnavail} openClientFromCalendar={(c)=>openClient("doctor-calendar",c)} />
      )}
      {page==="doctor-clients" && (
        <ClientsPage clients={doctorClients} search={doctorClientSearch} setSearch={setDoctorClientSearch} openClientFromClients={(c)=>openClient("doctor-clients",c)} />
      )}
      {page==="doctor-client-detail" && (
        <ClientDetail
          client={doctorSelectedClient}
          notesById={doctorNotes}
          setNotesById={setDoctorNotes}
          goBack={()=>setPage(doctorBackTarget)}
          plans={doctorPlans}
          assignPlanToClient={assignPlanToClient}
          setPageToChat={()=>setPage("doctor-client-chat")}
        />
      )}
      {page==="doctor-client-chat" && <ClientChat client={doctorSelectedClient} goBack={()=>setPage("doctor-client-detail")} />}
      {page==="doctor-plans" && <PlansPage plans={doctorPlans} setPage={setPage} setEditingPlanId={setEditingPlanId} />}
      {page==="doctor-plan-builder" && <PlanBuilder setPage={setPage} addTemplate={(p)=>addTemplate(p)} />}
      {page==="doctor-plan-edit" && <PlanEdit plans={doctorPlans} setPlans={setDoctorPlans} editingPlanId={editingPlanId} setPage={setPage} />}

      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage}/>
    </div>
  );
}
