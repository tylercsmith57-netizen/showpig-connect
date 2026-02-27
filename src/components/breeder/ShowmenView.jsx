import { useState } from "react";
import { css, labelStyle, inputStyle } from '../../lib/styles';
import { fmt } from '../../lib/calc';
import { sexIcon } from '../../lib/constants';

function ShowmenView({ data, setView, onAddShowman, onEditShowman, onDeleteShowman, onRecordSale }) {
  const [search, setSearch] = useState("");
  const filtered = data.showmen.filter(sm =>
    sm.name.toLowerCase().includes(search.toLowerCase()) ||
    (sm.city || "").toLowerCase().includes(search.toLowerCase()) ||
    (sm.club || "").toLowerCase().includes(search.toLowerCase())
  );
  const totalPigsPlaced = data.showmen.reduce((a, sm) => a + (sm.pigIds?.length || 0), 0);
  const totalRevenue = data.showmen.reduce((a, sm) => {
    const revenue = (sm.pigIds || []).reduce((sum, pigId) => {
      const pig = data.pigs.find(p => p.id === pigId);
      return sum + (pig?.purchasePrice || 0);
    }, 0);
    return a + revenue;
  }, 0);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Customers</h2><p>Showman contacts, pig placements & show records</p></div>
        <button className="btn btn-primary" style={{ background: "var(--green)" }} onClick={() => onRecordSale(null)}>+ Record Sale</button>
        <button className="btn btn-primary" onClick={onAddShowman}>+ Add Customer</button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14, marginBottom: 28 }}>
        {[
          { val: data.showmen.length, label: "Active Customers", color: "var(--blue-bright)" },
          { val: totalPigsPlaced, label: "Pigs Placed", color: "var(--green)" },
          { val: `$${totalRevenue.toLocaleString()}`, label: "Revenue Collected", color: "var(--green)" },
          { val: data.pigs.filter(p => !p.sold).length, label: "Pigs Available", color: "var(--amber)" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--surface)", borderRadius: 10, padding: "16px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.8rem", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 5, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input type="text" placeholder="Search by name, city, or club..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: 400 }} />
      </div>

      {/* Customer Cards */}
      {filtered.length === 0 ? (
        <div className="empty" style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)" }}>
          {search ? "No customers match your search." : "No customers added yet. Add a customer, then assign pigs from their individual pig pages."}
        </div>
      ) : (
        <div className="card-grid">
          {filtered.map(sm => {
            const pigsPlaced = (sm.pigIds || []).map(id => data.pigs.find(p => p.id === id)).filter(Boolean);
            const revenue = pigsPlaced.reduce((a, p) => a + p.purchasePrice, 0);
            const showResults = pigsPlaced.flatMap(p => p.showResults || []);
            return (
              <div className="card" key={sm.id} style={{ cursor: "default" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div>
                    <div className="card-tag">{sm.state} · {sm.club || "Independent"}</div>
                    <h3>{sm.name}</h3>
                    <div className="card-meta">{sm.city}, {sm.state}{sm.age ? ` · Age ${sm.age}` : ""}</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => onEditShowman(sm)} style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--blue-bright)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>Edit</button>
                    <button onClick={() => onDeleteShowman(sm.id)} style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 8px", color: "var(--red)", cursor: "pointer", fontSize: "0.7rem", fontWeight: 700 }}>×</button>
                  </div>
                </div>
                {sm.notes && <div style={{ fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic", marginBottom: 12, padding: "8px 10px", background: "var(--surface)", borderRadius: 6, borderLeft: "2px solid var(--blue-bright)" }}>"{sm.notes}"</div>}
                <div className="card-stats">
                  <div className="stat"><div className="stat-val">{pigsPlaced.length}</div><div className="stat-label">Pigs</div></div>
                  <div className="stat"><div className="stat-val" style={{ color: "var(--green)", fontSize: "1rem" }}>${revenue.toLocaleString()}</div><div className="stat-label">Spent</div></div>
                  <div className="stat"><div className="stat-val">{showResults.length}</div><div className="stat-label">Shows</div></div>
                </div>
                {pigsPlaced.length > 0 && (
                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 8 }}>Pigs Purchased</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {pigsPlaced.map(p => (
                        <span key={p.id} onClick={() => setView({ page: "pigDetail", id: p.id })} style={{ padding: "2px 9px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: "var(--blue-dim)", color: "var(--blue-bright)", border: "1px solid rgba(59,130,246,0.25)", cursor: "pointer" }}>{p.tag}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div style={{ marginTop: 12, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  {sm.email && <a href={`mailto:${sm.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: "0.72rem", color: "var(--blue-bright)", textDecoration: "none", fontWeight: 600 }}> {sm.email}</a>}
                  {sm.phone && <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}> {sm.phone}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Pigs */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", marginBottom: 16, letterSpacing: "-0.03em" }}>Available Pigs for Placement</h3>
        <div style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
          {data.pigs.filter(p => !p.sold).length === 0 ? (
            <div className="empty">All pigs have been placed!</div>
          ) : (
            <table>
              <thead><tr><th>Tag</th><th>Sex</th><th>Color</th><th>Dam</th><th>Cur. Weight</th><th>Asking Price</th><th>Born</th></tr></thead>
              <tbody>
                {data.pigs.filter(p => !p.sold).map(p => {
                  const litter = data.litters.find(l => l.id === p.litterId);
                  const sow = data.sows.find(s => s.id === litter?.sowId);
                  const latest = (p.weightLog || []).length > 0 ? (p.weightLog || [])[(p.weightLog || []).length - 1] : null;
                  return (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setView({ page: "pigDetail", id: p.id })}>
                      <td><strong style={{ color: "var(--blue-bright)" }}>{p.tag}</strong></td>
                      <td><span className={`badge ${p.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{sexIcon(p.sex)} {p.sex}</span></td>
                      <td style={{ fontSize: "0.82rem" }}>{p.color}</td>
                      <td>{sow?.name}</td>
                      <td>{latest ? `${latest.weight} lbs` : "—"}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)", fontSize: "1rem" }}>${(p.purchasePrice || 0).toLocaleString()}</td>
                      <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{fmt(litter?.farrowDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

//  SERVICE SIRES VIEW 

export { ShowmenView };
