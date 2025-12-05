import { todayStr, addDays, fmtDate } from "./dates";
export const EXERCISE_LIBRARY = ["Quad sets","Glute bridge","Step-downs"];
export const DAILY_EXERCISES  = ["Gentle warm-up (5 min)","Mobility drills (5 min)","Light strength work (5 min)"];
export const THERAPISTS = [
  { id:"t1", name:"Dr. Maya Chen", rating:4.9, distance:"0.8 km", specialty:"Sports rehab" },
  { id:"t2", name:"Alexei Morozov", rating:4.8, distance:"1.2 km", specialty:"Post-injury recovery" },
  { id:"t3", name:"Laura García", rating:4.7, distance:"2.0 km", specialty:"Back & shoulder" },
  { id:"t4", name:"Sam O’Connor", rating:4.6, distance:"1.5 km", specialty:"Knee & ankle" },
  { id:"t5", name:"Haruka Tanaka", rating:4.9, distance:"0.6 km", specialty:"Athletic training" },
];
export const BASE_DOCTOR_CLIENTS = [
  { id:"c1", name:"Emma Johnson", injury:"Knee ACL", progress:72, missedDays:0, new:true, feelBad:false },
  { id:"c2", name:"David Kim", injury:"Lumbar strain", progress:55, missedDays:2, new:false, feelBad:false },
  { id:"c3", name:"Lucas Meyer", injury:"Shoulder impingement", progress:40, missedDays:0, new:false, feelBad:false },
  { id:"c4", name:"Sara Lee", injury:"Lower back", progress:100, missedDays:0, new:false, feelBad:false },
  { id:"c5", name:"Noah Schmidt", injury:"Ankle sprain", progress:20, missedDays:0, new:true, feelBad:false },
  { id:"c6", name:"Chloe Martin", injury:"Patellofemoral pain", progress:35, missedDays:1, new:false, feelBad:true },
];
export const DOCTOR_APPTS = [
  { id:"a1", clientId:"c1", date: todayStr(), time:"10:00", type:"Follow-up" },
  { id:"a2", clientId:"c2", date: todayStr(), time:"11:30", type:"Mobility session" },
  { id:"a3", clientId:"c3", date: fmtDate(addDays(new Date(),1)), time:"09:00", type:"Initial assessment" },
  { id:"a4", clientId:"c4", date: fmtDate(addDays(new Date(),3)), time:"15:00", type:"Re-evaluation" },
  { id:"a5", clientId:"c5", date: fmtDate(addDays(new Date(),2)), time:"16:00", type:"Initial assessment" },
  { id:"a6", clientId:"c6", date: fmtDate(addDays(new Date(),1)), time:"14:30", type:"Pain review" },
];
export const INITIAL_DOCTOR_UNAVAIL = [
  { id:"u1", date: todayStr(), start:"08:00", end:"09:00", label:"Admin time" },
  { id:"u2", date: fmtDate(addDays(new Date(),2)), start:"12:00", end:"13:00", label:"Lunch" },
];
export const INITIAL_DOCTOR_PLANS = [
  { id:"p1", injury:"Knee injury (ACL)", duration:"14 days", description:"Early ACL rehab: quad sets, bridges, step-downs.",
    days:[
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    ],
  },
  { id:"p2", injury:"Lower back pain", duration:"21 days", description:"Core stability and hip mobility focus.",
    days:[
      {exercises:[EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2],EXERCISE_LIBRARY[0]]},
      {exercises:[EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[2]]},
      {exercises:[EXERCISE_LIBRARY[0],EXERCISE_LIBRARY[1],EXERCISE_LIBRARY[2]]},
    ],
  },
];
