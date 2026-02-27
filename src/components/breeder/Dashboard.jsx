import { useState, useMemo } from "react";
import { fmt, sowCashKPIs } from '../../lib/calc';
import { COST_CATEGORIES } from '../../lib/constants';
import { FarmCalendar } from './FarmCalendar';

const PERIODS = [
  { label: "This Week",   key: "week" },
  { label: "This Month",  key: "month" },
  { label: "3 Months",    key: "3mo" },
  { label: "This Year",   key: "year" },
  { label: "All Time",    key: "all" },
  { label: "Custom",      key: "custom" },
];

function getRange(key, customStart, customEnd) {
  const now = new Date(); now.setHours(23,59,59,999);
  if (key === "all") return { start: null, end: now };
  if (key === "custom") {
    if (!customStart || !customEnd) return { start: null, end: now };
    return { start: new Date(customStart + "T00:00:00"), end: new Date(customEnd + "T23:59:59") };
  }
  const start = new Date();
  if (key === "week")  start.setDate(start.getDate() - 7);
  if (key === "month") start.setMonth(start.getMonth() - 1);
  if (key === "3mo")   start.setMonth(start.getMonth() - 3);
  if (key === "year")  start.setFullYear(start.getFullYear() - 1);
  start.setHours(0,0,0,0);
  return { start, end: now };
}

function inRange(dateStr, range) {
  if (!range.start) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr + "T12:00:00");
  return d >= range.start && d <= range.end;
}

function Dashboard({ data }) {
  const [period, setPeriod] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const range = useMemo(() => getRange(period, customStart, customEnd), [period, customStart, customEnd]);

  // Filtered calculations
  const filteredSoldPigs = useMemo(() =>
    data.pigs.filter(p => p.sold && inRange(p.soldDate || null, range)),
    [data.pigs, range]
  );

  const totalRevenue = useMemo(() =>
    period === "all"
      ? data.pigs.filter(p => p.sold).reduce((a, p) => a + (p.purchasePrice || 0), 0)
      : filteredSoldPigs.reduce((a, p) => a + (p.purchasePrice || 0), 0),
    [data.pigs, filteredSoldPigs, period]
  );

  const totalExpenses = useMemo(() => {
    const allCosts = data.sows.flatMap(s => s.costs || []);
    const filtered = range.start ? allCosts.filter(c => inRange(c.date, range)) : allCosts;
    return filtered.reduce((a, c) => a + (c.amount || 0), 0);
  }, [data.sows, range]);

  const netProfit = totalRevenue - totalExpenses;

  const filteredLitters = useMemo(() =>
    range.start ? data.litters.filter(l => inRange(l.farrowDate, range)) : data.litters,
    [data.litters, range]
  );

  const totalSoldInPeriod = period === "all" ? data.pigs.filter(p => p.sold).length : filteredSoldPigs.length;
  const totalShowResults = data.pigs.flatMap(p => p.showResults || []).length;

  const btnStyle = (key) => ({
    padding: "7px 16px",
    borderRadius: 8,
    border: `1px solid ${period === key ? "var(--blue-bright)" : "var(--border)"}`,
    background: period === key ? "var(--blue-dim)" : "transparent",
    color: period === key ? "var(--blue-bright)" : "var(--muted)",
    cursor: "pointer",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.78rem",
    fontWeight: 700,
    transition: "all 0.15s",
  });

  const inputStyle = {
    padding: "7px 10px",
    border: "1px solid var(--border)",
    borderRadius: 8,
    background: "var(--surface)",
    color: "var(--text)",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.78rem",
  };

  return (
    <div>
      <div className="page-header">
        <h2>{data.farm.name}</h2>
        <p>{data.farm.owner} · {data.farm.location}</p>
      </div>

      {/* Period filter buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, alignItems: "center" }}>
        {PERIODS.map(p => (
          <button key={p.key} style={btnStyle(p.key)} onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
        {period === "custom" && (
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: 4 }}>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={inputStyle} />
            <span style={{ color: "var(--muted)", fontSize: "0.78rem" }}>to</span>
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={inputStyle} />
          </div>
        )}
      </div>

      {/* KPI Grid — revenue/expense cards larger */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>

        {/* Large financial cards */}
        {[
          { val: `$${Math.round(totalRevenue).toLocaleString()}`, label: "Revenue", color: "var(--green)", large: true },
          { val: `$${Math.round(totalExpenses).toLocaleString()}`, label: "Expenses", color: "var(--red)", large: true },
          { val: `${netProfit >= 0 ? "+" : ""}$${Math.round(netProfit).toLocaleString()}`, label: "Net Profit", color: netProfit >= 0 ? "var(--green)" : "var(--red)", large: true },
        ].map(s => (
          <div key={s.label} style={{
            background: "var(--card-bg)",
            borderRadius: 12,
            padding: "18px 20px",
            border: `1px solid var(--border)`,
            borderLeft: `4px solid ${s.color}`,
            gridColumn: "span 2",
          }}>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
          </div>
        ))}

        {/* Standard KPI cards */}
        {[
          { val: data.sows.length, label: "Active Sows" },
          { val: filteredLitters.length, label: "Litters" },
          { val: data.pigs.length, label: "Pigs Registered" },
          { val: totalSoldInPeriod, label: "Pigs Sold" },
          { val: data.showmen.length, label: "Customers" },
          { val: totalShowResults, label: "Show Results" },
        ].map(s => (
          <div key={s.label} className="dash-stat-card">
            <div className="accent-bar" />
            <div className="big">{s.val}</div>
            <div className="label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Farm Calendar */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", color: "var(--text)", letterSpacing: "-0.02em" }}>Farm Calendar</h3>
      </div>
      <FarmCalendar data={data} />
    </div>
  );
}

export { Dashboard };
