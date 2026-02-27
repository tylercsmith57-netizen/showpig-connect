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
            {["pigs", "tasks"].map(t => (
              <button key={t} onClick={() => setDashTab(t)} style={{ background: dashTab === t ? "rgba(16,185,129,0.15)" : "none", border: "none", color: dashTab === t ? "var(--green)" : "var(--muted)", cursor: "pointer", fontSize: "0.72rem", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", padding: "4px 10px", borderRadius: 6 }}>
                {t === "pigs" ? <><IconMyPigs /><span>My Pigs</span></> : <><IconTasks /><span>Tasks</span></>}
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
                  <span className={`badge ${pig.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{pig.sex === "Gilt" ? "" : ""} {pig.sex}</span>
                </div>
                <h3 style={{ fontSize: "1.1rem", marginBottom: 4 }}>{pig.name || pig.tag || "Unnamed Pig"}</h3>
                <div className="card-meta">{pig.breed || "Unknown breed"}</div>
                <div className="card-meta" style={{ marginTop: 4 }}>{pig.breeder_name ? `From: ${pig.breeder_name}` : "Independent"}</div>
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{pig.color || ""}</span>
                  <button onClick={e => { e.stopPropagation(); deletePig(pig.id); }} className="btn btn-danger" style={{ fontSize: "0.7rem", padding: "4px 10px" }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {dashTab === "tasks" && <ShowmanTasks profile={profile} pigs={pigs} />}
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
    const [w, f, v, s] = await Promise.all([
      supabase.from("showman_weight_log").select("*").eq("pig_id", pig.id).order("date"),
      supabase.from("showman_feed_notes").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
      supabase.from("showman_vaccinations").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
      supabase.from("showman_show_results").select("*").eq("pig_id", pig.id).order("date", { ascending: false }),
    ]);
    setWeightLog(w.data || []);
    setFeedNotes(f.data || []);
    setVaccinations(v.data || []);
    setShowResults(s.data || []);
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
          <div className="section-card">
            <h4>Feed Notes</h4>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 8, marginBottom: 16, alignItems: "end" }}>
              <div><label style={labelStyle}>Date</label><input type="date" value={newFeedDate} onChange={e => setNewFeedDate(e.target.value)} style={inputStyle} /></div>
              <div><label style={labelStyle}>Note</label><input value={newFeedNote} onChange={e => setNewFeedNote(e.target.value)} placeholder="Purina Honor Show Chow, 3lbs 2x daily" style={inputStyle} /></div>
              <button className="btn btn-primary" onClick={addFeed} style={{ height: 38, padding: "0 16px" }}>+ Add</button>
            </div>
            {feedNotes.length === 0 ? <div className="empty">No feed notes yet.</div> : (
              <table><thead><tr><th>Date</th><th>Note</th></tr></thead>
                <tbody>{feedNotes.map((f, i) => <tr key={i}><td>{f.date}</td><td>{f.note}</td></tr>)}</tbody>
              </table>
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


export { ShowmanTasks, TaskCard, AddTaskModal, ShowmanDashboard, ShowmanAddPigModal, ShowmanPigDetail };
