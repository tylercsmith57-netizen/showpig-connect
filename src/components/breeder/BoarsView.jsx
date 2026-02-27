import { useState } from "react";
import { css, labelStyle, inputStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';

function BoarsView({ data, onAddBoar, onEditBoar, onDeleteBoar }) {
  const onFarm = data.boars.filter(b => b.location === "on-farm" || b.owner === "On-farm");
  const offFarm = data.boars.filter(b => b.location === "off-farm" || (b.owner !== "On-farm" && b.location !== "on-farm"));

  const BoarCard = ({ boar }) => {
    const breedingCount = data.sows.reduce((a, s) => a + (s.breedingCycles || []).filter(c => c.sireId === boar.id).length, 0);
    const litterCount = data.litters.filter(l => l.boarId === boar.id).length;
    const pigCount = data.pigs.filter(p => { const l = data.litters.find(ll => ll.id === p.litterId); return l?.boarId === boar.id; }).length;
    const revenue = data.pigs.filter(p => { const l = data.litters.find(ll => ll.id === p.litterId); return l?.boarId === boar.id && p.sold; }).reduce((a, p) => a + p.purchasePrice, 0);
    const isAI = boar.method === "AI" || (boar.semenDosePrice > 0);
    const pricePerDose = boar.semenDosePrice || 0;
    return (
      <div className="card" style={{ cursor: "default" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <div className="card-tag" style={{ margin: 0 }}>{boar.tag} · {boar.breed}</div>
              {isAI && <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: "0.62rem", fontWeight: 700, background: "rgba(59,130,246,0.15)", color: "var(--blue-bright)", border: "1px solid rgba(59,130,246,0.3)" }}>AI</span>}
              {!isAI && <span style={{ padding: "1px 7px", borderRadius: 20, fontSize: "0.62rem", fontWeight: 700, background: "rgba(16,185,129,0.12)", color: "var(--green)", border: "1px solid rgba(16,185,129,0.25)" }}>Natural</span>}
            </div>
            <h3>{boar.name}</h3>
            <div className="card-meta">Born {fmt(boar.dob)}</div>
            <div className="card-meta">{boar.owner}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => onEditBoar(boar)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--blue-bright)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Edit</button>
            <button onClick={() => onDeleteBoar(boar.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>×</button>
          </div>
        </div>

        {/* Semen cost info */}
        {pricePerDose > 0 && (
          <div style={{ marginTop: 10, padding: "8px 12px", background: "var(--blue-dim)", borderRadius: 8, border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: "0.62rem", color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>Semen Price</div>
              <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Doses set per breeding when logged</div>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, color: "var(--blue-bright)" }}>${pricePerDose}<span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--muted)", marginLeft: 2 }}>/dose</span></div>
          </div>
        )}

        {boar.notes && <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic", padding: "8px 10px", background: "var(--surface)", borderRadius: 6 }}>"{boar.notes}"</div>}
        <div className="card-stats">
          <div className="stat"><div className="stat-val">{breedingCount}</div><div className="stat-label">Breedings</div></div>
          <div className="stat"><div className="stat-val">{litterCount}</div><div className="stat-label">Litters</div></div>
          <div className="stat"><div className="stat-val">{pigCount}</div><div className="stat-label">Offspring</div></div>
          <div className="stat"><div className="stat-val" style={{ color: "var(--green)", fontSize: "1rem" }}>${revenue.toLocaleString()}</div><div className="stat-label">Revenue</div></div>
        </div>
      </div>
    );
  };

  const SectionHeader = ({ label, count, color }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, marginTop: 8 }}>
      <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, color, letterSpacing: "-0.02em" }}>{label}</h3>
      <span style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, background: `${color}18`, color, border: `1px solid ${color}30` }}>{count}</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Service Sires</h2><p>Boars used for breeding — on-farm & off-farm</p></div>
        <button className="btn btn-primary" onClick={onAddBoar}>+ Add Sire</button>
      </div>

      {onFarm.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label=" On-Farm Sires" count={onFarm.length} color="var(--green)" />
          <div className="card-grid">{onFarm.map(b => <BoarCard key={b.id} boar={b} />)}</div>
        </div>
      )}

      {offFarm.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label=" Off-Farm / External Sires" count={offFarm.length} color="var(--amber)" />
          <div className="card-grid">{offFarm.map(b => <BoarCard key={b.id} boar={b} />)}</div>
        </div>
      )}

      {data.boars.length === 0 && <div className="empty">No service sires added yet.</div>}
    </div>
  );
}

//  FINANCIAL REPORTS (NEW) 

export { BoarsView };
