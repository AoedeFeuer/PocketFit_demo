import React from "react";
import Header from "./Header";
import { Icon } from "../../common/icons";
import { todayStr, clamp, fmtDate } from "../../shared/dates";
import { DAILY_EXERCISES } from "../../shared/data";
import kangaroo from '../../assets/kangaroo.jpg';
export default function PatientHome({ user,recovery,setRecovery, goProfile, onViewAll }) {
  const today = todayStr(); const planLength = recovery.planLength || 14;
  const completedDays = Array.isArray(recovery.completedDays)?recovery.completedDays:[];
  const progress = clamp((completedDays.length/planLength)*100);
  const map = recovery.exercises || {}; const list = map[today] || [false,false,false];
  const doneToday = list.every(Boolean);
  const petType = recovery.petType || "kangaroo";
  const petEmoji = petType==="cat"?"🐈":petType==="panda"?"🐼":"🐕";
  const firstName = (user?.name || "there").split(" ")[0];

  //const start = recovery.startDate ? new Date(recovery.startDate) : new Date();
  //const diffDays = Math.max(0, Math.floor((new Date() - new Date(start)) / (1000*60*60*24)));
  //const planDay = Math.min(planLength, diffDays + 1);
  //const doneCount = Array.isArray(completedDays) ? completedDays.length : 0;
  // Show the furthest meaningful day: either planned current day or last completed day
  //let visualDay = Math.max(planDay, Math.min(planLength, doneCount));
  //if(doneCount >= planLength) visualDay = planLength;

	// keep planDay from revamp12 (date-based “Day N”)
  const start = recovery.startDate ? new Date(recovery.startDate) : new Date();
  const diffDays = Math.max(0, Math.floor((new Date() - new Date(start)) / (1000*60*60*24)));
  const planDay = Math.min(planLength, diffDays + 1);

// how many full days are completed (all 3 tasks true)
  const doneCount = Array.isArray(completedDays) ? completedDays.length : 0;

//  ADVANCE the highlighted day immediately after finishing today
// - done nodes: d <= doneCount
// - current node: the next one (doneCount + 1), but never before planDay, and capped by plan length
  const visualDay = Math.min(planLength, Math.max(planDay, doneCount + 1));

  function cyclePet(){
    const order=["kangaroo","dog","cat","panda"];
    const idx=order.indexOf(petType);
    const next=order[(idx+1+order.length)%order.length];
    setRecovery(prev=>({...prev,petType:next}));
  }

  const totalTime = 15;
  const equipment = ["Mat","Resistance band"];

  const nodes = [];
  const startDay = Math.max(1, visualDay-2);
  const endDay = Math.min(planLength, startDay+4);
  for(let d=startDay; d<=endDay; d++) nodes.push(d);

  return (
    <>
      <Header title="PocketFit" right={<button className="iconbtn" onClick={goProfile}>{Icon.profile({})}</button>} />
      <main>
        <div className="stack" style={{gap:12}}>
	  <div className="sectionTitle">Welcome, {firstName}!</div>
          <div className="card" style={{padding:16}}>
            <div className="kangrow">
	  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
	      <button
  		type="button"
  		className="petBox"
  		onClick={cyclePet}
  		aria-label="Change pet"
  		style={{ cursor: "pointer", background: "transparent", border: 0, padding: 0 }}
	>
  		{petType === "kangaroo"
    			? <img src={kangaroo} alt="kangaroo" style={{ width: 96, height: 96, objectFit: "contain", display: "block" }} />
    			: <span style={{ fontSize: 64, lineHeight: 1, display: "block" }}>{petEmoji}</span>}
	      </button>
	  <div className="hint" style={{ fontSize: 12, userSelect: "none" }}>
    Click to change
  </div>
	  </div>
              <div className="progBlock">
                <div className="kmeta">
                  <div style={{fontWeight:700}}>Day {visualDay}</div>
                  <div>{Math.round(progress)}%</div>
                </div>
                <div className="pill"><span style={{width: `${progress}%`}}/></div>
                <div className="hint">Complete all exercises today to grow your pet.</div>
              </div>
            </div>
          </div>

          <div className="card" style={{padding:16}}>
            <div className="row" style={{justifyContent:"space-between",alignItems:"center"}}>
              <div className="sectionTitle">Today&apos;s program</div>
              <a className="link" href="#" onClick={(e)=>{e.preventDefault(); onViewAll();}}>View all</a>
            </div>
            <div className="hint" style={{marginTop:4,marginBottom:8}}>Focus on rebuilding strength and stability.</div>
            <div className="chips">
              <span className="chip">⏱ {totalTime} min</span>
              {equipment.map((x)=> (<span key={x} className="chip">{x}</span>))}
            </div>
            <div className="row" style={{marginTop:12, justifyContent:"flex-end"}}>
              <button className={"btn"} onClick={onViewAll} disabled={doneToday}>
                {doneToday ? "Congratulations!" : "Start"}
              </button>
            </div>
          </div>

          <div className="mapWrap">
            <div className="sectionTitle">Roadmap</div>
            <div className="mapRail"></div>
            <div className="mapNodes">
              {nodes.map((d)=>{
               // const done = d <= doneCount || (doneCount>=planLength);
               // const current = d === visualDay;
		const done    = d <= Math.min(planLength, doneCount);
		const current = (d === visualDay) && (doneCount < planLength);
                const cls = "node "+(current?"current":done?"done":"");
                return <div key={d} className={cls}></div>;
              })}
            </div>
            <div className="mapLabels">
              {nodes.map((d)=>(<div key={d}>Day {d}</div>))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
