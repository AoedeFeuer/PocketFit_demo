import React from "react";
import Header from "./Header";
export default function DoctorProfilePage({ doctor,goBack }){
  const stars = Math.round(doctor.rating||4.8);
  return (
    <>
      <Header title="Physiotherapist profile" left={<button className="iconbtn" onClick={goBack}>←</button>} />
      <main>
        <div className="card" style={{padding:16}}>
          <div className="list">
            <div className="item"><span className="hint">Name</span><span>{doctor.name}</span></div>
            <div className="item"><span className="hint">Star rating</span><span>{"★".repeat(stars)} {(doctor.rating||4.8).toFixed(1)}</span></div>
            <div className="item"><span className="hint">Appointments via PocketFit</span><span>{doctor.pfBookings||128}</span></div>
            <div className="item"><span className="hint">Specialty</span><span>{doctor.specialty||"Sports rehabilitation"}</span></div>
            <div className="item"><span className="hint">Location</span><span>{doctor.location||"Paris 11e"}</span></div>
          </div>
        </div>
      </main>
    </>
  );
}
