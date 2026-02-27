import { useState } from "react";
import { css } from '../../lib/styles';
import { fmt } from '../../lib/calc';
import { cycleCalc, sowMissedInfo, sowNextCycle } from '../../lib/constants';
import { StatusPill } from "./SharedUI";

function BreedingCalendar({ data, setView, onLogBreed }) {
  const rows = data.sows.map(sow => {
  const next = sowNextCycle(sow, data.litters);
  const mi = sowMissedInfo(sow, data.litters);
  const activeScheduled = next?.nextScheduled ?? null;
  const calc = activeScheduled ? cycleCalc(activeScheduled) : null;
  return { sow, next, mi, activeScheduled, calc };
});

console.log("rows:", rows.map(r => ({ sow: r.sow.name, activeScheduled: r.activeScheduled, calc: r.calc, next: r.next })));

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Breeding Calendar</h2><p>Cycle status, gestation tracking & heat alerts</p></div>
        <button className="btn btn-primary" onClick={() => onLogBreed(null)}>+ Log Breed</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(({ sow, next, mi, activeScheduled, calc }) => (
          <div key={sow.id} style={{ background: "var(--card-bg)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setView({ page: "sowDetail", id: sow.id })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 4 }}>{sow.tag}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>{sow.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{sow.breed}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                {activeScheduled ? <StatusPill status={calc.status} /> : <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", background: "var(--surface)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>Needs Breeding</span>}
                {mi.hasAlert && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.25)" }}> {mi.consecutiveMisses} missed</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Last Wean", val: next?.lastWeanDate ? fmt(next.lastWeanDate) : "—" },
                { label: activeScheduled ? "Breed Date" : "Next Heat", val: activeScheduled ? fmt(activeScheduled.breedDate) : mi.nextHeat ? fmt(mi.nextHeat) : "—", heat: !activeScheduled && !!mi.nextHeat, highlight: !!activeScheduled },
                { label: activeScheduled ? "Due Date" : "Est. Due Date", val: activeScheduled && calc?.dueDate ? fmt(calc.dueDate) : "—", highlight: !!activeScheduled },
                { label: "Litters", val: data.litters.filter(l => l.sowId === sow.id).length.toString() },
              ].map(item => (
                <div key={item.label} style={{ background: item.heat ? "rgba(239,68,68,0.08)" : item.highlight ? "var(--blue-dim)" : "var(--surface)", borderRadius: 8, padding: "9px 12px", border: `1px solid ${item.heat ? "rgba(239,68,68,0.25)" : item.highlight ? "rgba(59,130,246,0.25)" : "var(--border)"}` }}>
                  <div style={{ fontSize: "0.6rem", color: item.heat ? "#f87171" : item.highlight ? "var(--blue-bright)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.val}</div>
                </div>
              ))}
            </div>
            {calc && calc.status === "gestating" && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)", marginBottom: 5 }}><span>Gestation</span><DaysChip days={calc.dueDaysFromNow} /></div>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  {(() => {
                    const t = new Date(); t.setHours(0,0,0,0);
                    const bd = new Date(activeScheduled.breedDate);
                    const dd = new Date(calc.dueDate);
                    const pct = Math.max(0, Math.min(100, Math.round(((t - bd) / (dd - bd)) * 100)));
                    return <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--blue), var(--blue-bright))", borderRadius: 3 }} />;
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

//  CUSTOMERS VIEW 

export { BreedingCalendar };
