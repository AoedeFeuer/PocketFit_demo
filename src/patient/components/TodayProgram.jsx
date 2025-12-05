import React, { useState } from "react";
import Header from "./Header";
import { todayStr } from "../../shared/dates";
import { DAILY_EXERCISES } from "../../shared/data";
import exOne from "../../assets/ex1.png";
import exTwo from "../../assets/ex2.png";

// Simple mock details for each daily exercise.
// You can rewrite the content here (titles, reps, steps, image) without touching other files.
const DETAILS = [
  {
    title: "Quadriceps Stretch",
    reps: "x10 each leg",
    description: "Strengthen your hip flexors and lower abs.",
    steps: [
      "Lie on your back with legs extended",
      "Keep your lower back pressed to the floor",
      "Slowly raise one leg to 90 degrees",
      "Lower with control and repeat",
    ],
    image: exOne, // put an imported image path if you have one
  },
  {
    title: "Mobility Drills",
    reps: "3 sets, 30s each",
    description: "Gentle joint mobility sequence to prep for activity.",
    steps: [
      "Neck circles and shoulder rolls",
      "Hip circles",
      "Ankle pumps and knee extensions",
    ],
    image: exTwo,
  },
  {
    title: "Light Strength Work",
    reps: "2–3 sets",
    description: "Low-load activation to encourage tissue tolerance.",
    steps: [
      "Bodyweight squats (partial range)",
      "Glute bridges",
      "Heel raises (supported)",
    ],
    image: exOne,
  },
];

export default function TodayProgram({ recovery, setRecovery, onBack }) {
  const today = todayStr();
  const list = (recovery.exercises || {})[today] || [false, false, false];
  const [open, setOpen] = useState(null); // which exercise index is expanded
  const [pain, setPain] = useState([5, 5, 5]);
  const [note, setNote] = useState({ 0: "", 1: "", 2: "" });

  function markDone(idx) {
    setRecovery((prev) => {
      const map = prev.exercises || {};
      const l = map[today] ? [...map[today]] : [false, false, false];
      l[idx] = true;
      const nm = { ...map, [today]: l };

      // if all three are done, count the day as complete
      const cd = new Set(prev.completedDays || []);
      if (l.every(Boolean)) cd.add(today);
      else cd.delete(today);

      return { ...prev, exercises: nm, completedDays: Array.from(cd) };
    });
    setOpen(null);
  }

  function headerRow(idx, label) {
    const done = list[idx];
    return (
      <button
        className="item"
        onClick={() => setOpen((o) => (o === idx ? null : idx))}
        style={{
          justifyContent: "space-between",
          background: done ? "var(--accentSoft)" : "#fff",
          borderColor: done ? "var(--accent)" : "var(--border)",
        }}
      >
        <span>{label}</span>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 999,
            border: "1px solid var(--border)",
            background: done ? "var(--accent)" : "#fff",
            color: done ? "#fff" : "var(--muted)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {done ? "✓" : ""}
        </span>
      </button>
    );
  }

  return (
    <>
      <Header
        title="Today's program"
        left={
          <button className="iconbtn" onClick={onBack}>
            ←
          </button>
        }
      />
      <main>
        <div className="card" style={{ padding: 16 }}>
          <div className="hint" style={{ marginBottom: 8 }}>
            Tap an exercise to view its description. Press <b>Submit</b> to mark it as
            done.
          </div>

          <div className="stack">
            {DAILY_EXERCISES.map((label, idx) => {
              const d = DETAILS[idx] || {
                title: label,
                reps: "",
                description: "",
                steps: [],
                image: null,
              };
              const expanded = open === idx;

              return (
                <div key={idx} className="stack">
                  {headerRow(idx, label)}

                  {expanded && (
                    <div
                      className="card"
                      style={{
                        padding: 12,
                        background: "#fff",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {/* top card (image/title/reps) */}
                      <div
                        className="card"
                        style={{
                          padding: 12,
                          background: "#f7f7f7",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <div style={{ fontWeight: 800, marginBottom: 8 }}>
                          {d.title || label}
                        </div>

			<div className="exercise-illustration">
  			  {d.image ? (
    			    <img
      				src={d.image}
      				alt={d.title || label}
      				loading="lazy"
    			    />
  			   ) : (
    			     <div className="hint">Illustration</div>
  			   )}

			  {d.reps && (
    			    <span className="chip reps">Reps: {d.reps}</span>
  			  )}
			</div>

                      </div>

                      {/* description */}
                      {d.description && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 800, marginBottom: 6 }}>
                            Description
                          </div>
                          <div className="hint" style={{ color: "var(--text)" }}>
                            {d.description}
                          </div>
                        </div>
                      )}

                      {/* instructions */}
                      {d.steps?.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <div style={{ fontWeight: 800, marginBottom: 6 }}>
                            Instructions
                          </div>
                          <div className="stack">
                            {d.steps.map((s, i) => (
                              <div
                                key={i}
                                className="row"
                                style={{ alignItems: "center" }}
                              >
                                <span
                                  style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 999,
                                    display: "grid",
                                    placeItems: "center",
                                    background: "#FFF1E6",
                                    color: "#9a3412",
                                    border: "1px solid #FBD9B2",
                                    marginRight: 8,
                                    fontSize: 12,
                                  }}
                                >
                                  {i + 1}
                                </span>
                                <div>{s}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* pain scale */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>
                          How do you feel? (Pain level: {pain[idx]}/10)
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={10}
                          value={pain[idx]}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setPain((p) => {
                              const copy = [...p];
                              copy[idx] = v;
                              return copy;
                            });
                          }}
                          style={{ width: "100%" }}
                        />
                        <div className="row" style={{ justifyContent: "space-between" }}>
                          <span className="hint">No pain</span>
                          <span className="hint">Extreme pain</span>
                        </div>
                      </div>

                      {/* notes */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontWeight: 800, marginBottom: 6 }}>
                          Notes (optional)
                        </div>
                        <textarea
                          className="textarea"
                          value={note[idx] || ""}
                          onChange={(e) =>
                            setNote((n) => ({ ...n, [idx]: e.target.value }))
                          }
                          placeholder="Add any comments about this exercise..."
                        />
                      </div>

                      {/* submit */}
                      <div
                        className="row"
                        style={{ marginTop: 12, justifyContent: "flex-end" }}
                      >
                        <button className="btn" onClick={() => markDone(idx)}>
                          Submit
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="row" style={{ marginTop: 12, justifyContent: "flex-end" }}>
            <button className="btn secondary" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
