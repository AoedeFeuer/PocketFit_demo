import React, { useEffect, useMemo, useState } from "react";

/**
 * PocketFit – Full prototype (Patient + Doctor) with Notes and Alerts
 * - Patient: registration, Tamagotchi pet, calendar, therapists, booking, chat, profile
 * - Doctor: login, home with alerts, clients list with badges, client detail with notes, calendar, bills, plans
 */

// ---- CLEAR PERSISTED DATA ON LOAD (demo mode) ----
if (typeof window !== "undefined") {
  try {
    ["pf_user", "pf_appts", "pf_chat", "pf_recovery", "pf_exercise_log"].forEach(
      (k) => window.localStorage.removeItem(k)
    );
  } catch (e) {
    console.warn("Cannot clear PocketFit storage", e);
  }
}

// ---------- THEME ----------
const theme = {
  bg: "#FAFAF9",
  surface: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  accent: "#10B981",
  accentSoft: "#A7F3D0",
};

const css = `
  :root{
    --bg:${theme.bg};
    --surface:${theme.surface};
    --text:${theme.text};
    --muted:${theme.muted};
    --border:${theme.border};
    --accent:${theme.accent};
    --accentSoft:${theme.accentSoft};
  }
  *{box-sizing:border-box}
  .app{max-width:420px;margin:0 auto;min-height:100vh;display:flex;flex-direction:column;background:var(--bg)}
  header{position:sticky;top:0;background:rgba(255,255,255,.9);backdrop-filter:saturate(180%) blur(8px);border-bottom:1px solid var(--border);z-index:10}
  .hwrap{display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
  .title{font-weight:700}
  .iconbtn{width:36px;height:36px;border-radius:12px;border:1px solid var(--border);display:grid;place-items:center;background:var(--surface)}
  main{flex:1;padding:16px}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:0 6px 20px rgba(2,6,23,.06)}
  .btn{height:44px;border-radius:12px;border:1px solid transparent;background:var(--accent);color:#fff;font-weight:600;display:inline-grid;place-items:center;padding:0 16px}
  .btn.secondary{background:#fff;color:var(--text);border-color:var(--border)}
  .btn.ghost{background:transparent;border-color:var(--border);color:var(--text)}
  .btn.warn{background:#fff;color:#b45309;border-color:#f59e0b}
  .btn:disabled{opacity:.6}
  .badge{font-size:11px;padding:2px 8px;border-radius:999px;border:1px solid var(--border);background:#fff;color:var(--muted)}
  .badge.attn{border-color:#f59e0b;color:#b45309;background:#fff8e1}
  .field{display:grid;gap:6px}
  .label{font-size:12px;color:var(--muted)}
  .input, select, .textarea{height:44px;border-radius:12px;border:1px solid var(--border);padding:0 12px;background:#fff;color:var(--text)}
  .textarea{height:88px;padding:10px 12px}
  .row{display:flex;gap:12px}
  .stack{display:grid;gap:12px}
  .center{display:grid;place-items:center}
  .logo{width:96px;height:96px;border-radius:28px;background:linear-gradient(135deg,var(--accentSoft),var(--accent));display:grid;place-items:center;color:#fff;font-weight:800;font-size:28px;box-shadow:0 10px 30px rgba(16,185,129,.25)}
  .pet{width:120px;height:120px;border-radius:999px;background:#F3F4F6;display:grid;place-items:center;font-size:56px;border:1px solid var(--border);cursor:pointer}
  .stat{display:grid;gap:6px}
  .bar{height:12px;border-radius:999px;background:#E5E7EB;overflow:hidden}
  .bar>span{display:block;height:100%;background:var(--accent)}
  .tabs{position:sticky;bottom:0;background:rgba(255,255,255,.98);backdrop-filter:saturate(180%) blur(8px);border-top:1px solid var(--border)}
  .tabbar{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}
  .tab{height:44px;border-radius:12px;border:1px solid var(--border);background:#fff;display:grid;place-items:center;font-size:12px;color:var(--muted)}
  .tab.active{background:var(--accent);color:#fff;border-color:transparent;font-weight:600}
  .hint{font-size:12px;color:var(--muted)}
  .list{display:grid;gap:8px}
  .item{padding:10px 12px;border-radius:12px;border:1px solid var(--border);display:flex;justify-content:space-between;align-items:center}
  .calendar{display:grid;gap:8px}
  .calhead{display:flex;align-items:center;justify-content:space-between}
  .grid7{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .day{height:42px;border-radius:10px;border:1px solid var(--border);display:grid;place-items:center;background:#fff;font-size:12px;position:relative}
`;

// ---------- UTIL ----------
const fmtDate = (d) => d.toISOString().slice(0, 10);
const todayStr = () => fmtDate(new Date());
function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function endOfMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0); }
function addMonths(date, n) { return new Date(date.getFullYear(), date.getMonth() + n, 1); }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }
function getMonthCells(base) {
  const s = startOfMonth(base), e = endOfMonth(base);
  const cells = [];
  for (let i = 0; i < s.getDay(); i++) cells.push(null);
  for (let d = 1; d <= e.getDate(); d++) cells.push(new Date(base.getFullYear(), base.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
const clamp = (n, min = 0, max = 100) => Math.max(min, Math.min(max, n));

// ---------- STORAGE ----------
const LS = {
  user: "pf_user",
  appts: "pf_appts",
  chat: "pf_chat",
  recovery: "pf_recovery",
  log: "pf_exercise_log",
};
const useLS = (key, init) => {
  const [v, setV] = useState(() => {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : init; } catch { return init; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(v)); } catch {} }, [key, v]);
  return [v, setV];
};

// ---------- SAMPLE THERAPISTS ----------
const THERAPISTS = [
  { id: "t1", name: "Dr. Maya Chen", rating: 4.9, distance: "0.8 km", specialty: "Sports rehab" },
  { id: "t2", name: "Alexei Morozov", rating: 4.8, distance: "1.2 km", specialty: "Post-injury recovery" },
  { id: "t3", name: "Laura García", rating: 4.7, distance: "2.0 km", specialty: "Back & shoulder" },
  { id: "t4", name: "Sam O’Connor", rating: 4.6, distance: "1.5 km", specialty: "Knee & ankle" },
  { id: "t5", name: "Haruka Tanaka", rating: 4.9, distance: "0.6 km", specialty: "Athletic training" },
];

// ---------- DAILY EXERCISES ----------
const DAILY_EXERCISES = [
  "Gentle warm-up (5 min)",
  "Mobility drills (5 min)",
  "Light strength work (5 min)",
];

// ---------- DOCTOR MOCK DATA ----------
const DOCTOR_CLIENTS = {
  new: [
    { id: "n1", name: "Anna Novak", injury: "Ankle sprain", note: "Referred today" },
    { id: "n2", name: "Marco Rossi", injury: "Shoulder pain", note: "Awaiting first session" },
    { id: "n3", name: "Sara Lee", injury: "Lower back", note: "Screening pending" },
  ],
  current: [
    { id: "c1", name: "Emma Johnson", injury: "Knee ACL", progress: 70, missedDays: 0 },
    { id: "c2", name: "David Kim", injury: "Lumbar strain", progress: 55, missedDays: 2 }, // needs attention
    { id: "c3", name: "Lucas Meyer", injury: "Shoulder impingement", progress: 40, missedDays: 0 },
  ],
  finished: [
    { id: "f1", name: "Isabel Cruz", injury: "Ankle rehab", outcome: "Returned to sport" },
    { id: "f2", name: "Tom Becker", injury: "Hamstring strain", outcome: "Pain free" },
    { id: "f3", name: "Yuki Tanaka", injury: "Neck pain", outcome: "Discharged" },
  ],
};

const DOCTOR_APPOINTMENTS = [
  { id: "a1", patient: "Emma Johnson", date: "2025-03-10", time: "10:00", type: "Knee rehab follow-up" },
  { id: "a2", patient: "David Kim", date: "2025-03-10", time: "11:30", type: "Back mobility session" },
  { id: "a3", patient: "Anna Novak", date: "2025-03-11", time: "09:00", type: "Initial assessment" },
];

const DOCTOR_BILLS = [
  { id: "b1", patient: "Emma Johnson", amount: 80, status: "Paid" },
  { id: "b2", patient: "David Kim", amount: 60, status: "Pending" },
  { id: "b3", patient: "Sara Lee", amount: 90, status: "Paid" },
];

const INITIAL_DOCTOR_PLANS = [
  {
    id: "p1",
    injury: "Knee injury (ACL)",
    duration: "2 weeks",
    description: "3 exercises / day: quad sets, bridges, step-downs.",
  },
  {
    id: "p2",
    injury: "Lower back pain",
    duration: "3 weeks",
    description: "Core stability, hip mobility, gentle extensions.",
  },
];

// ---------- ICONS ----------
const Icon = {
  profile: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <circle cx="12" cy="8" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 21c1.8-3.7 5-5.5 8-5.5s6.2 1.8 8 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  home: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M3 11.5 12 4l9 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 11v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  cal: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 3v4M17 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  book: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 4h9a3 3 0 0 1 3 3v13H8a2 2 0 0 1-2-2V4Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  chat: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M4 6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H9l-5 5V6Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  money: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  plan: (p) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" {...p}>
      <path d="M6 4h9l3 3v13H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
};

// ---------- SPLASH ----------
function Splash({ onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 900); return () => clearTimeout(t); }, [onDone]);
  return (
    <div className="center" style={{ minHeight: "100vh", padding: 24 }}>
      <style>{css}</style>
      <div className="stack" style={{ placeItems: "center" }}>
        <div className="logo">PF</div>
        <div style={{ fontWeight: 700, fontSize: 22 }}>PocketFit</div>
        <div className="hint">Loading…</div>
      </div>
    </div>
  );
}

// ---------- ROLE CHOICE ----------
function RoleChoice({ onPatient, onDoctor }) {
  return (
    <div style={{ padding: 16 }}>
      <div className="stack" style={{ gap: 20 }}>
        <div className="center" style={{ marginTop: 24 }}>
          <div className="logo" style={{ width: 72, height: 72, fontSize: 22 }}>PF</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Welcome to PocketFit</div>
          <div className="hint">Choose how you want to use the app.</div>
        </div>
        <div className="stack">
          <button className="btn" onClick={onPatient}>I&apos;m a patient</button>
          <button className="btn secondary" onClick={onDoctor}>I&apos;m a doctor</button>
        </div>
      </div>
    </div>
  );
}

// ---------- PATIENT: REGISTER ----------
function Register({ onSubmit }) {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [injury, setInjury] = useState("");
  const [needsTherapist, setNeedsTherapist] = useState("yes");
  const [hasPlan, setHasPlan] = useState("needs");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [sportArea, setSportArea] = useState("");

  function submit(e) {
    e.preventDefault();
    onSubmit({
      id: crypto.randomUUID(),
      name, age, injury, needsTherapist,
      planStatus: hasPlan, weight, height, sportArea,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div style={{ padding: 16 }}>
      <div className="stack" style={{ gap: 16 }}>
        <div className="center" style={{ marginTop: 16 }}>
          <div className="logo" style={{ width: 72, height: 72, fontSize: 22 }}>PF</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Create your profile</div>
          <div className="hint">Tell us a few details to personalize PocketFit.</div>
        </div>
        <form onSubmit={submit} className="stack">
          <div className="field">
            <div className="label">Name</div>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
          </div>

          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Age</div>
              <input className="input" type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} placeholder="28" required />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Weight (kg)</div>
              <input className="input" type="number" min="0" max="400" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="65" />
            </div>
          </div>

          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Height (cm)</div>
              <input className="input" type="number" min="0" max="250" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="170" />
            </div>
            <div className="field" style={{ flex: 1 }}>
              <div className="label">Sport area</div>
              <input className="input" value={sportArea} onChange={(e) => setSportArea(e.target.value)} placeholder="Running, yoga, etc." />
            </div>
          </div>

          <div className="field">
            <div className="label">Type of injury</div>
            <input className="input" value={injury} onChange={(e) => setInjury(e.target.value)} placeholder="Knee, shoulder, back…" />
          </div>

          <div className="field">
            <div className="label">Do you need a therapist?</div>
            <div className="row">
              <button type="button" className={`btn ${needsTherapist === "yes" ? "" : "secondary"}`} onClick={() => setNeedsTherapist("yes")}>Yes</button>
              <button type="button" className={`btn ${needsTherapist === "no" ? "" : "secondary"}`} onClick={() => setNeedsTherapist("no")}>No</button>
            </div>
          </div>

          <div className="field">
            <div className="label">Plan</div>
            <select value={hasPlan} onChange={(e) => setHasPlan(e.target.value)}>
              <option value="needs">I need a plan</option>
              <option value="has">I already have one</option>
            </select>
          </div>

          <button className="btn" style={{ marginTop: 4 }}>Continue to Home</button>
        </form>
      </div>
    </div>
  );
}

// ---------- PATIENT: CALENDAR (inner) ----------
function Calendar({ selectedDate, setSelectedDate, appointments = [], planDays = new Set(), recovery, setRecovery }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const cells = useMemo(() => getMonthCells(month), [month]);
  const label = month.toLocaleString(undefined, { month: "long", year: "numeric" });
  const apptMap = useMemo(() => {
    const m = new Map();
    appointments.forEach((a) => { const k = a.date; m.set(k, (m.get(k) || 0) + 1); });
    return m;
  }, [appointments]);

  const today = todayStr();
  const selectedAppts = appointments.filter((a) => a.date === selectedDate);
  const selectedLabel = selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }) : "";

  const exerciseMap = recovery.exercises || {};
  const selectedExercises = selectedDate && exerciseMap[selectedDate] ? exerciseMap[selectedDate] : [false, false, false];

  function toggleExerciseAtSelected(idx) {
    if (!selectedDate) return;
    setRecovery((prev) => {
      const map = prev.exercises || {};
      const current = map[selectedDate] ? [...map[selectedDate]] : [false, false, false];
      current[idx] = !current[idx];
      const newMap = { ...map, [selectedDate]: current };
      const newAllDone = current.every(Boolean);
      const prevCompleted = new Set(prev.completedDays || []);
      if (newAllDone) prevCompleted.add(selectedDate);
      return { ...prev, exercises: newMap, completedDays: Array.from(prevCompleted) };
    });
  }

  return (
    <div className="stack" style={{ gap: 12 }}>
      <div className="card" style={{ padding: 12 }}>
        <div className="calhead">
          <button className="btn ghost" onClick={() => setMonth(addMonths(month, -1))}>◀</button>
          <div style={{ fontWeight: 600 }}>{label}</div>
          <button className="btn ghost" onClick={() => setMonth(addMonths(month, 1))}>▶</button>
        </div>
        <div className="grid7" style={{ marginTop: 8, color: "var(--muted)" }}>
          {"Sun Mon Tue Wed Thu Fri Sat".split(" ").map((d) => (
            <div key={d} className="center hint" style={{ height: 24 }}>{d}</div>
          ))}
        </div>
        <div className="grid7">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const ds = fmtDate(d);
            const isSel = ds === selectedDate;
            const hasAppt = (apptMap.get(ds) || 0) > 0;
            const dayInPlan = planDays.has(ds);
            return (
              <button key={i} className="day" style={{ background: isSel ? "var(--accentSoft)" : "#fff", borderColor: isSel ? "var(--accent)" : "var(--border)" }} onClick={() => setSelectedDate(ds)}>
                {d.getDate()}
                <div style={{ position: "absolute", bottom: 4, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 4 }}>
                  {dayInPlan && <span style={{ width: 6, height: 6, borderRadius: 999, background: "#A7F3D0", display: "inline-block" }} />}
                  {hasAppt && <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--accent)", display: "inline-block" }} />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ padding: 12 }}>
        <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div className="hint">Selected day</div>
            <div style={{ fontWeight: 600 }}>{selectedLabel || "—"}</div>
          </div>
          <button className="btn ghost" onClick={() => { setSelectedDate(today); setMonth(startOfMonth(new Date())); }}>Back to today</button>
        </div>

        <div className="stack" style={{ marginTop: 8 }}>
          <div>
            <div className="label">Appointments</div>
            {selectedAppts.length === 0 ? (
              <div className="hint">No appointments on this day.</div>
            ) : (
              <div className="list" style={{ marginTop: 4 }}>
                {selectedAppts.map((a) => (
                  <div key={a.id} className="item">
                    <div>
                      <div style={{ fontWeight: 600 }}>{a.title}</div>
                      <div className="hint">{a.time} • {a.therapist || "Physio"}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="label">Training plan</div>
            {planDays.has(selectedDate) ? (
              <>
                <div className="hint" style={{ marginBottom: 4 }}>This day is part of your 2-week training plan.</div>
                <div className="stack">
                  {DAILY_EXERCISES.map((label, idx) => {
                    const done = selectedExercises[idx];
                    return (
                      <button key={idx} type="button" className="item" onClick={() => toggleExerciseAtSelected(idx)}
                        style={{ justifyContent: "space-between", background: done ? "var(--accentSoft)" : "#fff", borderColor: done ? "var(--accent)" : "var(--border)" }}>
                        <span>{label}</span>
                        <span style={{ width: 24, height: 24, borderRadius: 999, border: "1px solid var(--border)", background: done ? "var(--accent)" : "#fff", color: done ? "#fff" : "var(--muted)", display: "grid", placeItems: "center", fontSize: 14 }}>{done ? "✓" : ""}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="hint">No specific training planned. Use it as rest or light mobility.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- PATIENT: HOME (Tamagotchi) ----------
function Home({ user, goProfile, nav, setNav, setPage, recovery, setRecovery }) {
  const today = todayStr();
  const planLength = 14;

  const start = new Date(recovery.startDate || today);
  const now = new Date();
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((nowDay - startDay) / (24 * 60 * 60 * 1000));
  const dayNumber = Math.min(planLength, Math.max(1, diffDays + 1));

  const completedDays = Array.isArray(recovery.completedDays) ? recovery.completedDays : [];
  const completedCount = Math.min(planLength, completedDays.length);
  const progress = clamp((completedCount / planLength) * 100);

  const exerciseMap = recovery.exercises || {};
  const todayExercises = exerciseMap[today] || [false, false, false];
  const allDoneToday = todayExercises.every(Boolean);

  const petType = recovery.petType || "dog";
  const petEmoji = petType === "cat" ? "🐈" : petType === "panda" ? "🐼" : "🐕";

  function toggleExercise(idx) {
    setRecovery((prev) => {
      const currentMap = prev.exercises || {};
      const list = currentMap[today] ? [...currentMap[today]] : [false, false, false];
      list[idx] = !list[idx];
      const newMap = { ...currentMap, [today]: list };
      const newAllDone = list.every(Boolean);
      const prevCompleted = new Set(prev.completedDays || []);
      if (newAllDone) prevCompleted.add(today);
      return { ...prev, exercises: newMap, completedDays: Array.from(prevCompleted) };
    });
  }

  function cyclePet() {
    const order = ["dog", "cat", "panda"];
    const idx = order.indexOf(petType);
    const next = order[(idx + 1) % order.length];
    setRecovery((prev) => ({ ...prev, petType: next }));
  }

  const scale = 0.7 + (progress / 100) * 0.8;

  const Stat = ({ label, val }) => (
    <div className="stat">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <span className="hint">{label}</span>
        <span className="hint">{Math.round(val)}%</span>
      </div>
      <div className="bar"><span style={{ width: val + "%" }} /></div>
    </div>
  );

  return (
    <>
      <header>
        <div className="hwrap">
          <div className="title">PocketFit</div>
          <button className="iconbtn" onClick={() => goProfile()} title="Profile"><Icon.profile /></button>
        </div>
      </header>

      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="center" style={{ marginBottom: 8 }}>
            <div className="pet" style={{ transform: `scale(${scale})`, transition: "transform 300ms" }} aria-label="Pet" onClick={cyclePet} title="Tap to change your pet">
              {petEmoji}
            </div>
          </div>
          <div className="center"><div className="hint">Tap the pet to switch: dog → cat → panda</div></div>

          <div className="stack" style={{ gap: 8, marginTop: 8 }}>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <div className="hint">Day {dayNumber} of 14</div>
              <div className="hint">{Math.round(progress)}% recovery</div>
            </div>
            <Stat label="Recovery stage" val={progress} />
            <div className="hint">{allDoneToday ? "Today's achievement unlocked – your pet is growing!" : "Complete all 3 exercises to unlock today's achievement."}</div>
          </div>

          <div className="stack" style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>Today&apos;s plan</div>
            <div className="hint">Three focused rehab exercises for today.</div>
            {DAILY_EXERCISES.map((label, idx) => {
              const done = todayExercises[idx];
              return (
                <button key={idx} type="button" className="item" onClick={() => toggleExercise(idx)}
                  style={{ justifyContent: "space-between", background: done ? "var(--accentSoft)" : "#fff", borderColor: done ? "var(--accent)" : "var(--border)" }}>
                  <span>{label}</span>
                  <span style={{ width: 24, height: 24, borderRadius: 999, border: "1px solid var(--border)", background: done ? "var(--accent)" : "#fff", color: done ? "#fff" : "var(--muted)", display: "grid", placeItems: "center", fontSize: 14 }}>{done ? "✓" : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: BOOK ----------
function Book({ onCreate, therapist, nav, setNav, setPage, openProfile, goBackToBook }) {
  const [date, setDate] = useState(todayStr());
  const [time, setTime] = useState("10:00");
  const [title, setTitle] = useState(therapist ? `Session with ${therapist.name}` : "Physio session");
  const [notes, setNotes] = useState("");

  return (
    <>
      <header>
        <div className="hwrap">
          <button className="iconbtn" onClick={goBackToBook} title="Back">←</button>
          <div className="title">Book appointment</div>
          <button className="iconbtn" onClick={openProfile} title="Profile"><Icon.profile /></button>
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          {therapist && (
            <div className="item" style={{ marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{therapist.name}</div>
                <div className="hint">{therapist.specialty} • ⭐ {therapist.rating} • {therapist.distance}</div>
              </div>
            </div>
          )}
          <div className="stack">
            <div className="field"><div className="label">Date</div><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
            <div className="field"><div className="label">Time</div><input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} /></div>
            <div className="field"><div className="label">Title</div><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
            <div className="field"><div className="label">Notes</div><textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe pain, goals, etc." /></div>
            <button className="btn" onClick={() => onCreate({ id: crypto.randomUUID(), date, time, title, notes, therapist: therapist ? therapist.name : null, })}>Create</button>
          </div>
        </div>
      </main>
      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: CALENDAR PAGE ----------
function CalendarPage({ selectedDate, setSelectedDate, appointments, planDays, nav, setNav, setPage, openProfile, recovery, setRecovery }) {
  return (
    <>
      <header>
        <div className="hwrap">
          <div className="title">Calendar</div>
          <button className="iconbtn" onClick={openProfile} title="Profile"><Icon.profile /></button>
        </div>
      </header>
      <main>
        <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} appointments={appointments} planDays={planDays} recovery={recovery} setRecovery={setRecovery} />
      </main>
      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: THERAPISTS ----------
function Therapists({ onPick, nav, setNav, setPage, openProfile }) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const q = query.toLowerCase();
    return THERAPISTS.filter((t) => t.name.toLowerCase().includes(q) || t.specialty.toLowerCase().includes(q));
  }, [query]);
  return (
    <>
      <header>
        <div className="hwrap">
          <div className="title">Find a physiotherapist</div>
          <button className="iconbtn" onClick={openProfile} title="Profile"><Icon.profile /></button>
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 12 }}>
          <div className="row" style={{ marginBottom: 12 }}>
            <input className="input" placeholder="Search by name or specialty" value={query} onChange={(e) => setQuery(e.target.value)} style={{ flex: 1 }} />
            <button className="btn secondary" disabled>I have my own plan</button>
          </div>
          <div className="list">
            {items.map((t) => (
              <div key={t.id} className="item">
                <div>
                  <div style={{ fontWeight: 600 }}>{t.name}</div>
                  <div className="hint">{t.specialty} • ⭐ {t.rating} • {t.distance}</div>
                </div>
                <button className="btn" onClick={() => onPick(t)}>Book</button>
              </div>
            ))}
          </div>
        </div>
      </main>
      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: CHAT ----------
function Chat({ nav, setNav, setPage, openProfile }) {
  const initialMessages = [
    { id: "1", who: "assistant", text: "Hi! I'm the PocketFit Assistant. I can explain features and give general, non-medical tips." },
    { id: "2", who: "you", text: "How often should I exercise?" },
    { id: "3", who: "assistant", text: "For this demo, imagine I suggest 10–15 minutes of gentle rehab most days, with at least one rest day. Always confirm with a real professional." },
  ];
  const [messages, setMessages] = useLS(LS.chat, initialMessages);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const MAX = 40;

  function send(textOverride) {
    const raw = textOverride ?? text; const q = raw.trim(); if (!q) return;
    const userMsg = { id: crypto.randomUUID(), who: "you", text: q };
    setMessages((m) => [...m, userMsg]); setText(""); setTyping(true);
    setTimeout(() => {
      const a = "Thanks for your question. In this prototype I only provide generic, non-medical feedback. Please consult a professional for personal advice.";
      setMessages((m) => [...m, { id: crypto.randomUUID(), who: "assistant", text: a }]); setTyping(false);
    }, 600);
  }

  return (
    <>
      <header>
        <div className="hwrap">
          <div className="title">Assistant</div>
          <button className="iconbtn" onClick={openProfile} title="Profile"><Icon.profile /></button>
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 12 }}>
          <div className="list">
            {messages.map((m) => (
              <div key={m.id} className="item" style={{ justifyContent: m.who === "you" ? "flex-end" : "flex-start", gap: 12 }}>
                <div style={{ background: m.who === "you" ? "var(--accent)" : "#fff", color: m.who === "you" ? "#fff" : "var(--text)", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)", whiteSpace: "pre-wrap" }}>{m.text}</div>
              </div>
            ))}
            {typing && (<div className="item" style={{ gap: 12 }}><div style={{ background: "#fff", padding: "8px 12px", borderRadius: 12, border: "1px solid var(--border)" }}>…typing</div></div>)}
          </div>
          <div className="row" style={{ marginTop: 12, alignItems: "center" }}>
            <input className="input" placeholder="Ask (max 40 chars)" value={text} onChange={(e) => setText(e.target.value.slice(0, MAX))} style={{ flex: 1 }} />
            <button className="btn" onClick={() => send()}>Send</button>
          </div>
          <div className="hint" style={{ marginTop: 6 }}>{MAX - text.length} characters left</div>
        </div>
      </main>
      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: PROFILE ----------
function PatientProfile({ user, nav, setNav, setPage, goHome, recovery, setRecovery }) {
  function simulateFinished() {
    const start = new Date(recovery.startDate || todayStr());
    const completedDays = []; const exMap = { ...(recovery.exercises || {}) };
    for (let i = 0; i < 14; i++) { const d = fmtDate(addDays(start, i)); completedDays.push(d); exMap[d] = [true, true, true]; }
    setRecovery((prev) => ({ ...prev, completedDays, exercises: exMap }));
  }
  function resetPlan() {
    setRecovery({ startDate: todayStr(), completedDays: [], exercises: {}, petType: recovery.petType || "dog" });
  }
  return (
    <>
      <header>
        <div className="hwrap">
          <button className="iconbtn" onClick={goHome} title="Back">←</button>
          <div className="title">Profile</div>
          <div style={{ width: 36 }} />
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="row" style={{ alignItems: "center" }}>
            <div className="iconbtn" style={{ width: 56, height: 56, borderRadius: 18, marginRight: 12 }}><Icon.profile /></div>
            <div>
              <div style={{ fontWeight: 700 }}>{user?.name || "Unknown"}</div>
              <div className="hint">Age: {user?.age || "—"}</div>
            </div>
          </div>
          <div className="list" style={{ marginTop: 12 }}>
            <div className="item"><span className="hint">Weight</span><span>{user?.weight ? `${user.weight} kg` : "—"}</span></div>
            <div className="item"><span className="hint">Height</span><span>{user?.height ? `${user.height} cm` : "—"}</span></div>
            <div className="item"><span className="hint">Sport area</span><span>{user?.sportArea || "—"}</span></div>
            <div className="item"><span className="hint">Injury</span><span>{user?.injury || "—"}</span></div>
            <div className="item"><span className="hint">Needs therapist</span><span>{user?.needsTherapist === "yes" ? "Yes" : "No"}</span></div>
            <div className="item"><span className="hint">Plan</span><span>{user?.planStatus === "has" ? "Already has one" : "Needs a plan"}</span></div>
          </div>
          <div className="stack" style={{ marginTop: 16 }}>
            <div className="label">Demo controls</div>
            <button type="button" className="btn secondary" onClick={simulateFinished}>Simulate finished 2-week plan</button>
            <button type="button" className="btn ghost" onClick={resetPlan}>Reset plan</button>
          </div>
        </div>
      </main>
      <BottomNav nav={nav} setNav={setNav} setPage={setPage} />
    </>
  );
}

// ---------- PATIENT: BOTTOM NAV ----------
function BottomNav({ nav, setNav, setPage }) {
  const items = [
    { id: "home", label: "Home", icon: Icon.home },
    { id: "calendar", label: "Calendar", icon: Icon.cal },
    { id: "book", label: "Book", icon: Icon.book },
    { id: "chat", label: "Chat", icon: Icon.chat },
  ];
  function handleClick(id) {
    setNav(id);
    if (id === "home") setPage("home");
    else if (id === "calendar") setPage("calendar");
    else if (id === "book") setPage("therapists");
    else if (id === "chat") setPage("chat");
  }
  return (
    <nav className="tabs">
      <div className="tabbar">
        {items.map((it) => (
          <button key={it.id} className={`tab ${nav === it.id ? "active" : ""}`} onClick={() => handleClick(it.id)}>
            <div style={{ display: "grid", placeItems: "center", gap: 4 }}>{it.icon({})}<div>{it.label}</div></div>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ---------- DOCTOR: LOGIN ----------
function DoctorLogin({ onSubmit, onBack }) {
  const [name, setName] = useState("");
  function submit(e) { e.preventDefault(); const trimmed = name.trim(); if (!trimmed) return; onSubmit({ name: trimmed }); }
  return (
    <div style={{ padding: 16 }}>
      <div className="stack" style={{ gap: 16 }}>
        <button className="iconbtn" onClick={onBack} title="Back">←</button>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontWeight: 700, fontSize: 20 }}>Doctor sign-in</div>
          <div className="hint">We only need your name for this demo.</div>
        </div>
        <form onSubmit={submit} className="stack">
          <div className="field"><div className="label">Your name</div><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" /></div>
          <button className="btn">Continue</button>
        </form>
      </div>
    </div>
  );
}

// ---------- DOCTOR: NAV ----------
function DoctorNav({ doctorNav, setDoctorNav, setPage }) {
  const items = [
    { id: "home", label: "Home", icon: Icon.home },
    { id: "calendar", label: "Calendar", icon: Icon.cal },
    { id: "bills", label: "Bills", icon: Icon.money },
    { id: "plans", label: "Plans", icon: Icon.plan },
  ];
  function handleClick(id) {
    setDoctorNav(id);
    if (id === "home") setPage("doctor-home");
    else if (id === "calendar") setPage("doctor-calendar");
    else if (id === "bills") setPage("doctor-bills");
    else if (id === "plans") setPage("doctor-plans");
  }
  return (
    <nav className="tabs">
      <div className="tabbar">
        {items.map((it) => (
          <button key={it.id} className={`tab ${doctorNav === it.id ? "active" : ""}`} onClick={() => handleClick(it.id)}>
            <div style={{ display: "grid", placeItems: "center", gap: 4 }}>{it.icon({})}<div>{it.label}</div></div>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ---------- DOCTOR: HOME (with alerts) ----------
function DoctorHome({ doctor, setPage, setDoctorCategory, doctorNav, setDoctorNav }) {
  const fullName = doctor?.name || "Doctor";
  const greeting = fullName.startsWith("Dr.") || fullName.startsWith("Dr ") ? fullName : `Dr. ${fullName}`;

  const needsAttention = DOCTOR_CLIENTS.current.filter((c) => (c.missedDays || 0) >= 2);
  const attentionCount = needsAttention.length;

  const cards = [
    { id: "new", label: "New clients", count: DOCTOR_CLIENTS.new.length },
    { id: "current", label: "Current therapy", count: DOCTOR_CLIENTS.current.length, badge: attentionCount ? `${attentionCount} needs attention` : null },
    { id: "finished", label: "Finished therapy", count: DOCTOR_CLIENTS.finished.length },
  ];

  function openCategory(id) { setDoctorCategory(id); setPage("doctor-clients"); }

  return (
    <>
      <header>
        <div className="hwrap">
          <div className="title">PocketFit • Doctor</div>
          <div className="hint">Welcome {greeting}</div>
        </div>
      </header>
      <main>
        {attentionCount > 0 && (
          <div className="card" style={{ padding: 12, borderColor: "#f59e0b" }}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>Alerts</div>
                <div className="hint">{attentionCount} client{attentionCount>1?"s":""} skipped days</div>
              </div>
              <button className="btn warn" onClick={() => openCategory("current")}>Review now</button>
            </div>
            <div className="list" style={{ marginTop: 8 }}>
              {needsAttention.map((c) => (
                <div key={c.id} className="item">
                  <div>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div className="hint">Skipped {c.missedDays} days • {c.injury}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card" style={{ padding: 16, marginTop: 12 }}>
          <div style={{ marginBottom: 12 }}>
            <div className="hint">Overview</div>
            <div style={{ fontWeight: 600, marginTop: 4 }}>Your caseload</div>
          </div>
          <div className="stack">
            {cards.map((c) => (
              <button key={c.id} type="button" className="item" onClick={() => openCategory(c.id)} style={{ justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.label}</div>
                  <div className="hint">Tap to view details</div>
                </div>
                <div style={{ display: "grid", gap: 6, justifyItems: "center" }}>
                  <div style={{ minWidth: 32, height: 32, borderRadius: 999, border: "1px solid var(--border)", display: "grid", placeItems: "center", fontWeight: 600 }}>{c.count}</div>
                  {c.badge && <span className="badge attn">{c.badge}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- DOCTOR: CLIENT LIST (with inline badges) ----------
function DoctorClients({ category, setPage, setSelectedClient, goHome, doctorNav, setDoctorNav }) {
  let title = "New clients", people = DOCTOR_CLIENTS.new;
  if (category === "current") { title = "Current therapy"; people = DOCTOR_CLIENTS.current; }
  else if (category === "finished") { title = "Finished therapy"; people = DOCTOR_CLIENTS.finished; }

  function openClient(p) { if (category === "current") { setSelectedClient(p); setPage("doctor-client-detail"); } }

  return (
    <>
      <header>
        <div className="hwrap">
          <button className="iconbtn" onClick={goHome} title="Back">←</button>
          <div className="title">{title}</div>
          <div style={{ width: 36 }} />
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="stack">
            {people.map((p) => {
              const missed = p.missedDays || 0;
              return (
                <button key={p.id} type="button" className="item" onClick={() => openClient(p)} style={{ justifyContent: "space-between", opacity: category === "current" ? 1 : 0.9 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div className="hint">{p.injury || p.outcome || p.note || (category === "current" ? "In progress" : "")}</div>
                  </div>
                  <div style={{ display: "grid", gap: 6, justifyItems: "end" }}>
                    {category === "current" && <div className="badge">Progress {p.progress}%</div>}
                    {missed >= 2 && <div className="badge attn">Skipped {missed} days</div>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- DOCTOR: CLIENT DETAIL (with Notes) ----------
function DoctorClientDetail({ client, notes, setNotes, setPage, goBackToList, doctorNav, setDoctorNav }) {
  if (!client) {
    return (
      <>
        <header>
          <div className="hwrap">
            <button className="iconbtn" onClick={goBackToList} title="Back">←</button>
            <div className="title">Client</div>
            <div style={{ width: 36 }} />
          </div>
        </header>
        <main><div className="card" style={{ padding: 16 }}><div className="hint">No client selected.</div></div></main>
        <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
      </>
    );
  }
  const totalDays = 14;
  const completed = Math.round(((client.progress || 0) / 100) * totalDays);
  const missed = client.missedDays || 0;
  const showContactButton = missed >= 2;

  return (
    <>
      <header>
        <div className="hwrap">
          <button className="iconbtn" onClick={goBackToList} title="Back">←</button>
          <div className="title">{client.name}</div>
          <div style={{ width: 36 }} />
        </div>
      </header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="stack">
            <div><div className="hint">Injury</div><div style={{ fontWeight: 600 }}>{client.injury}</div></div>
            <div className="stat">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="hint">Program progress</span><span className="hint">{client.progress}%</span>
              </div>
              <div className="bar"><span style={{ width: `${client.progress}%` }} /></div>
            </div>
            <div className="hint">{completed} / {totalDays} planned days completed.</div>
            {missed > 0 && (<div className="hint" style={{ marginTop: 8, color: "#b45309", fontWeight: 500 }}>Skipped {missed} day{missed > 1 ? "s" : ""} in a row.</div>)}
            {showContactButton && (<button type="button" className="btn secondary" style={{ marginTop: 8 }}>Get contacted to ask</button>)}

            <div style={{ marginTop: 16 }}>
              <div className="label">Notes</div>
              <textarea className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Session notes, red flags, home-exercise adjustments…" style={{ width: "100%", marginTop: 4 }} />
              <div className="hint" style={{ marginTop: 4 }}>Notes are stored only in this demo session – ideal for prototype testing.</div>
            </div>
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- DOCTOR: CALENDAR ----------
function DoctorCalendarPage({ doctorNav, setDoctorNav, setPage }) {
  return (
    <>
      <header><div className="hwrap"><div className="title">Schedule</div><div className="hint">Your upcoming appointments</div></div></header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="list">
            {DOCTOR_APPOINTMENTS.map((a) => (
              <div key={a.id} className="item">
                <div><div style={{ fontWeight: 600 }}>{a.patient}</div><div className="hint">{a.date} • {a.time}</div><div className="hint">{a.type}</div></div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- DOCTOR: BILLS ----------
function DoctorBillsPage({ doctorNav, setDoctorNav, setPage }) {
  return (
    <>
      <header><div className="hwrap"><div className="title">Bills</div><div className="hint">Payments overview</div></div></header>
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="list">
            {DOCTOR_BILLS.map((b) => (
              <div key={b.id} className="item"><div><div style={{ fontWeight: 600 }}>{b.patient}</div><div className="hint">{b.status} • {b.amount} €</div></div></div>
            ))}
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- DOCTOR: PLANS ----------
function DoctorPlansPage({ plans, setPlans, doctorNav, setDoctorNav, setPage }) {
  const [injury, setInjury] = useState("");
  const [description, setDescription] = useState("");
  function addPlan(e) {
    e.preventDefault();
    const i = injury.trim(), d = description.trim();
    if (!i || !d) return;
    setPlans((prev) => [...prev, { id: crypto.randomUUID(), injury: i, duration: "Custom", description: d }]);
    setInjury(""); setDescription("");
  }
  return (
    <>
      <header><div className="hwrap"><div className="title">Plans</div><div className="hint">Template rehab programs</div></div></header>
      <main>
        <div className="stack" style={{ gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Existing templates</div>
            <div className="list">
              {plans.map((p) => (
                <div key={p.id} className="item" style={{ alignItems: "flex-start" }}>
                  <div><div style={{ fontWeight: 600 }}>{p.injury}</div><div className="hint">{p.duration}</div><div className="hint" style={{ marginTop: 4 }}>{p.description}</div></div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Create template</div>
            <form onSubmit={addPlan} className="stack">
              <div className="field"><div className="label">Injury / program name</div><input className="input" value={injury} onChange={(e) => setInjury(e.target.value)} placeholder="Knee injury program" /></div>
              <div className="field"><div className="label">Exercises / notes</div><textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Example: 2 weeks, 3 exercises per day..." /></div>
              <button className="btn">Save template</button>
            </form>
          </div>
        </div>
      </main>
      <DoctorNav doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
    </>
  );
}

// ---------- APP ROOT ----------
export default function App() {
  const [page, setPage] = useState("splash");
  const [role, setRole] = useState(null); // 'patient' | 'doctor'
  const [nav, setNav] = useState("home"); // patient nav
  const [doctorNav, setDoctorNav] = useState("home"); // doctor nav

  // patient
  const [user, setUser] = useLS(LS.user, null);
  const [appts, setAppts] = useLS(LS.appts, []);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [therapist, setTherapist] = useState(null);
  const [recovery, setRecovery] = useLS(LS.recovery, { startDate: todayStr(), completedDays: [], exercises: {}, petType: "dog" });

  // doctor
  const [doctor, setDoctor] = useState(null);
  const [doctorCategory, setDoctorCategory] = useState("new");
  const [doctorSelectedClient, setDoctorSelectedClient] = useState(null);
  const [doctorPlans, setDoctorPlans] = useState(INITIAL_DOCTOR_PLANS);
  const [doctorNotes, setDoctorNotes] = useState({}); // clientId -> notes

  // patient plan days (14 days from start)
  const planDays = useMemo(() => {
    const set = new Set(); const start = new Date(recovery.startDate);
    for (let i = 0; i < 14; i++) set.add(fmtDate(addDays(start, i)));
    return set;
  }, [recovery.startDate]);

  // handlers
  function handleRegister(profile) { setUser(profile); setRole("patient"); setNav("home"); setPage("home"); }
  function openProfile() { setPage("profile"); }
  function goHome() { setNav("home"); setPage("home"); }
  function goBackToBook() { setPage("therapists"); }
  function createAppt(a) { setAppts((x) => [...x, a]); setSelectedDate(a.date); setNav("calendar"); setPage("calendar"); }

  function handleDoctorLogin(info) { setDoctor(info); setRole("doctor"); setDoctorNav("home"); setPage("doctor-home"); }
  function doctorGoHome() { setDoctorNav("home"); setPage("doctor-home"); }

  return (
    <div className="app">
      <style>{css}</style>

      {page === "splash" && <Splash onDone={() => setPage("role")} />}

      {page === "role" && (
        <RoleChoice
          onPatient={() => { setRole("patient"); setPage("register"); }}
          onDoctor={() => { setRole("doctor"); setPage("doctor-login"); }}
        />
      )}

      {/* PATIENT PAGES */}
      {role === "patient" && page === "register" && <Register onSubmit={handleRegister} />}

      {role === "patient" && page === "home" && (
        <Home user={user} goProfile={openProfile} nav={nav} setNav={setNav} setPage={setPage} recovery={recovery} setRecovery={setRecovery} />
      )}

      {role === "patient" && page === "calendar" && (
        <CalendarPage selectedDate={selectedDate} setSelectedDate={setSelectedDate} appointments={appts} planDays={planDays} nav={nav} setNav={setNav} setPage={setPage} openProfile={openProfile} recovery={recovery} setRecovery={setRecovery} />
      )}

      {role === "patient" && page === "therapists" && (
        <Therapists onPick={(t) => { setTherapist(t); setPage("book"); }} nav={nav} setNav={setNav} setPage={setPage} openProfile={openProfile} />
      )}

      {role === "patient" && page === "book" && (
        <Book onCreate={createAppt} therapist={therapist} nav={nav} setNav={setNav} setPage={setPage} openProfile={openProfile} goBackToBook={goBackToBook} />
      )}

      {role === "patient" && page === "chat" && (
        <Chat nav={nav} setNav={setNav} setPage={setPage} openProfile={openProfile} />
      )}

      {role === "patient" && page === "profile" && (
        <PatientProfile user={user} nav={nav} setNav={setNav} setPage={setPage} goHome={goHome} recovery={recovery} setRecovery={setRecovery} />
      )}

      {/* DOCTOR PAGES */}
      {page === "doctor-login" && role === "doctor" && (
        <DoctorLogin onSubmit={handleDoctorLogin} onBack={() => { setRole(null); setPage("role"); }} />
      )}

      {role === "doctor" && page === "doctor-home" && (
        <DoctorHome doctor={doctor} setPage={setPage} setDoctorCategory={setDoctorCategory} doctorNav={doctorNav} setDoctorNav={setDoctorNav} />
      )}

      {role === "doctor" && page === "doctor-clients" && (
        <DoctorClients category={doctorCategory} setPage={setPage} setSelectedClient={setDoctorSelectedClient} goHome={doctorGoHome} doctorNav={doctorNav} setDoctorNav={setDoctorNav} />
      )}

      {role === "doctor" && page === "doctor-client-detail" && (
        <DoctorClientDetail client={doctorSelectedClient} notes={doctorSelectedClient ? (doctorNotes[doctorSelectedClient.id] || "") : ""}
          setNotes={(text) => { if (!doctorSelectedClient) return; setDoctorNotes((prev) => ({ ...prev, [doctorSelectedClient.id]: text })); }}
          setPage={setPage} goBackToList={() => setPage("doctor-clients")} doctorNav={doctorNav} setDoctorNav={setDoctorNav} />
      )}

      {role === "doctor" && page === "doctor-calendar" && (
        <DoctorCalendarPage doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
      )}

      {role === "doctor" && page === "doctor-bills" && (
        <DoctorBillsPage doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
      )}

      {role === "doctor" && page === "doctor-plans" && (
        <DoctorPlansPage plans={doctorPlans} setPlans={setDoctorPlans} doctorNav={doctorNav} setDoctorNav={setDoctorNav} setPage={setPage} />
      )}
    </div>
  );
}
