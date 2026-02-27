import { useState, useRef } from "react";
import { css, labelStyle, inputStyle, textareaStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';
import { WeightChart } from '../breeder/WeightChart';

function CustomerPigCard({ pig, data, onUpdatePig, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [activeTab, setActiveTab] = useState("overview");

  // Pig-level editable state (showman-owned)
  const [showGoal, setShowGoal] = useState(pig.showGoal || { targetWeight: "", showDate: "", showName: "" });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(pig.showGoal || { targetWeight: "", showDate: "", showName: "" });

  // Weight entry
  const [showAddWeight, setShowAddWeight] = useState(false);
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWeightVal, setNewWeightVal] = useState("");
  const [newWeightNote, setNewWeightNote] = useState("");

  // Feed note entry
  const [showAddFeed, setShowAddFeed] = useState(false);
  const [newFeedDate, setNewFeedDate] = useState(new Date().toISOString().split("T")[0]);
  const [newFeedNote, setNewFeedNote] = useState("");

  // Vaccination entry
  const [showAddVax, setShowAddVax] = useState(false);
  const [newVaxName, setNewVaxName] = useState("");
  const [newVaxDate, setNewVaxDate] = useState(new Date().toISOString().split("T")[0]);
  const [newVaxGivenBy, setNewVaxGivenBy] = useState("");

  // Show result entry
  const [showAddResult, setShowAddResult] = useState(false);
  const [newResultShow, setNewResultShow] = useState("");
  const [newResultDate, setNewResultDate] = useState(new Date().toISOString().split("T")[0]);
  const [newResultClass, setNewResultClass] = useState("");
  const [newResultPlacing, setNewResultPlacing] = useState("");

  // Expenses (showman-private)
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [expDate, setExpDate] = useState(new Date().toISOString().split("T")[0]);
  const [expDesc, setExpDesc] = useState("");
  const [expAmt, setExpAmt] = useState("");
  const [expCat, setExpCat] = useState("feed");

  // Photos
  const photoInputRef = useRef(null);

  const litter = data.litters.find(l => l.id === pig.litterId);
  const sow = data.sows.find(s => s.id === litter?.sowId);
  const boar = data.boars.find(b => b.id === litter?.boarId);
  const latest = (pig.weightLog || []).length > 0 ? (pig.weightLog || [])[(pig.weightLog || []).length - 1] : null;
  const firstWeight = (pig.weightLog || [])[0];
  const gain = latest && firstWeight ? (latest.weight - firstWeight.weight).toFixed(1) : null;

  const showmanExpenses = pig.showmanExpenses || [];
  const totalExpenses = showmanExpenses.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);

  const EXPENSE_CATS = {
    feed: { label: "Feed & Supplies", icon: "feed" },
    entry: { label: "Show Entry Fees", icon: "trophy" },
    transport: { label: "Transport", icon: "" },
    equipment: { label: "Equipment", icon: "" },
    vet: { label: "Vet & Health", icon: "vet" },
    other: { label: "Other", icon: "" },
  };

  // Handlers
  const addWeight = () => {
    if (!newWeightVal || !newWeightDate) return;
    const updated = { ...pig, weightLog: [...(pig.weightLog || []), { date: newWeightDate, weight: parseFloat(newWeightVal), notes: newWeightNote.trim() || "" }].sort((a, b) => new Date(a.date) - new Date(b.date)) };
    onUpdatePig(updated);
    setNewWeightVal(""); setNewWeightNote(""); setShowAddWeight(false);
  };

  const addFeedNote = () => {
    if (!newFeedNote.trim()) return;
    const updated = { ...pig, feedNotes: [...pig.feedNotes, { date: newFeedDate, note: newFeedNote.trim() }] };
    onUpdatePig(updated);
    setNewFeedNote(""); setShowAddFeed(false);
  };

  const addVax = () => {
    if (!newVaxName.trim()) return;
    const updated = { ...pig, vaccinations: [...pig.vaccinations, { name: newVaxName.trim(), date: newVaxDate, givenBy: newVaxGivenBy.trim() || "Showman" }] };
    onUpdatePig(updated);
    setNewVaxName(""); setNewVaxGivenBy(""); setShowAddVax(false);
  };

  const addShowResult = () => {
    if (!newResultShow.trim()) return;
    const updated = { ...pig, showResults: [...pig.showResults, { show: newResultShow.trim(), date: newResultDate, class: newResultClass.trim(), placing: newResultPlacing.trim() }] };
    onUpdatePig(updated);
    setNewResultShow(""); setNewResultClass(""); setNewResultPlacing(""); setShowAddResult(false);
  };

  const addExpense = () => {
    if (!expDesc.trim() || !expAmt) return;
    const updated = { ...pig, showmanExpenses: [...showmanExpenses, { id: uid(), date: expDate, category: expCat, description: expDesc.trim(), amount: parseFloat(expAmt) }] };
    onUpdatePig(updated);
    setExpDesc(""); setExpAmt(""); setShowAddExpense(false);
  };

  const saveGoal = () => {
    const updated = { ...pig, showGoal: { ...goalDraft } };
    onUpdatePig(updated);
    setShowGoal({ ...goalDraft });
    setEditingGoal(false);
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const updated = { ...pig, photos: [...(pig.photos || []), { id: uid(), dataUrl: ev.target.result, name: file.name, date: new Date().toISOString().split("T")[0] }] };
        onUpdatePig(updated);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removePhoto = (photoId) => {
    const updated = { ...pig, photos: (pig.photos || []).filter(p => p.id !== photoId) };
    onUpdatePig(updated);
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "weight", label: "Weight" },
    { id: "feed", label: "Feed" },
    { id: "health", label: "Health" },
    { id: "shows", label: "Shows" },
    { id: "photos", label: " Photos" },
    { id: "expenses", label: " My Expenses" },
  ];

  const SectionHeader = ({ title, onAdd, addLabel = "+ Add" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)" }}>{title}</div>
      {onAdd && <button onClick={onAdd} className="btn btn-outline" style={{ fontSize: "0.72rem", padding: "4px 10px" }}>{addLabel}</button>}
    </div>
  );

  const AddRow = ({ onSave, onCancel, children }) => (
    <div style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 10, padding: "14px 16px", marginBottom: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {children}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>Cancel</button>
          <button onClick={onSave} className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>Save</button>
        </div>
      </div>
    </div>
  );

  // Header thumbnail — last photo or emoji
  const headerPhoto = pig.photos?.[(pig.photos || []).length - 1];

  return (
    <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
      {/* Pig header */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: open ? "rgba(59,130,246,0.04)" : "transparent", transition: "background 0.15s" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
            {headerPhoto ? <img src={headerPhoto.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "—"}
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 3 }}>{pig.tag}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{pig.color}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
              {sexIcon(pig.sex)} {pig.sex} · Born {fmt(litter?.farrowDate)}
              {pig.showGoal?.showDate && <span style={{ marginLeft: 10, color: "var(--green)", fontWeight: 600 }}> Show: {fmt(pig.showGoal.showDate)}</span>}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, color: "var(--green)", lineHeight: 1 }}>
              {latest?.weight || "—"}<span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted)", marginLeft: 3 }}>lbs</span>
            </div>
            {pig.showGoal?.targetWeight && (
              <div style={{ fontSize: "0.65rem", color: "var(--amber)", marginTop: 2, fontWeight: 600 }}>
                {latest ? `${(pig.showGoal.targetWeight - latest.weight).toFixed(1)} lbs to target` : `Target: ${pig.showGoal.targetWeight} lbs`}
              </div>
            )}
            {!pig.showGoal?.targetWeight && <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginTop: 2 }}>Current weight</div>}
          </div>
          <div style={{ color: "var(--muted)", fontSize: "1rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}></div>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid var(--border)" }}>
          {/* Tab bar */}
          <div style={{ padding: "12px 24px 0", display: "flex", gap: 4, overflowX: "auto", borderBottom: "1px solid var(--border)" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: "8px 12px", borderRadius: "8px 8px 0 0", border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700, whiteSpace: "nowrap", transition: "all 0.15s", background: activeTab === t.id ? "var(--card-bg)" : "transparent", color: activeTab === t.id ? "var(--blue-bright)" : "var(--muted)", borderBottom: activeTab === t.id ? "2px solid var(--blue-bright)" : "2px solid transparent", marginBottom: -1 }}>
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: "24px" }}>

            {/*  OVERVIEW  */}
            {activeTab === "overview" && (
              <div>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
                  {[
                    { label: "Sire", val: boar?.name || "—" },
                    { label: "Dam", val: sow?.name || "—" },
                    { label: "Birth Weight", val: firstWeight ? `${firstWeight.weight} lbs` : "—" },
                    { label: "Total Gain", val: gain ? `+${gain} lbs` : "—" },
                    { label: "Shows Entered", val: (pig.showResults || []).length || 0 },
                    { label: "My Expenses", val: totalExpenses > 0 ? `$${totalExpenses.toFixed(0)}` : "—" },
                  ].map(s => (
                    <div key={s.label} style={{ background: "var(--surface)", borderRadius: 9, padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.6rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>{s.val}</div>
                    </div>
                  ))}
                </div>

                {/* Show goal */}
                <div style={{ background: "var(--surface)", borderRadius: 12, border: "1px solid var(--border)", padding: "16px 18px", marginBottom: 24 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)" }}> Show Goal</div>
                    <button onClick={() => { setGoalDraft({ ...pig.showGoal }); setEditingGoal(true); }} className="btn btn-outline" style={{ fontSize: "0.72rem", padding: "4px 10px" }}>Edit</button>
                  </div>
                  {editingGoal ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                        <div>
                          <label style={labelStyle}>Target Weight (lbs)</label>
                          <input type="number" value={goalDraft.targetWeight} onChange={e => setGoalDraft(g => ({ ...g, targetWeight: e.target.value }))} placeholder="280" style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>Show Date</label>
                          <input type="date" value={goalDraft.showDate} onChange={e => setGoalDraft(g => ({ ...g, showDate: e.target.value }))} style={inputStyle} />
                        </div>
                      </div>
                      <div>
                        <label style={labelStyle}>Show Name</label>
                        <input value={goalDraft.showName} onChange={e => setGoalDraft(g => ({ ...g, showName: e.target.value }))} placeholder="e.g. County Fair Livestock Show" style={inputStyle} />
                      </div>
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button onClick={() => setEditingGoal(false)} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>Cancel</button>
                        <button onClick={saveGoal} className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>Save Goal</button>
                      </div>
                    </div>
                  ) : pig.showGoal?.targetWeight || pig.showGoal?.showDate ? (
                    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                      {pig.showGoal?.showName && <div><div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Show</div><div style={{ fontWeight: 600, marginTop: 3 }}>{pig.showGoal.showName}</div></div>}
                      {pig.showGoal?.showDate && <div><div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Date</div><div style={{ fontWeight: 600, marginTop: 3, color: "var(--green)" }}>{fmt(pig.showGoal.showDate)}</div></div>}
                      {pig.showGoal?.targetWeight && <div><div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Target Weight</div><div style={{ fontWeight: 600, marginTop: 3, color: "var(--amber)" }}>{pig.showGoal.targetWeight} lbs</div></div>}
                      {pig.showGoal?.targetWeight && latest && <div><div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Still Needed</div><div style={{ fontWeight: 700, marginTop: 3, color: (pig.showGoal.targetWeight - latest.weight) > 0 ? "var(--amber)" : "var(--green)" }}>{pig.showGoal.targetWeight - latest.weight > 0 ? `+${(pig.showGoal.targetWeight - latest.weight).toFixed(1)} lbs` : " At weight"}</div></div>}
                    </div>
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>No show goal set yet. Click Edit to add your target weight and show date.</div>
                  )}
                </div>

                {/* Mini weight chart */}
                <SectionHeader title="Weight Progress" />
                <WeightChart weightLog={pig.weightLog} targetWeight={pig.showGoal?.targetWeight} showDate={pig.showGoal?.showDate} />
              </div>
            )}

            {/*  WEIGHT  */}
            {activeTab === "weight" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <WeightChart weightLog={pig.weightLog} targetWeight={pig.showGoal?.targetWeight} showDate={pig.showGoal?.showDate} />
                </div>
                <SectionHeader title=" Weight Log" onAdd={() => setShowAddWeight(true)} addLabel="+ Log Weight" />
                {showAddWeight && (
                  <AddRow onSave={addWeight} onCancel={() => { setShowAddWeight(false); setNewWeightVal(""); setNewWeightNote(""); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelStyle}>Date</label><input type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Weight (lbs)</label><input type="number" step="0.1" value={newWeightVal} onChange={e => setNewWeightVal(e.target.value)} placeholder="245.0" style={inputStyle} autoFocus /></div>
                    </div>
                    <div><label style={labelStyle}>Notes (optional)</label><input value={newWeightNote} onChange={e => setNewWeightNote(e.target.value)} placeholder="e.g. Weighed before feeding" style={inputStyle} /></div>
                  </AddRow>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {(pig.weightLog || []).length === 0 ? <div className="empty">No weight entries yet.</div> : (
                    <table>
                      <thead><tr><th>Date</th><th>Weight (lbs)</th><th>Notes</th></tr></thead>
                      <tbody>{[...(pig.weightLog || [])].reverse().map((w, i) => (
                        <tr key={i}>
                          <td>{fmt(w.date)}</td>
                          <td><strong style={{ color: i === 0 ? "var(--green)" : "var(--text)" }}>{w.weight}</strong>{i === 0 && <span style={{ fontSize: "0.65rem", color: "var(--green)", marginLeft: 6, fontWeight: 700 }}> latest</span>}</td>
                          <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{w.notes || "—"}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/*  FEED  */}
            {activeTab === "feed" && (
              <div>
                <SectionHeader title=" Feed Program" onAdd={() => setShowAddFeed(true)} addLabel="+ Add Note" />
                {showAddFeed && (
                  <AddRow onSave={addFeedNote} onCancel={() => { setShowAddFeed(false); setNewFeedNote(""); }}>
                    <div><label style={labelStyle}>Date</label><input type="date" value={newFeedDate} onChange={e => setNewFeedDate(e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Feed Note</label><input value={newFeedNote} onChange={e => setNewFeedNote(e.target.value)} placeholder="e.g. Purina Honor Show 3lbs 2x daily, added showbloom" style={inputStyle} autoFocus /></div>
                  </AddRow>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {(pig.feedNotes || []).length === 0 ? <div className="empty">No feed notes yet. Add your first entry to start tracking your feed program.</div> : (
                    <table>
                      <thead><tr><th>Date</th><th>Note</th></tr></thead>
                      <tbody>{[...(pig.feedNotes || [])].reverse().map((f, i) => <tr key={i}><td>{fmt(f.date)}</td><td>{f.note}</td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/*  HEALTH  */}
            {activeTab === "health" && (
              <div>
                <SectionHeader title=" Vaccinations" onAdd={() => setShowAddVax(true)} addLabel="+ Log Vaccine" />
                {showAddVax && (
                  <AddRow onSave={addVax} onCancel={() => { setShowAddVax(false); setNewVaxName(""); setNewVaxGivenBy(""); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelStyle}>Vaccine</label><input value={newVaxName} onChange={e => setNewVaxName(e.target.value)} placeholder="e.g. Parvovirus Booster" style={inputStyle} autoFocus /></div>
                      <div><label style={labelStyle}>Date Given</label><input type="date" value={newVaxDate} onChange={e => setNewVaxDate(e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div><label style={labelStyle}>Given By</label><input value={newVaxGivenBy} onChange={e => setNewVaxGivenBy(e.target.value)} placeholder="Your name or vet name" style={inputStyle} /></div>
                  </AddRow>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {(pig.vaccinations || []).length === 0 ? <div className="empty">No vaccinations logged yet.</div> : (
                    <table>
                      <thead><tr><th>Vaccine</th><th>Date</th><th>Given By</th></tr></thead>
                      <tbody>{(pig.vaccinations || []).map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.givenBy}</td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/*  SHOWS  */}
            {activeTab === "shows" && (
              <div>
                <SectionHeader title=" Show Results" onAdd={() => setShowAddResult(true)} addLabel="+ Add Result" />
                {showAddResult && (
                  <AddRow onSave={addShowResult} onCancel={() => { setShowAddResult(false); setNewResultShow(""); setNewResultClass(""); setNewResultPlacing(""); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelStyle}>Show Name</label><input value={newResultShow} onChange={e => setNewResultShow(e.target.value)} placeholder="Taylor County Fair" style={inputStyle} autoFocus /></div>
                      <div><label style={labelStyle}>Date</label><input type="date" value={newResultDate} onChange={e => setNewResultDate(e.target.value)} style={inputStyle} /></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelStyle}>Class</label><input value={newResultClass} onChange={e => setNewResultClass(e.target.value)} placeholder="Market Barrow Heavy" style={inputStyle} /></div>
                      <div><label style={labelStyle}>Placing</label><input value={newResultPlacing} onChange={e => setNewResultPlacing(e.target.value)} placeholder="1st, Grand Champion..." style={inputStyle} /></div>
                    </div>
                  </AddRow>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {(pig.showResults || []).length === 0 ? <div className="empty">No show results yet. Add your first placing!</div> : (
                    <table>
                      <thead><tr><th>Show</th><th>Date</th><th>Class</th><th>Placing</th></tr></thead>
                      <tbody>{(pig.showResults || []).map((r, i) => <tr key={i}><td>{r.show}</td><td>{fmt(r.date)}</td><td>{r.class}</td><td><strong style={{ color: "var(--amber)" }}>{r.placing}</strong></td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/*  PHOTOS  */}
            {activeTab === "photos" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)" }}> Photos</div>
                  <button onClick={() => photoInputRef.current?.click()} className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "6px 14px" }}>+ Upload Photos</button>
                  <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
                </div>
                {(pig.photos || []).length === 0 ? (
                  <div style={{ background: "var(--surface)", borderRadius: 12, border: "2px dashed var(--border)", padding: "48px 24px", textAlign: "center", cursor: "pointer" }} onClick={() => photoInputRef.current?.click()}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}></div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 700, marginBottom: 6 }}>No photos yet</div>
                    <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Click to upload photos of your pig</div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
                    {(pig.photos || []).map(photo => (
                      <div key={photo.id} style={{ position: "relative", borderRadius: 10, overflow: "hidden", aspectRatio: "1", background: "var(--surface)" }}>
                        <img src={photo.dataUrl} alt={photo.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.15s" }}
                          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.4)"}
                          onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0)"}>
                          <button onClick={() => removePhoto(photo.id)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(239,68,68,0.85)", border: "none", borderRadius: "50%", width: 24, height: 24, color: "white", cursor: "pointer", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                        </div>
                        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.7))", padding: "16px 8px 6px", fontSize: "0.65rem", color: "rgba(255,255,255,0.8)" }}>{fmt(photo.date)}</div>
                      </div>
                    ))}
                    <div onClick={() => photoInputRef.current?.click()} style={{ borderRadius: 10, border: "2px dashed var(--border)", aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.5rem", color: "var(--muted)", background: "var(--surface)", transition: "border-color 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "var(--blue-bright)"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>+</div>
                  </div>
                )}
              </div>
            )}

            {/*  EXPENSES  */}
            {activeTab === "expenses" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)" }}> My Expenses</div>
                  <button onClick={() => setShowAddExpense(true)} className="btn btn-outline" style={{ fontSize: "0.72rem", padding: "4px 10px" }}>+ Add Expense</button>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginBottom: 14 }}>These expenses are only visible to you — your breeder cannot see them.</div>
                {showAddExpense && (
                  <AddRow onSave={addExpense} onCancel={() => { setShowAddExpense(false); setExpDesc(""); setExpAmt(""); }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div><label style={labelStyle}>Date</label><input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} style={inputStyle} /></div>
                      <div><label style={labelStyle}>Category</label><select value={expCat} onChange={e => setExpCat(e.target.value)} style={inputStyle}>{Object.entries(EXPENSE_CATS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}</select></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, alignItems: "end" }}>
                      <div><label style={labelStyle}>Description</label><input value={expDesc} onChange={e => setExpDesc(e.target.value)} placeholder="e.g. Show Chow feed bag" style={inputStyle} autoFocus /></div>
                      <div><label style={labelStyle}>Amount ($)</label><input type="number" min="0" step="0.01" value={expAmt} onChange={e => setExpAmt(e.target.value)} placeholder="45.00" style={{ ...inputStyle, width: 100 }} /></div>
                    </div>
                  </AddRow>
                )}
                {/* Expense summary */}
                {showmanExpenses.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10, marginBottom: 16 }}>
                    {Object.entries(EXPENSE_CATS).map(([k, v]) => {
                      const catTotal = showmanExpenses.filter(e => e.category === k).reduce((a, e) => a + e.amount, 0);
                      if (!catTotal) return null;
                      return (
                        <div key={k} style={{ background: "var(--surface)", borderRadius: 9, padding: "10px 14px" }}>
                          <div style={{ fontSize: "0.62rem", color: "var(--muted)", marginBottom: 4 }}>{v.icon} {v.label}</div>
                          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "var(--green)" }}>${catTotal.toFixed(2)}</div>
                        </div>
                      );
                    }).filter(Boolean)}
                    <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 9, padding: "10px 14px" }}>
                      <div style={{ fontSize: "0.62rem", color: "var(--green)", fontWeight: 700, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total</div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, color: "var(--green)" }}>${totalExpenses.toFixed(2)}</div>
                    </div>
                  </div>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {showmanExpenses.length === 0 ? <div className="empty">No expenses logged yet. Track your feed, entry fees, and show costs here.</div> : (
                    <table>
                      <thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th></tr></thead>
                      <tbody>{[...showmanExpenses].reverse().map((e, i) => (
                        <tr key={i}>
                          <td>{fmt(e.date)}</td>
                          <td><span style={{ fontSize: "0.75rem" }}>{EXPENSE_CATS[e.category]?.icon} {EXPENSE_CATS[e.category]?.label}</span></td>
                          <td>{e.description}</td>
                          <td style={{ fontWeight: 700, color: "var(--green)" }}>${e.amount.toFixed(2)}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}


//  SHOWMAN SIGNUP 

export { CustomerPigCard };
