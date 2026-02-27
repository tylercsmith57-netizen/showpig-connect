import { useState, useMemo } from "react";
import { supabase } from '../../../supabaseClient';
import { labelStyle, inputStyle, textareaStyle } from '../../../lib/styles';
import { fmt } from '../../../lib/calc';
import { sexIcon } from '../../../lib/constants';

function RecordSaleModal({ data, farmId, defaultCustomerId, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const availablePigs = data.pigs.filter(p => !p.sold);

  const [customerId, setCustomerId] = useState(defaultCustomerId || "");
  const [saleDate, setSaleDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [selectedPigIds, setSelectedPigIds] = useState([]);
  const [priceOverrides, setPriceOverrides] = useState({});
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [filterSow, setFilterSow] = useState("all");

  const togglePig = (pigId) => {
    setSelectedPigIds(prev =>
      prev.includes(pigId) ? prev.filter(id => id !== pigId) : [...prev, pigId]
    );
  };

  const filteredPigs = useMemo(() => {
    return availablePigs.filter(p => {
      const litter = data.litters.find(l => l.id === p.litterId);
      const sow = data.sows.find(s => s.id === litter?.sowId);
      const matchSearch = !search ||
        p.tag.toLowerCase().includes(search.toLowerCase()) ||
        (p.color || "").toLowerCase().includes(search.toLowerCase()) ||
        (sow?.name || "").toLowerCase().includes(search.toLowerCase());
      const matchSow = filterSow === "all" || litter?.sowId === filterSow;
      return matchSearch && matchSow;
    });
  }, [availablePigs, search, filterSow, data]);

  const totalAmount = selectedPigIds.reduce((sum, id) => {
    const pig = data.pigs.find(p => p.id === id);
    return sum + (parseFloat(priceOverrides[id] ?? pig?.askingPrice ?? pig?.purchasePrice ?? 0));
  }, 0);

  const isValid = customerId && saleDate && selectedPigIds.length > 0;

  const handleSave = async () => {
    if (!isValid) return;
    setSaving(true);

    // Create sale record
    const { data: newSale, error: saleError } = await supabase
      .from("sales")
      .insert([{ farm_id: farmId, customer_id: customerId, sale_date: saleDate, notes: notes || null }])
      .select().single();

    if (saleError) { console.error("sale error:", saleError); setSaving(false); return; }

    // Create sale items
    const saleItems = selectedPigIds.map(pigId => {
      const pig = data.pigs.find(p => p.id === pigId);
      return {
        sale_id: newSale.id,
        pig_id: pigId,
        sale_price: parseFloat(priceOverrides[pigId] ?? pig?.askingPrice ?? pig?.purchasePrice ?? 0),
      };
    });

    const { error: itemsError } = await supabase.from("sale_items").insert(saleItems);
    if (itemsError) { console.error("sale items error:", itemsError); setSaving(false); return; }

    // Update pigs as sold
    await Promise.all(selectedPigIds.map(pigId =>
      supabase.from("pigs").update({ sold: true, sold_date: saleDate, customer_id: customerId }).eq("id", pigId)
    ));

    const customer = data.showmen.find(sm => sm.id === customerId);
    onSave({
      sale: { id: newSale.id, customerId, saleDate, notes, items: saleItems.map((item, i) => ({ ...item, id: `temp-${i}` })) },
      soldPigIds: selectedPigIds,
      customer,
      priceOverrides,
    });
    setSaving(false);
    onClose();
  };

  const inputStyle2 = {
    padding: "6px 10px",
    border: "1px solid var(--border)",
    borderRadius: 7,
    background: "var(--surface)",
    color: "var(--text)",
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: "0.82rem",
    width: "90px",
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 700, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="modal-header">
          <h3>Record Sale</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body" style={{ overflowY: "auto", flex: 1 }}>

          {/* Sale info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Customer *</label>
              <select value={customerId} onChange={e => setCustomerId(e.target.value)} style={inputStyle}>
                <option value="">Select customer...</option>
                {data.showmen.map(sm => <option key={sm.id} value={sm.id}>{sm.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sale Date *</label>
              <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional sale notes..." style={inputStyle} />
          </div>

          {/* Pig selection */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <label style={{ ...labelStyle, margin: 0 }}>Select Pigs * ({selectedPigIds.length} selected)</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="Search pigs..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, margin: 0, width: 160 }} />
                <select value={filterSow} onChange={e => setFilterSow(e.target.value)} style={{ ...inputStyle, margin: 0 }}>
                  <option value="all">All Sows</option>
                  {data.sows.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            {availablePigs.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", background: "var(--surface)", borderRadius: 10, border: "1px solid var(--border)" }}>
                No available pigs to sell.
              </div>
            ) : (
              <div style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "var(--surface)" }}>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <input type="checkbox"
                          checked={filteredPigs.length > 0 && filteredPigs.every(p => selectedPigIds.includes(p.id))}
                          onChange={e => {
                            if (e.target.checked) setSelectedPigIds(prev => [...new Set([...prev, ...filteredPigs.map(p => p.id)])]);
                            else setSelectedPigIds(prev => prev.filter(id => !filteredPigs.find(p => p.id === id)));
                          }}
                        />
                      </th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Tag</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sex</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Dam</th>
                      <th style={{ padding: "8px 12px", textAlign: "left", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Color</th>
                      <th style={{ padding: "8px 12px", textAlign: "right", fontSize: "0.65rem", color: "var(--muted)", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>Sale Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPigs.map((pig, i) => {
                      const litter = data.litters.find(l => l.id === pig.litterId);
                      const sow = data.sows.find(s => s.id === litter?.sowId);
                      const selected = selectedPigIds.includes(pig.id);
                      return (
                        <tr key={pig.id}
                          onClick={() => togglePig(pig.id)}
                          style={{
                            background: selected ? "var(--blue-dim)" : i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)",
                            borderTop: "1px solid var(--border)",
                            cursor: "pointer",
                            transition: "background 0.1s",
                          }}>
                          <td style={{ padding: "8px 12px" }} onClick={e => e.stopPropagation()}>
                            <input type="checkbox" checked={selected} onChange={() => togglePig(pig.id)} />
                          </td>
                          <td style={{ padding: "8px 12px", fontWeight: 700, color: selected ? "var(--blue-bright)" : "var(--text)", fontSize: "0.88rem" }}>{pig.tag}</td>
                          <td style={{ padding: "8px 12px" }}>
                            <span className={`badge ${pig.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`} style={{ fontSize: "0.65rem" }}>{sexIcon(pig.sex)} {pig.sex}</span>
                          </td>
                          <td style={{ padding: "8px 12px", fontSize: "0.82rem", color: "var(--muted)" }}>{sow?.name || "—"}</td>
                          <td style={{ padding: "8px 12px", fontSize: "0.78rem", color: "var(--muted)" }}>{pig.color}</td>
                          <td style={{ padding: "8px 12px", textAlign: "right" }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>$</span>
                              <input
                                type="number"
                                value={priceOverrides[pig.id] ?? pig.askingPrice ?? pig.purchasePrice ?? ""}
                                onChange={e => setPriceOverrides(prev => ({ ...prev, [pig.id]: e.target.value }))}
                                style={inputStyle2}
                                placeholder="0"
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Total */}
          {selectedPigIds.length > 0 && (
            <div style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.65rem", color: "var(--green)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Sale Total</div>
                <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{selectedPigIds.length} pig{selectedPigIds.length !== 1 ? "s" : ""}</div>
              </div>
              <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, color: "var(--green)" }}>${totalAmount.toLocaleString()}</div>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!isValid || saving}
              style={{ background: "var(--green)", opacity: (!isValid || saving) ? 0.5 : 1 }}
            >
              {saving ? "Recording..." : `Record Sale${selectedPigIds.length > 0 ? ` (${selectedPigIds.length} pigs)` : ""}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { RecordSaleModal };
