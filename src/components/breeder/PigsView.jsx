import { useState } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle, textareaStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';
import { WeightChart } from './WeightChart';
import { sexIcon } from '../../lib/constants';




function PigsView({ data, setView, onAddPig, onRecordSale }) {
  const [filter, setFilter] = useState("all");
  const filtered = data.pigs.filter(p => filter === "all" ? true : filter === "sold" ? p.sold : !p.sold);
  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><h2>Individual Pigs</h2><p>All registered pigs across all litters</p></div>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "available", "sold"].map(f => (
            <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-outline"}`} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
          ))}
          <button className="btn btn-success" onClick={onAddPig}>+ Add Pig</button>
          <button className="btn btn-primary" style={{ background: "var(--green)" }} onClick={onRecordSale}>+ Record Sale</button>
        </div>
      </div>
      <div className="card-grid">
        {filtered.map(pig => {
          const litter = data.litters.find(l => l.id === pig.litterId);
          const sow = data.sows.find(s => s.id === litter?.sowId);
          const latest = (pig.weightLog || []).length > 0 ? (pig.weightLog || [])[((pig.weightLog || []).length - 1)] : null;
          return (
            <div className="card" key={pig.id} onClick={() => setView({ page: "pigDetail", id: pig.id })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div className="card-tag">{pig.tag}</div>
                <span className={`badge ${pig.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{sexIcon(pig.sex)} {pig.sex}</span>
              </div>
              <div className="card-meta" style={{ marginBottom: 4 }}>Dam: {sow?.name}</div>
              <div className="card-meta">{pig.color}</div>
              <div className="card-stats">
                <div className="stat"><div className="stat-val">{latest?.weight || "—"}</div><div className="stat-label">Cur. Wt (lbs)</div></div>
                <div className="stat"><div className="stat-val" style={{ color: "var(--green)" }}>${pig.purchasePrice}</div><div className="stat-label">Price</div></div>
                <div className="stat"><div className="stat-val">{(pig.showResults || []).length}</div><div className="stat-label">Shows</div></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <span className={`badge ${pig.sold ? "badge-sold" : "badge-available"}`}>{pig.sold ? ` Sold to ${pig.showmanName}` : " Available"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

//  PIG DETAIL 
//  ASSIGN CUSTOMER MODAL 
function AssignCustomerModal({ pig, showmen, onAssign, onUnassign, onClose }) {
  const current = showmen.find(sm => (sm.pigIds || []).includes(pig.id));
  const [selected, setSelected] = useState(current?.id || "");
  const [search, setSearch] = useState("");
  const filtered = showmen.filter(sm =>
    sm.name.toLowerCase().includes(search.toLowerCase()) ||
    (sm.city || "").toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 460 }}>
        <div className="modal-header">
          <h3>Assign Customer</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 4 }}>
            Pig <strong style={{ color: "var(--text)" }}>{pig.tag}</strong> — select a customer to assign, or unassign if currently placed.
          </div>
          {current && (
            <div style={{ padding: "10px 14px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 2 }}>Currently Assigned</div>
                <div style={{ fontWeight: 600 }}>{current.name}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{current.city}, {current.state}</div>
              </div>
              <button onClick={() => onUnassign(current.id)} className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>Unassign</button>
            </div>
          )}
          <div>
            <label style={labelStyle}>Select Customer</label>
            <input type="text" placeholder="Search customers..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: 10 }} />
            {showmen.length === 0 ? (
              <div style={{ fontSize: "0.82rem", color: "var(--muted)", padding: "10px 12px", background: "var(--surface)", borderRadius: 8 }}>No customers added yet. Add a customer first.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
                {filtered.map(sm => {
                  const isCurrent = sm.id === current?.id;
                  const isSelected = selected === sm.id;
                  const pigsCount = (sm.pigIds || []).length;
                  return (
                    <button key={sm.id} onClick={() => setSelected(isSelected ? "" : sm.id)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 9, border: `1px solid ${isSelected ? "var(--blue-bright)" : isCurrent ? "rgba(16,185,129,0.3)" : "var(--border)"}`, background: isSelected ? "var(--blue-dim)" : isCurrent ? "rgba(16,185,129,0.06)" : "var(--surface)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left", transition: "all 0.15s" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isSelected ? "var(--blue-bright)" : "var(--text)" }}>{sm.name} {isCurrent && <span style={{ fontSize: "0.65rem", color: "var(--green)", marginLeft: 4 }}> current</span>}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{sm.city}, {sm.state}{sm.club ? ` · ${sm.club}` : ""}</div>
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>{pigsCount} pig{pigsCount !== 1 ? "s" : ""}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={() => selected && selected !== current?.id && onAssign(selected)} disabled={!selected || selected === current?.id} style={{ opacity: (!selected || selected === current?.id) ? 0.45 : 1 }}>
              Assign to Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function RetainAnimalModal({ pig, data, onRetain, onClose }) {
  const litter = data.litters.find(l => l.id === pig.litterId);
  const sow = data.sows.find(s => s.id === litter?.sowId);
  const boar = data.boars.find(b => b.id === litter?.boarId);
  const isGilt = pig.sex === "Gilt";
  const [name, setName] = useState(pig.tag || "");
  const [tag, setTag] = useState(pig.tag || "");
  const [breed, setBreed] = useState(sow?.breed || "");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [method, setMethod] = useState("Natural");
  const [location, setLocation] = useState("on-farm");

  const handleRetain = async () => {
    setSaving(true);
    if (isGilt) {
      await onRetain({ type: "sow", record: { name, tag, breed, dob: litter?.farrowDate || null, sire: boar?.name || null, damSire: sow?.sire || null, notes: notes || `Retained gilt from ${pig.tag}`, breedingCycles: [], costs: [] } });
    } else {
      await onRetain({ type: "boar", record: { name, tag, breed, dob: litter?.farrowDate || null, method, owner: "On-farm", location, semenDosePrice: 0, dosesPerBreeding: 1, notes: notes || `Retained boar from ${pig.tag}` } });
    }
    setSaving(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>Retain {isGilt ? "Gilt → Sow Herd" : "Boar → Service Sires"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ background: isGilt ? "rgba(16,185,129,0.08)" : "rgba(59,130,246,0.08)", border: `1px solid ${isGilt ? "rgba(16,185,129,0.2)" : "rgba(59,130,246,0.2)"}`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, color: isGilt ? "var(--green)" : "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{isGilt ? "Adding to Sow Herd" : "Adding to Service Sires"}</div>
            <div style={{ fontSize: "0.82rem", display: "flex", gap: 20 }}>
              <span><span style={{ color: "var(--muted)" }}>Dam:</span> {sow?.name || "—"}</span>
              <span><span style={{ color: "var(--muted)" }}>Sire:</span> {boar?.name || "—"}</span>
              <span><span style={{ color: "var(--muted)" }}>Born:</span> {litter?.farrowDate || "—"}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Lady Jane" style={inputStyle} /></div>
            <div><label style={labelStyle}>Tag / ID</label><input type="text" value={tag} onChange={e => setTag(e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Breed</label><input type="text" value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g. Hampshire x Duroc" style={inputStyle} /></div>
          {!isGilt && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><label style={labelStyle}>Breeding Method</label><select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}><option>Natural</option><option>AI</option><option>Both</option></select></div>
              <div><label style={labelStyle}>Location</label><select value={location} onChange={e => setLocation(e.target.value)} style={inputStyle}><option value="on-farm">On-Farm</option><option value="off-farm">Off-Farm</option></select></div>
            </div>
          )}
          <div><label style={labelStyle}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} style={textareaStyle} placeholder="Any additional notes..." /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleRetain} disabled={!name || !tag || saving} style={{ background: isGilt ? "var(--green)" : "var(--blue-bright)", opacity: (!name || !tag || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : isGilt ? "Add to Sow Herd" : "Add to Service Sires"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PigDetail({ data, id, setView, onAssignCustomer, onUnassignCustomer, onRetainAnimal, onEditPig }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRetainModal, setShowRetainModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const pig = data.pigs.find(p => p.id === id);
  if (!pig) return <div className="empty">Pig not found.</div>;
  const litter = data.litters.find(l => l.id === pig.litterId);
  const sow = data.sows.find(s => s.id === litter?.sowId);
  const boar = data.boars.find(b => b.id === litter?.boarId);
  const latest = (pig.weightLog || []).length > 0 ? (pig.weightLog || [])[(pig.weightLog || []).length - 1] : null;
  const assignedCustomer = data.showmen.find(sm => (sm.pigIds || []).includes(pig.id));
  const canRetain = (pig.sex === "Gilt" || pig.sex === "Boar") && !pig.sold;

  return (
    <div>
      <div className="detail-back" onClick={() => setView({ page: "pigs" })}>← Back to Pigs</div>
      <div className="detail-header">
        <div>
          <h2>{pig.tag} · {pig.sex}</h2>
          <p style={{ color: "var(--blue-bright)", marginTop: 4 }}>{pig.color} · Born {fmt(litter?.farrowDate)} · {latest?.weight} lbs current</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <span className={`badge ${pig.sold ? "badge-sold" : "badge-available"}`} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            {pig.sold ? `Sold – ${pig.showmanName}` : " Available"}
          </span>
          <button className="btn btn-outline" onClick={() => setShowEditModal(true)} style={{ fontSize: "0.8rem", padding: "7px 14px" }}>
            Edit Pig
          </button>
          {canRetain && (
            <button className="btn btn-outline" onClick={() => setShowRetainModal(true)} style={{ fontSize: "0.8rem", padding: "7px 14px", borderColor: pig.sex === "Gilt" ? "var(--green)" : "var(--blue-bright)", color: pig.sex === "Gilt" ? "var(--green)" : "var(--blue-bright)" }}>
              {pig.sex === "Gilt" ? "Retain as Sow" : "Retain as Boar"}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} style={{ fontSize: "0.8rem", padding: "7px 14px" }}>
            {assignedCustomer ? "Reassign" : "Assign Customer"}
          </button>
        </div>
      </div>

      {/* Customer panel */}
      {assignedCustomer ? (
        <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}>
          <h4 style={{ color: "var(--green)" }}>Customer</h4>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
            <div className="info-grid" style={{ flex: 1 }}>
              <div className="info-item"><label>Name</label><span>{assignedCustomer.name}</span></div>
              <div className="info-item"><label>Email</label><span>{assignedCustomer.email || "—"}</span></div>
              <div className="info-item"><label>Phone</label><span>{assignedCustomer.phone || "—"}</span></div>
              <div className="info-item"><label>Location</label><span>{assignedCustomer.city ? `${assignedCustomer.city}, ${assignedCustomer.state}` : assignedCustomer.state || "—"}</span></div>
              {assignedCustomer.club && <div className="info-item"><label>Club</label><span>{assignedCustomer.club}</span></div>}
            </div>
            <button onClick={() => onUnassignCustomer && onUnassignCustomer(assignedCustomer.id, pig.id)} className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "6px 12px", alignSelf: "flex-start" }}>Unassign</button>
          </div>
        </div>
      ) : (
        <div className="section-card" style={{ borderColor: "rgba(245,158,11,0.25)", background: "rgba(245,158,11,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--amber)", marginBottom: 3 }}>No Customer Assigned</div>
              <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>This pig is available for placement.</div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} style={{ fontSize: "0.8rem" }}>Assign Customer</button>
          </div>
        </div>
      )}

      <div className="section-card">
        <h4>Lineage</h4>
        <div className="lineage" style={{ flexWrap: "wrap", gap: 8 }}>
          <div className="lineage-box"><div className="role">Dam (Sow)</div><div className="name">{sow?.name}</div><div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{sow?.breed}</div></div>
          <div className="lineage-arrow">+</div>
          <div className="lineage-box"><div className="role">Sire (Boar)</div><div className="name">{boar?.name}</div><div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{boar?.breed}</div></div>
          <div className="lineage-arrow">→</div>
          <div className="lineage-box" style={{ background: "var(--blue-bright)", borderColor: "var(--blue-bright)" }}>
            <div className="role" style={{ color: "rgba(255,255,255,0.7)" }}>This Pig</div>
            <div className="name" style={{ color: "white" }}>{pig.tag}</div>
          </div>
        </div>
      </div>
      <div className="section-card">
        <h4>Weight Log</h4>
        <table>
          <thead><tr><th>Date</th><th>Weight (lbs)</th><th>Notes</th></tr></thead>
          <tbody>{(pig.weightLog || []).map((w, i) => <tr key={i}><td>{fmt(w.date)}</td><td><strong>{w.weight}</strong></td><td>{w.notes}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="section-card">
        <h4>Vaccination Record</h4>
        <table>
          <thead><tr><th>Vaccine</th><th>Date</th><th>Given By</th></tr></thead>
          <tbody>{(pig.vaccinations || []).map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.givenBy}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="section-card">
        <h4>Feed Notes & Plans</h4>
        {(pig.feedNotes || []).length === 0 ? <div className="empty">No feed notes yet.</div> : (
          <table>
            <thead><tr><th>Date</th><th>Note</th></tr></thead>
            <tbody>{(pig.feedNotes || []).map((f, i) => <tr key={i}><td>{fmt(f.date)}</td><td>{f.note}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <div className="section-card">
        <h4>Show Results</h4>
        {(pig.showResults || []).length === 0 ? <div className="empty">No show results recorded yet.</div> : (
          <table>
            <thead><tr><th>Show</th><th>Date</th><th>Class</th><th>Placing</th></tr></thead>
            <tbody>{(pig.showResults || []).map((r, i) => <tr key={i}><td>{r.show}</td><td>{fmt(r.date)}</td><td>{r.class}</td><td><strong>{r.placing}</strong></td></tr>)}</tbody>
          </table>
        )}
      </div>

      {showAssignModal && (
        <AssignCustomerModal
          pig={pig}
          showmen={data.showmen}
          onAssign={(customerId) => { onAssignCustomer && onAssignCustomer(customerId, pig.id); setShowAssignModal(false); }}
          onUnassign={(customerId) => { onUnassignCustomer && onUnassignCustomer(customerId, pig.id); setShowAssignModal(false); }}
          onClose={() => setShowAssignModal(false)}
        />
      )}
      {showRetainModal && (
        <RetainAnimalModal
          pig={pig}
          data={data}
          onRetain={onRetainAnimal}
          onClose={() => setShowRetainModal(false)}
        />
      )}
      {showEditModal && (
        <EditPigModal
          pig={pig}
          onSave={async (updates) => {
            await onEditPig && onEditPig(pig.id, updates);
            setShowEditModal(false);
          }}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}

//  BREEDING CALENDAR 


function EditPigModal({ pig, onSave, onClose }) {
  const [tag, setTag] = useState(pig.tag || "");
  const [sex, setSex] = useState(pig.sex || "Barrow");
  const [color, setColor] = useState(pig.color || "");
  const [birthWeight, setBirthWeight] = useState(pig.birthWeight || "");
  const [askingPrice, setAskingPrice] = useState(pig.askingPrice ?? pig.purchasePrice ?? "");
  const [showGoal, setShowGoal] = useState(pig.showGoal || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!tag.trim()) return;
    setSaving(true);
    await onSave({ tag, sex, color, birthWeight: parseFloat(birthWeight) || null, askingPrice: parseFloat(askingPrice) || 0, purchasePrice: parseFloat(askingPrice) || 0, showGoal });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3>Edit Pig</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tag / ID</label>
              <input type="text" value={tag} onChange={e => setTag(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} style={inputStyle}>
                <option>Barrow</option>
                <option>Gilt</option>
                <option>Boar</option>
                <option>Unknown</option>
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Color / Markings</label>
            <input type="text" value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Black with white belt" style={inputStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Birth Weight (lbs)</label>
              <input type="number" value={birthWeight} onChange={e => setBirthWeight(e.target.value)} placeholder="e.g. 3.2" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Asking Price ($)</label>
              <input type="number" value={askingPrice} onChange={e => setAskingPrice(e.target.value)} placeholder="e.g. 500" style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Show Goal</label>
            <input type="text" value={showGoal} onChange={e => setShowGoal(e.target.value)} placeholder="e.g. State Fair Grand Champion" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!tag.trim() || saving} style={{ opacity: (!tag.trim() || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { PigsView, PigDetail, AssignCustomerModal };
