import { useState } from "react";
import { supabase } from '../../../supabaseClient';
import { css, labelStyle, inputStyle, textareaStyle } from '../../../lib/styles';
import { COST_CATEGORIES, addDays, daysBetween, uid } from "../../../lib/constants";
import { fmt } from '../../../lib/calc';

console.log("addDays:", addDays);
function SowModal({ sow, onSave, onClose }) {
  const [name, setName] = useState(sow?.name || "");
  const [tag, setTag] = useState(sow?.tag || "");
  const [breed, setBreed] = useState(sow?.breed || "");
  const [dob, setDob] = useState(sow?.dob || "");
  const [sire, setSire] = useState(sow?.sire || "");
  const [damSire, setDamSire] = useState(sow?.damSire || "");
  const isValid = name.trim() && tag.trim() && breed.trim();
  const handleSave = () => {
    if (!isValid) return;
    onSave({ ...sow, name: name.trim(), tag: tag.trim(), breed: breed.trim(), dob, sire: sire.trim(), damSire: damSire.trim(), id: sow?.id || uid(), breedingCycles: sow?.breedingCycles || [], costs: sow?.costs || [] });
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h3>{sow ? "Edit Sow" : "Add New Sow"}</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div><label style={labelStyle}>Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Duchess" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Tag *</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. A-112" style={inputStyle} /></div>
            <div><label style={labelStyle}>Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Breed *</label><input value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g. Hampshire x Duroc" style={inputStyle} /></div>
          <div style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 10 }}>Lineage</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={labelStyle}>Sire</label><input value={sire} onChange={e => setSire(e.target.value)} placeholder="e.g. Ironside" style={inputStyle} /></div>
              <div><label style={labelStyle}>Dam's Sire</label><input value={damSire} onChange={e => setDamSire(e.target.value)} placeholder="e.g. Full Package" style={inputStyle} /></div>
            </div>
            {(sire || damSire) && (
              <div style={{ marginTop: 10, padding: "7px 12px", background: "var(--card-bg)", borderRadius: 6, fontSize: "0.82rem", color: "var(--muted)" }}>
                Preview: <strong style={{ color: "var(--text)" }}>{sire || "?"} × {damSire || "?"}</strong>
              </div>
            )}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Sow</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoarModal({ boar, onSave, onClose }) {
  const [name, setName] = useState(boar?.name || "");
  const [tag, setTag] = useState(boar?.tag || "");
  const [breed, setBreed] = useState(boar?.breed || "");
  const [dob, setDob] = useState(boar?.dob || "");
  const [owner, setOwner] = useState(boar?.owner || "");
  const [location, setLocation] = useState(boar?.location || "on-farm");
  const [method, setMethod] = useState(boar?.method || "Natural");
  const [semenDosePrice, setSemenDosePrice] = useState(boar?.semenDosePrice ?? "");
  const [dosesPerBreeding, setDosesPerBreeding] = useState(boar?.dosesPerBreeding ?? 2);
  const [notes, setNotes] = useState(boar?.notes || "");
  const isValid = name.trim() && tag.trim() && breed.trim();
  const handleSave = () => {
    if (!isValid) return;
    onSave({
      ...boar, id: boar?.id || uid(),
      name: name.trim(), tag: tag.trim(), breed: breed.trim(), dob,
      owner: owner.trim() || (location === "on-farm" ? "On-farm" : ""),
      location, method,
      semenDosePrice: method === "AI" ? parseFloat(semenDosePrice) || 0 : 0,
      dosesPerBreeding: method === "AI" ? parseInt(dosesPerBreeding) || 1 : 1,
      notes: notes.trim()
    });
  };
  const totalDoseCost = method === "AI" ? (parseFloat(semenDosePrice) || 0) * (parseInt(dosesPerBreeding) || 1) : 0;
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h3>{boar ? " Edit Service Sire" : " Add Service Sire"}</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div><label style={labelStyle}>Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Thunder" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Tag *</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. S-003" style={inputStyle} /></div>
            <div><label style={labelStyle}>Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Breed *</label><input value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g. Hampshire" style={inputStyle} /></div>
          {/* Location toggle */}
          <div>
            <label style={labelStyle}>Location</label>
            <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              {[["on-farm"," On-Farm"],["off-farm"," Off-Farm / External"]].map(([v,l]) => (
                <button key={v} onClick={() => { setLocation(v); if (v === "on-farm") setOwner("On-farm"); }} style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700, background: location === v ? "var(--blue-dim)" : "transparent", color: location === v ? "var(--blue-bright)" : "var(--muted)", transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          {location === "off-farm" && <div><label style={labelStyle}>Owner / Farm Name</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. JB Farms" style={inputStyle} /></div>}
          {/* Method */}
          <div>
            <label style={labelStyle}>Breeding Method</label>
            <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              {[["Natural"," Natural Service"],["AI"," Artificial Insemination"]].map(([v,l]) => (
                <button key={v} onClick={() => setMethod(v)} style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700, background: method === v ? "var(--blue-dim)" : "transparent", color: method === v ? "var(--blue-bright)" : "var(--muted)", transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          {/* AI semen cost section */}
          {method === "AI" && (
            <div style={{ background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}> Semen Cost Settings</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Cost Per Dose ($)</label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }}>$</span>
                    <input type="number" min="0" step="0.01" value={semenDosePrice} onChange={e => setSemenDosePrice(e.target.value)} placeholder="40.00" style={{ ...inputStyle, paddingLeft: 24 }} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Doses Per Breeding</label>
                  <input type="number" min="1" max="5" value={dosesPerBreeding} onChange={e => setDosesPerBreeding(e.target.value)} style={inputStyle} />
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 4 }}>Applied 12hrs apart</div>
                </div>
              </div>
              {totalDoseCost > 0 && (
                <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(16,185,129,0.1)", borderRadius: 7, border: "1px solid rgba(16,185,129,0.2)" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--green)", fontWeight: 700 }}>Auto-charge per breeding: ${totalDoseCost.toFixed(2)}</span>
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", marginLeft: 8 }}>({dosesPerBreeding} dose{dosesPerBreeding > 1 ? "s" : ""} × ${semenDosePrice})</span>
                </div>
              )}
            </div>
          )}
          <div><label style={labelStyle}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Outstanding ham genetics, used for AI" style={textareaStyle} /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Sire</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowmanModal({ showman, onSave, onClose }) {
  const [name, setName] = useState(showman?.name || "");
  const [email, setEmail] = useState(showman?.email || "");
  const [phone, setPhone] = useState(showman?.phone || "");
  const [city, setCity] = useState(showman?.city || "");
  const [state, setState] = useState(showman?.state || "TX");
  const [age, setAge] = useState(showman?.age || "");
  const [club, setClub] = useState(showman?.club || "");
  const [notes, setNotes] = useState(showman?.notes || "");
  const isValid = name.trim();
  const handleSave = () => {
    if (!isValid) return;
    onSave({ ...showman, id: showman?.id || uid(), name: name.trim(), email: email.trim(), phone: phone.trim(), city: city.trim(), state, age: parseInt(age) || null, club: club.trim(), notes: notes.trim(), pigIds: showman?.pigIds || [] });
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{showman ? "Edit Customer" : "Add Customer"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div><label style={labelStyle}>Full Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Tyler Owens" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tyler@example.com" style={inputStyle} /></div>
            <div><label style={labelStyle}>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} placeholder="325-555-0101" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>City</label><input value={city} onChange={e => setCity(e.target.value)} placeholder="Abilene" style={inputStyle} /></div>
            <div><label style={labelStyle}>State</label><input value={state} onChange={e => setState(e.target.value)} placeholder="TX" style={inputStyle} /></div>
            <div><label style={labelStyle}>Age</label><input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="16" style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>4-H / FFA Club</label><input value={club} onChange={e => setClub(e.target.value)} placeholder="Taylor County 4-H" style={inputStyle} /></div>
          <div><label style={labelStyle}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes about this customer..." style={textareaStyle} /></div>
          <div style={{ padding: "10px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.78rem", color: "var(--muted)" }}>
             To assign pigs to this customer, open the individual pig's page and use the <strong style={{ color: "var(--text)" }}>Assign Customer</strong> button.
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Customer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddPigModal({ litterId, litters, sows, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [selectedLitter, setSelectedLitter] = useState(litterId || (litters[0]?.id || ""));
  const [tag, setTag] = useState("");
  const [sex, setSex] = useState("Barrow");
  const [birthWeight, setBirthWeight] = useState("");
  const [color, setColor] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const isValid = tag.trim() && selectedLitter && purchasePrice;
  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: uid(), litterId: selectedLitter, tag: tag.trim(), sex, birthWeight: parseFloat(birthWeight) || 0,
      color: color.trim(), purchasePrice: parseFloat(purchasePrice) || 0,
      sold: false, showmanName: null, showmanContact: null, showmanPhone: null, photos: [],
      weightLog: birthWeight ? [{ date: today, weight: parseFloat(birthWeight), notes: "Birth" }] : [],
      vaccinations: [], feedNotes: [], showResults: []
    });
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h3> Add Pig</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div>
            <label style={labelStyle}>Litter *</label>
            <select value={selectedLitter} onChange={e => setSelectedLitter(e.target.value)} style={inputStyle}>
              {litters.map(l => {
                const sow = sows.find(s => s.id === l.sowId);
                return <option key={l.id} value={l.id}>{sow?.name} – {fmt(l.farrowDate)}</option>;
              })}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Tag *</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. L1-004" style={inputStyle} /></div>
            <div>
              <label style={labelStyle}>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} style={inputStyle}>
                <option value="Barrow">Barrow</option><option value="Gilt">Gilt</option>
              </select>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Birth Weight (lbs)</label><input type="number" step="0.1" value={birthWeight} onChange={e => setBirthWeight(e.target.value)} placeholder="3.2" style={inputStyle} /></div>
            <div><label style={labelStyle}>Asking Price ($) *</label><input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="950" style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Color / Description</label><input value={color} onChange={e => setColor(e.target.value)} placeholder="e.g. Black w/ white belt" style={inputStyle} /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Add Pig</button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  RECORD FARROW MODAL 
function RecordFarrowModal({ sows, boars, defaultSowId, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const addDays = (dateStr, days) => { const d = new Date(dateStr + "T12:00:00"); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]; };
  const [sowId, setSowId] = useState(defaultSowId || sows[0]?.id || "");
  const [farrowDate, setFarrowDate] = useState(today);
  const [boarId, setBoarId] = useState(boars[0]?.id || "");
  const [numberBorn, setNumberBorn] = useState("");
  const [numberBornAlive, setNumberBornAlive] = useState("");
  const [numberWeaned, setNumberWeaned] = useState("");
  const [weanDate, setWeanDate] = useState(addDays(today, 21));
  const [notes, setNotes] = useState("");
  const [litterNum, setLitterNum] = useState("");
  const [pigPrice, setPigPrice] = useState("");

  const sow = sows.find(s => s.id === sowId);
  const gestatingCycle = (sow?.breedingCycles || [])
    .filter(c => c.conceived && !c.farrowDateActual && !c.missed)
    .sort((a, b) => new Date(b.breedDate) - new Date(a.breedDate))[0];

  // Auto-generate pig tags preview
  const bornAliveCount = parseInt(numberBornAlive) || parseInt(numberBorn) || 0;
  const sowTag = (sow?.tag || "").replace(/[^a-zA-Z0-9]/g, "");
  const lNum = litterNum || "?";
  const previewTags = bornAliveCount > 0 && sowTag
    ? Array.from({ length: Math.min(bornAliveCount, 3) }, (_, i) => `${sowTag}-L${lNum}-${String(i + 1).padStart(2, "0")}`)
    : [];

  const handleSave = async () => {
    if (!sowId || !farrowDate || !numberBorn) return;

    // Update the gestating cycle in Supabase with farrow date
    if (gestatingCycle?.id) {
      await supabase
        .from("breeding_cycles")
        .update({ farrow_date_actual: farrowDate })
        .eq("id", gestatingCycle.id);
    }

    // Auto-generate pigs for born alive count
    const generatedPigs = bornAliveCount > 0 && sowTag ? Array.from({ length: bornAliveCount }, (_, i) => ({
      id: crypto.randomUUID(),
      tag: `${sowTag}-L${lNum}-${String(i + 1).padStart(2, "0")}`,
      sex: "Unknown",
      birthWeight: null,
      color: "",
      purchasePrice: parseFloat(pigPrice) || 0,
      askingPrice: parseFloat(pigPrice) || 0,
      sold: false,
      weightLog: [],
      vaccinations: [],
      feedNotes: [],
      showResults: [],
      photos: [],
    })) : [];

    onSave({
      id: crypto.randomUUID(),
      sowId, boarId, farrowDate,
      litterNum: litterNum || null,
      numberBorn: parseInt(numberBorn),
      numberBornAlive: parseInt(numberBornAlive) || parseInt(numberBorn),
      numberWeaned: parseInt(numberWeaned) || 0,
      weanDate, notes,
      vaccinations: [],
      cycleId: gestatingCycle?.id || null,
      generatedPigs,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>Record Farrowing</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {gestatingCycle && (
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Linking to Gestating Cycle</div>
              <div style={{ display: "flex", gap: 20, fontSize: "0.82rem" }}>
                <span><span style={{ color: "var(--muted)" }}>Bred:</span> {gestatingCycle.breedDate}</span>
                {gestatingCycle.conceiveDate && <span><span style={{ color: "var(--muted)" }}>Conceived:</span> {gestatingCycle.conceiveDate}</span>}
                {gestatingCycle.expectedFarrowDate && <span><span style={{ color: "var(--muted)" }}>Due:</span> {gestatingCycle.expectedFarrowDate}</span>}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Sow</label>
              <select value={sowId} onChange={e => setSowId(e.target.value)} style={inputStyle}>
                {sows.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tag})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sire</label>
              <select value={boarId} onChange={e => setBoarId(e.target.value)} style={inputStyle}>
                {boars.map(b => <option key={b.id} value={b.id}>{b.name} ({b.tag})</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Farrow Date</label><input type="date" value={farrowDate} onChange={e => setFarrowDate(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Wean Date</label><input type="date" value={weanDate} onChange={e => setWeanDate(e.target.value)} style={inputStyle} /></div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Born Total</label><input type="number" value={numberBorn} onChange={e => setNumberBorn(e.target.value)} placeholder="11" style={inputStyle} /></div>
            <div><label style={labelStyle}>Born Alive</label><input type="number" value={numberBornAlive} onChange={e => setNumberBornAlive(e.target.value)} placeholder="10" style={inputStyle} /></div>
            <div><label style={labelStyle}>Weaned</label><input type="number" value={numberWeaned} onChange={e => setNumberWeaned(e.target.value)} placeholder="9" style={inputStyle} /></div>
          </div>

          {/* Litter number and pig price */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Litter # <span style={{ color: "var(--muted)", fontWeight: 400 }}>(for tagging)</span></label>
              <input type="number" min="1" value={litterNum} onChange={e => setLitterNum(e.target.value)} placeholder="e.g. 3" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Asking Price per Pig <span style={{ color: "var(--muted)", fontWeight: 400 }}>(optional)</span></label>
              <input type="number" min="0" value={pigPrice} onChange={e => setPigPrice(e.target.value)} placeholder="$0" style={inputStyle} />
            </div>
          </div>

          {/* Tag preview */}
          {previewTags.length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                Auto-generated Tags Preview ({bornAliveCount} pigs)
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {previewTags.map(tag => (
                  <span key={tag} style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 700, background: "var(--blue-dim)", color: "var(--blue-bright)", border: "1px solid rgba(59,130,246,0.25)" }}>{tag}</span>
                ))}
                {bornAliveCount > 3 && <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: "0.75rem", color: "var(--muted)", border: "1px solid var(--border)" }}>+{bornAliveCount - 3} more</span>}
              </div>
            </div>
          )}

          <div><label style={labelStyle}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} style={textareaStyle} placeholder="Litter notes..." /></div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ background: "var(--green)" }}>Record Farrow</button>
          </div>
        </div>
      </div>
    </div>
  );
}
  





function LogBreedModal({ sows, boars, defaultSowId, onSave, onClose }) {

  const today = new Date().toISOString().split("T")[0];
  const [sowId, setSowId] = useState(defaultSowId || sows[0]?.id || "");
  const [mode, setMode] = useState("breed");
  const [breedDate, setBreedDate] = useState(today);
  const [sireId, setSireId] = useState(boars[0]?.id || "");
  const [method, setMethod] = useState(boars[0]?.method || "Natural");
  const [doses, setDoses] = useState(boars[0]?.dosesPerBreeding || 1);
  const [notes, setNotes] = useState("");
  const [openDate, setOpenDate] = useState(today);
  const [nextHeatDate, setNextHeatDate] = useState(addDays(today, 21));

  const selectedBoar = boars.find(b => b.id === sireId);
  const semenCost = method === "AI" ? (selectedBoar?.semenDosePrice || 0) * (parseInt(doses) || 1) : 0;
  const selectedSowName = sows.find(s => s.id === sowId)?.name || "";

  const handleSireChange = (boarId) => {
    setSireId(boarId);
    const b = boars.find(x => x.id === boarId);
    if (b) { setMethod(b.method || "Natural"); setDoses(b.dosesPerBreeding || 1); }
  };

  const isValid = sowId && (mode === 'open' ? openDate : (breedDate && sireId));

  const handleSave = () => {
    if (!isValid) return;
    if (mode === 'open') {
      onSave(sowId, { type: 'open', openDate, nextHeatDate, notes: notes.trim() || undefined }, []);
    } else {
      const cycle = { breedDate, sireId, method, doses: parseInt(doses) || 1, notes: notes.trim() || undefined };
      const autoExpenses = semenCost > 0 ? [{
        sowId,
        cost: { id: uid(), date: breedDate, category: "breeding",
          description: `AI semen – ${selectedBoar?.name} (${doses} dose${doses > 1 ? "s" : ""} × $${selectedBoar?.semenDosePrice})`,
          amount: semenCost }
      }] : [];
      onSave(sowId, cycle, autoExpenses);
    }
  };

  const onFarmBoars = boars.filter(b => b.location === "on-farm" || b.owner === "On-farm");
  const offFarmBoars = boars.filter(b => !(b.location === "on-farm" || b.owner === "On-farm"));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div className="modal-header">
          <h3>{mode === 'open' ? ' Log Open Cycle' : ' Log Breeding'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
            {[["breed"," Breed Attempt"],["open"," Open / Missed Heat"]].map(([val,lbl]) => (
              <button key={val} onClick={() => setMode(val)} style={{ flex: 1, padding: "8px 10px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700, transition: "all 0.15s", background: mode === val ? (val === 'open' ? "rgba(245,158,11,0.15)" : "var(--blue-dim)") : "transparent", color: mode === val ? (val === 'open' ? "var(--amber)" : "var(--blue-bright)") : "var(--muted)" }}>{lbl}</button>
            ))}
          </div>

          <div>
            <label style={labelStyle}>Sow</label>
            <select value={sowId} onChange={e => setSowId(e.target.value)} style={inputStyle}>
              {sows.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tag})</option>)}
            </select>
          </div>

          {mode === 'breed' && (<>
            <div>
              <label style={labelStyle}>Breed Date</label>
              <input type="date" value={breedDate} onChange={e => setBreedDate(e.target.value)} style={inputStyle} />
            </div>

            <div>
              <label style={labelStyle}>Service Sire</label>
              <select value={sireId} onChange={e => handleSireChange(e.target.value)} style={inputStyle}>
                {onFarmBoars.length > 0 && <optgroup label=" On-Farm">{onFarmBoars.map(b => <option key={b.id} value={b.id}>{b.name} ({b.tag}) · {b.breed}</option>)}</optgroup>}
                {offFarmBoars.length > 0 && <optgroup label=" Off-Farm / External">{offFarmBoars.map(b => <option key={b.id} value={b.id}>{b.name} ({b.tag}) · {b.breed} — {b.owner}</option>)}</optgroup>}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}>
                  <option value="Natural"> Natural Service</option>
                  <option value="AI"> Artificial Insemination</option>
                </select>
              </div>
              {method === "AI" && (
                <div>
                  <label style={labelStyle}>Number of Doses</label>
                  <input type="number" min="1" max="5" value={doses} onChange={e => setDoses(e.target.value)} style={inputStyle} />
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 3 }}>Doses applied 12hrs apart</div>
                </div>
              )}
            </div>

            {/* Auto-charge preview */}
            {method === "AI" && semenCost > 0 && (
              <div style={{ background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, padding: "12px 16px" }}>
                <div style={{ fontSize: "0.62rem", color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}> Auto-Charge on Save</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{doses} dose{doses > 1 ? "s" : ""} × ${selectedBoar?.semenDosePrice || 0} ({selectedBoar?.name})</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "var(--green)" }}>${semenCost.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 4 }}>Added to {selectedSowName}'s expense log automatically.</div>
              </div>
            )}

            {/* Pending notice */}
            <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}></span>
              <div style={{ fontSize: "0.78rem", color: "#c084fc", lineHeight: 1.5 }}>
                <strong>Saved as "Bred — Pending Confirmation."</strong><br />
                <span style={{ color: "var(--muted)" }}>Recheck ~19 days post-breeding. Confirm conception from the sow's breeding cycle card — due date calculates from that date.</span>
              </div>
            </div>
          </>)}

          {mode === 'open' && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Open Date</label>
                <input type="date" value={openDate} onChange={e => { setOpenDate(e.target.value); setNextHeatDate(addDays(e.target.value, 21)); }} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Next Heat (auto)</label>
                <input type="date" value={nextHeatDate} onChange={e => setNextHeatDate(e.target.value)} style={inputStyle} />
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 3 }}>Default: 21 days after open date</div>
              </div>
            </div>
          )}

          <div>
            <label style={labelStyle}>Notes (optional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Checked standing heat beforehand" style={inputStyle} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Breeding Record</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddExpenseModal({ sows, defaultSowId, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState("feed");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [splitMode, setSplitMode] = useState("single");
  const [selectedSows, setSelectedSows] = useState(defaultSowId ? [defaultSowId] : [sows[0]?.id || ""]);
  const [manualAmounts, setManualAmounts] = useState({});
  const toggleSow = (id) => setSelectedSows(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const equalSplit = parseFloat(totalAmount) / (selectedSows.length || 1);
  const manualTotal = Object.values(manualAmounts).reduce((a, v) => a + (parseFloat(v) || 0), 0);
  const isValid = date && description.trim() && selectedSows.length > 0 && (splitMode === "single" ? parseFloat(totalAmount) > 0 : manualTotal > 0);
  const handleSave = () => {
    if (!isValid) return;
    const entries = selectedSows.map(sowId => ({
      sowId,
      cost: {
        id: uid(), date, category, description: description.trim(),
        amount: splitMode === "single" ? parseFloat(totalAmount) : splitMode === "equal" ? equalSplit : parseFloat(manualAmounts[sowId] || 0)
      }
    }));
    onSave(entries);
  };
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header"><h3> Add Expense</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Date</label><input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Category</label><select value={category} onChange={e => setCategory(e.target.value)} style={inputStyle}>{Object.entries(COST_CATEGORIES).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
          </div>
          <div><label style={labelStyle}>Description</label><input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Gestation feed – 250lb bag" style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Split Mode</label>
            <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              {[["single","Single Sow"],["equal","Split Equally"],["manual","Manual Split"]].map(([v, l]) => (
                <button key={v} onClick={() => setSplitMode(v)} style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.72rem", fontWeight: 700, background: splitMode === v ? "var(--blue-dim)" : "transparent", color: splitMode === v ? "var(--blue-bright)" : "var(--muted)", transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          {splitMode === "single" && (
            <div>
              <label style={labelStyle}>Sow</label>
              <select value={selectedSows[0] || ""} onChange={e => setSelectedSows([e.target.value])} style={inputStyle}>
                {sows.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tag})</option>)}
              </select>
            </div>
          )}
          {(splitMode === "equal" || splitMode === "manual") && (
            <div>
              <label style={labelStyle}>Select Sows</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {sows.map(s => {
                  const sel = selectedSows.includes(s.id);
                  return <button key={s.id} onClick={() => toggleSow(s.id)} style={{ padding: "5px 12px", borderRadius: 20, border: `1px solid ${sel ? "var(--blue-bright)" : "var(--border)"}`, background: sel ? "var(--blue-dim)" : "transparent", color: sel ? "var(--blue-bright)" : "var(--muted)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700 }}>{s.name}</button>;
                })}
              </div>
            </div>
          )}
          {(splitMode === "single" || splitMode === "equal") && (
            <div>
              <label style={labelStyle}>Total Amount ($)</label>
              <input type="number" min="0" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" style={inputStyle} />
              {splitMode === "equal" && selectedSows.length > 1 && parseFloat(totalAmount) > 0 && (
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 5 }}>= ${equalSplit.toFixed(2)} per sow</div>
              )}
            </div>
          )}
          {splitMode === "manual" && selectedSows.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <label style={labelStyle}>Enter Amount per Sow</label>
              {selectedSows.map(id => {
                const sow = sows.find(s => s.id === id);
                return (
                  <div key={id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ minWidth: 120, fontSize: "0.85rem", fontWeight: 500 }}>{sow?.name}</span>
                    <input type="number" min="0" step="0.01" value={manualAmounts[id] || ""} onChange={e => setManualAmounts(prev => ({ ...prev, [id]: e.target.value }))} placeholder="0.00" style={{ ...inputStyle, margin: 0 }} />
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Expense</button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  CUSTOMER PORTAL 
//  WEIGHT CHART (SVG) 
export { SowModal, BoarModal, ShowmanModal, AddPigModal, RecordFarrowModal, LogBreedModal, AddExpenseModal };
