import { useState, useRef } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle, textareaStyle } from '../../lib/styles';
import { fmt, sowCashKPIs, getSowStage, cycleCalc, } from '../../lib/calc';
import { COST_CATEGORIES, sowNextCycle} from '../../lib/constants';
import { StatusPill, DaysChip, CycleTimeline } from './SharedUI';

function SowsView({ data, setView, onAddExpense, onAddSow, onEditSow, onDeleteSow }) {
  const allSowKPIs = data.sows.map(s => sowCashKPIs(s, data));
  const farmRevenue = allSowKPIs.reduce((a, k) => a + k.totalRevenue, 0);
  const farmCosts = allSowKPIs.reduce((a, k) => a + k.totalCosts, 0);
  const farmNet = farmRevenue - farmCosts;
  const farmMargin = farmRevenue > 0 ? Math.round((farmNet / farmRevenue) * 100) : 0;
  const farmSold = allSowKPIs.reduce((a, k) => a + k.soldCount, 0);
  const farmAvail = allSowKPIs.reduce((a, k) => a + k.availCount, 0);
  const farmPipeline = allSowKPIs.reduce((a, k) => a + k.pipeline, 0);

  // Group sows by stage
  const stages = [
    { key: "nursing",   label: "Nursing",          color: "#34d399", desc: "Active litter not yet weaned" },
    { key: "gestating", label: "Gestating",         color: "var(--amber)", desc: "Confirmed pregnant" },
    { key: "bred",      label: "Bred — Pending ",  color: "#c084fc", desc: "Bred, awaiting conception check" },
    { key: "open",      label: "Open / Needs Breeding", color: "var(--muted)", desc: "Ready to breed" },
  ];
  const sowsByStage = {};
  stages.forEach(s => { sowsByStage[s.key] = []; });
  data.sows.forEach((sow, i) => {
    const stage = getSowStage(sow, data.litters);
    sowsByStage[stage] = [...(sowsByStage[stage] || []), { sow, kpi: allSowKPIs[i] }];
  });

  const SowCard = ({ sow, kpi }) => {
    const sellThrough = kpi.totalPigs > 0 ? Math.round((kpi.soldCount / kpi.totalPigs) * 100) : 0;
    const stage = getSowStage(sow, data.litters);
    const activeCycles = (sow.breedingCycles || []).filter(c => !c.farrowDateActual && !c.missed && c.type !== 'open');
    const latestCycle = activeCycles.sort((a, b) => new Date(b.breedDate) - new Date(a.breedDate))[0];
    const calc = latestCycle ? cycleCalc(latestCycle) : null;
    const boar = latestCycle ? data.boars.find(b => b.id === latestCycle.sireId) : null;
    return (
      <div className="card" key={sow.id} style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
          <button onClick={() => onEditSow(sow)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--blue-bright)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Edit</button>
          <button onClick={() => onDeleteSow(sow.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>×</button>
        </div>
        <div onClick={() => setView({ page: "sowDetail", id: sow.id })}>
          <div className="card-tag">{sow.tag}</div>
          <h3>{sow.name}</h3>
          <div className="card-meta">{sow.breed}</div>
          {(sow.sire || sow.damSire) && (
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>{sow.sire || "?"} × {sow.damSire || "?"}</div>
          )}
          {/* Stage-specific info */}
          {calc && boar && (
            <div style={{ marginTop: 8, marginBottom: 8, padding: "7px 10px", borderRadius: 7, background: stage === "gestating" ? "rgba(245,158,11,0.07)" : stage === "bred" ? "rgba(168,85,247,0.07)" : "transparent", border: `1px solid ${stage === "gestating" ? "rgba(245,158,11,0.2)" : stage === "bred" ? "rgba(168,85,247,0.2)" : "transparent"}` }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: stage === "gestating" ? "var(--amber)" : "#c084fc", marginBottom: 3 }}>
                {stage === "gestating" ? `Due ${fmt(calc.dueDate)}` : `Bred ${fmt(latestCycle.breedDate)}`}
                {calc.dueDaysFromNow !== null && stage === "gestating" && ` · ${calc.dueDaysFromNow}d left`}
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>× {boar.name} · {latestCycle.method}{latestCycle.doses > 1 ? ` · ${latestCycle.doses} doses` : ""}</div>
            </div>
          )}
          {kpi.totalPigs > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)", marginBottom: 4 }}><span>Sell-through</span><span style={{ fontWeight: 600, color: sellThrough === 100 ? "var(--green)" : "var(--blue-bright)" }}>{sellThrough}%</span></div>
              <div style={{ height: 5, background: "var(--subtle)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${sellThrough}%`, background: sellThrough === 100 ? "var(--green)" : "linear-gradient(90deg, var(--blue), var(--blue-bright))", borderRadius: 3 }} /></div>
            </div>
          )}
          <div className="card-stats" style={{ flexWrap: "wrap" }}>
            <div className="stat"><div className="stat-val">{kpi.litters.length}</div><div className="stat-label">Litters</div></div>
            <div className="stat"><div className="stat-val" style={{ color: "var(--green)", fontSize: "1.05rem" }}>${kpi.totalRevenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div>
            <div className="stat"><div className="stat-val" style={{ color: "var(--blue-bright)", fontSize: "1.05rem" }}>${Math.round(kpi.totalCosts).toLocaleString()}</div><div className="stat-label">Costs</div></div>
            <div className="stat"><div className="stat-val" style={{ color: kpi.netProfit >= 0 ? "var(--green)" : "var(--red)", fontSize: "1.05rem" }}>{kpi.netProfit >= 0 ? "+" : ""}${Math.round(kpi.netProfit).toLocaleString()}</div><div className="stat-label">Net</div></div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Sow Herd</h2><p>Breeding females grouped by production stage</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-outline" onClick={() => onAddExpense(null)}>+ Add Expense</button>
          <button className="btn btn-primary" onClick={onAddSow}>+ Add Sow</button>
        </div>
      </div>

      {/* Farm summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: 14, marginBottom: 32 }}>
        {[
          { val: `$${farmRevenue.toLocaleString()}`, label: "Revenue Collected", color: "var(--green)" },
          { val: `$${Math.round(farmCosts).toLocaleString()}`, label: "Total Costs", color: "var(--blue-bright)" },
          { val: `${farmNet >= 0 ? "+" : ""}$${Math.round(farmNet).toLocaleString()}`, label: "Net Profit", color: farmNet >= 0 ? "var(--green)" : "var(--red)" },
          { val: `${farmMargin}%`, label: "Profit Margin", color: farmMargin >= 40 ? "var(--green)" : "var(--blue-bright)" },
          { val: `$${farmPipeline.toLocaleString()}`, label: "Pipeline (Unsold)", color: "#1d4ed8" },
          { val: `${farmSold} / ${farmSold + farmAvail}`, label: "Pigs Sold", color: "var(--muted)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", borderRadius: 10, padding: "16px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grouped by stage */}
      {stages.map(stage => {
        const sows = sowsByStage[stage.key] || [];
        if (sows.length === 0) return null;
        return (
          <div key={stage.key} style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: stage.color, letterSpacing: "-0.02em" }}>{stage.label}</h3>
              <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, background: `${stage.color}18`, color: stage.color, border: `1px solid ${stage.color}30` }}>{sows.length}</span>
              <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{stage.desc}</span>
            </div>
            <div className="card-grid">
              {sows.map(({ sow, kpi }) => <SowCard key={sow.id} sow={sow} kpi={kpi} />)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

//  SOW DETAIL 
function SowDetail({ data, id, setView, onAddExpense, onLogBreed, onMarkMissed, onConfirmConceived, onRecordFarrow, onDeleteCycle }) {
  const sow = data.sows.find(s => s.id === id);
  if (!sow) return <div className="empty">Sow not found.</div>;
  const litters = data.litters.filter(l => l.sowId === id);
  const kpi = sowCashKPIs(sow, data);
  const sellThrough = kpi.totalPigs > 0 ? Math.round((kpi.soldCount / kpi.totalPigs) * 100) : 0;
  const cycles = sow.breedingCycles || [];
  const next = sowNextCycle(sow, data.litters);
  const lineage = (sow.sire || sow.damSire) ? `${sow.sire || "Unknown"} × ${sow.damSire || "Unknown"}` : null;
  return (
    <div>
      <div className="detail-back" onClick={() => setView({ page: "sows" })}>← Back to Sows</div>
      <div className="detail-header">
        <div>
          <h2>{sow.name}</h2>
          <p style={{ color: "var(--blue-bright)", marginTop: 4 }}>{sow.breed} · Tag: {sow.tag}</p>
          {lineage && <p style={{ color: "var(--muted)", marginTop: 3, fontSize: "0.82rem" }}>{lineage}</p>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-success" onClick={() => onRecordFarrow && onRecordFarrow(id)}>Record Farrow</button>
          <button className="btn btn-primary" onClick={() => onAddExpense(id)}>+ Add Expense</button>
        </div>
      </div>
      <div className="section-card">
        <h4>Sow Info</h4>
        <div className="info-grid">
          <div className="info-item"><label>Tag</label><span>{sow.tag}</span></div>
          <div className="info-item"><label>Breed</label><span>{sow.breed}</span></div>
          <div className="info-item"><label>Date of Birth</label><span>{fmt(sow.dob)}</span></div>
          <div className="info-item"><label>Total Litters</label><span>{litters.length}</span></div>
          {sow.sire && <div className="info-item"><label>Sire</label><span>{sow.sire}</span></div>}
          {sow.damSire && <div className="info-item"><label>Dam's Sire</label><span>{sow.damSire}</span></div>}
          {lineage && <div className="info-item" style={{ gridColumn: "1 / -1" }}><label>Lineage</label><span style={{ fontWeight: 700, fontSize: "1rem" }}>{lineage}</span></div>}
        </div>
      </div>

      {/* P&L */}
      <div className="section-card" style={{ background: "linear-gradient(135deg, #0a1a0e 0%, #0a0f1e 100%)", borderColor: "#1a3a1a" }}>
        <h4 style={{ color: "var(--blue-bright)" }}>Profit & Loss</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 14, marginBottom: 20 }}>
          {[
            { val: `$${kpi.totalRevenue.toLocaleString()}`, label: "Revenue", accent: "var(--green)" },
            { val: `$${Math.round(kpi.totalCosts).toLocaleString()}`, label: "Total Costs", accent: "#c0392b" },
            { val: `${kpi.netProfit >= 0 ? "+" : ""}$${Math.round(kpi.netProfit).toLocaleString()}`, label: "Net Profit", accent: kpi.netProfit >= 0 ? "var(--blue-bright)" : "#c0392b", big: true },
            { val: `${kpi.margin}%`, label: "Margin", accent: kpi.margin >= 40 ? "var(--green)" : "var(--blue-bright)" },
            { val: `$${kpi.pipeline.toLocaleString()}`, label: "Pipeline", accent: "#1d4ed8" },
            { val: `$${kpi.costPerWeaned}`, label: "Cost / Weaned", accent: "var(--muted)" },
          ].map(m => (
            <div key={m.label} style={{ textAlign: "center", padding: "12px 8px", background: "rgba(255,255,255,0.03)", borderRadius: 8, border: m.big ? `1px solid ${m.accent}` : "1px solid rgba(255,255,255,0.04)" }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: m.big ? "1.6rem" : "1.35rem", fontWeight: 900, color: m.accent, lineHeight: 1 }}>{m.val}</div>
              <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</div>
            </div>
          ))}
        </div>
        {/* Cost breakdown */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
          {Object.entries(COST_CATEGORIES).map(([key, cat]) => {
            const amt = kpi.costByCategory[key] || 0;
            const pct = kpi.totalCosts > 0 ? Math.round((amt / kpi.totalCosts) * 100) : 0;
            return (
              <div key={key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 6, padding: "8px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{cat.icon} {cat.label}</span>
                  <span style={{ fontSize: "0.78rem", fontWeight: 600, color: cat.color }}>${amt.toFixed(0)}</span>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 2 }} /></div>
                <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginTop: 3 }}>{pct}% of costs</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense Log */}
      <div className="section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h4 style={{ margin: 0 }}>Expense Log</h4>
          <button className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "5px 12px" }} onClick={() => onAddExpense(id)}>+ Add</button>
        </div>
        {(kpi.costs || []).length === 0 ? <div className="empty">No expenses recorded yet.</div> : (
          <table>
            <thead><tr><th>Date</th><th>Category</th><th>Description</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
            <tbody>
              {[...(kpi.costs || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).map(c => (
                <tr key={c.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{fmt(c.date)}</td>
                  <td><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 600, background: `${COST_CATEGORIES[c.category]?.color}22`, color: COST_CATEGORIES[c.category]?.color }}>{COST_CATEGORIES[c.category]?.icon} {COST_CATEGORIES[c.category]?.label}</span></td>
                  <td>{c.description}</td>
                  <td style={{ textAlign: "right", fontWeight: 600, color: "var(--blue-bright)" }}>${c.amount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Breeding Cycles */}
      <div className="section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h4 style={{ margin: 0 }}>Breeding Cycles</h4>
          <button className="btn btn-outline" style={{ fontSize: "0.73rem", padding: "5px 10px" }} onClick={() => onLogBreed && onLogBreed(id)}>+ Log Breed</button>
        </div>
        {cycles.length === 0
          ? <div className="empty" style={{ padding: 20 }}>No breeding cycles recorded.</div>
          : cycles.slice().reverse().map(cycle => (
              <div key={cycle.id} style={{ marginBottom: 10 }}>
                <CycleTimeline cycle={cycle} boars={data.boars} onMarkMissed={cycleId => onMarkMissed && onMarkMissed(sow.id, cycleId)} onConfirmConceived={cycleId => onConfirmConceived && onConfirmConceived(sow.id, cycleId)} onDeleteCycle={cycleId => onDeleteCycle && onDeleteCycle(sow.id, cycleId)} />
              </div>
            ))
        }
      </div>

      {/* Farrowing Records */}
      <div className="section-card">
        <h4>Farrowing Records</h4>
        {litters.length === 0 ? <div className="empty">No litters recorded yet.</div> : (
          <table>
            <thead><tr><th>Farrow Date</th><th>Born</th><th>Born Alive</th><th>Weaned</th><th>Age Weaned</th><th>Sire</th></tr></thead>
            <tbody>
              {litters.map(l => {
                const boar = data.boars.find(b => b.id === l.boarId);
                return (
                  <tr key={l.id} style={{ cursor: "pointer" }} onClick={() => setView({ page: "litterDetail", id: l.id })}>
                    <td>{fmt(l.farrowDate)}</td><td>{l.numberBorn}</td><td>{l.numberBornAlive}</td><td>{l.numberWeaned}</td><td>{l.ageWeanedDays} days</td><td>{boar?.name}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

//  LITTER DETAIL (IMPROVED) 

export { SowsView, SowDetail };
