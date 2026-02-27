import { useState } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle, textareaStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';

function LitterDetail({ data, id, setView, onUpdateLitter, onAddPigToLitter }) {
  const litter = data.litters.find(l => l.id === id);
  if (!litter) return <div className="empty">Litter not found.</div>;

  const sow = data.sows.find(s => s.id === litter.sowId);
  const boar = data.boars.find(b => b.id === litter.boarId);
  const pigs = data.pigs.filter(p => p.litterId === id);
  const soldPigs = pigs.filter(p => p.sold);
  const revenue = soldPigs.reduce((a, p) => a + p.purchasePrice, 0);
  const pipeline = pigs.filter(p => !p.sold).reduce((a, p) => a + p.purchasePrice, 0);
  const avgBirthWeight = pigs.length > 0 ? (pigs.reduce((a, p) => a + p.birthWeight, 0) / pigs.length).toFixed(1) : "—";
  const survivability = litter.numberBorn > 0 ? Math.round((litter.numberBornAlive / litter.numberBorn) * 100) : 0;
  const weanPct = litter.numberBornAlive > 0 ? Math.round((litter.numberWeaned / litter.numberBornAlive) * 100) : 0;

  const addDays = (dateStr, days) => {
    const d = new Date(dateStr + "T12:00:00");
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const daysBetween = (a, b) => {
    const d1 = new Date(a + "T12:00:00");
    const d2 = new Date(b + "T12:00:00");
    return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  };

  // Editing state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({
    numberBorn: litter.numberBorn ?? "",
    numberBornAlive: litter.numberBornAlive ?? "",
    numberWeaned: litter.numberWeaned ?? "",
    weanDate: litter.weanDate ?? "",
    notes: litter.notes ?? "",
  });

  const nextHeat = draft.weanDate ? addDays(draft.weanDate, 21) : null;
  const ageAtWean = draft.weanDate && litter.farrowDate ? daysBetween(litter.farrowDate, draft.weanDate) : litter.ageWeanedDays;

  const handleSave = async () => {
    setSaving(true);
    const updates = {
      number_born: parseInt(draft.numberBorn) || 0,
      number_born_alive: parseInt(draft.numberBornAlive) || 0,
      number_weaned: parseInt(draft.numberWeaned) || 0,
      wean_date: draft.weanDate || null,
      age_weaned_days: ageAtWean || null,
      notes: draft.notes || null,
    };

    const { error } = await supabase.from("litters").update(updates).eq("id", litter.id);
    if (error) { console.error("updateLitter error:", error); setSaving(false); return; }

    // If wean date changed, update the linked breeding cycle's next heat date
    if (draft.weanDate && nextHeat) {
      const linkedCycle = (sow?.breedingCycles || []).find(c => c.farrowDateActual === litter.farrowDate || c.id === litter.cycleId);
      if (linkedCycle?.id) {
        await supabase.from("breeding_cycles").update({ next_heat_date: nextHeat }).eq("id", linkedCycle.id);
      }
    }

    onUpdateLitter({ ...litter, ...updates, weanDate: draft.weanDate, numberBorn: parseInt(draft.numberBorn), numberBornAlive: parseInt(draft.numberBornAlive), numberWeaned: parseInt(draft.numberWeaned), ageWeanedDays: ageAtWean, notes: draft.notes });
    setSaving(false);
    setEditing(false);
  };

  const sexIcon = (sex) => sex === "Gilt" ? "♀" : "♂";

  return (
    <div>
      <div className="detail-back" onClick={() => setView({ page: "sowDetail", id: litter.sowId })}>← Back to {sow?.name}</div>
      <div className="detail-header">
        <div>
          <h2>Litter – {fmt(litter.farrowDate)}</h2>
          <p style={{ color: "var(--blue-bright)", marginTop: 4 }}>{sow?.name} × {boar?.name}</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="btn btn-outline" onClick={() => { setDraft({ numberBorn: litter.numberBorn ?? "", numberBornAlive: litter.numberBornAlive ?? "", numberWeaned: litter.numberWeaned ?? "", weanDate: litter.weanDate ?? "", notes: litter.notes ?? "" }); setEditing(true); }}>Edit Litter</button>
          <button className="btn btn-primary" onClick={() => onAddPigToLitter(id)}>+ Add Pig</button>
        </div>
      </div>

      {/* KPI Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { val: litter.numberBorn, label: "Total Born", color: "var(--text)" },
          { val: litter.numberBornAlive, label: "Born Alive", color: "var(--green)" },
          { val: litter.numberWeaned, label: "Weaned", color: "var(--blue-bright)" },
          { val: `${survivability}%`, label: "Survivability", color: survivability >= 90 ? "var(--green)" : survivability >= 75 ? "var(--amber)" : "var(--red)" },
          { val: `${weanPct}%`, label: "Wean Rate", color: "var(--blue-bright)" },
          { val: `${avgBirthWeight} lbs`, label: "Avg Birth Wt", color: "var(--muted)" },
          { val: `$${revenue.toLocaleString()}`, label: "Revenue", color: "var(--green)" },
          { val: `$${pipeline.toLocaleString()}`, label: "Pipeline", color: "#1d4ed8" },
        ].map(k => (
          <div key={k.label} style={{ background: "var(--surface)", borderRadius: 10, padding: "12px 14px", border: "1px solid var(--border)" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.5rem", fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.val}</div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.09em", fontWeight: 600 }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="modal-overlay">
          <div className="modal-box" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3>Edit Litter Data</h3>
              <button className="modal-close" onClick={() => setEditing(false)}>×</button>
            </div>
            <div className="modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Total Born</label>
                  <input type="number" min="0" value={draft.numberBorn} onChange={e => setDraft(d => ({ ...d, numberBorn: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Born Alive</label>
                  <input type="number" min="0" value={draft.numberBornAlive} onChange={e => setDraft(d => ({ ...d, numberBornAlive: e.target.value }))} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Weaned</label>
                  <input type="number" min="0" value={draft.numberWeaned} onChange={e => setDraft(d => ({ ...d, numberWeaned: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Wean Date</label>
                <input type="date" value={draft.weanDate} onChange={e => setDraft(d => ({ ...d, weanDate: e.target.value }))} style={inputStyle} />
              </div>

              {draft.weanDate && (
                <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px" }}>
                  <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Calculated Dates</div>
                  <div style={{ display: "flex", gap: 24, fontSize: "0.85rem" }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontWeight: 600, marginBottom: 2 }}>Age at Wean</div>
                      <div style={{ fontWeight: 700 }}>{ageAtWean} days</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "var(--muted)", fontWeight: 600, marginBottom: 2 }}>Next Expected Heat</div>
                      <div style={{ fontWeight: 700, color: "var(--amber)" }}>{fmt(nextHeat)} <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 400 }}>(wean + 21 days)</span></div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={draft.notes} onChange={e => setDraft(d => ({ ...d, notes: e.target.value }))} style={textareaStyle} placeholder="Litter notes..." />
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button className="btn btn-outline" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{ background: "var(--green)", opacity: saving ? 0.6 : 1 }}>
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Farrowing Details */}
      <div className="section-card">
        <h4>Farrowing Data</h4>
        <div className="info-grid">
          <div className="info-item"><label>Farrow Date</label><span>{fmt(litter.farrowDate)}</span></div>
          <div className="info-item"><label>Sow</label><span>{sow?.name} ({sow?.tag})</span></div>
          <div className="info-item"><label>Sire</label><span>{boar?.name} ({boar?.tag})</span></div>
          <div className="info-item"><label>Number Born</label><span>{litter.numberBorn}</span></div>
          <div className="info-item"><label>Born Alive</label><span>{litter.numberBornAlive}</span></div>
          <div className="info-item"><label>Number Weaned</label><span>{litter.numberWeaned}</span></div>
          <div className="info-item"><label>Wean Date</label><span>{fmt(litter.weanDate)}</span></div>
          <div className="info-item"><label>Age at Wean</label><span>{litter.ageWeanedDays} days</span></div>
          {litter.weanDate && (
            <div className="info-item"><label>Next Expected Heat</label><span style={{ color: "var(--amber)", fontWeight: 600 }}>{fmt(addDays(litter.weanDate, 21))}</span></div>
          )}
        </div>
        {litter.notes && <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic", borderLeft: "3px solid var(--blue-bright)" }}>"{litter.notes}"</div>}
      </div>

      {/* Litter Vaccinations */}
      <div className="section-card">
        <h4>Litter Vaccinations</h4>
        {(litter.vaccinations || []).length === 0 ? <div className="empty">None recorded.</div> : (
          <table>
            <thead><tr><th>Vaccine</th><th>Date</th><th>Notes</th></tr></thead>
            <tbody>{litter.vaccinations.map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.notes}</td></tr>)}</tbody>
          </table>
        )}
      </div>

      {/* Individual Pigs */}
      <div className="section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h4 style={{ margin: 0 }}>Individual Pigs in This Litter</h4>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{pigs.length} registered · {soldPigs.length} sold</div>
        </div>
        {pigs.length === 0 ? <div className="empty">No pigs registered yet.</div> : (
          <table>
            <thead><tr><th>Tag</th><th>Sex</th><th>Color</th><th>Birth Wt</th><th>Cur. Wt</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {pigs.map(p => {
                const latest = (p.weightLog || []).length > 0 ? (p.weightLog || [])[(p.weightLog || []).length - 1] : null;
                return (
                  <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setView({ page: "pigDetail", id: p.id })}>
                    <td><strong>{p.tag}</strong></td>
                    <td><span className={`badge ${p.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{sexIcon(p.sex)} {p.sex}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{p.color}</td>
                    <td>{p.birthWeight} lbs</td>
                    <td>{latest ? `${latest.weight} lbs` : "—"}</td>
                    <td style={{ fontWeight: 600, color: "var(--green)" }}>${(p.purchasePrice || 0).toLocaleString()}</td>
                    <td><span className={`badge ${p.sold ? "badge-sold" : "badge-available"}`}>{p.sold ? `${p.showmanName}` : "Available"}</span></td>
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

export { LitterDetail };
