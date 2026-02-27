import { useState } from "react";
import { css } from '../../lib/styles';
import { fmt, sowCashKPIs, getSowStage } from '../../lib/calc';
import { cycleCalc } from '../../lib/constants';


const addDays = (dateStr, days) => { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]; };
const CAL_EVENT_TYPES = {
  breed:   { label: "Bred",          color: "#c084fc", bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.3)" },
  recheck: { label: "Recheck",       color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)" },
  due:     { label: "Due to Farrow", color: "#f59e0b", bg: "rgba(245,158,11,0.12)",  border: "rgba(245,158,11,0.3)" },
  farrow:  { label: "Farrowed",      color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)" },
  wean:    { label: "Wean",          color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" },
  heat:    { label: "Expected Heat", color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)" },
  open:    { label: "Open",          color: "var(--muted)", bg: "transparent",       border: "var(--border)" },
};


function buildFarmEvents(data) {
  const events = [];
  data.sows.forEach(sow => {
    (sow.breedingCycles || []).forEach(cycle => {
      if (cycle.type === "open") {
        if (cycle.nextHeatDate) events.push({ date: cycle.nextHeatDate, type: "heat", label: `${sow.name} – Expected Heat`, sowId: sow.id });
        return;
      }
      if (cycle.breedDate) {
        events.push({ date: cycle.breedDate, type: "breed", label: `${sow.name} – Bred`, sowId: sow.id });
        if (!cycle.missed && !cycle.farrowDateActual) {
          // Pregnancy recheck ~19 days post-breed
          const recheckDate = addDays(cycle.breedDate, 19);
          events.push({ date: recheckDate, type: "recheck", label: `${sow.name} – Preg. Check`, sowId: sow.id });
        }
      }
      if (cycle.missed && cycle.missedDate) {
        const nextHeat = addDays(cycle.missedDate, 21);
        events.push({ date: nextHeat, type: "heat", label: `${sow.name} – Return Heat`, sowId: sow.id });
      }
      if (cycle.conceived && cycle.conceiveDate && !cycle.farrowDateActual) {
        const due = addDays(cycle.conceiveDate, 114);
        events.push({ date: due, type: "due", label: `${sow.name} – Due`, sowId: sow.id });
      }
    });
  });
  data.litters.forEach(litter => {
    const sow = data.sows.find(s => s.id === litter.sowId);
    const name = sow?.name || "Unknown";
    if (litter.farrowDate) events.push({ date: litter.farrowDate, type: "farrow", label: `${name} – Farrowed (${litter.numberBornAlive} alive)`, sowId: litter.sowId });
    if (litter.weanDate)   events.push({ date: litter.weanDate,   type: "wean",   label: `${name} litter – Wean Day`,                             sowId: litter.sowId });
  });
  return events;
}

function FarmCalendar({ data }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // "YYYY-MM-DD"

  const events = buildFarmEvents(data);

  // Group events by date string
  const byDate = {};
  events.forEach(ev => {
    const key = ev.date?.slice(0,10);
    if (!key) return;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(ev);
  });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelected(null); };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = today.toISOString().slice(0,10);
  const selEvents = selected ? (byDate[selected] || []) : [];

  // Upcoming events (next 30 days)
  const upcomingCutoff = new Date(today); upcomingCutoff.setDate(upcomingCutoff.getDate() + 30);
  const upcoming = events
    .filter(ev => { const d = new Date(ev.date); return d >= today && d <= upcomingCutoff; })
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
      {/* Calendar */}
      <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <button onClick={prevMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{MONTH_NAMES[month]} {year}</div>
          <button onClick={nextMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          {DAY_NAMES.map(d => <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--subtle)", textTransform: "uppercase" }}>{d}</div>)}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} style={{ minHeight: 72, borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }} />;
            const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayEvents = byDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selected;
            const col = i % 7;
            return (
              <div key={dateKey} onClick={() => setSelected(isSelected ? null : dateKey)}
                style={{ minHeight: 72, padding: "6px 5px", borderRight: col < 6 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)", cursor: dayEvents.length > 0 || true ? "pointer" : "default", background: isSelected ? "rgba(59,130,246,0.08)" : isToday ? "rgba(59,130,246,0.04)" : "transparent", transition: "background 0.1s", position: "relative" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", fontWeight: isToday ? 900 : 600, color: isToday ? "var(--blue-bright)" : "var(--text)", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--blue-dim)" : "transparent", border: isToday ? "1px solid rgba(59,130,246,0.4)" : "none", marginBottom: 3 }}>{day}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayEvents.slice(0,2).map((ev, ei) => {
                    const t = CAL_EVENT_TYPES[ev.type];
                    return <div key={ei} style={{ fontSize: "0.6rem", fontWeight: 700, background: t.bg, color: t.color, borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", border: `1px solid ${t.border}` }}>{t.icon} {ev.label.split(" – ")[0]}</div>;
                  })}
                  {dayEvents.length > 2 && <div style={{ fontSize: "0.58rem", color: "var(--muted)", fontWeight: 700 }}>+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
        {/* Selected day events */}
        {selected && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "14px 18px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 10 }}>
              {fmt(selected)} — {selEvents.length} event{selEvents.length !== 1 ? "s" : ""}
            </div>
            {selEvents.length === 0 ? <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>No events on this day.</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selEvents.map((ev, i) => {
                  const t = CAL_EVENT_TYPES[ev.type];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: t.bg, border: `1px solid ${t.border}` }}>
                      <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: t.color }}>{t.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text)" }}>{ev.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* Legend */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 18px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(CAL_EVENT_TYPES).map(([k, t]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: t.color, fontWeight: 600 }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — upcoming events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 12 }}> Next 30 Days</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>Nothing scheduled.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {upcoming.map((ev, i) => {
                const t = CAL_EVENT_TYPES[ev.type];
                const daysOut = Math.round((new Date(ev.date) - today) / 86400000);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 9, background: t.bg, border: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: "1rem", lineHeight: 1.4 }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.color }}>{ev.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 1 }}>
                        {fmt(ev.date)} · {daysOut === 0 ? <strong style={{ color: "var(--green)" }}>Today</strong> : `${daysOut}d away`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Herd at a glance */}
        <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 12 }}>Herd Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.sows.map(sow => {
              const stage = getSowStage(sow, data.litters);
              const stageConf = {
                nursing:   { icon: "", color: "#34d399", label: "Nursing" },
                gestating: { icon: "", color: "#f59e0b", label: "Gestating" },
                bred:      { icon: "", color: "#c084fc", label: "Bred — Pending " },
                open:      { icon: "open", color: "var(--muted)", label: "Open" },
              }[stage] || { icon: "", color: "var(--muted)", label: stage };
              const lineage = (sow.sire || sow.damSire) ? `${sow.sire || "?"} × ${sow.damSire || "?"}` : null;
              return (
                <div key={sow.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{sow.name}</div>
                    {lineage && <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{lineage}</div>}
                  </div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: stageConf.color, textAlign: "right" }}>{stageConf.icon} {stageConf.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const totalPigs = data.pigs.length;
  const soldPigs = data.pigs.filter(p => p.sold).length;
  const totalRevenue = data.pigs.filter(p => p.sold).reduce((a,p) => a + p.purchasePrice, 0);
  const totalShowResults = data.pigs.flatMap(p => p.showResults).length;
  const totalShowmen = data.showmen.length;
  return (
    <div>
      <div className="page-header"><h2>{data.farm.name}</h2><p>{data.farm.owner} · {data.farm.location}</p></div>

      {/* KPI strip */}
      <div className="dash-stats" style={{ marginBottom: 28 }}>
        {[
          { val: data.sows.length, label: "Active Sows" },
          { val: data.litters.length, label: "Litters on Record" },
          { val: totalPigs, label: "Pigs Registered" },
          { val: soldPigs, label: "Sold to Customers" },
          { val: totalShowmen, label: "Active Customers" },
          { val: `$${totalRevenue.toLocaleString()}`, label: "Total Revenue" },
          { val: totalShowResults, label: "Show Results" },
        ].map(s => (
          <div className="dash-stat-card" key={s.label}><div className="accent-bar" /><div className="big">{s.val}</div><div className="label">{s.label}</div></div>
        ))}
      </div>

      {/* Farm Calendar */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", color: "var(--text)", letterSpacing: "-0.02em" }}> Farm Calendar</h3>
      </div>
      <FarmCalendar data={data} />
    </div>
  );
}

//  SOWS VIEW 

export { FarmCalendar, buildFarmEvents };
