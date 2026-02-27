import { useState } from "react";
import { css, labelStyle, inputStyle } from '../../lib/styles';
import { fmt, sowCashKPIs } from '../../lib/calc';
import { COST_CATEGORIES } from '../../lib/constants';

function FinancialReports({ data }) {
  const [tab, setTab] = useState("overview");
  const [rangePreset, setRangePreset] = useState("all");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [annualYear, setAnnualYear] = useState(new Date().getFullYear());

  // Build date range from preset
  const getDateRange = () => {
    const now = new Date();
    if (rangePreset === "week") { const s = new Date(now); s.setDate(s.getDate() - 7); return { start: s, end: now }; }
    if (rangePreset === "month") { const s = new Date(now); s.setMonth(s.getMonth() - 1); return { start: s, end: now }; }
    if (rangePreset === "3months") { const s = new Date(now); s.setMonth(s.getMonth() - 3); return { start: s, end: now }; }
    if (rangePreset === "6months") { const s = new Date(now); s.setMonth(s.getMonth() - 6); return { start: s, end: now }; }
    if (rangePreset === "year") { const s = new Date(now); s.setFullYear(s.getFullYear() - 1); return { start: s, end: now }; }
    if (rangePreset === "custom" && customStart && customEnd) return { start: new Date(customStart), end: new Date(customEnd) };
    return null; // all time
  };

  const dateRange = getDateRange();

  // Filter expenses by date range
  const filterCosts = (costs) => {
    if (!dateRange) return costs;
    return costs.filter(c => {
      const d = new Date(c.date);
      return d >= dateRange.start && d <= dateRange.end;
    });
  };

  // Filter litters by farrow date
  const filteredLitters = dateRange
    ? data.litters.filter(l => { const d = new Date(l.farrowDate); return d >= dateRange.start && d <= dateRange.end; })
    : data.litters;

  // Build filtered data for KPIs
  const filteredData = { ...data, litters: filteredLitters };
  const allKPIs = data.sows.map(s => {
    const litters = filteredLitters.filter(l => l.sowId === s.id);
    const litterIds = litters.map(l => l.id);
    const pigs = data.pigs.filter(p => litterIds.includes(p.litterId));
    const soldPigs = pigs.filter(p => p.sold);
    const availPigs = pigs.filter(p => !p.sold);
    const totalRevenue = soldPigs.reduce((a, p) => a + p.purchasePrice, 0);
    const pipeline = availPigs.reduce((a, p) => a + p.purchasePrice, 0);
    const totalWeaned = litters.reduce((a, l) => a + l.numberWeaned, 0);
    const costs = filterCosts(s.costs || []);
    const totalCosts = costs.reduce((a, c) => a + c.amount, 0);
    const costByCategory = Object.fromEntries(Object.keys(COST_CATEGORIES).map(cat => [cat, costs.filter(c => c.category === cat).reduce((a, c) => a + c.amount, 0)]));
    const netProfit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    const costPerWeaned = totalWeaned > 0 ? (totalCosts / totalWeaned).toFixed(2) : "—";
    return { totalRevenue, pipeline, soldCount: soldPigs.length, totalPigs: pigs.length, litters, totalCosts, costByCategory, netProfit, margin, costPerWeaned, costs };
  });

  const totalRevenue = allKPIs.reduce((a, k) => a + k.totalRevenue, 0);
  const totalCosts = allKPIs.reduce((a, k) => a + k.totalCosts, 0);
  const totalPipeline = allKPIs.reduce((a, k) => a + k.pipeline, 0);
  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const totalPigs = data.pigs.length;
  const soldPigs = data.pigs.filter(p => p.sold).length;
  const avgPigPrice = totalPigs > 0 ? Math.round(data.pigs.reduce((a, p) => a + p.purchasePrice, 0) / totalPigs) : 0;
  const catTotals = Object.fromEntries(Object.keys(COST_CATEGORIES).map(k => [k, allKPIs.reduce((a, kpi) => a + (kpi.costByCategory[k] || 0), 0)]));

  const litterAnalysis = filteredLitters.map(l => {
    const sow = data.sows.find(s => s.id === l.sowId);
    const boar = data.boars.find(b => b.id === l.boarId);
    const pigs = data.pigs.filter(p => p.litterId === l.id);
    const sold = pigs.filter(p => p.sold);
    const revenue = sold.reduce((a, p) => a + p.purchasePrice, 0);
    const pipeline = pigs.filter(p => !p.sold).reduce((a, p) => a + p.purchasePrice, 0);
    return { litter: l, sow, boar, pigs, sold, revenue, pipeline };
  });

  // Annual report data
  const annualStart = new Date(annualYear, 0, 1);
  const annualEnd = new Date(annualYear, 11, 31, 23, 59, 59);
  const annualLitters = data.litters.filter(l => { const d = new Date(l.farrowDate); return d >= annualStart && d <= annualEnd; });
  const annualKPIs = data.sows.map(s => {
    const litters = annualLitters.filter(l => l.sowId === s.id);
    const litterIds = litters.map(l => l.id);
    const pigs = data.pigs.filter(p => litterIds.includes(p.litterId));
    const soldPigs = pigs.filter(p => p.sold);
    const totalRevenue = soldPigs.reduce((a, p) => a + p.purchasePrice, 0);
    const costs = (s.costs || []).filter(c => { const d = new Date(c.date); return d >= annualStart && d <= annualEnd; });
    const totalCosts = costs.reduce((a, c) => a + c.amount, 0);
    const costByCategory = Object.fromEntries(Object.keys(COST_CATEGORIES).map(cat => [cat, costs.filter(c => c.category === cat).reduce((a, c) => a + c.amount, 0)]));
    const netProfit = totalRevenue - totalCosts;
    const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
    return { sow: s, totalRevenue, totalCosts, costByCategory, netProfit, margin, litters, soldCount: soldPigs.length, totalPigs: pigs.length, costs };
  });
  const annualRevenue = annualKPIs.reduce((a, k) => a + k.totalRevenue, 0);
  const annualCosts = annualKPIs.reduce((a, k) => a + k.totalCosts, 0);
  const annualProfit = annualRevenue - annualCosts;
  const annualMargin = annualRevenue > 0 ? Math.round((annualProfit / annualRevenue) * 100) : 0;
  const annualCatTotals = Object.fromEntries(Object.keys(COST_CATEGORIES).map(k => [k, annualKPIs.reduce((a, kpi) => a + (kpi.costByCategory[k] || 0), 0)]));

  // Available years (from earliest expense or litter)
  const allDates = [
    ...data.litters.map(l => l.farrowDate),
    ...data.sows.flatMap(s => (s.costs || []).map(c => c.date)),
  ].filter(Boolean).map(d => new Date(d).getFullYear());
  const years = allDates.length > 0
    ? Array.from({ length: new Date().getFullYear() - Math.min(...allDates) + 1 }, (_, i) => Math.min(...allDates) + i).reverse()
    : [new Date().getFullYear()];

  const filterBtnStyle = (active) => ({
    padding: "6px 14px", borderRadius: 8, border: `1px solid ${active ? "var(--blue-bright)" : "var(--border)"}`,
    background: active ? "var(--blue-dim)" : "transparent", color: active ? "var(--blue-bright)" : "var(--muted)",
    cursor: "pointer", fontSize: "0.78rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600,
  });

  const KPIGrid = ({ revenue, costs, profit, margin, pipeline, pigsLabel }) => (
    <div className="report-kpi-grid">
      {[
        { val: `$${revenue.toLocaleString()}`, label: "Total Revenue", color: "var(--green)" },
        { val: `$${Math.round(costs).toLocaleString()}`, label: "Total Costs", color: "var(--red)" },
        { val: `${profit >= 0 ? "+" : ""}$${Math.round(profit).toLocaleString()}`, label: "Net Profit", color: profit >= 0 ? "var(--green)" : "var(--red)" },
        { val: `${margin}%`, label: "Profit Margin", color: margin >= 40 ? "var(--green)" : "var(--amber)" },
        ...(pipeline !== undefined ? [{ val: `$${pipeline.toLocaleString()}`, label: "Pipeline (Unsold)", color: "var(--blue-bright)" }] : []),
        ...(pigsLabel ? [{ val: pigsLabel, label: "Pigs Sold", color: "var(--blue-bright)" }] : []),
      ].map(k => (
        <div key={k.label} className="report-kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
          <div className="val" style={{ color: k.color }}>{k.val}</div>
          <div className="lbl">{k.label}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <div className="page-header"><h2>Financial Reports</h2><p>Revenue, costs, margins & performance analysis</p></div>
      <div className="tab-bar">
        {[["overview","Overview"],["perlitter","Per Litter"],["costs","Cost Breakdown"],["sow","Sow Comparison"],["annual","Annual Report"]].map(([id, lbl]) => (
          <button key={id} className={`tab-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* Date range filter — shown on all tabs except annual */}
      {tab !== "annual" && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginRight: 4 }}>Period</span>
          {[["all","All Time"],["week","Last 7 Days"],["month","Last Month"],["3months","Last 3 Months"],["6months","Last 6 Months"],["year","Last Year"],["custom","Custom"]].map(([v, l]) => (
            <button key={v} style={filterBtnStyle(rangePreset === v)} onClick={() => setRangePreset(v)}>{l}</button>
          ))}
          {rangePreset === "custom" && (
            <>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{ ...inputStyle, width: 140, fontSize: "0.78rem", padding: "6px 10px" }} />
              <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}>to</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{ ...inputStyle, width: 140, fontSize: "0.78rem", padding: "6px 10px" }} />
            </>
          )}
          {dateRange && (
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: 8 }}>
              {dateRange.start.toLocaleDateString()} – {dateRange.end.toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {tab === "overview" && (
        <div>
          <KPIGrid revenue={totalRevenue} costs={totalCosts} profit={netProfit} margin={margin} pipeline={totalPipeline} pigsLabel={`${soldPigs}/${totalPigs}`} />
          <div className="section-card">
            <h4>Revenue vs Costs by Sow</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.sows.map((sow, i) => {
                const kpi = allKPIs[i];
                const maxVal = Math.max(...allKPIs.map(k => Math.max(k.totalRevenue, k.totalCosts)), 1);
                return (
                  <div key={sow.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{sow.name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({sow.tag})</span></span>
                      <span style={{ fontSize: "0.8rem", color: kpi.netProfit >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{kpi.netProfit >= 0 ? "+" : ""}${Math.round(kpi.netProfit).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {[["Revenue", kpi.totalRevenue, "var(--green)"],["Costs", kpi.totalCosts, "var(--red)"]].map(([lbl, val, color]) => (
                        <div key={lbl} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: "0.62rem", color: "var(--muted)", width: 55, textAlign: "right" }}>{lbl}</span>
                          <div style={{ flex: 1, height: 12, background: "var(--surface)", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(val / maxVal) * 100}%`, background: color, borderRadius: 6 }} /></div>
                          <span style={{ fontSize: "0.72rem", fontWeight: 600, color, width: 60, textAlign: "right" }}>${Math.round(val).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "perlitter" && (
        <div>
          <div style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
            <table>
              <thead><tr><th>Sow × Sire</th><th>Farrow Date</th><th>Born / Weaned</th><th>Registered</th><th>Sold</th><th>Revenue</th><th>Pipeline</th><th>Avg Price</th></tr></thead>
              <tbody>
                {litterAnalysis.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>No litters in this period</td></tr>
                ) : litterAnalysis.map(({ litter, sow, boar, pigs, sold, revenue, pipeline }) => {
                  const avg = pigs.length > 0 ? Math.round(pigs.reduce((a, p) => a + p.purchasePrice, 0) / pigs.length) : 0;
                  return (
                    <tr key={litter.id}>
                      <td><strong>{sow?.name}</strong> <span style={{ color: "var(--muted)" }}>× {boar?.name}</span></td>
                      <td>{fmt(litter.farrowDate)}</td>
                      <td>{litter.numberBorn} / {litter.numberWeaned}</td>
                      <td>{pigs.length}</td>
                      <td>{sold.length}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>${revenue.toLocaleString()}</td>
                      <td style={{ color: "var(--blue-bright)" }}>${pipeline.toLocaleString()}</td>
                      <td>${avg.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {litterAnalysis.length > 0 && (
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, padding: "14px 20px", background: "var(--surface)", borderRadius: 10 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Totals</span>
              <span style={{ fontWeight: 700, color: "var(--green)" }}>${litterAnalysis.reduce((a, l) => a + l.revenue, 0).toLocaleString()} revenue</span>
              <span style={{ fontWeight: 700, color: "var(--blue-bright)" }}>${litterAnalysis.reduce((a, l) => a + l.pipeline, 0).toLocaleString()} pipeline</span>
            </div>
          )}
        </div>
      )}

      {tab === "costs" && (
        <div>
          <div className="section-card">
            <h4>Cost Categories — Farm Total</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(COST_CATEGORIES).map(([key, cat]) => {
                const amt = catTotals[key] || 0;
                const pct = totalCosts > 0 ? Math.round((amt / totalCosts) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cat.label}</span>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{pct}%</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: cat.color }}>${amt.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{ height: 10, background: "var(--surface)", borderRadius: 5, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 5 }} /></div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Total Farm Costs</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--blue-bright)" }}>${Math.round(totalCosts).toLocaleString()}</span>
            </div>
          </div>
          <div className="section-card">
            <h4>All Expenses</h4>
            <table>
              <thead><tr><th>Date</th><th>Sow</th><th>Category</th><th>Description</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
              <tbody>
                {(() => {
                  const rows = data.sows.flatMap(sow => filterCosts(sow.costs || []).map(c => ({ ...c, sowName: sow.name, sowTag: sow.tag }))).sort((a, b) => new Date(b.date) - new Date(a.date));
                  if (rows.length === 0) return <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>No expenses in this period</td></tr>;
                  return rows.map(c => (
                    <tr key={c.id}>
                      <td style={{ whiteSpace: "nowrap" }}>{fmt(c.date)}</td>
                      <td style={{ fontSize: "0.82rem" }}>{c.sowName} <span style={{ color: "var(--muted)" }}>({c.sowTag})</span></td>
                      <td><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 600, background: `${COST_CATEGORIES[c.category]?.color}22`, color: COST_CATEGORIES[c.category]?.color }}>{COST_CATEGORIES[c.category]?.label}</span></td>
                      <td>{c.description}</td>
                      <td style={{ textAlign: "right", fontWeight: 600, color: "var(--red)" }}>-${c.amount.toFixed(2)}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "sow" && (
        <div>
          <div style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <table>
              <thead><tr><th>Sow</th><th>Litters</th><th>Pigs</th><th>Sold</th><th>Revenue</th><th>Costs</th><th>Net Profit</th><th>Margin</th><th>Cost/Weaned</th></tr></thead>
              <tbody>
                {data.sows.map((sow, i) => {
                  const kpi = allKPIs[i];
                  return (
                    <tr key={sow.id}>
                      <td><strong>{sow.name}</strong> <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({sow.tag})</span></td>
                      <td>{kpi.litters.length}</td>
                      <td>{kpi.totalPigs}</td>
                      <td>{kpi.soldCount}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>${kpi.totalRevenue.toLocaleString()}</td>
                      <td style={{ color: "var(--red)" }}>${Math.round(kpi.totalCosts).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: kpi.netProfit >= 0 ? "var(--green)" : "var(--red)" }}>{kpi.netProfit >= 0 ? "+" : ""}${Math.round(kpi.netProfit).toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 50, height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.max(0, Math.min(100, kpi.margin))}%`, background: kpi.margin >= 40 ? "var(--green)" : kpi.margin >= 0 ? "var(--amber)" : "var(--red)", borderRadius: 3 }} /></div>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: kpi.margin >= 40 ? "var(--green)" : kpi.margin >= 0 ? "var(--amber)" : "var(--red)" }}>{kpi.margin}%</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)" }}>${kpi.costPerWeaned}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: "14px 20px", background: "var(--surface)", borderRadius: 10, display: "flex", justifyContent: "flex-end", gap: 32 }}>
            {[
              { label: "Total Revenue", val: `$${totalRevenue.toLocaleString()}`, color: "var(--green)" },
              { label: "Total Costs", val: `$${Math.round(totalCosts).toLocaleString()}`, color: "var(--red)" },
              { label: "Net Profit", val: `${netProfit >= 0 ? "+" : ""}$${Math.round(netProfit).toLocaleString()}`, color: netProfit >= 0 ? "var(--green)" : "var(--red)" },
              { label: "Margin", val: `${margin}%`, color: "var(--blue-bright)" },
            ].map(k => (
              <div key={k.label} style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{k.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "annual" && (
        <div>
          {/* Year selector */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Year</span>
            <div style={{ display: "flex", gap: 6 }}>
              {years.map(y => (
                <button key={y} onClick={() => setAnnualYear(y)} style={filterBtnStyle(annualYear === y)}>{y}</button>
              ))}
            </div>
          </div>

          {/* Annual KPI summary */}
          <div style={{ background: "linear-gradient(135deg, var(--card-bg) 0%, rgba(29,78,216,0.08) 100%)", borderRadius: 16, border: "1px solid var(--border)", padding: "28px 28px 24px", marginBottom: 24 }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 6 }}>Annual Summary</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 20 }}>{annualYear} Financial Report</div>
            <KPIGrid revenue={annualRevenue} costs={annualCosts} profit={annualProfit} margin={annualMargin} />
          </div>

          {/* Monthly breakdown */}
          <div className="section-card" style={{ marginBottom: 20 }}>
            <h4>Monthly Breakdown — {annualYear}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Array.from({ length: 12 }, (_, month) => {
                const mStart = new Date(annualYear, month, 1);
                const mEnd = new Date(annualYear, month + 1, 0, 23, 59, 59);
                const mCosts = data.sows.flatMap(s => (s.costs || []).filter(c => { const d = new Date(c.date); return d >= mStart && d <= mEnd; }));
                const mLitters = data.litters.filter(l => { const d = new Date(l.farrowDate); return d >= mStart && d <= mEnd; });
                const mLitterIds = mLitters.map(l => l.id);
                const mPigs = data.pigs.filter(p => mLitterIds.includes(p.litterId) && p.sold);
                const mRevenue = mPigs.reduce((a, p) => a + p.purchasePrice, 0);
                const mTotalCosts = mCosts.reduce((a, c) => a + c.amount, 0);
                const mProfit = mRevenue - mTotalCosts;
                const monthName = new Date(annualYear, month).toLocaleString("default", { month: "short" });
                const maxMonthVal = Math.max(...Array.from({ length: 12 }, (_, m) => {
                  const s2 = new Date(annualYear, m, 1); const e2 = new Date(annualYear, m + 1, 0);
                  const c2 = data.sows.flatMap(s => (s.costs || []).filter(c => { const d = new Date(c.date); return d >= s2 && d <= e2; })).reduce((a, c) => a + c.amount, 0);
                  const l2 = data.litters.filter(l => { const d = new Date(l.farrowDate); return d >= s2 && d <= e2; }).map(l => l.id);
                  const r2 = data.pigs.filter(p => l2.includes(p.litterId) && p.sold).reduce((a, p) => a + p.purchasePrice, 0);
                  return Math.max(r2, c2);
                }), 1);
                const hasData = mRevenue > 0 || mTotalCosts > 0;
                return (
                  <div key={month} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", width: 32 }}>{monthName}</span>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ height: 8, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(mRevenue / maxMonthVal) * 100}%`, background: "var(--green)", borderRadius: 4, transition: "width 0.3s" }} /></div>
                      <div style={{ height: 8, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${(mTotalCosts / maxMonthVal) * 100}%`, background: "var(--red)", borderRadius: 4, transition: "width 0.3s" }} /></div>
                    </div>
                    {hasData ? (
                      <div style={{ textAlign: "right", minWidth: 100 }}>
                        <div style={{ fontSize: "0.72rem", color: "var(--green)", fontWeight: 700 }}>${mRevenue.toLocaleString()}</div>
                        <div style={{ fontSize: "0.7rem", color: mProfit >= 0 ? "var(--green)" : "var(--red)" }}>{mProfit >= 0 ? "+" : ""}${Math.round(mProfit).toLocaleString()}</div>
                      </div>
                    ) : <span style={{ fontSize: "0.7rem", color: "var(--subtle)", minWidth: 100, textAlign: "right" }}>No data</span>}
                  </div>
                );
              })}
              <div style={{ display: "flex", gap: 16, marginTop: 8, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 8, background: "var(--green)", borderRadius: 2 }} /><span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Revenue</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 8, background: "var(--red)", borderRadius: 2 }} /><span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Costs</span></div>
              </div>
            </div>
          </div>

          {/* Annual cost breakdown */}
          <div className="section-card" style={{ marginBottom: 20 }}>
            <h4>Cost Breakdown — {annualYear}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {Object.entries(COST_CATEGORIES).map(([key, cat]) => {
                const amt = annualCatTotals[key] || 0;
                const pct = annualCosts > 0 ? Math.round((amt / annualCosts) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cat.label}</span>
                      <div style={{ display: "flex", gap: 14 }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{pct}%</span>
                        <span style={{ fontSize: "0.88rem", fontWeight: 700, color: cat.color }}>${amt.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: "var(--surface)", borderRadius: 4, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 4 }} /></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Annual sow performance */}
          <div className="section-card">
            <h4>Sow Performance — {annualYear}</h4>
            <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
              <table>
                <thead><tr><th>Sow</th><th>Litters</th><th>Pigs Sold</th><th>Revenue</th><th>Costs</th><th>Net Profit</th><th>Margin</th></tr></thead>
                <tbody>
                  {annualKPIs.filter(k => k.litters.length > 0 || k.costs.length > 0).map(k => (
                    <tr key={k.sow.id}>
                      <td><strong>{k.sow.name}</strong> <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({k.sow.tag})</span></td>
                      <td>{k.litters.length}</td>
                      <td>{k.soldCount}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>${k.totalRevenue.toLocaleString()}</td>
                      <td style={{ color: "var(--red)" }}>${Math.round(k.totalCosts).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: k.netProfit >= 0 ? "var(--green)" : "var(--red)" }}>{k.netProfit >= 0 ? "+" : ""}${Math.round(k.netProfit).toLocaleString()}</td>
                      <td><span style={{ fontWeight: 700, color: k.margin >= 40 ? "var(--green)" : k.margin >= 0 ? "var(--amber)" : "var(--red)" }}>{k.margin}%</span></td>
                    </tr>
                  ))}
                  {annualKPIs.every(k => k.litters.length === 0 && k.costs.length === 0) && (
                    <tr><td colSpan={7} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>No data for {annualYear}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//  MODALS 

export { FinancialReports };
