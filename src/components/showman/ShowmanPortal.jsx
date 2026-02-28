import { useState, useRef, useEffect } from "react";
import { supabase } from '../../supabaseClient';
import { css, labelStyle, inputStyle, textareaStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';
import { IconMyPigs, IconTasks } from "../icons";

function ShowmanTasks({ profile, pigs }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => { loadTasks(); }, []);

  const loadTasks = async () => {
    setLoading(true);
    const { data } = await supabase.from("showman_tasks").select("*").eq("owner_id", profile.id).order("created_at");
    setTasks(data || []);
    setLoading(false);
  };

  const addTask = async (task) => {
    const { data } = await supabase.from("showman_tasks").insert({ ...task, owner_id: profile.id, completed: false }).select().single();
    if (data) { setTasks(prev => [...prev, data]); setShowAdd(false); }
  };

  const completeTask = async (task, note = "") => {
    // Mark current instance as completed
    const now = new Date().toISOString();
    await supabase.from("showman_tasks").update({ completed: true, completed_at: now, completion_note: note || null }).eq("id", task.id);

    // Spawn next instance if recurring
    let nextTask = null;
    if (task.frequency !== "one-time") {
      const nextDue = new Date();
      if (task.frequency === "daily") nextDue.setDate(nextDue.getDate() + 1);
      if (task.frequency === "weekly") nextDue.setDate(nextDue.getDate() + 7);
      if (task.frequency === "monthly") nextDue.setMonth(nextDue.getMonth() + 1);
      const { data: spawned } = await supabase.from("showman_tasks").insert({
        owner_id: profile.id,
        title: task.title,
        frequency: task.frequency,
        pig_id: task.pig_id || null,
        next_due: nextDue.toISOString().split("T")[0],
        completed: false,
        parent_task_id: task.parent_task_id || task.id,
      }).select().single();
      nextTask = spawned;
    }

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true, completed_at: now, completion_note: note || null } : t).concat(nextTask ? [nextTask] : []));
  };

  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    await supabase.from("showman_tasks").delete().eq("id", id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const freqLabel = { "one-time": "One-time", daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
  const freqColor = { "one-time": "var(--muted)", daily: "var(--blue-bright)", weekly: "var(--green)", monthly: "var(--amber)" };

  if (loading) return <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Loading tasks...</div>;

  const pending = tasks.filter(t => !t.completed);
  const completed = tasks.filter(t => t.completed).sort((a, b) => new Date(b.completed_at) - new Date(a.completed_at));

  const isDue = (task) => {
    if (!task.next_due) return true;
    return new Date() >= new Date(task.next_due);
  };

  const dueTasks = pending.filter(t => isDue(t));
  const upcomingTasks = pending.filter(t => !isDue(t));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800 }}>
          Tasks {dueTasks.length > 0 && <span style={{ fontSize: "0.75rem", background: "rgba(239,68,68,0.15)", color: "var(--red)", borderRadius: 20, padding: "2px 10px", marginLeft: 8 }}>{dueTasks.length} due</span>}
        </h3>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ background: "var(--green)", fontSize: "0.8rem", padding: "8px 14px" }}>+ Add Task</button>
      </div>

      {pending.length === 0 && completed.length === 0 ? (
        <div style={{ background: "var(--card-bg)", borderRadius: 12, border: "1px solid var(--border)", padding: "32px 24px", textAlign: "center" }}>
          
          <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>No tasks yet. Add recurring reminders for feeding, weighing, or vaccinations.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {dueTasks.length > 0 && <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--red)", marginBottom: 2 }}>Due Now</div>}
          {dueTasks.map(task => (
            <TaskCard key={task.id} task={task} pigs={pigs} isDue={true} freqLabel={freqLabel} freqColor={freqColor} onComplete={completeTask} onDelete={deleteTask} />
          ))}
          {upcomingTasks.length > 0 && <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--muted)", marginTop: dueTasks.length > 0 ? 8 : 0, marginBottom: 2 }}>Upcoming</div>}
          {upcomingTasks.map(task => (
            <TaskCard key={task.id} task={task} pigs={pigs} isDue={false} freqLabel={freqLabel} freqColor={freqColor} onComplete={completeTask} onDelete={deleteTask} />
          ))}

          {completed.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setShowCompleted(p => !p)} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.75rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, padding: 0, display: "flex", alignItems: "center", gap: 6 }}>
                {showCompleted ? "" : ""} {completed.length} completed task{completed.length !== 1 ? "s" : ""}
              </button>
              {showCompleted && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                  {completed.map(task => (
                    <TaskCard key={task.id} task={task} pigs={pigs} isDue={false} freqLabel={freqLabel} freqColor={freqColor} onComplete={completeTask} onDelete={deleteTask} isCompleted={true} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {showAdd && <AddTaskModal pigs={pigs} onSave={addTask} onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function TaskCard({ task, pigs, isDue, freqLabel, freqColor, onComplete, onDelete, isCompleted }) {
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const pig = pigs.find(p => p.id === task.pig_id);

  const handleComplete = () => {
    onComplete(task, note);
    setNote("");
    setShowNoteInput(false);
  };

  return (
    <div style={{ background: "var(--card-bg)", borderRadius: 12, border: `1px solid ${isDue ? "rgba(239,68,68,0.3)" : isCompleted ? "rgba(16,185,129,0.2)" : "var(--border)"}`, overflow: "hidden", opacity: isCompleted ? 0.75 : 1 }}>
      <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid ${isCompleted ? "var(--green)" : isDue ? "var(--red)" : "var(--border)"}`, background: isCompleted ? "var(--green)" : isDue ? "rgba(239,68,68,0.08)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.8rem", color: "white", fontWeight: 700 }}>
          {isCompleted ? "" : ""}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 3, textDecoration: isCompleted ? "line-through" : "none", color: isCompleted ? "var(--muted)" : "var(--text)" }}>{task.title}</div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: freqColor[task.frequency] }}>{freqLabel[task.frequency]}</span>
            {pig && <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>· {pig.name || pig.tag}</span>}
            {task.next_due && !isCompleted && <span style={{ fontSize: "0.7rem", color: isDue ? "var(--red)" : "var(--muted)" }}>· Due {new Date(task.next_due).toLocaleDateString()}</span>}
            {isCompleted && task.completed_at && <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>· Done {new Date(task.completed_at).toLocaleDateString()}</span>}
            {isCompleted && task.completion_note && <span style={{ fontSize: "0.7rem", color: "var(--muted)", fontStyle: "italic" }}>· "{task.completion_note}"</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {!isCompleted && (
            <button onClick={() => setShowNoteInput(p => !p)} style={{ background: "none", border: `1px solid ${isDue ? "rgba(16,185,129,0.4)" : "var(--border)"}`, borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: isDue ? "var(--green)" : "var(--muted)", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
               Done
            </button>
          )}
          <button onClick={() => onDelete(task.id)} style={{ background: "none", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "4px 10px", cursor: "pointer", color: "var(--red)", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            Delete
          </button>
        </div>
      </div>

      {showNoteInput && (
        <div style={{ padding: "0 16px 14px", display: "flex", gap: 8 }}>
          <input value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note (optional)" onKeyDown={e => e.key === "Enter" && handleComplete()} style={{ ...inputStyle, flex: 1, fontSize: "0.8rem", padding: "8px 12px" }} autoFocus />
          <button onClick={handleComplete} className="btn btn-primary" style={{ background: "var(--green)", fontSize: "0.8rem", padding: "8px 14px" }}>Confirm</button>
        </div>
      )}
    </div>
  );
}

function AddTaskModal({ pigs, onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("weekly");
  const [pigId, setPigId] = useState("");
  const [dueDate, setDueDate] = useState("");

  const handleSave = () => {
    if (!title.trim()) { alert("Please enter a task title."); return; }
    onSave({ title: title.trim(), frequency, pig_id: pigId || null, next_due: dueDate || null });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <h3>Add Task</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div><label style={labelStyle}>Task Title</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Weigh pig, Feed morning ration, Give vaccination" style={inputStyle} autoFocus /></div>
          <div>
            <label style={labelStyle}>Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value)} style={inputStyle}>
              <option value="one-time">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div><label style={labelStyle}>Due Date (optional)</label><input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} style={inputStyle} /></div>
          <div>
            <label style={labelStyle}>Assign to Pig (optional)</label>
            <select value={pigId} onChange={e => setPigId(e.target.value)} style={inputStyle}>
              <option value="">— No specific pig —</option>
              {pigs.map(p => <option key={p.id} value={p.id}>{p.name || p.tag}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ background: "var(--green)" }}>Add Task</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShowmanDashboard({ profile, onLogout }) {
  const [pigs, setPigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPig, setShowAddPig] = useState(false);
  const [selectedPig, setSelectedPig] = useState(null);
  const [dashTab, setDashTab] = useState("pigs");

  useEffect(() => {
    loadPigs();
  }, []);

  const loadPigs = async () => {
    setLoading(true);
    const { data } = await supabase.from("showman_pigs").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false });
    setPigs(data || []);
    setLoading(false);
  };

  const addPig = async (pig) => {
    const { data: newPig } = await supabase.from("showman_pigs").insert({ ...pig, owner_id: profile.id }).select().single();
    if (newPig) { setPigs(prev => [newPig, ...prev]); setShowAddPig(false); }
  };

  const deletePig = async (id) => {
    if (!window.confirm("Delete this pig?")) return;
    await supabase.from("showman_pigs").delete().eq("id", id);
    setPigs(prev => prev.filter(p => p.id !== id));
    if (selectedPig?.id === id) setSelectedPig(null);
  };

  if (selectedPig) return <ShowmanPigDetail pig={selectedPig} profile={profile} onBack={() => { setSelectedPig(null); loadPigs(); }} onDelete={deletePig} />;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <style>{css}</style>
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #fff 0%, var(--green) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ShowPig Connect</div>
          <div style={{ width: 1, height: 18, background: "var(--border)" }} />
          <div style={{ display: "flex", gap: 4 }}>
            {["pigs", "tasks", "feed"].map(t => (
              <button key={t} onClick={() => setDashTab(t)} style={{ background: dashTab === t ? "rgba(16,185,129,0.15)" : "none", border: "none", color: dashTab === t ? "var(--green)" : "var(--muted)", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 6 }}>
                {t === "pigs" ? <><IconMyPigs /><span>My Pigs</span></> : t === "tasks" ? <><IconTasks /><span>Tasks</span></> : <span>Feed Calculator</span>}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{profile.name}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{profile.club || profile.city || "Showman"}</div>
          </div>
          
          <button onClick={onLogout} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>Sign Out</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--green)", marginBottom: 6 }}>Welcome back</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>Hey, {profile.name.split(" ")[0]}</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{pigs.length} pig{pigs.length !== 1 ? "s" : ""} in your program</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAddPig(true)} style={{ background: "var(--green)", boxShadow: "0 0 20px rgba(16,185,129,0.3)" }}>+ Add Pig</button>
        </div>

        {dashTab === "pigs" && loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading...</div>
        ) : dashTab === "pigs" && pigs.length === 0 ? (
          <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "60px 40px", textAlign: "center" }}>
            
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>No Pigs Yet</div>
            <div style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: 24 }}>Add your first pig to start tracking weights, feed, and show results.</div>
            <button className="btn btn-primary" onClick={() => setShowAddPig(true)} style={{ background: "var(--green)" }}>+ Add Your First Pig</button>
          </div>
        ) : dashTab === "pigs" ? (
          <div className="card-grid">
            {pigs.map(pig => (
              <div className="card" key={pig.id} onClick={() => setSelectedPig(pig)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div className="card-tag">{pig.tag || "No Tag"}</div>
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {pig.from_breeder && (
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--blue-bright)", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 6, padding: "2px 6px" }}>
                        From Breeder
                      </span>
                    )}
                    <span className={`badge ${pig.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{pig.sex}</span>
                  </div>
                </div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{pig.name || pig.tag || "Unnamed Pig"}</h3>
                <div className="card-meta">{pig.breed || "Unknown breed"}</div>
                <div className="card-meta" style={{ marginTop: 4 }}>
                  {pig.from_breeder ? `From: ${pig.farm_name || pig.breeder_name || "Breeder"}` : "Self-added"}
                </div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{pig.color || ""}</span>
                  {!pig.from_breeder && (
                    <button onClick={e => { e.stopPropagation(); deletePig(pig.id); }} className="btn btn-danger" style={{ fontSize: "0.7rem", padding: "4px 10px" }}>Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {dashTab === "tasks" && <ShowmanTasks profile={profile} pigs={pigs} />}
      {dashTab === "feed" && <FeedCalculator profile={profile} pigs={pigs} />}
      {showAddPig && <ShowmanAddPigModal onSave={addPig} onClose={() => setShowAddPig(false)} />}
    </div>
  );
}

//  SHOWMAN ADD PIG MODAL 
function ShowmanAddPigModal({ onSave, onClose }) {
  const [tag, setTag] = useState("");
  const [name, setName] = useState("");
  const [sex, setSex] = useState("Barrow");
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [breederName, setBreederName] = useState("");
  const [sire, setSire] = useState("");
  const [damSire, setDamSire] = useState("");
  const [notes, setNotes] = useState("");

  const handleSave = () => {
    if (!sex) { alert("Please select a sex."); return; }
    onSave({
      tag: tag || null, name: name || null, sex, breed: breed || null, color: color || null,
      birth_date: birthDate || null, purchase_price: purchasePrice ? parseFloat(purchasePrice) : 0,
      purchase_date: purchaseDate || null, breeder_name: breederName || null,
      sire: sire || null, dam_sire: damSire || null, notes: notes || null,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <h3>Add Pig</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Tag / ID</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="L1-001" style={inputStyle} /></div>
            <div><label style={labelStyle}>Name (optional)</label><input value={name} onChange={e => setName(e.target.value)} placeholder="Big Red" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)} style={inputStyle}>
                <option>Barrow</option><option>Gilt</option>
              </select>
            </div>
            <div><label style={labelStyle}>Breed</label><input value={breed} onChange={e => setBreed(e.target.value)} placeholder="Hampshire x Duroc" style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Color</label><input value={color} onChange={e => setColor(e.target.value)} placeholder="Black w/ white belt" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Birth Date</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Purchase Price ($)</label><input type="number" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="850" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Purchase Date</label><input type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Breeder Name</label><input value={breederName} onChange={e => setBreederName(e.target.value)} placeholder="Ridgeline Show Pigs" style={inputStyle} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={labelStyle}>Sire</label><input value={sire} onChange={e => setSire(e.target.value)} placeholder="Ironside" style={inputStyle} /></div>
            <div><label style={labelStyle}>Dam's Sire</label><input value={damSire} onChange={e => setDamSire(e.target.value)} placeholder="Full Package" style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Notes</label><textarea value={notes} onChange={e => setNotes(e.target.value)} style={textareaStyle} placeholder="Any additional notes..." /></div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} style={{ background: "var(--green)" }}>Save Pig</button>
          </div>
        </div>
      </div>
    </div>
  );
}

//  SHOWMAN PIG DETAIL 
function ShowmanPigDetail({ pig, profile, onBack, onDelete }) {
  const [weightLog, setWeightLog] = useState([]);
  const [feedNotes, setFeedNotes] = useState([]);
  const [vaccinations, setVaccinations] = useState([]);
  const [showResults, setShowResults] = useState([]);
  const [tab, setTab] = useState("weight");
  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWeightNote, setNewWeightNote] = useState("");
  const [newFeedDate, setNewFeedDate] = useState(new Date().toISOString().split("T")[0]);
  const [newFeedNote, setNewFeedNote] = useState("");
  const [savedRations, setSavedRations] = useState([]);
  const [showRationPicker, setShowRationPicker] = useState(false);
  const [newVaxName, setNewVaxName] = useState("");
  const [newVaxDate, setNewVaxDate] = useState(new Date().toISOString().split("T")[0]);
  const [newVaxBy, setNewVaxBy] = useState("");
  const [newShowName, setNewShowName] = useState("");
  const [newShowDate, setNewShowDate] = useState("");
  const [newShowClass, setNewShowClass] = useState("");
  const [newShowPlacing, setNewShowPlacing] = useState("");

  useEffect(() => {
    loadAll();
  }, [pig.id]);

  const loadAll = async () => {
    const [w, f, v, s, r] = await Promise.all([
      supabase.from("showman_weight_log").select("*").eq("pig_id", pig.id).order("date"),
      supabase.from("showman_feed_notes").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
      supabase.from("showman_vaccinations").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
      supabase.from("showman_show_results").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
      supabase.from("feed_rations").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
    ]);
    setWeightLog(w.data || []);
    setFeedNotes(f.data || []);
    setVaccinations(v.data || []);
    setShowResults(s.data || []);
    setSavedRations(r.data || []);
  };

  const addWeight = async () => {
    if (!newWeight) return;
    const { data } = await supabase.from("showman_weight_log").insert({ pig_id: pig.id, owner_id: profile.id, date: newWeightDate, weight: parseFloat(newWeight), notes: newWeightNote || null }).select().single();
    if (data) { setWeightLog(prev => [...prev, data].sort((a,b) => new Date(a.date) - new Date(b.date))); setNewWeight(""); setNewWeightNote(""); }
  };

  const addFeed = async () => {
    if (!newFeedNote) return;
    const { data } = await supabase.from("showman_feed_notes").insert({ pig_id: pig.id, owner_id: profile.id, date: newFeedDate, note: newFeedNote }).select().single();
    if (data) { setFeedNotes(prev => [data, ...prev]); setNewFeedNote(""); }
  };

  const addVax = async () => {
    if (!newVaxName) return;
    const { data } = await supabase.from("showman_vaccinations").insert({ pig_id: pig.id, owner_id: profile.id, name: newVaxName, date: newVaxDate, given_by: newVaxBy || null }).select().single();
    if (data) { setVaccinations(prev => [data, ...prev]); setNewVaxName(""); setNewVaxBy(""); }
  };

  const addShow = async () => {
    if (!newShowName || !newShowDate) return;
    const { data } = await supabase.from("showman_show_results").insert({ pig_id: pig.id, owner_id: profile.id, show_name: newShowName, date: newShowDate, class: newShowClass || null, placement: newShowPlacing || null }).select().single();
    if (data) { setShowResults(prev => [data, ...prev]); setNewShowName(""); setNewShowDate(""); setNewShowClass(""); setNewShowPlacing(""); }
  };

  const latest = weightLog.length > 0 ? weightLog[weightLog.length - 1] : null;
  const first = weightLog.length > 0 ? weightLog[0] : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <style>{css}</style>
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
          <div style={{ width: 1, height: 18, background: "var(--border)" }} />
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1rem", fontWeight: 800 }}>{pig.name || pig.tag || "Pig Detail"}</div>
        </div>
        <button onClick={() => onDelete(pig.id)} className="btn btn-danger" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>Delete Pig</button>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
        {/* Info card */}
        <div className="section-card" style={{ marginBottom: 20 }}>
          <div className="info-grid">
            <div className="info-item"><label>Tag</label><span>{pig.tag || "—"}</span></div>
            <div className="info-item"><label>Sex</label><span>{pig.sex}</span></div>
            <div className="info-item"><label>Breed</label><span>{pig.breed || "—"}</span></div>
            <div className="info-item"><label>Color</label><span>{pig.color || "—"}</span></div>
            <div className="info-item"><label>Current Weight</label><span style={{ color: "var(--blue-bright)", fontWeight: 700 }}>{latest ? `${latest.weight} lbs` : "—"}</span></div>
            <div className="info-item"><label>Purchase Price</label><span>${(pig.purchase_price || 0).toLocaleString()}</span></div>
            <div className="info-item"><label>Breeder</label><span>{pig.breeder_name || "—"}</span></div>
            <div className="info-item"><label>Sire × Dam's Sire</label><span>{pig.sire || "—"} × {pig.dam_sire || "—"}</span></div>
          </div>
        </div>

        {/* Tabs */}
        <div className="tab-bar" style={{ marginBottom: 20 }}>
          {["weight", "feed", "vaccines", "shows"].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
              {t === "weight" ? "Weight" : t === "feed" ? "Feed" : t === "vaccines" ? "Vaccines" : "Shows"}
            </button>
          ))}
        </div>

        {tab === "weight" && (
          <div className="section-card">
            <h4>Weight Log</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 16, alignItems: "end" }}>
              <div><label style={labelStyle}>Date</label><input type="date" value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Weight (lbs)</label><input type="number" value={newWeight} onChange={e => setNewWeight(e.target.value)} placeholder="125" style={inputStyle} /></div>
              <div><label style={labelStyle}>Notes</label><input value={newWeightNote} onChange={e => setNewWeightNote(e.target.value)} placeholder="optional" style={inputStyle} /></div>
              <button className="btn btn-primary" onClick={addWeight} style={{ height: 38, padding: "0 16px" }}>+ Add</button>
            </div>
            {weightLog.length === 0 ? <div className="empty">No weight entries yet.</div> : (
              <table><thead><tr><th>Date</th><th>Weight</th><th>Notes</th></tr></thead>
                <tbody>{[...weightLog].reverse().map((w, i) => <tr key={i}><td>{w.date}</td><td><strong>{w.weight} lbs</strong></td><td style={{ color: "var(--muted)" }}>{w.notes}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}

        {tab === "feed" && (
          <div>
            {/* Log a ration or note */}
            <div className="section-card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h4 style={{ margin: 0 }}>Log Feed Entry</h4>
                <button
                  className="btn btn-outline"
                  onClick={() => setShowRationPicker(true)}
                  style={{ fontSize: "0.78rem", padding: "5px 12px", borderColor: "var(--green)", color: "var(--green)" }}
                >
                  + Use Saved Ration
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, alignItems: "end" }}>
                <div><label style={labelStyle}>Date</label><input type="date" value={newFeedDate} onChange={e => setNewFeedDate(e.target.value)} style={inputStyle} /></div>
                <div><label style={labelStyle}>Note / Custom Entry</label><input value={newFeedNote} onChange={e => setNewFeedNote(e.target.value)} placeholder="e.g. 3 lbs Honor Show Chow 2x daily" style={inputStyle} /></div>
                <button className="btn btn-primary" onClick={addFeed} style={{ height: 38, padding: "0 16px" }}>+ Add</button>
              </div>
            </div>

            {/* Feed log */}
            <div className="section-card">
              <h4>Feed History</h4>
              {feedNotes.length === 0 ? <div className="empty">No feed entries yet. Log a note or use a saved ration.</div> : (
                <table>
                  <thead><tr><th>Date</th><th>Entry</th><th>Type</th></tr></thead>
                  <tbody>
                    {feedNotes.map((f, i) => (
                      <tr key={i}>
                        <td style={{ whiteSpace: "nowrap" }}>{f.date}</td>
                        <td>
                          {f.ration_name ? (
                            <div>
                              <div style={{ fontWeight: 700, color: "var(--green)" }}>{f.ration_name}</div>
                              {f.note && <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>{f.note}</div>}
                              {f.ration_nutrients && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                                  {Object.entries(f.ration_nutrients).slice(0, 4).map(([k, v]) => (
                                    <span key={k} style={{ padding: "2px 8px", borderRadius: 6, fontSize: "0.68rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--green)" }}>
                                      {k}: {parseFloat(v).toFixed(1)}%
                                    </span>
                                  ))}
                                </div>
                              )}
                              {f.ration_mix && f.ration_mix.length > 0 && (
                                <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                                  {f.ration_mix.map(m => m.name).join(" · ")}
                                </div>
                              )}
                            </div>
                          ) : (
                            <span>{f.note}</span>
                          )}
                        </td>
                        <td>
                          <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: "0.68rem", fontWeight: 700, background: f.ration_name ? "rgba(16,185,129,0.1)" : "var(--surface)", color: f.ration_name ? "var(--green)" : "var(--muted)", border: "1px solid", borderColor: f.ration_name ? "rgba(16,185,129,0.25)" : "var(--border)" }}>
                            {f.ration_name ? "Saved Ration" : "Manual Note"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Ration picker modal */}
            {showRationPicker && (
              <RationPickerModal
                rations={savedRations}
                date={newFeedDate}
                onPick={async (ration) => {
                  const entry = {
                    pig_id: pig.id,
                    owner_id: profile.id,
                    date: newFeedDate,
                    note: null,
                    ration_id: ration.id,
                    ration_name: ration.name,
                    ration_nutrients: ration.nutrients || {},
                    ration_mix: (ration.mix || []).map(m => ({ name: m.ingredientName || "", lbs: m.lbs })),
                  };
                  const { data, error } = await supabase.from("showman_feed_notes").insert(entry).select().single();
                  if (error) { console.error("Feed insert error:", error); alert("Error saving: " + error.message); return; }
                  if (data) setFeedNotes(prev => [data, ...prev]);
                  setShowRationPicker(false);
                }}
                onClose={() => setShowRationPicker(false)}
              />
            )}
          </div>
        )}

        {tab === "vaccines" && (
          <div className="section-card">
            <h4>Vaccinations</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 8, marginBottom: 16, alignItems: "end" }}>
              <div><label style={labelStyle}>Vaccine</label><input value={newVaxName} onChange={e => setNewVaxName(e.target.value)} placeholder="Iron" style={inputStyle} /></div>
              <div><label style={labelStyle}>Date</label><input type="date" value={newVaxDate} onChange={e => setNewVaxDate(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Given By</label><input value={newVaxBy} onChange={e => setNewVaxBy(e.target.value)} placeholder="Breeder" style={inputStyle} /></div>
              <button className="btn btn-primary" onClick={addVax} style={{ height: 38, padding: "0 16px" }}>+ Add</button>
            </div>
            {vaccinations.length === 0 ? <div className="empty">No vaccination records yet.</div> : (
              <table><thead><tr><th>Vaccine</th><th>Date</th><th>Given By</th></tr></thead>
                <tbody>{vaccinations.map((v, i) => <tr key={i}><td><strong>{v.name}</strong></td><td>{v.date}</td><td style={{ color: "var(--muted)" }}>{v.given_by}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}

        {tab === "shows" && (
          <div className="section-card">
            <h4>Show Results</h4>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr 1fr auto", gap: 8, marginBottom: 16, alignItems: "end" }}>
              <div><label style={labelStyle}>Show Name</label><input value={newShowName} onChange={e => setNewShowName(e.target.value)} placeholder="County Fair" style={inputStyle} /></div>
              <div><label style={labelStyle}>Date</label><input type="date" value={newShowDate} onChange={e => setNewShowDate(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Class</label><input value={newShowClass} onChange={e => setNewShowClass(e.target.value)} placeholder="Market Barrow HW" style={inputStyle} /></div>
              <div><label style={labelStyle}>Placing</label><input value={newShowPlacing} onChange={e => setNewShowPlacing(e.target.value)} placeholder="1st" style={inputStyle} /></div>
              <button className="btn btn-primary" onClick={addShow} style={{ height: 38, padding: "0 16px" }}>+ Add</button>
            </div>
            {showResults.length === 0 ? <div className="empty">No show results yet.</div> : (
              <table><thead><tr><th>Show</th><th>Date</th><th>Class</th><th>Placing</th></tr></thead>
                <tbody>{showResults.map((s, i) => <tr key={i}><td><strong>{s.show_name}</strong></td><td>{s.date}</td><td style={{ color: "var(--muted)" }}>{s.class}</td><td style={{ color: "var(--amber)", fontWeight: 700 }}>{s.placement}</td></tr>)}</tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}



// ── FEED CALCULATOR ────────────────────────────────────────────────────────
const DEFAULT_NUTRIENTS = ["Protein", "Fat", "Fiber", "Moisture", "Lysine", "Phosphorus"];

function FeedCalculator({ profile, pigs }) {
  const [tab, setTab] = useState("calculator");
  // Ingredients library
  const [ingredients, setIngredients] = useState([]);
  const [savedRations, setSavedRations] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Calculator state
  const [mix, setMix] = useState([]); // { ingredientId, lbs }
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [showSaveRation, setShowSaveRation] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoadingData(true);
    const [ingRes, rationRes] = await Promise.all([
      supabase.from("feed_ingredients").select("*").eq("owner_id", profile.id).order("name"),
      supabase.from("feed_rations").select("*").eq("owner_id", profile.id).order("created_at", { ascending: false }),
    ]);
    setIngredients(ingRes.data || []);
    setSavedRations(rationRes.data || []);
    setLoadingData(false);
  };

  const saveIngredient = async (ing) => {
    const row = { owner_id: profile.id, name: ing.name, nutrients: ing.nutrients };
    if (ing.id) {
      await supabase.from("feed_ingredients").update(row).eq("id", ing.id);
      setIngredients(prev => prev.map(i => i.id === ing.id ? { ...i, ...row } : i));
    } else {
      const { data } = await supabase.from("feed_ingredients").insert(row).select().single();
      if (data) setIngredients(prev => [...prev, data]);
    }
  };

  const deleteIngredient = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    await supabase.from("feed_ingredients").delete().eq("id", id);
    setIngredients(prev => prev.filter(i => i.id !== id));
    setMix(prev => prev.filter(m => m.ingredientId !== id));
  };

  const saveRation = async (name, pigId) => {
    const row = {
      owner_id: profile.id,
      pig_id: pigId || null,
      name,
      mix: mix.map(m => {
  const ing = ingredients.find(i => i.id === m.ingredientId);
  return { ingredientId: m.ingredientId, ingredientName: ing?.name || "", lbs: m.lbs };
}),
      nutrients: calcNutrients(),
      total_lbs: mix.reduce((s, m) => s + (parseFloat(m.lbs) || 0), 0),
      date: new Date().toISOString().split("T")[0],
    };
    const { data } = await supabase.from("feed_rations").insert(row).select().single();
    if (data) setSavedRations(prev => [data, ...prev]);
  };

  const deleteRation = async (id) => {
    if (!window.confirm("Delete this ration?")) return;
    await supabase.from("feed_rations").delete().eq("id", id);
    setSavedRations(prev => prev.filter(r => r.id !== id));
  };

  // Calculate blended nutrients from mix
  const calcNutrients = () => {
    const totalLbs = mix.reduce((s, m) => s + (parseFloat(m.lbs) || 0), 0);
    if (totalLbs === 0) return {};
    const result = {};
    for (const m of mix) {
      const ing = ingredients.find(i => i.id === m.ingredientId);
      if (!ing) continue;
      const lbs = parseFloat(m.lbs) || 0;
      const pct = lbs / totalLbs;
      for (const [key, val] of Object.entries(ing.nutrients || {})) {
        result[key] = (result[key] || 0) + (parseFloat(val) || 0) * pct;
      }
    }
    return result;
  };

  const totalLbs = mix.reduce((s, m) => s + (parseFloat(m.lbs) || 0), 0);
  const blended = calcNutrients();
  const allNutrients = [...new Set([...DEFAULT_NUTRIENTS, ...Object.keys(blended)])];

  const cardStyle = { background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", padding: "20px 22px", marginBottom: 16 };
  const smallLabel = { fontSize: "0.62rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, display: "block" };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em" }}>Feed Calculator</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.84rem", marginTop: 4 }}>Build rations, calculate nutrition, save for your records.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["calculator", "ingredients", "history"].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`btn ${tab === t ? "btn-primary" : "btn-outline"}`} style={{ fontSize: "0.75rem", padding: "6px 14px", background: tab === t ? "var(--green)" : undefined, borderColor: tab === t ? "var(--green)" : undefined }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loadingData ? <div style={{ textAlign: "center", padding: 60, color: "var(--muted)" }}>Loading...</div> : null}

      {/* ── CALCULATOR TAB ── */}
      {!loadingData && tab === "calculator" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
          {/* Left: mix builder */}
          <div>
            <div style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>Ingredients in Mix</div>
                <button className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "5px 12px", background: "var(--green)" }} onClick={() => setShowAddIngredient("mix")}>+ Add</button>
              </div>
              {mix.length === 0 ? (
                <div style={{ textAlign: "center", padding: "30px 0", color: "var(--muted)", fontSize: "0.84rem" }}>
                  No ingredients added yet.<br />Click "+ Add" to build your mix.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mix.map((m, i) => {
                    const ing = ingredients.find(x => x.id === m.ingredientId);
                    const lbs = parseFloat(m.lbs) || 0;
                    const pct = totalLbs > 0 ? ((lbs / totalLbs) * 100).toFixed(1) : 0;
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "var(--surface)", borderRadius: 9, border: "1px solid var(--border)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{ing?.name || "Unknown"}</div>
                          <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{pct}% of mix</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <input
                            type="number" min="0" step="0.1"
                            value={m.lbs}
                            onChange={e => setMix(prev => prev.map((x, j) => j === i ? { ...x, lbs: e.target.value } : x))}
                            style={{ width: 70, padding: "5px 8px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--surface)", color: "var(--text)", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.82rem" }}
                            placeholder="lbs"
                          />
                          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>lbs</span>
                          <button onClick={() => setMix(prev => prev.filter((_, j) => j !== i))} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, padding: "4px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.8rem", fontWeight: 700 }}>×</button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.82rem", color: "var(--muted)", paddingTop: 4 }}>
                    Total: <strong style={{ color: "var(--text)", marginLeft: 6 }}>{totalLbs.toFixed(1)} lbs</strong>
                  </div>
                </div>
              )}
            </div>

            {/* Visual bar */}
            {mix.length > 0 && totalLbs > 0 && (
              <div style={cardStyle}>
                <div style={{ fontWeight: 700, fontSize: "0.82rem", marginBottom: 10 }}>Mix Breakdown</div>
                <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", gap: 1 }}>
                  {mix.map((m, i) => {
                    const ing = ingredients.find(x => x.id === m.ingredientId);
                    const lbs = parseFloat(m.lbs) || 0;
                    const pct = totalLbs > 0 ? (lbs / totalLbs) * 100 : 0;
                    const colors = ["var(--green)", "var(--blue-bright)", "var(--amber)", "#a78bfa", "#f472b6", "#34d399", "#60a5fa"];
                    return pct > 0 ? (
                      <div key={i} style={{ width: `${pct}%`, background: colors[i % colors.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: 700, color: "white", overflow: "hidden", whiteSpace: "nowrap", padding: "0 4px" }}>
                        {pct > 8 ? ing?.name : ""}
                      </div>
                    ) : null;
                  })}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                  {mix.map((m, i) => {
                    const ing = ingredients.find(x => x.id === m.ingredientId);
                    const lbs = parseFloat(m.lbs) || 0;
                    const pct = totalLbs > 0 ? ((lbs / totalLbs) * 100).toFixed(1) : 0;
                    const colors = ["var(--green)", "var(--blue-bright)", "var(--amber)", "#a78bfa", "#f472b6", "#34d399", "#60a5fa"];
                    return (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.72rem" }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: colors[i % colors.length] }} />
                        <span style={{ color: "var(--muted)" }}>{ing?.name}</span>
                        <span style={{ fontWeight: 700 }}>{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right: nutrition panel */}
          <div>
            <div style={{ ...cardStyle, borderColor: mix.length > 0 ? "rgba(16,185,129,0.3)" : "var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 14, color: mix.length > 0 ? "var(--green)" : "var(--text)" }}>Blended Nutrition</div>
              {mix.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>Add ingredients to see calculated nutrition.</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {allNutrients.map(n => {
                    const val = blended[n];
                    if (val === undefined) return null;
                    return (
                      <div key={n}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{n}</span>
                          <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--green)" }}>{val.toFixed(2)}%</span>
                        </div>
                        <div style={{ height: 4, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${Math.min(val * 3, 100)}%`, background: "var(--green)", borderRadius: 4, transition: "width 0.3s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {mix.length > 0 && (
              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", background: "var(--green)", fontSize: "0.88rem", padding: "12px" }} onClick={() => setShowSaveRation(true)}>
                Save This Ration →
              </button>
            )}
            {ingredients.length === 0 && (
              <div style={{ marginTop: 12, padding: "12px 14px", background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 10, fontSize: "0.78rem", color: "var(--amber)", lineHeight: 1.6 }}>
                No ingredients yet. Go to the <strong>Ingredients</strong> tab to add corn, soybean meal, etc.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── INGREDIENTS TAB ── */}
      {!loadingData && tab === "ingredients" && (
        <div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <button className="btn btn-primary" style={{ background: "var(--green)" }} onClick={() => setShowAddIngredient("library")}>+ New Ingredient</button>
          </div>
          {ingredients.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              No ingredients yet. Add corn, soybean meal, or any custom ingredient.
            </div>
          ) : (
            <div style={{ ...cardStyle, padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "var(--surface)" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Ingredient</th>
                    {DEFAULT_NUTRIENTS.map(n => <th key={n} style={{ padding: "10px 10px", textAlign: "right", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{n} %</th>)}
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ing, i) => (
                    <tr key={ing.id} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.01)" }}>
                      <td style={{ padding: "10px 16px", fontWeight: 700, fontSize: "0.88rem" }}>{ing.name}</td>
                      {DEFAULT_NUTRIENTS.map(n => (
                        <td key={n} style={{ padding: "10px 10px", textAlign: "right", fontSize: "0.82rem", color: ing.nutrients?.[n] ? "var(--text)" : "var(--muted)" }}>
                          {ing.nutrients?.[n] != null ? `${ing.nutrients[n]}%` : "—"}
                        </td>
                      ))}
                      <td style={{ padding: "10px 12px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <button onClick={() => deleteIngredient(ing.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, padding: "3px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── HISTORY TAB ── */}
      {!loadingData && tab === "history" && (
        <div>
          {savedRations.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", padding: "40px 20px", color: "var(--muted)" }}>
              No saved rations yet. Build a mix in the Calculator tab and save it.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {savedRations.map(r => {
                const pig = pigs.find(p => p.id === r.pig_id);
                return (
                  <div key={r.id} style={cardStyle}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 2 }}>{r.name}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          {r.date} · {r.total_lbs?.toFixed(1)} lbs total{pig ? ` · ${pig.name || pig.tag}` : ""}
                        </div>
                      </div>
                      <button onClick={() => deleteRation(r.id)} style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, padding: "3px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.72rem", fontWeight: 700 }}>Delete</button>
                    </div>
                    {/* Ingredients */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Ingredients</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {(r.mix || []).map((m, i) => {
                          const ing = ingredients.find(x => x.id === m.ingredientId);
                          return (
                            <span key={i} style={{ padding: "3px 10px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600, background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                              {ing?.name || "Unknown"} — {m.lbs} lbs
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    {/* Nutrition */}
                    {r.nutrients && Object.keys(r.nutrients).length > 0 && (
                      <div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Blended Nutrition</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {Object.entries(r.nutrients).map(([k, v]) => (
                            <div key={k} style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", fontSize: "0.75rem" }}>
                              <span style={{ color: "var(--muted)" }}>{k}: </span>
                              <strong style={{ color: "var(--green)" }}>{parseFloat(v).toFixed(2)}%</strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ADD INGREDIENT MODAL ── */}
      {showAddIngredient && (
        <AddIngredientModal
          mode={showAddIngredient}
          ingredients={ingredients}
          onSave={async (ing) => { await saveIngredient(ing); setShowAddIngredient(false); }}
          onAddToMix={(id) => { if (!mix.find(m => m.ingredientId === id)) setMix(prev => [...prev, { ingredientId: id, lbs: "" }]); setShowAddIngredient(false); setTab("calculator"); }}
          onClose={() => setShowAddIngredient(false)}
        />
      )}

      {/* ── SAVE RATION MODAL ── */}
      {showSaveRation && (
        <SaveRationModal
          pigs={pigs}
          onSave={async (name, pigId) => { await saveRation(name, pigId); setShowSaveRation(false); }}
          onClose={() => setShowSaveRation(false)}
        />
      )}
    </div>
  );
}

function AddIngredientModal({ mode, ingredients, onSave, onAddToMix, onClose }) {
  const [step, setStep] = useState(mode === "mix" ? "pick" : "new");
  const [name, setName] = useState("");
  const [nutrients, setNutrients] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name, nutrients });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>{step === "pick" ? "Add to Mix" : "New Ingredient"}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {step === "pick" && (
            <>
              <input type="text" placeholder="Search ingredients..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} autoFocus />
              {filtered.length === 0 ? (
                <div style={{ color: "var(--muted)", fontSize: "0.84rem", textAlign: "center", padding: "20px 0" }}>
                  No ingredients found. <button onClick={() => setStep("new")} style={{ background: "none", border: "none", color: "var(--blue-bright)", cursor: "pointer", fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>Create one →</button>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 300, overflowY: "auto" }}>
                  {filtered.map(ing => (
                    <button key={ing.id} onClick={() => onAddToMix(ing.id)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 9, border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{ing.name}</div>
                        <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                          {Object.entries(ing.nutrients || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`) .join(" · ")}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--green)", fontWeight: 700 }}>Add →</span>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button onClick={() => setStep("new")} style={{ background: "none", border: "none", color: "var(--blue-bright)", cursor: "pointer", fontSize: "0.8rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700 }}>+ Create new ingredient</button>
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
              </div>
            </>
          )}
          {step === "new" && (
            <>
              <div>
                <label style={labelStyle}>Ingredient Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Corn, Soybean Meal, Lysine HCl" style={inputStyle} autoFocus />
              </div>
              <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>Nutritional Values (%)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {DEFAULT_NUTRIENTS.map(n => (
                  <div key={n}>
                    <label style={labelStyle}>{n} %</label>
                    <input type="number" min="0" max="100" step="0.01" value={nutrients[n] || ""} onChange={e => setNutrients(prev => ({ ...prev, [n]: e.target.value }))} placeholder="0.00" style={inputStyle} />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                {mode === "mix" && <button className="btn btn-outline" onClick={() => setStep("pick")}>← Back</button>}
                <button className="btn btn-outline" onClick={onClose}>Cancel</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim() || saving} style={{ background: "var(--green)", opacity: (!name.trim() || saving) ? 0.5 : 1 }}>
                  {saving ? "Saving..." : "Save Ingredient"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SaveRationModal({ pigs, onSave, onClose }) {
  const [name, setName] = useState("");
  const [pigId, setPigId] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave(name, pigId || null);
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <h3>Save Ration</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div>
            <label style={labelStyle}>Ration Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Grower Mix Week 8" style={inputStyle} autoFocus />
          </div>
          <div>
            <label style={labelStyle}>Assign to Pig (optional)</label>
            <select value={pigId} onChange={e => setPigId(e.target.value)} style={inputStyle}>
              <option value="">No specific pig</option>
              {pigs.map(p => <option key={p.id} value={p.id}>{p.name || p.tag}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!name.trim() || saving} style={{ background: "var(--green)", opacity: (!name.trim() || saving) ? 0.5 : 1 }}>
              {saving ? "Saving..." : "Save Ration"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


function RationPickerModal({ rations, date, onPick, onClose }) {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const filtered = rations.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>Select a Saved Ration</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: 10 }}>
            Logging for <strong style={{ color: "var(--text)" }}>{date}</strong>
          </div>
          <input type="text" placeholder="Search rations..." value={search} onChange={e => setSearch(e.target.value)} style={inputStyle} autoFocus />
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--muted)", fontSize: "0.84rem" }}>
              No saved rations yet. Build one in the Feed Calculator tab.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 360, overflowY: "auto" }}>
              {filtered.map(r => (
                <div key={r.id} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", cursor: "pointer", background: expanded === r.id ? "rgba(16,185,129,0.06)" : "var(--surface)" }}
                    onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: "0.9rem" }}>{r.name}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 2 }}>
                        {r.date} · {r.total_lbs?.toFixed(1)} lbs · {(r.mix || []).length} ingredients
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>{expanded === r.id ? "▲" : "▼"}</span>
                      <button
                        className="btn btn-primary"
                        onClick={e => { e.stopPropagation(); onPick(r); }}
                        style={{ fontSize: "0.75rem", padding: "5px 12px", background: "var(--green)" }}
                      >
                        Use →
                      </button>
                    </div>
                  </div>
                  {expanded === r.id && (
                    <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)", background: "rgba(16,185,129,0.03)" }}>
                      {r.nutrients && Object.keys(r.nutrients).length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
                          {Object.entries(r.nutrients).map(([k, v]) => (
                            <span key={k} style={{ padding: "2px 8px", borderRadius: 6, fontSize: "0.68rem", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "var(--green)" }}>
                              {k}: {parseFloat(v).toFixed(1)}%
                            </span>
                          ))}
                        </div>
                      )}
                      {(r.mix || []).length > 0 && (
                        <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          {r.mix.map((m, i) => <span key={i}>{m.lbs} lbs {m.ingredientName || "ingredient"}{i < r.mix.length - 1 ? " · " : ""}</span>)}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ShowmanTasks, TaskCard, AddTaskModal, ShowmanDashboard, ShowmanAddPigModal, ShowmanPigDetail };
