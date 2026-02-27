import { useState } from "react";
import { css, labelStyle, inputStyle } from '../../lib/styles';
import { fmt, cycleCalc } from "../../lib/calc";
import { addDays, daysFromToday } from "../../lib/constants";

function StatusPill({ status }) {
  const map = {
    scheduled: { bg: "rgba(59,130,246,0.12)", color: "var(--blue-bright)", border: "rgba(59,130,246,0.3)", label: "Scheduled" },
    bred:       { bg: "rgba(168,85,247,0.12)", color: "#c084fc",            border: "rgba(168,85,247,0.3)",  label: "Bred — Pending " },
    gestating:  { bg: "rgba(245,158,11,0.1)",  color: "var(--amber)",       border: "rgba(245,158,11,0.25)", label: "Gestating" },
    farrowed:   { bg: "rgba(16,185,129,0.1)",  color: "var(--green)",       border: "rgba(16,185,129,0.25)", label: "Farrowed " },
    missed:     { bg: "rgba(239,68,68,0.1)",   color: "var(--red)",         border: "rgba(239,68,68,0.3)",   label: "Did Not Conceive" },
    open:       { bg: "rgba(245,158,11,0.1)",  color: "var(--amber)",       border: "rgba(245,158,11,0.3)",  label: "Open Cycle" },
  };
  const s = map[status] || map.scheduled;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>;
}
function DaysChip({ days }) {
  if (days === null) return null;
  const abs = Math.abs(days);
  const future = days > 0;
  const color = days < -3 ? "var(--red)" : days < 7 ? "var(--amber)" : "var(--blue-bright)";
  const label = days === 0 ? "Today" : future ? `In ${abs}d` : `${abs}d ago`;
  return <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{label}</span>;
}

//  CYCLE TIMELINE 
function CycleTimeline({ cycle, boars, onMarkMissed, onConfirmConceived, onDeleteCycle }) {
  const calc = cycleCalc(cycle);
  const boar = boars.find(b => b.id === cycle.sireId);
  const today = new Date(); today.setHours(0,0,0,0);
  if (cycle.type === 'open') {
    const nextHeat = calc.nextHeatDate;
    const heatDays = nextHeat ? daysFromToday(nextHeat) : null;
    return (
      <div style={{ background: "rgba(245,158,11,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <StatusPill status="open" />
          {heatDays !== null && heatDays >= 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171" }}>Heat in {heatDays}d</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Open Date</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.openDate)}</div></div>
          <div><div style={{ fontSize: "0.62rem", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Next Heat</div><div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f87171" }}>{nextHeat ? fmt(nextHeat) : "—"}</div></div>
        </div>
        {cycle.notes && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }
  if (calc.status === 'missed') {
    return (
      <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><StatusPill status="missed" /><span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Bred</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.breedDate)}</div></div>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Confirmed Miss</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{cycle.missedDate ? fmt(cycle.missedDate) : "—"}</div></div>
        </div>
        {cycle.notes && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }

  //  Bred but NOT YET confirmed conceived 
  if (calc.status === 'bred') {
    const daysBred = Math.abs(calc.breedDaysFromNow);
    // Typical recheck window: 18–25 days after breeding
    const recheckDate = addDays(cycle.breedDate, 19);
    const recheckDays = daysFromToday(recheckDate);
    return (
      <div style={{ background: "rgba(168,85,247,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(168,85,247,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusPill status="bred" />
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "#c084fc", fontWeight: 700 }}>{daysBred}d since breeding</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Bred</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.breedDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Recheck Window</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: recheckDays <= 3 && recheckDays >= 0 ? "#c084fc" : "var(--text)" }}>
              {fmt(recheckDate)} {recheckDays > 0 ? `(in ${recheckDays}d)` : recheckDays === 0 ? "(Today!)" : "(passed)"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onConfirmConceived && (
            <button onClick={() => onConfirmConceived(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.1)", color: "var(--green)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
               Confirm Conceived
            </button>
          )}
          {onDeleteCycle && (
            <button onClick={() => onDeleteCycle(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "var(--red)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
              Delete
            </button>
          )}
          {onMarkMissed && (
            <button onClick={() => onMarkMissed(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "var(--red)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
               Did Not Conceive
            </button>
          )}
        </div>
        {cycle.notes && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }

  //  Confirmed gestating or farrowed 
  const breedD = new Date(cycle.breedDate);
  const dueD = calc.dueDate ? new Date(calc.dueDate) : null;
  const pct = calc.status === "farrowed" ? 100 : (dueD ? Math.max(0, Math.min(100, Math.round(((today - breedD) / (dueD - breedD)) * 100))) : 0);
  return (
    <div style={{ background: "var(--surface)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusPill status={calc.status} />
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {calc.status === "gestating" && calc.dueDaysFromNow !== null && <DaysChip days={calc.dueDaysFromNow} />}
          {onDeleteCycle && (
            <button onClick={() => onDeleteCycle(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "var(--red)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
              Delete
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: calc.status === "gestating" ? 12 : 0 }}>
        {[
          { label: "Bred", val: fmt(cycle.breedDate) },
          { label: "Conceived", val: cycle.conceiveDate ? fmt(cycle.conceiveDate) : "—" },
          { label: calc.status === "farrowed" ? "Farrowed" : "Due Date", val: calc.status === "farrowed" ? fmt(calc.actualFarrow) : calc.dueDate ? fmt(calc.dueDate) : "—" },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.val}</div>
          </div>
        ))}
      </div>
      {calc.status === "gestating" && calc.dueDate && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)", marginBottom: 5 }}>
            <span>Gestation progress</span>
            <span style={{ fontWeight: 700, color: "var(--blue-bright)" }}>{pct}% · {calc.dueDaysFromNow}d left</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: pct > 85 ? "linear-gradient(90deg, var(--amber), var(--green))" : "linear-gradient(90deg, var(--blue), var(--blue-bright))", borderRadius: 3 }} /></div>
        </div>
      )}
      {cycle.notes && <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
    </div>
  );
}

//  DASHBOARD 
//  FARM CALENDAR 
const CAL_EVENT_TYPES = {
  breed:    { label: "Breeding",         color: "#a78bfa", bg: "rgba(167,139,250,0.13)", border: "rgba(167,139,250,0.35)", icon: "" },
  recheck:  { label: "Preg. Recheck",   color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)",  icon: "" },
  due:      { label: "Due Date",         color: "#f59e0b", bg: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.3)",  icon: "" },
  farrow:   { label: "Farrowed",         color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)",  icon: "—" },
  wean:     { label: "Wean Date",        color: "#3b82f6", bg: "rgba(59,130,246,0.13)", border: "rgba(59,130,246,0.3)",  icon: "" },
  heat:     { label: "Expected Heat",    color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)", icon: "" },
};


export { StatusPill, DaysChip, CycleTimeline };
