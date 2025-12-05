import React, { useState } from "react";
import { EXERCISE_LIBRARY } from "../../shared/data";

export default function PerPatientPlan({ client,plans,assignPlanToClient }){
  const hasExisting = !!client.plan;
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(plans[0]?.id || "");
  const [custom, setCustom] = useState(
    client.plan || {
      name: plans[0]?.injury || "Custom plan",
      notes: "",
      days: [
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
        { exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1], EXERCISE_LIBRARY[2]] },
      ],
    }
  );

  function assignTemplate() {
    const t = plans.find((p) => p.id === selectedTemplate);
    const baseDays = t?.days || custom.days;
    const plan = {
      name: t?.injury || "Custom plan",
      notes: `Template: ${t?.injury || "Custom"}`,
      days: baseDays,
    };
    assignPlanToClient(client.id, plan);
    setCustom(plan);
    setExpanded(true);
    setEditing(true);
  }

  function save() {
    const plan = {
      ...custom,
      name: custom.name || client.plan?.name || "Custom plan",
    };
    assignPlanToClient(client.id, plan);
    setCustom(plan);
    setEditing(false);
    setExpanded(false);
  }

  const effectiveName = custom.name || client.plan?.name || "Assigned plan";

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Assigned program</div>

      {!hasExisting && !expanded && !editing && (
        <div className="stack">
          <div className="row">
            <select className="input" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} style={{ flex: 1 }}>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>{p.injury} ({p.duration})</option>
              ))}
            </select>
            <button className="btn" type="button" onClick={assignTemplate}>Assign program</button>
          </div>
          <div className="hint">You can customise per client after assigning.</div>
        </div>
      )}

      {(hasExisting || expanded) && (
        <div className="item" style={{ marginTop: 8, marginBottom: 8 }}>
          <div>
            <div className="hint">Current program</div>
            <div style={{ fontWeight: 700 }}>{effectiveName}</div>
          </div>
          <div className="row">
            <button className="btn secondary" type="button" onClick={() => { setExpanded((e) => !e); setEditing(false); }}>View</button>
            <button className="btn" type="button" onClick={() => { setExpanded(true); setEditing(true); }}>Edit</button>
          </div>
        </div>
      )}

      {expanded && (
        <div className="stack" style={{ marginTop: 8 }}>
          <div className="field">
            <div className="label">Notes</div>
            <textarea className="textarea" value={custom.notes || ""} onChange={(e) => setCustom((prev) => ({ ...prev, notes: e.target.value }))} readOnly={!editing}/>
          </div>

          {custom.days.slice(0, 3).map((d, idx) => (
            <div key={idx} className="stack">
              <div style={{ fontWeight: 700 }}>Day {idx + 1}</div>
              {Array.from({ length: 3 }).map((_, exIdx) => (
                <div key={exIdx} className="field">
                  <div className="label">Exercise {exIdx + 1}</div>
                  <select className="input" value={d.exercises[exIdx]} disabled={!editing}
                    onChange={(e) => {
                      const v = e.target.value;
                      const copy = { ...custom };
                      const arr = [...copy.days];
                      const inner = [...arr[idx].exercises];
                      inner[exIdx] = v;
                      arr[idx] = { ...arr[idx], exercises: inner };
                      copy.days = arr;
                      setCustom(copy);
                    }}
                  >
                    {EXERCISE_LIBRARY.map((x) => (<option key={x} value={x}>{x}</option>))}
                  </select>
                </div>
              ))}
            </div>
          ))}

          {editing ? (
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn" type="button" onClick={save}>Save</button>
            </div>
          ) : (
            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn secondary" type="button" onClick={() => setExpanded(false)}>Close</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
