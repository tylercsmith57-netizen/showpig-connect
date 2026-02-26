import { useState, useRef, useEffect } from "react";

// ─── MOCK DATA ──────────────────────────────────────────────────────────────
const initialData = {
  farm: { name: "Ridgeline Show Pigs", owner: "Jake Harmon", location: "Abilene, TX" },
  sows: [
    {
      id: "sow-1", name: "Duchess", tag: "A-112", breed: "Hampshire x Duroc", dob: "2021-03-10", sire: "Ironside", damSire: "Full Package",
      breedingCycles: [
        { id: "bc-1", breedDate: "2024-09-01", sireId: "boar-1", method: "AI", doses: 2, notes: "Confirmed bred on recheck", conceived: true, conceiveDate: "2024-09-22", farrowDateActual: "2024-10-12" },
        { id: "bc-2", breedDate: "2024-12-01", sireId: "boar-2", method: "Natural", doses: 1, notes: "Did not hold — returned to heat", missed: true, missedDate: "2024-12-22" },
        { id: "bc-2b", breedDate: "2025-01-14", sireId: "boar-2", method: "Natural", doses: 1, notes: "Re-bred after missed cycle" },
      ],
      costs: [
        { id: "c1", date: "2024-09-01", category: "breeding", description: "AI breeding fee – Thunder semen", amount: 175 },
        { id: "c2", date: "2024-09-15", category: "feed", description: "Gestation feed – 250lb bag", amount: 62 },
        { id: "c3", date: "2024-10-01", category: "feed", description: "Farrowing feed – 200lb bag", amount: 54 },
        { id: "c4", date: "2024-10-10", category: "vet", description: "Pre-farrow check & oxytocin", amount: 45 },
        { id: "c5", date: "2024-10-13", category: "vaccine", description: "Iron dextran – 11 doses", amount: 13.20 },
        { id: "c6", date: "2024-10-20", category: "vaccine", description: "Mycoplasma – 10 doses", amount: 25 },
        { id: "c7", date: "2024-11-01", category: "feed", description: "Lactation feed – 300lb bag", amount: 78 },
        { id: "c8", date: "2024-11-20", category: "vet", description: "Routine health check", amount: 30 },
      ]
    },
    {
      id: "sow-2", name: "Lady Blue", tag: "B-047", breed: "Yorkshire", dob: "2020-08-22", sire: "Final Answer", damSire: "Lucky Strike",
      breedingCycles: [
        { id: "bc-3", breedDate: "2024-10-01", sireId: "boar-2", method: "Natural", doses: 1, notes: "Good conception", conceived: true, conceiveDate: "2024-10-22", farrowDateActual: "2024-11-05" },
        { id: "bc-4", breedDate: "2025-02-10", sireId: "boar-1", method: "AI", doses: 2, notes: "Scheduled after wean" },
        { id: "bc-5", type: "open", openDate: "2025-01-20", notes: "Skipped heat — sow not in condition", nextHeatDate: "2025-02-10" },
      ],
      costs: [
        { id: "c9", date: "2024-10-01", category: "breeding", description: "Boar lease fee – Maverick", amount: 200 },
        { id: "c10", date: "2024-10-10", category: "feed", description: "Gestation feed – 250lb bag", amount: 62 },
        { id: "c11", date: "2024-11-01", category: "feed", description: "Farrowing feed – 200lb bag", amount: 54 },
        { id: "c12", date: "2024-11-06", category: "vaccine", description: "Iron dextran – 9 doses", amount: 10.80 },
        { id: "c13", date: "2024-11-15", category: "vet", description: "Piglet scour treatment", amount: 38 },
        { id: "c14", date: "2024-12-01", category: "feed", description: "Lactation feed – 300lb bag", amount: 78 },
      ]
    },
  ],
  boars: [
    { id: "boar-1", name: "Thunder", tag: "S-001", breed: "Hampshire", dob: "2022-04-15", notes: "Top AI sire, excellent ham", owner: "On-farm", location: "on-farm", method: "AI", semenDosePrice: 40, dosesPerBreeding: 2 },
    { id: "boar-2", name: "Maverick", tag: "S-002", breed: "Duroc", dob: "2021-11-03", notes: "Lease from JB Farms, strong muscle", owner: "JB Farms", location: "off-farm", method: "Natural", semenDosePrice: 0, dosesPerBreeding: 1 },
  ],
  litters: [
    {
      id: "litter-1", sowId: "sow-1", boarId: "boar-1",
      farrowDate: "2024-10-12", numberBorn: 11, numberBornAlive: 10, numberWeaned: 9,
      weanDate: "2024-11-25", ageWeanedDays: 44,
      vaccinations: [
        { name: "Iron", date: "2024-10-13", notes: "1cc IM" },
        { name: "Mycoplasma", date: "2024-10-20", notes: "2cc SQ" },
      ],
      notes: "Excellent litter. Strong birthweights across the board."
    },
    {
      id: "litter-2", sowId: "sow-2", boarId: "boar-2",
      farrowDate: "2024-11-05", numberBorn: 9, numberBornAlive: 9, numberWeaned: 8,
      weanDate: "2024-12-19", ageWeanedDays: 44,
      vaccinations: [
        { name: "Iron", date: "2024-11-06", notes: "1cc IM" },
      ],
      notes: "Very uniform litter. Good potential show prospects."
    }
  ],
  pigs: [
    {
      id: "pig-1", litterId: "litter-1", tag: "L1-001", sex: "Barrow", birthWeight: 3.2,
      color: "Black w/ white belt", purchasePrice: 850, sold: true,
      showmanName: "Tyler Owens", showmanContact: "tyler@example.com", showmanPhone: "325-555-0101",
      photos: [],
      weightLog: [
        { date: "2024-10-12", weight: 3.2, notes: "Birth" },
        { date: "2024-11-25", weight: 18.4, notes: "Wean weight" },
        { date: "2025-01-15", weight: 87, notes: "Feeding out well" },
      ],
      vaccinations: [
        { name: "Iron", date: "2024-10-13", givenBy: "Breeder" },
        { name: "Mycoplasma", date: "2024-10-20", givenBy: "Breeder" },
        { name: "Parvovirus Booster", date: "2025-01-10", givenBy: "Tyler Owens" },
      ],
      feedNotes: [
        { date: "2025-01-01", note: "Purina Honor Show Chow Showpig, 3lbs 2x daily" },
        { date: "2025-01-20", note: "Bumped to 3.5lbs, added show bloom topdress" },
      ],
      showResults: [
        { show: "Abilene Junior Livestock", date: "2025-02-01", class: "Market Barrow Heavyweight", placing: "3rd" },
      ]
    },
    {
      id: "pig-2", litterId: "litter-1", tag: "L1-002", sex: "Gilt", birthWeight: 2.9,
      color: "Black", purchasePrice: 1100, sold: false,
      showmanName: null, showmanContact: null, showmanPhone: null,
      photos: [],
      weightLog: [
        { date: "2024-10-12", weight: 2.9, notes: "Birth" },
        { date: "2024-11-25", weight: 16.8, notes: "Wean weight" },
      ],
      vaccinations: [
        { name: "Iron", date: "2024-10-13", givenBy: "Breeder" },
      ],
      feedNotes: [],
      showResults: []
    },
    {
      id: "pig-3", litterId: "litter-2", tag: "L2-001", sex: "Barrow", birthWeight: 3.5,
      color: "Red Duroc", purchasePrice: 950, sold: false,
      showmanName: null, showmanContact: null, showmanPhone: null,
      photos: [],
      weightLog: [
        { date: "2024-11-05", weight: 3.5, notes: "Birth" },
        { date: "2024-12-19", weight: 20.1, notes: "Wean weight" },
      ],
      vaccinations: [{ name: "Iron", date: "2024-11-06", givenBy: "Breeder" }],
      feedNotes: [],
      showResults: []
    }
  ],
  showmen: [
    {
      id: "sm-1", name: "Tyler Owens", email: "tyler@example.com", phone: "325-555-0101",
      city: "Abilene", state: "TX", age: 16, club: "Taylor County 4-H",
      notes: "Dedicated showman, 3rd year competitor. Has own rig.",
      pigIds: ["pig-1"],
    }
  ],
};

// ─── HELPERS ────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const sexIcon = (s) => s === "Barrow" ? "♂" : s === "Gilt" ? "♀" : "—";
const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── BREEDING HELPERS ────────────────────────────────────────────────────────
const GESTATION_DAYS = 114;
const WEAN_TO_ESTRUS_DAYS = 7;
const HEAT_INTERVAL_DAYS = 21;
const addDays = (dateStr, days) => { const d = new Date(dateStr); d.setDate(d.getDate() + days); return d.toISOString().split("T")[0]; };
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
const daysFromToday = (dateStr) => { const today = new Date(); today.setHours(0,0,0,0); const d = new Date(dateStr); d.setHours(0,0,0,0); return Math.round((d - today) / (1000 * 60 * 60 * 24)); };

const cycleCalc = (cycle) => {
  if (cycle.type === 'open') return { status: 'open', nextHeatDate: cycle.nextHeatDate || addDays(cycle.openDate, HEAT_INTERVAL_DAYS), openDate: cycle.openDate };
  // Due date is calculated from the BREED date only once confirmed conceived
  const conceiveDate = cycle.conceiveDate || null;
  const dueDate = conceiveDate ? addDays(conceiveDate, GESTATION_DAYS) : null;
  const isConfirmed = !!cycle.farrowDateActual;
  const actualFarrow = cycle.farrowDateActual || null;
  const dueDaysFromNow = dueDate ? daysFromToday(dueDate) : null;
  const breedDaysFromNow = daysFromToday(cycle.breedDate);
  let status;
  if (cycle.missed) status = "missed";
  else if (isConfirmed) status = "farrowed";
  else if (cycle.conceived && dueDate) status = "gestating";
  else if (breedDaysFromNow <= 0) status = "bred"; // bred but not yet confirmed conceived
  else status = "scheduled";
  const nextHeatDate = cycle.missed && cycle.missedDate ? addDays(cycle.missedDate, HEAT_INTERVAL_DAYS) : null;
  return { dueDate, isConfirmed, actualFarrow, status, dueDaysFromNow, breedDaysFromNow, nextHeatDate, missedDate: cycle.missedDate || null };
};

// Returns the overall stage of a sow based on her most recent active cycle
const getSowStage = (sow, litters) => {
  const cycles = sow.breedingCycles || [];
  const sowLitters = litters.filter(l => l.sowId === sow.id);
  // Check if actively nursing (has a litter that hasn't been weaned yet or was weaned recently)
  const activeLitter = sowLitters.find(l => !l.weanDate || daysFromToday(l.weanDate) > 0);
  if (activeLitter) return "nursing";
  // Check most recent non-finished cycle
  const activeCycles = cycles.filter(c => !c.farrowDateActual && !c.missed && c.type !== 'open');
  const sorted = activeCycles.sort((a, b) => new Date(b.breedDate) - new Date(a.breedDate));
  const latest = sorted[0];
  if (!latest) return "open";
  const calc = cycleCalc(latest);
  if (calc.status === "gestating") return "gestating";
  if (calc.status === "bred") return "bred";
  if (calc.status === "scheduled") return "bred"; // scheduled = bred in the future
  return "open";
};

const sowMissedInfo = (sow) => {
  const cycles = sow.breedingCycles || [];
  const missedCycles = cycles.filter(c => c.missed || c.type === 'open');
  const consecutiveMisses = (() => {
    const sorted = [...cycles].sort((a, b) => new Date(b.breedDate || b.openDate) - new Date(a.breedDate || a.openDate));
    let count = 0;
    for (const c of sorted) { if (c.missed || c.type === 'open') count++; else if (c.farrowDateActual || (!c.missed && !c.type)) break; }
    return count;
  })();
  const lastMiss = missedCycles.sort((a, b) => new Date(b.missedDate || b.openDate) - new Date(a.missedDate || a.openDate))[0];
  const nextHeat = lastMiss ? (lastMiss.type === 'open' ? (lastMiss.nextHeatDate || addDays(lastMiss.openDate, HEAT_INTERVAL_DAYS)) : (lastMiss.missedDate ? addDays(lastMiss.missedDate, HEAT_INTERVAL_DAYS) : null)) : null;
  const hasAlert = consecutiveMisses >= 1;
  return { missedCount: missedCycles.length, consecutiveMisses, nextHeat, hasAlert };
};

const sowNextCycle = (sow, litters) => {
  const cycles = sow.breedingCycles || [];
  const sowLitters = litters.filter(l => l.sowId === sow.id);
  const lastLitter = sowLitters.sort((a,b) => new Date(b.weanDate) - new Date(a.weanDate))[0];
  const lastWeanDate = lastLitter?.weanDate || null;
  const projNextBreed = lastWeanDate ? addDays(lastWeanDate, WEAN_TO_ESTRUS_DAYS) : null;
  const projDueDate = projNextBreed ? addDays(projNextBreed, GESTATION_DAYS) : null;
  // "nextScheduled" = active cycle that is bred or gestating (not yet farrowed)
  const futureCycles = cycles.filter(c => !c.farrowDateActual && !c.missed && c.type !== 'open');
  const nextScheduled = futureCycles.sort((a,b) => new Date(b.breedDate) - new Date(a.breedDate))[0] || null;
  const lastFarrowed = cycles.filter(c => c.farrowDateActual).sort((a,b) => new Date(b.farrowDateActual) - new Date(a.farrowDateActual))[0] || null;
  return { projNextBreed, projDueDate, nextScheduled, lastFarrowed, lastWeanDate, cycles };
};

// ─── COST DATA ───────────────────────────────────────────────────────────────
const COST_CATEGORIES = {
  feed:     { label: "Feed & Supplies", icon: "🌾", color: "#60a5fa" },
  vet:      { label: "Vet & Medications", icon: "🩺", color: "#a78bfa" },
  vaccine:  { label: "Vaccinations", icon: "💉", color: "#34d399" },
  breeding: { label: "Breeding Fees", icon: "🐗", color: "#fb923c" },
};

function sowCashKPIs(sow, data) {
  const litters = data.litters.filter(l => l.sowId === sow.id);
  const litterIds = litters.map(l => l.id);
  const pigs = data.pigs.filter(p => litterIds.includes(p.litterId));
  const soldPigs = pigs.filter(p => p.sold);
  const availPigs = pigs.filter(p => !p.sold);
  const totalRevenue = soldPigs.reduce((a, p) => a + p.purchasePrice, 0);
  const pipeline = availPigs.reduce((a, p) => a + p.purchasePrice, 0);
  const avgPrice = pigs.length > 0 ? Math.round(pigs.reduce((a, p) => a + p.purchasePrice, 0) / pigs.length) : 0;
  const totalWeaned = litters.reduce((a, l) => a + l.numberWeaned, 0);
  const costs = sow.costs || [];
  const totalCosts = costs.reduce((a, c) => a + c.amount, 0);
  const costByCategory = Object.fromEntries(Object.keys(COST_CATEGORIES).map(cat => [cat, costs.filter(c => c.category === cat).reduce((a, c) => a + c.amount, 0)]));
  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const costPerWeaned = totalWeaned > 0 ? (totalCosts / totalWeaned).toFixed(2) : "—";
  return { totalRevenue, pipeline, avgPrice, soldCount: soldPigs.length, availCount: availPigs.length, totalPigs: pigs.length, litters, totalCosts, costByCategory, netProfit, margin, costPerWeaned, costs };
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #06090F; --charcoal: #0D1117; --card-bg: #131A26; --surface: #1A2236;
    --border: #222D42; --blue: #1D4ED8; --blue-bright: #3B82F6; --blue-glow: rgba(29,78,216,0.3);
    --blue-dim: rgba(59,130,246,0.1); --text: #E8F0FF; --muted: #5C6B88; --subtle: #263049;
    --green: #10B981; --red: #EF4444; --amber: #F59E0B; --shadow: rgba(0,0,0,0.6);
  }
  body { background: var(--black); font-family: 'Space Grotesk', sans-serif; color: var(--text); }
  h1,h2,h3,h4 { font-family: 'Syne', sans-serif; }
  ::selection { background: var(--blue); color: white; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: var(--charcoal); } ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  .app { display: flex; min-height: 100vh; }
  .sidebar { width: 232px; min-width: 232px; background: var(--charcoal); border-right: 1px solid var(--border); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; overflow: hidden; }
  .sidebar-brand { padding: 28px 22px 22px; border-bottom: 1px solid var(--border); position: relative; overflow: hidden; }
  .sidebar-brand::before { content: ''; position: absolute; top: -40px; right: -40px; width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle, rgba(29,78,216,0.2) 0%, transparent 70%); }
  .sidebar-brand h1 { font-size: 1.4rem; line-height: 1.1; letter-spacing: -0.03em; background: linear-gradient(135deg, #ffffff 0%, var(--blue-bright) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .sidebar-brand p { font-size: 0.67rem; color: var(--muted); margin-top: 6px; letter-spacing: 0.12em; text-transform: uppercase; font-weight: 500; }
  .sidebar-nav { flex: 1; padding: 12px 0; overflow-y: auto; }
  .nav-section { padding: 14px 22px 4px; font-size: 0.6rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--subtle); font-weight: 700; }
  .nav-item { display: flex; align-items: center; gap: 11px; padding: 11px 22px; cursor: pointer; transition: all 0.15s; font-size: 0.875rem; font-weight: 500; color: var(--muted); border-left: 2px solid transparent; }
  .nav-item:hover { background: rgba(255,255,255,0.03); color: var(--text); }
  .nav-item.active { background: var(--blue-dim); color: var(--blue-bright); border-left-color: var(--blue-bright); }
  .nav-icon { font-size: 1rem; width: 20px; text-align: center; }
  .main { flex: 1; padding: 36px 44px; max-width: 1120px; overflow-y: auto; }
  .page-header { margin-bottom: 32px; }
  .page-header h2 { font-size: 2rem; color: var(--text); letter-spacing: -0.04em; }
  .page-header p { color: var(--muted); margin-top: 5px; font-size: 0.875rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(285px, 1fr)); gap: 14px; }
  .card { background: var(--card-bg); border-radius: 14px; padding: 22px 24px; border: 1px solid var(--border); cursor: pointer; transition: transform 0.18s, box-shadow 0.2s, border-color 0.2s; position: relative; overflow: hidden; }
  .card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px var(--shadow), 0 0 0 1px rgba(59,130,246,0.5); border-color: rgba(59,130,246,0.5); }
  .card-tag { font-size: 0.65rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--blue-bright); margin-bottom: 7px; }
  .card h3 { font-size: 1.18rem; color: var(--text); margin-bottom: 4px; letter-spacing: -0.02em; }
  .card-meta { font-size: 0.8rem; color: var(--muted); margin-top: 2px; }
  .card-stats { display: flex; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border); flex-wrap: wrap; }
  .stat { text-align: center; flex: 1; min-width: 55px; padding: 2px 4px; }
  .stat + .stat { border-left: 1px solid var(--border); }
  .stat-val { font-size: 1.25rem; font-family: 'Syne', sans-serif; font-weight: 800; color: var(--blue-bright); }
  .stat-label { font-size: 0.62rem; color: var(--muted); letter-spacing: 0.07em; text-transform: uppercase; margin-top: 2px; }
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
  .badge-sold { background: rgba(16,185,129,0.12); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
  .badge-available { background: rgba(245,158,11,0.1); color: var(--amber); border: 1px solid rgba(245,158,11,0.22); }
  .badge-gilt { background: rgba(236,72,153,0.1); color: #f472b6; border: 1px solid rgba(236,72,153,0.22); }
  .badge-barrow { background: var(--blue-dim); color: var(--blue-bright); border: 1px solid rgba(59,130,246,0.3); }
  .detail-back { display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--blue-bright); font-size: 0.82rem; font-weight: 600; margin-bottom: 22px; }
  .detail-back:hover { color: var(--text); }
  .detail-header { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 28px; }
  .detail-header h2 { font-size: 2rem; letter-spacing: -0.04em; }
  .section-card { background: var(--card-bg); border-radius: 14px; padding: 22px 24px; margin-bottom: 14px; border: 1px solid var(--border); }
  .section-card h4 { font-size: 0.72rem; color: var(--blue-bright); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; letter-spacing: 0.12em; text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
  .info-item label { display: block; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 4px; font-weight: 600; }
  .info-item span { font-size: 0.92rem; font-weight: 500; color: var(--text); }
  table { width: 100%; border-collapse: collapse; font-size: 0.84rem; }
  th { text-align: left; padding: 9px 14px; background: var(--surface); color: var(--muted); font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'Space Grotesk', sans-serif; font-weight: 700; }
  th:first-child { border-radius: 8px 0 0 8px; } th:last-child { border-radius: 0 8px 8px 0; }
  td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--text); }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: rgba(255,255,255,0.02); }
  .dash-stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(178px, 1fr)); gap: 14px; margin-bottom: 36px; }
  .dash-stat-card { background: var(--card-bg); border-radius: 14px; padding: 20px 22px; border: 1px solid var(--border); position: relative; overflow: hidden; }
  .dash-stat-card::after { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue) 0%, transparent 80%); }
  .dash-stat-card .big { font-family: 'Syne', sans-serif; font-size: 2.4rem; font-weight: 800; color: var(--text); line-height: 1; }
  .dash-stat-card .label { font-size: 0.68rem; color: var(--muted); margin-top: 8px; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
  .accent-bar { height: 2px; border-radius: 1px; background: linear-gradient(90deg, var(--blue), var(--blue-bright)); margin-bottom: 14px; }
  .lineage { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
  .lineage-box { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 10px 16px; text-align: center; }
  .lineage-box .role { font-size: 0.6rem; text-transform: uppercase; letter-spacing: 0.14em; color: var(--blue-bright); font-weight: 700; }
  .lineage-box .name { font-size: 0.92rem; font-weight: 600; margin-top: 3px; color: var(--text); }
  .lineage-arrow { font-size: 1rem; color: var(--subtle); }
  .btn { display: inline-flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.84rem; font-weight: 600; transition: all 0.15s; }
  .btn-primary { background: var(--blue); color: white; box-shadow: 0 0 20px var(--blue-glow); }
  .btn-primary:hover { background: var(--blue-bright); transform: translateY(-1px); box-shadow: 0 4px 24px rgba(59,130,246,0.45); }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--muted); }
  .btn-outline:hover { border-color: var(--blue-bright); color: var(--blue-bright); }
  .btn-danger { background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: var(--red); }
  .btn-danger:hover { background: rgba(239,68,68,0.2); }
  .btn-success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: var(--green); }
  .btn-success:hover { background: rgba(16,185,129,0.25); }
  .empty { text-align: center; padding: 44px; color: var(--muted); font-size: 0.875rem; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(6,9,15,0.85); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
  .modal-box { background: var(--card-bg); border-radius: 16px; width: 100%; max-width: 520px; box-shadow: 0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px var(--border); max-height: 90vh; overflow-y: auto; }
  .modal-header { padding: 24px 28px 0; display: flex; justify-content: space-between; align-items: center; }
  .modal-header h3 { font-family: 'Syne', sans-serif; font-size: 1.3rem; color: var(--text); letter-spacing: -0.02em; }
  .modal-close { background: none; border: none; cursor: pointer; font-size: 1.4rem; color: var(--muted); line-height: 1; padding: 4px; }
  .modal-body { padding: 20px 28px 28px; display: flex; flex-direction: column; gap: 16px; }
  .tab-bar { display: flex; gap: 4px; background: var(--surface); border-radius: 10px; padding: 4px; border: 1px solid var(--border); margin-bottom: 24px; }
  .tab-btn { flex: 1; padding: 9px 12px; border-radius: 7px; border: none; cursor: pointer; font-family: 'Space Grotesk', sans-serif; font-size: 0.78rem; font-weight: 700; transition: all 0.15s; background: transparent; color: var(--muted); }
  .tab-btn.active { background: var(--blue-dim); color: var(--blue-bright); border: 1px solid rgba(59,130,246,0.25); }
  .report-kpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
  .report-kpi { background: var(--surface); border-radius: 10px; padding: 14px 16px; border: 1px solid var(--border); }
  .report-kpi .val { font-family: 'Syne', sans-serif; font-size: 1.8rem; font-weight: 800; line-height: 1; }
  .report-kpi .lbl { font-size: 0.62rem; color: var(--muted); margin-top: 5px; text-transform: uppercase; letter-spacing: 0.09em; font-weight: 600; }
  .tag-pill { display: inline-flex; align-items: center; gap: 4px; padding: 2px 9px; border-radius: 20px; font-size: 0.7rem; font-weight: 700; }
`;

const labelStyle = { display: "block", fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 6 };
const inputStyle = { width: "100%", padding: "9px 12px", border: "1px solid var(--border)", borderRadius: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.9rem", color: "var(--text)", background: "var(--surface)", outline: "none" };
const textareaStyle = { ...inputStyle, resize: "vertical", minHeight: 72 };

// ─── STATUS PILLS ─────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const map = {
    scheduled: { bg: "rgba(59,130,246,0.12)", color: "var(--blue-bright)", border: "rgba(59,130,246,0.3)", label: "Scheduled" },
    bred:       { bg: "rgba(168,85,247,0.12)", color: "#c084fc",            border: "rgba(168,85,247,0.3)",  label: "Bred — Pending ✓" },
    gestating:  { bg: "rgba(245,158,11,0.1)",  color: "var(--amber)",       border: "rgba(245,158,11,0.25)", label: "Gestating" },
    farrowed:   { bg: "rgba(16,185,129,0.1)",  color: "var(--green)",       border: "rgba(16,185,129,0.25)", label: "Farrowed ✓" },
    missed:     { bg: "rgba(239,68,68,0.1)",   color: "var(--red)",         border: "rgba(239,68,68,0.3)",   label: "Did Not Conceive" },
    open:       { bg: "rgba(245,158,11,0.1)",  color: "var(--amber)",       border: "rgba(245,158,11,0.3)",  label: "Open Cycle" },
  };
  const s = map[status] || map.scheduled;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 20, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.06em", background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span>;
}
function DaysChip({ days }) {
  if (days === null) return null;
  const abs = Math.abs(days);
  const future = days > 0;
  const color = days < -3 ? "var(--red)" : days < 7 ? "var(--amber)" : "var(--blue-bright)";
  const label = days === 0 ? "Today" : future ? `In ${abs}d` : `${abs}d ago`;
  return <span style={{ fontSize: "0.72rem", fontWeight: 700, color }}>{label}</span>;
}

// ─── CYCLE TIMELINE ───────────────────────────────────────────────────────────
function CycleTimeline({ cycle, boars, onMarkMissed, onConfirmConceived }) {
  const calc = cycleCalc(cycle);
  const boar = boars.find(b => b.id === cycle.sireId);
  const today = new Date(); today.setHours(0,0,0,0);
  if (cycle.type === 'open') {
    const nextHeat = calc.nextHeatDate;
    const heatDays = nextHeat ? daysFromToday(nextHeat) : null;
    return (
      <div style={{ background: "rgba(245,158,11,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(245,158,11,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <StatusPill status="open" />
          {heatDays !== null && heatDays >= 0 && <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#f87171" }}>🔥 Heat in {heatDays}d</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Open Date</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.openDate)}</div></div>
          <div><div style={{ fontSize: "0.62rem", color: "#f87171", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>🔥 Next Heat</div><div style={{ fontSize: "0.88rem", fontWeight: 600, color: "#f87171" }}>{nextHeat ? fmt(nextHeat) : "—"}</div></div>
        </div>
        {cycle.notes && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }
  if (calc.status === 'missed') {
    return (
      <div style={{ background: "rgba(239,68,68,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(239,68,68,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><StatusPill status="missed" /><span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Bred</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.breedDate)}</div></div>
          <div><div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Confirmed Miss</div><div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{cycle.missedDate ? fmt(cycle.missedDate) : "—"}</div></div>
        </div>
        {cycle.notes && <div style={{ marginTop: 8, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }

  // ── Bred but NOT YET confirmed conceived ─────────────────────────────
  if (calc.status === 'bred') {
    const daysBred = Math.abs(calc.breedDaysFromNow);
    // Typical recheck window: 18–25 days after breeding
    const recheckDate = addDays(cycle.breedDate, 19);
    const recheckDays = daysFromToday(recheckDate);
    return (
      <div style={{ background: "rgba(168,85,247,0.06)", borderRadius: 10, padding: "14px 16px", border: "1px solid rgba(168,85,247,0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <StatusPill status="bred" />
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span>
          </div>
          <span style={{ fontSize: "0.72rem", color: "#c084fc", fontWeight: 700 }}>{daysBred}d since breeding</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Bred</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{fmt(cycle.breedDate)}</div>
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>Recheck Window</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600, color: recheckDays <= 3 && recheckDays >= 0 ? "#c084fc" : "var(--text)" }}>
              {fmt(recheckDate)} {recheckDays > 0 ? `(in ${recheckDays}d)` : recheckDays === 0 ? "(Today!)" : "(passed)"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {onConfirmConceived && (
            <button onClick={() => onConfirmConceived(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(16,185,129,0.4)", background: "rgba(16,185,129,0.1)", color: "var(--green)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
              ✓ Confirm Conceived
            </button>
          )}
          {onMarkMissed && (
            <button onClick={() => onMarkMissed(cycle.id)} style={{ padding: "6px 14px", borderRadius: 7, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "var(--red)", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.75rem", fontWeight: 700 }}>
              ✗ Did Not Conceive
            </button>
          )}
        </div>
        {cycle.notes && <div style={{ marginTop: 10, fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
      </div>
    );
  }

  // ── Confirmed gestating or farrowed ──────────────────────────────────
  const breedD = new Date(cycle.breedDate);
  const dueD = calc.dueDate ? new Date(calc.dueDate) : null;
  const pct = calc.status === "farrowed" ? 100 : (dueD ? Math.max(0, Math.min(100, Math.round(((today - breedD) / (dueD - breedD)) * 100))) : 0);
  return (
    <div style={{ background: "var(--surface)", borderRadius: 10, padding: "14px 16px", border: "1px solid var(--border)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusPill status={calc.status} />
          <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{boar?.name} · {cycle.method}{cycle.doses > 1 ? ` · ${cycle.doses} doses` : ""}</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {calc.status === "gestating" && calc.dueDaysFromNow !== null && <DaysChip days={calc.dueDaysFromNow} />}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: calc.status === "gestating" ? 12 : 0 }}>
        {[
          { label: "Bred", val: fmt(cycle.breedDate) },
          { label: "Conceived", val: cycle.conceiveDate ? fmt(cycle.conceiveDate) : "—" },
          { label: calc.status === "farrowed" ? "Farrowed" : "Due Date", val: calc.status === "farrowed" ? fmt(calc.actualFarrow) : calc.dueDate ? fmt(calc.dueDate) : "—" },
        ].map(item => (
          <div key={item.label}>
            <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.val}</div>
          </div>
        ))}
      </div>
      {calc.status === "gestating" && calc.dueDate && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)", marginBottom: 5 }}>
            <span>Gestation progress</span>
            <span style={{ fontWeight: 700, color: "var(--blue-bright)" }}>{pct}% · {calc.dueDaysFromNow}d left</span>
          </div>
          <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: pct > 85 ? "linear-gradient(90deg, var(--amber), var(--green))" : "linear-gradient(90deg, var(--blue), var(--blue-bright))", borderRadius: 3 }} /></div>
        </div>
      )}
      {cycle.notes && <div style={{ marginTop: 10, fontSize: "0.78rem", color: "var(--muted)", fontStyle: "italic" }}>"{cycle.notes}"</div>}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
// ─── FARM CALENDAR ────────────────────────────────────────────────────────────
const CAL_EVENT_TYPES = {
  breed:    { label: "Breeding",         color: "#a78bfa", bg: "rgba(167,139,250,0.13)", border: "rgba(167,139,250,0.35)", icon: "🐗" },
  recheck:  { label: "Preg. Recheck",   color: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)",  icon: "🔬" },
  due:      { label: "Due Date",         color: "#f59e0b", bg: "rgba(245,158,11,0.13)", border: "rgba(245,158,11,0.3)",  icon: "🤰" },
  farrow:   { label: "Farrowed",         color: "#34d399", bg: "rgba(52,211,153,0.12)", border: "rgba(52,211,153,0.3)",  icon: "🐖" },
  wean:     { label: "Wean Date",        color: "#3b82f6", bg: "rgba(59,130,246,0.13)", border: "rgba(59,130,246,0.3)",  icon: "🍼" },
  heat:     { label: "Expected Heat",    color: "#f472b6", bg: "rgba(244,114,182,0.12)", border: "rgba(244,114,182,0.3)", icon: "🔥" },
};

function buildFarmEvents(data) {
  const events = [];
  data.sows.forEach(sow => {
    (sow.breedingCycles || []).forEach(cycle => {
      if (cycle.type === "open") {
        if (cycle.nextHeatDate) events.push({ date: cycle.nextHeatDate, type: "heat", label: `${sow.name} – Expected Heat`, sowId: sow.id });
        return;
      }
      if (cycle.breedDate) {
        events.push({ date: cycle.breedDate, type: "breed", label: `${sow.name} – Bred`, sowId: sow.id });
        if (!cycle.missed && !cycle.farrowDateActual) {
          // Pregnancy recheck ~19 days post-breed
          const recheckDate = addDays(cycle.breedDate, 19);
          events.push({ date: recheckDate, type: "recheck", label: `${sow.name} – Preg. Check`, sowId: sow.id });
        }
      }
      if (cycle.missed && cycle.missedDate) {
        const nextHeat = addDays(cycle.missedDate, 21);
        events.push({ date: nextHeat, type: "heat", label: `${sow.name} – Return Heat`, sowId: sow.id });
      }
      if (cycle.conceived && cycle.conceiveDate && !cycle.farrowDateActual) {
        const due = addDays(cycle.conceiveDate, 114);
        events.push({ date: due, type: "due", label: `${sow.name} – Due`, sowId: sow.id });
      }
    });
  });
  data.litters.forEach(litter => {
    const sow = data.sows.find(s => s.id === litter.sowId);
    const name = sow?.name || "Unknown";
    if (litter.farrowDate) events.push({ date: litter.farrowDate, type: "farrow", label: `${name} – Farrowed (${litter.numberBornAlive} alive)`, sowId: litter.sowId });
    if (litter.weanDate)   events.push({ date: litter.weanDate,   type: "wean",   label: `${name} litter – Wean Day`,                             sowId: litter.sowId });
  });
  return events;
}

function FarmCalendar({ data }) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(null); // "YYYY-MM-DD"

  const events = buildFarmEvents(data);

  // Group events by date string
  const byDate = {};
  events.forEach(ev => {
    const key = ev.date?.slice(0,10);
    if (!key) return;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(ev);
  });

  // Calendar grid
  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y-1); } else setMonth(m => m-1); setSelected(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y+1); } else setMonth(m => m+1); setSelected(null); };

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const todayKey = today.toISOString().slice(0,10);
  const selEvents = selected ? (byDate[selected] || []) : [];

  // Upcoming events (next 30 days)
  const upcomingCutoff = new Date(today); upcomingCutoff.setDate(upcomingCutoff.getDate() + 30);
  const upcoming = events
    .filter(ev => { const d = new Date(ev.date); return d >= today && d <= upcomingCutoff; })
    .sort((a,b) => new Date(a.date) - new Date(b.date))
    .slice(0, 8);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
      {/* Calendar */}
      <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
          <button onClick={prevMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{MONTH_NAMES[month]} {year}</div>
          <button onClick={nextMonth} style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", color: "var(--muted)", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
        </div>
        {/* Day labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid var(--border)" }}>
          {DAY_NAMES.map(d => <div key={d} style={{ padding: "8px 0", textAlign: "center", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.08em", color: "var(--subtle)", textTransform: "uppercase" }}>{d}</div>)}
        </div>
        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)" }}>
          {cells.map((day, i) => {
            if (!day) return <div key={`blank-${i}`} style={{ minHeight: 72, borderRight: "1px solid var(--border)", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.15)" }} />;
            const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const dayEvents = byDate[dateKey] || [];
            const isToday = dateKey === todayKey;
            const isSelected = dateKey === selected;
            const col = i % 7;
            return (
              <div key={dateKey} onClick={() => setSelected(isSelected ? null : dateKey)}
                style={{ minHeight: 72, padding: "6px 5px", borderRight: col < 6 ? "1px solid var(--border)" : "none", borderBottom: "1px solid var(--border)", cursor: dayEvents.length > 0 || true ? "pointer" : "default", background: isSelected ? "rgba(59,130,246,0.08)" : isToday ? "rgba(59,130,246,0.04)" : "transparent", transition: "background 0.1s", position: "relative" }}>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "0.82rem", fontWeight: isToday ? 900 : 600, color: isToday ? "var(--blue-bright)" : "var(--text)", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: isToday ? "var(--blue-dim)" : "transparent", border: isToday ? "1px solid rgba(59,130,246,0.4)" : "none", marginBottom: 3 }}>{day}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {dayEvents.slice(0,2).map((ev, ei) => {
                    const t = CAL_EVENT_TYPES[ev.type];
                    return <div key={ei} style={{ fontSize: "0.6rem", fontWeight: 700, background: t.bg, color: t.color, borderRadius: 3, padding: "1px 4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%", border: `1px solid ${t.border}` }}>{t.icon} {ev.label.split(" – ")[0]}</div>;
                  })}
                  {dayEvents.length > 2 && <div style={{ fontSize: "0.58rem", color: "var(--muted)", fontWeight: 700 }}>+{dayEvents.length - 2} more</div>}
                </div>
              </div>
            );
          })}
        </div>
        {/* Selected day events */}
        {selected && (
          <div style={{ borderTop: "1px solid var(--border)", padding: "14px 18px" }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 10 }}>
              {fmt(selected)} — {selEvents.length} event{selEvents.length !== 1 ? "s" : ""}
            </div>
            {selEvents.length === 0 ? <div style={{ fontSize: "0.82rem", color: "var(--muted)" }}>No events on this day.</div> : (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selEvents.map((ev, i) => {
                  const t = CAL_EVENT_TYPES[ev.type];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 8, background: t.bg, border: `1px solid ${t.border}` }}>
                      <span style={{ fontSize: "1rem" }}>{t.icon}</span>
                      <div>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: t.color }}>{t.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text)" }}>{ev.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
        {/* Legend */}
        <div style={{ borderTop: "1px solid var(--border)", padding: "10px 18px", display: "flex", gap: 10, flexWrap: "wrap" }}>
          {Object.entries(CAL_EVENT_TYPES).map(([k, t]) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.65rem", color: t.color, fontWeight: 600 }}>
              <span>{t.icon}</span>{t.label}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — upcoming events */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 12 }}>📅 Next 30 Days</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: "0.82rem", color: "var(--muted)", textAlign: "center", padding: "20px 0" }}>Nothing scheduled.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {upcoming.map((ev, i) => {
                const t = CAL_EVENT_TYPES[ev.type];
                const daysOut = Math.round((new Date(ev.date) - today) / 86400000);
                return (
                  <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 10px", borderRadius: 9, background: t.bg, border: `1px solid ${t.border}` }}>
                    <span style={{ fontSize: "1rem", lineHeight: 1.4 }}>{t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "0.75rem", fontWeight: 700, color: t.color }}>{ev.label}</div>
                      <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 1 }}>
                        {fmt(ev.date)} · {daysOut === 0 ? <strong style={{ color: "var(--green)" }}>Today</strong> : `${daysOut}d away`}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Herd at a glance */}
        <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "16px 18px" }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 12 }}>🐷 Herd Status</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.sows.map(sow => {
              const stage = getSowStage(sow, data.litters);
              const stageConf = {
                nursing:   { icon: "🍼", color: "#34d399", label: "Nursing" },
                gestating: { icon: "🤰", color: "#f59e0b", label: "Gestating" },
                bred:      { icon: "🔬", color: "#c084fc", label: "Bred — Pending ✓" },
                open:      { icon: "🔓", color: "var(--muted)", label: "Open" },
              }[stage] || { icon: "❓", color: "var(--muted)", label: stage };
              const lineage = (sow.sire || sow.damSire) ? `${sow.sire || "?"} × ${sow.damSire || "?"}` : null;
              return (
                <div key={sow.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700 }}>{sow.name}</div>
                    {lineage && <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>🧬 {lineage}</div>}
                  </div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: stageConf.color, textAlign: "right" }}>{stageConf.icon} {stageConf.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard({ data }) {
  const totalPigs = data.pigs.length;
  const soldPigs = data.pigs.filter(p => p.sold).length;
  const totalRevenue = data.pigs.filter(p => p.sold).reduce((a,p) => a + p.purchasePrice, 0);
  const totalShowResults = data.pigs.flatMap(p => p.showResults).length;
  const totalShowmen = data.showmen.length;
  return (
    <div>
      <div className="page-header"><h2>{data.farm.name}</h2><p>{data.farm.owner} · {data.farm.location}</p></div>

      {/* KPI strip */}
      <div className="dash-stats" style={{ marginBottom: 28 }}>
        {[
          { val: data.sows.length, label: "Active Sows" },
          { val: data.litters.length, label: "Litters on Record" },
          { val: totalPigs, label: "Pigs Registered" },
          { val: soldPigs, label: "Sold to Customers" },
          { val: totalShowmen, label: "Active Customers" },
          { val: `$${totalRevenue.toLocaleString()}`, label: "Total Revenue" },
          { val: totalShowResults, label: "Show Results" },
        ].map(s => (
          <div className="dash-stat-card" key={s.label}><div className="accent-bar" /><div className="big">{s.val}</div><div className="label">{s.label}</div></div>
        ))}
      </div>

      {/* Farm Calendar */}
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", color: "var(--text)", letterSpacing: "-0.02em" }}>🗓 Farm Calendar</h3>
      </div>
      <FarmCalendar data={data} />
    </div>
  );
}

// ─── SOWS VIEW ────────────────────────────────────────────────────────────────
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
    { key: "nursing",   label: "🍼 Nursing",          color: "#34d399", desc: "Active litter not yet weaned" },
    { key: "gestating", label: "🤰 Gestating",         color: "var(--amber)", desc: "Confirmed pregnant" },
    { key: "bred",      label: "🔬 Bred — Pending ✓",  color: "#c084fc", desc: "Bred, awaiting conception check" },
    { key: "open",      label: "🔓 Open / Needs Breeding", color: "var(--muted)", desc: "Ready to breed" },
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
            <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 3 }}>🧬 {sow.sire || "?"} × {sow.damSire || "?"}</div>
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

// ─── SOW DETAIL ───────────────────────────────────────────────────────────────
function SowDetail({ data, id, setView, onAddExpense, onLogBreed, onMarkMissed, onConfirmConceived, onRecordFarrow }) {
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
          {lineage && <p style={{ color: "var(--muted)", marginTop: 3, fontSize: "0.82rem" }}>🧬 {lineage}</p>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="btn btn-success" onClick={() => onRecordFarrow && onRecordFarrow(id)}>🐖 Record Farrow</button>
          <button className="btn btn-primary" onClick={() => onAddExpense(id)}>+ Add Expense</button>
        </div>
      </div>
      <div className="section-card">
        <h4>🐷 Sow Info</h4>
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
        <h4 style={{ color: "var(--blue-bright)" }}>💰 Profit & Loss</h4>
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
          <h4 style={{ margin: 0 }}>🧾 Expense Log</h4>
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
          <h4 style={{ margin: 0 }}>🗓 Breeding Cycles</h4>
          <button className="btn btn-outline" style={{ fontSize: "0.73rem", padding: "5px 10px" }} onClick={() => onLogBreed && onLogBreed(id)}>+ Log Breed</button>
        </div>
        {cycles.length === 0
          ? <div className="empty" style={{ padding: 20 }}>No breeding cycles recorded.</div>
          : cycles.slice().reverse().map(cycle => (
              <div key={cycle.id} style={{ marginBottom: 10 }}>
                <CycleTimeline cycle={cycle} boars={data.boars} onMarkMissed={cycleId => onMarkMissed && onMarkMissed(sow.id, cycleId)} onConfirmConceived={cycleId => onConfirmConceived && onConfirmConceived(sow.id, cycleId)} />
              </div>
            ))
        }
      </div>

      {/* Farrowing Records */}
      <div className="section-card">
        <h4>🗂 Farrowing Records</h4>
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

// ─── LITTER DETAIL (IMPROVED) ─────────────────────────────────────────────────
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

  return (
    <div>
      <div className="detail-back" onClick={() => setView({ page: "sowDetail", id: litter.sowId })}>← Back to {sow?.name}</div>
      <div className="detail-header">
        <div>
          <h2>Litter – {fmt(litter.farrowDate)}</h2>
          <p style={{ color: "var(--blue-bright)", marginTop: 4 }}>{sow?.name} × {boar?.name}</p>
        </div>
        <button className="btn btn-primary" onClick={() => onAddPigToLitter(id)}>+ Add Pig</button>
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

      {/* Farrowing Details */}
      <div className="section-card">
        <h4>📋 Farrowing Data</h4>
        <div className="info-grid">
          <div className="info-item"><label>Farrow Date</label><span>{fmt(litter.farrowDate)}</span></div>
          <div className="info-item"><label>Sow</label><span>{sow?.name} ({sow?.tag})</span></div>
          <div className="info-item"><label>Sire</label><span>{boar?.name} ({boar?.tag})</span></div>
          <div className="info-item"><label>Number Born</label><span>{litter.numberBorn}</span></div>
          <div className="info-item"><label>Born Alive</label><span>{litter.numberBornAlive}</span></div>
          <div className="info-item"><label>Number Weaned</label><span>{litter.numberWeaned}</span></div>
          <div className="info-item"><label>Wean Date</label><span>{fmt(litter.weanDate)}</span></div>
          <div className="info-item"><label>Age at Wean</label><span>{litter.ageWeanedDays} days</span></div>
        </div>
        {litter.notes && <div style={{ marginTop: 14, padding: "10px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.875rem", color: "var(--muted)", fontStyle: "italic", borderLeft: "3px solid var(--blue-bright)" }}>"{litter.notes}"</div>}
      </div>

      {/* Litter Vaccinations */}
      <div className="section-card">
        <h4>💉 Litter Vaccinations</h4>
        {litter.vaccinations.length === 0 ? <div className="empty">None recorded.</div> : (
          <table>
            <thead><tr><th>Vaccine</th><th>Date</th><th>Notes</th></tr></thead>
            <tbody>{litter.vaccinations.map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.notes}</td></tr>)}</tbody>
          </table>
        )}
      </div>

      {/* Individual Pigs */}
      <div className="section-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h4 style={{ margin: 0 }}>🐖 Individual Pigs in This Litter</h4>
          <div style={{ fontSize: "0.75rem", color: "var(--muted)" }}>{pigs.length} registered · {soldPigs.length} sold</div>
        </div>
        {pigs.length === 0 ? <div className="empty">No pigs registered yet.</div> : (
          <table>
            <thead><tr><th>Tag</th><th>Sex</th><th>Color</th><th>Birth Wt</th><th>Cur. Wt</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {pigs.map(p => {
                const latest = p.weightLog[p.weightLog.length - 1];
                return (
                  <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setView({ page: "pigDetail", id: p.id })}>
                    <td><strong>{p.tag}</strong></td>
                    <td><span className={`badge ${p.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{sexIcon(p.sex)} {p.sex}</span></td>
                    <td style={{ fontSize: "0.8rem" }}>{p.color}</td>
                    <td>{p.birthWeight} lbs</td>
                    <td>{latest ? `${latest.weight} lbs` : "—"}</td>
                    <td style={{ fontWeight: 600, color: "var(--green)" }}>${p.purchasePrice.toLocaleString()}</td>
                    <td><span className={`badge ${p.sold ? "badge-sold" : "badge-available"}`}>{p.sold ? `✓ ${p.showmanName}` : "Available"}</span></td>
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

// ─── PIGS VIEW ────────────────────────────────────────────────────────────────
function PigsView({ data, setView, onAddPig }) {
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
        </div>
      </div>
      <div className="card-grid">
        {filtered.map(pig => {
          const litter = data.litters.find(l => l.id === pig.litterId);
          const sow = data.sows.find(s => s.id === litter?.sowId);
          const latest = pig.weightLog[pig.weightLog.length - 1];
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
                <div className="stat"><div className="stat-val">{pig.showResults.length}</div><div className="stat-label">Shows</div></div>
              </div>
              <div style={{ marginTop: 12 }}>
                <span className={`badge ${pig.sold ? "badge-sold" : "badge-available"}`}>{pig.sold ? `✓ Sold to ${pig.showmanName}` : "● Available"}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PIG DETAIL ───────────────────────────────────────────────────────────────
// ─── ASSIGN CUSTOMER MODAL ────────────────────────────────────────────────────
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
          <h3>🤠 Assign Customer</h3>
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
                        <div style={{ fontWeight: 700, fontSize: "0.88rem", color: isSelected ? "var(--blue-bright)" : "var(--text)" }}>{sm.name} {isCurrent && <span style={{ fontSize: "0.65rem", color: "var(--green)", marginLeft: 4 }}>✓ current</span>}</div>
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

function PigDetail({ data, id, setView, onAssignCustomer, onUnassignCustomer }) {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const pig = data.pigs.find(p => p.id === id);
  if (!pig) return <div className="empty">Pig not found.</div>;
  const litter = data.litters.find(l => l.id === pig.litterId);
  const sow = data.sows.find(s => s.id === litter?.sowId);
  const boar = data.boars.find(b => b.id === litter?.boarId);
  const latest = pig.weightLog[pig.weightLog.length - 1];
  const assignedCustomer = data.showmen.find(sm => (sm.pigIds || []).includes(pig.id));

  return (
    <div>
      <div className="detail-back" onClick={() => setView({ page: "pigs" })}>← Back to Pigs</div>
      <div className="detail-header">
        <div>
          <h2>{pig.tag} · {pig.sex}</h2>
          <p style={{ color: "var(--blue-bright)", marginTop: 4 }}>{pig.color} · Born {fmt(litter?.farrowDate)} · {latest?.weight} lbs current</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span className={`badge ${pig.sold ? "badge-sold" : "badge-available"}`} style={{ fontSize: "0.85rem", padding: "6px 14px" }}>
            {pig.sold ? `Sold – ${pig.showmanName}` : "● Available"}
          </span>
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} style={{ fontSize: "0.8rem", padding: "7px 14px" }}>
            🤠 {assignedCustomer ? "Reassign" : "Assign Customer"}
          </button>
        </div>
      </div>

      {/* Customer panel */}
      {assignedCustomer ? (
        <div className="section-card" style={{ borderColor: "rgba(16,185,129,0.3)", background: "rgba(16,185,129,0.04)" }}>
          <h4 style={{ color: "var(--green)" }}>🤠 Customer</h4>
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
            <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} style={{ fontSize: "0.8rem" }}>🤠 Assign Customer</button>
          </div>
        </div>
      )}

      <div className="section-card">
        <h4>🧬 Lineage</h4>
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
        <h4>⚖️ Weight Log</h4>
        <table>
          <thead><tr><th>Date</th><th>Weight (lbs)</th><th>Notes</th></tr></thead>
          <tbody>{pig.weightLog.map((w, i) => <tr key={i}><td>{fmt(w.date)}</td><td><strong>{w.weight}</strong></td><td>{w.notes}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="section-card">
        <h4>💉 Vaccination Record</h4>
        <table>
          <thead><tr><th>Vaccine</th><th>Date</th><th>Given By</th></tr></thead>
          <tbody>{pig.vaccinations.map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.givenBy}</td></tr>)}</tbody>
        </table>
      </div>
      <div className="section-card">
        <h4>🌾 Feed Notes & Plans</h4>
        {pig.feedNotes.length === 0 ? <div className="empty">No feed notes yet.</div> : (
          <table>
            <thead><tr><th>Date</th><th>Note</th></tr></thead>
            <tbody>{pig.feedNotes.map((f, i) => <tr key={i}><td>{fmt(f.date)}</td><td>{f.note}</td></tr>)}</tbody>
          </table>
        )}
      </div>
      <div className="section-card">
        <h4>🏆 Show Results</h4>
        {pig.showResults.length === 0 ? <div className="empty">No show results recorded yet.</div> : (
          <table>
            <thead><tr><th>Show</th><th>Date</th><th>Class</th><th>Placing</th></tr></thead>
            <tbody>{pig.showResults.map((r, i) => <tr key={i}><td>{r.show}</td><td>{fmt(r.date)}</td><td>{r.class}</td><td><strong>{r.placing}</strong></td></tr>)}</tbody>
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
    </div>
  );
}

// ─── BREEDING CALENDAR ────────────────────────────────────────────────────────
function BreedingCalendar({ data, setView, onLogBreed }) {
  const rows = data.sows.map(sow => {
    const next = sowNextCycle(sow, data.litters);
    const mi = sowMissedInfo(sow);
    const activeScheduled = next.nextScheduled;
    const calc = activeScheduled ? cycleCalc(activeScheduled) : null;
    return { sow, next, mi, activeScheduled, calc };
  });
  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><h2>Breeding Calendar</h2><p>Cycle status, gestation tracking & heat alerts</p></div>
        <button className="btn btn-primary" onClick={() => onLogBreed(null)}>+ Log Breed</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {rows.map(({ sow, next, mi, activeScheduled, calc }) => (
          <div key={sow.id} style={{ background: "var(--card-bg)", borderRadius: 14, padding: "18px 20px", border: "1px solid var(--border)", cursor: "pointer" }} onClick={() => setView({ page: "sowDetail", id: sow.id })}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
              <div>
                <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 4 }}>{sow.tag}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 700 }}>{sow.name}</div>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{sow.breed}</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 5 }}>
                {activeScheduled ? <StatusPill status={calc.status} /> : <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted)", background: "var(--surface)", padding: "3px 10px", borderRadius: 20, border: "1px solid var(--border)" }}>Needs Breeding</span>}
                {mi.hasAlert && <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 20, fontSize: "0.65rem", fontWeight: 700, background: "rgba(239,68,68,0.12)", color: "var(--red)", border: "1px solid rgba(239,68,68,0.25)" }}>⚠ {mi.consecutiveMisses} missed</span>}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "Last Wean", val: next.lastWeanDate ? fmt(next.lastWeanDate) : "—" },
                { label: activeScheduled ? "Scheduled Breed" : "Proj. Breed", val: activeScheduled ? fmt(activeScheduled.breedDate) : next.projNextBreed ? fmt(next.projNextBreed) : "—", highlight: !!activeScheduled },
                { label: activeScheduled ? "Due Date" : "Proj. Due Date", val: activeScheduled ? fmt(calc.dueDate) : next.projDueDate ? fmt(next.projDueDate) : "—", highlight: !!activeScheduled },
                mi.nextHeat ? { label: "🔥 Next Heat", val: fmt(mi.nextHeat), heat: true } : { label: "Litters", val: data.litters.filter(l => l.sowId === sow.id).length.toString() },
              ].map(item => (
                <div key={item.label} style={{ background: item.heat ? "rgba(239,68,68,0.08)" : item.highlight ? "var(--blue-dim)" : "var(--surface)", borderRadius: 8, padding: "9px 12px", border: `1px solid ${item.heat ? "rgba(239,68,68,0.25)" : item.highlight ? "rgba(59,130,246,0.25)" : "var(--border)"}` }}>
                  <div style={{ fontSize: "0.6rem", color: item.heat ? "#f87171" : item.highlight ? "var(--blue-bright)" : "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{item.label}</div>
                  <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{item.val}</div>
                </div>
              ))}
            </div>
            {calc && calc.status === "gestating" && (
              <div style={{ marginTop: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--muted)", marginBottom: 5 }}><span>Gestation</span><DaysChip days={calc.dueDaysFromNow} /></div>
                <div style={{ height: 5, background: "var(--border)", borderRadius: 3, overflow: "hidden" }}>
                  {(() => {
                    const t = new Date(); t.setHours(0,0,0,0);
                    const bd = new Date(activeScheduled.breedDate);
                    const dd = new Date(calc.dueDate);
                    const pct = Math.max(0, Math.min(100, Math.round(((t - bd) / (dd - bd)) * 100)));
                    return <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, var(--blue), var(--blue-bright))", borderRadius: 3 }} />;
                  })()}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CUSTOMERS VIEW ───────────────────────────────────────────────────────────
function ShowmenView({ data, setView, onAddShowman, onEditShowman, onDeleteShowman }) {
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
                  {sm.email && <a href={`mailto:${sm.email}`} onClick={e => e.stopPropagation()} style={{ fontSize: "0.72rem", color: "var(--blue-bright)", textDecoration: "none", fontWeight: 600 }}>✉ {sm.email}</a>}
                  {sm.phone && <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>📞 {sm.phone}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Available Pigs */}
      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", marginBottom: 16, letterSpacing: "-0.03em" }}>🐖 Available Pigs for Placement</h3>
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
                  const latest = p.weightLog[p.weightLog.length - 1];
                  return (
                    <tr key={p.id} style={{ cursor: "pointer" }} onClick={() => setView({ page: "pigDetail", id: p.id })}>
                      <td><strong style={{ color: "var(--blue-bright)" }}>{p.tag}</strong></td>
                      <td><span className={`badge ${p.sex === "Gilt" ? "badge-gilt" : "badge-barrow"}`}>{sexIcon(p.sex)} {p.sex}</span></td>
                      <td style={{ fontSize: "0.82rem" }}>{p.color}</td>
                      <td>{sow?.name}</td>
                      <td>{latest ? `${latest.weight} lbs` : "—"}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)", fontSize: "1rem" }}>${p.purchasePrice.toLocaleString()}</td>
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

// ─── SERVICE SIRES VIEW ───────────────────────────────────────────────────────
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
          <SectionHeader label="🏠 On-Farm Sires" count={onFarm.length} color="var(--green)" />
          <div className="card-grid">{onFarm.map(b => <BoarCard key={b.id} boar={b} />)}</div>
        </div>
      )}

      {offFarm.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <SectionHeader label="🔗 Off-Farm / External Sires" count={offFarm.length} color="var(--amber)" />
          <div className="card-grid">{offFarm.map(b => <BoarCard key={b.id} boar={b} />)}</div>
        </div>
      )}

      {data.boars.length === 0 && <div className="empty">No service sires added yet.</div>}
    </div>
  );
}

// ─── FINANCIAL REPORTS (NEW) ──────────────────────────────────────────────────
function FinancialReports({ data }) {
  const [tab, setTab] = useState("overview");
  const allKPIs = data.sows.map(s => sowCashKPIs(s, data));
  const totalRevenue = allKPIs.reduce((a, k) => a + k.totalRevenue, 0);
  const totalCosts = allKPIs.reduce((a, k) => a + k.totalCosts, 0);
  const totalPipeline = allKPIs.reduce((a, k) => a + k.pipeline, 0);
  const netProfit = totalRevenue - totalCosts;
  const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const totalPigs = data.pigs.length;
  const soldPigs = data.pigs.filter(p => p.sold).length;
  const avgPigPrice = totalPigs > 0 ? Math.round(data.pigs.reduce((a, p) => a + p.purchasePrice, 0) / totalPigs) : 0;

  // Category totals
  const catTotals = Object.fromEntries(Object.keys(COST_CATEGORIES).map(k => [k, allKPIs.reduce((a, kpi) => a + (kpi.costByCategory[k] || 0), 0)]));

  // Per-litter analysis
  const litterAnalysis = data.litters.map(l => {
    const sow = data.sows.find(s => s.id === l.sowId);
    const boar = data.boars.find(b => b.id === l.boarId);
    const pigs = data.pigs.filter(p => p.litterId === l.id);
    const sold = pigs.filter(p => p.sold);
    const revenue = sold.reduce((a, p) => a + p.purchasePrice, 0);
    const pipeline = pigs.filter(p => !p.sold).reduce((a, p) => a + p.purchasePrice, 0);
    return { litter: l, sow, boar, pigs, sold, revenue, pipeline };
  });

  return (
    <div>
      <div className="page-header"><h2>Financial Reports</h2><p>Revenue, costs, margins & performance analysis</p></div>
      <div className="tab-bar">
        {[["overview","📊 Overview"],["perlitter","🐣 Per Litter"],["costs","💸 Cost Breakdown"],["sow","🐷 Sow Comparison"]].map(([id, lbl]) => (
          <button key={id} className={`tab-btn ${tab === id ? "active" : ""}`} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div>
          <div className="report-kpi-grid">
            {[
              { val: `$${totalRevenue.toLocaleString()}`, label: "Total Revenue", color: "var(--green)" },
              { val: `$${Math.round(totalCosts).toLocaleString()}`, label: "Total Costs", color: "var(--red)" },
              { val: `${netProfit >= 0 ? "+" : ""}$${Math.round(netProfit).toLocaleString()}`, label: "Net Profit", color: netProfit >= 0 ? "var(--green)" : "var(--red)" },
              { val: `${margin}%`, label: "Profit Margin", color: margin >= 40 ? "var(--green)" : "var(--amber)" },
              { val: `$${totalPipeline.toLocaleString()}`, label: "Pipeline (Unsold)", color: "var(--blue-bright)" },
              { val: `${soldPigs}/${totalPigs}`, label: "Pigs Sold", color: "var(--blue-bright)" },
              { val: `$${avgPigPrice.toLocaleString()}`, label: "Avg Pig Price", color: "var(--muted)" },
              { val: data.showmen.length, label: "Active Customers", color: "var(--muted)" },
            ].map(k => (
              <div key={k.label} className="report-kpi" style={{ borderLeft: `3px solid ${k.color}` }}>
                <div className="val" style={{ color: k.color }}>{k.val}</div>
                <div className="lbl">{k.label}</div>
              </div>
            ))}
          </div>

          {/* Revenue vs Cost bar chart */}
          <div className="section-card">
            <h4>📈 Revenue vs Costs by Sow</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {data.sows.map((sow, i) => {
                const kpi = allKPIs[i];
                const maxVal = Math.max(...allKPIs.map(k => Math.max(k.totalRevenue, k.totalCosts)), 1);
                return (
                  <div key={sow.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{sow.name} <span style={{ color: "var(--muted)", fontWeight: 400 }}>({sow.tag})</span></span>
                      <span style={{ fontSize: "0.8rem", color: kpi.netProfit >= 0 ? "var(--green)" : "var(--red)", fontWeight: 700 }}>{kpi.netProfit >= 0 ? "+" : ""}${Math.round(kpi.netProfit).toLocaleString()}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.62rem", color: "var(--muted)", width: 55, textAlign: "right" }}>Revenue</span>
                        <div style={{ flex: 1, height: 12, background: "var(--surface)", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(kpi.totalRevenue / maxVal) * 100}%`, background: "var(--green)", borderRadius: 6 }} /></div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--green)", width: 60, textAlign: "right" }}>${kpi.totalRevenue.toLocaleString()}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "0.62rem", color: "var(--muted)", width: 55, textAlign: "right" }}>Costs</span>
                        <div style={{ flex: 1, height: 12, background: "var(--surface)", borderRadius: 6, overflow: "hidden" }}><div style={{ height: "100%", width: `${(kpi.totalCosts / maxVal) * 100}%`, background: "var(--red)", borderRadius: 6 }} /></div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--red)", width: 60, textAlign: "right" }}>${Math.round(kpi.totalCosts).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {tab === "perlitter" && (
        <div>
          <div style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
            <table>
              <thead><tr><th>Sow × Sire</th><th>Farrow Date</th><th>Born / Weaned</th><th>Registered</th><th>Sold</th><th>Revenue</th><th>Pipeline</th><th>Avg Price</th></tr></thead>
              <tbody>
                {litterAnalysis.map(({ litter, sow, boar, pigs, sold, revenue, pipeline }) => {
                  const avg = pigs.length > 0 ? Math.round(pigs.reduce((a, p) => a + p.purchasePrice, 0) / pigs.length) : 0;
                  return (
                    <tr key={litter.id}>
                      <td><strong>{sow?.name}</strong> <span style={{ color: "var(--muted)" }}>× {boar?.name}</span></td>
                      <td>{fmt(litter.farrowDate)}</td>
                      <td>{litter.numberBorn} / {litter.numberWeaned}</td>
                      <td>{pigs.length}</td>
                      <td>{sold.length}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>${revenue.toLocaleString()}</td>
                      <td style={{ color: "var(--blue-bright)" }}>${pipeline.toLocaleString()}</td>
                      <td>${avg.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 24, padding: "14px 20px", background: "var(--surface)", borderRadius: 10 }}>
            <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Totals</span>
            <span style={{ fontWeight: 700, color: "var(--green)" }}>${litterAnalysis.reduce((a, l) => a + l.revenue, 0).toLocaleString()} revenue</span>
            <span style={{ fontWeight: 700, color: "var(--blue-bright)" }}>${litterAnalysis.reduce((a, l) => a + l.pipeline, 0).toLocaleString()} pipeline</span>
          </div>
        </div>
      )}

      {tab === "costs" && (
        <div>
          <div className="section-card">
            <h4>💸 Cost Categories — Farm Total</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Object.entries(COST_CATEGORIES).map(([key, cat]) => {
                const amt = catTotals[key] || 0;
                const pct = totalCosts > 0 ? Math.round((amt / totalCosts) * 100) : 0;
                return (
                  <div key={key}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>{cat.icon} {cat.label}</span>
                      <div style={{ display: "flex", gap: 16 }}>
                        <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{pct}%</span>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: cat.color }}>${amt.toFixed(2)}</span>
                      </div>
                    </div>
                    <div style={{ height: 10, background: "var(--surface)", borderRadius: 5, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: cat.color, borderRadius: 5 }} /></div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Total Farm Costs</span>
              <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--blue-bright)" }}>${Math.round(totalCosts).toLocaleString()}</span>
            </div>
          </div>

          {/* All expenses table */}
          <div className="section-card">
            <h4>📋 All Expenses</h4>
            <table>
              <thead><tr><th>Date</th><th>Sow</th><th>Category</th><th>Description</th><th style={{ textAlign: "right" }}>Amount</th></tr></thead>
              <tbody>
                {data.sows.flatMap(sow =>
                  (sow.costs || []).map(c => ({ ...c, sowName: sow.name, sowTag: sow.tag }))
                ).sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => (
                  <tr key={c.id}>
                    <td style={{ whiteSpace: "nowrap" }}>{fmt(c.date)}</td>
                    <td style={{ fontSize: "0.82rem" }}>{c.sowName} <span style={{ color: "var(--muted)" }}>({c.sowTag})</span></td>
                    <td><span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 8px", borderRadius: 12, fontSize: "0.72rem", fontWeight: 600, background: `${COST_CATEGORIES[c.category]?.color}22`, color: COST_CATEGORIES[c.category]?.color }}>{COST_CATEGORIES[c.category]?.icon} {COST_CATEGORIES[c.category]?.label}</span></td>
                    <td>{c.description}</td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: "var(--red)" }}>-${c.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "sow" && (
        <div>
          <div style={{ background: "var(--card-bg)", borderRadius: 14, border: "1px solid var(--border)", overflow: "hidden" }}>
            <table>
              <thead><tr><th>Sow</th><th>Litters</th><th>Pigs</th><th>Sold</th><th>Revenue</th><th>Costs</th><th>Net Profit</th><th>Margin</th><th>Cost/Weaned</th></tr></thead>
              <tbody>
                {data.sows.map((sow, i) => {
                  const kpi = allKPIs[i];
                  return (
                    <tr key={sow.id}>
                      <td><strong>{sow.name}</strong> <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({sow.tag})</span></td>
                      <td>{kpi.litters.length}</td>
                      <td>{kpi.totalPigs}</td>
                      <td>{kpi.soldCount}</td>
                      <td style={{ fontWeight: 700, color: "var(--green)" }}>${kpi.totalRevenue.toLocaleString()}</td>
                      <td style={{ color: "var(--red)" }}>${Math.round(kpi.totalCosts).toLocaleString()}</td>
                      <td style={{ fontWeight: 700, color: kpi.netProfit >= 0 ? "var(--green)" : "var(--red)" }}>{kpi.netProfit >= 0 ? "+" : ""}${Math.round(kpi.netProfit).toLocaleString()}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 50, height: 6, background: "var(--surface)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.max(0, Math.min(100, kpi.margin))}%`, background: kpi.margin >= 40 ? "var(--green)" : kpi.margin >= 0 ? "var(--amber)" : "var(--red)", borderRadius: 3 }} /></div>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: kpi.margin >= 40 ? "var(--green)" : kpi.margin >= 0 ? "var(--amber)" : "var(--red)" }}>{kpi.margin}%</span>
                        </div>
                      </td>
                      <td style={{ color: "var(--muted)" }}>${kpi.costPerWeaned}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, padding: "14px 20px", background: "var(--surface)", borderRadius: 10, display: "flex", justifyContent: "flex-end", gap: 32 }}>
            {[
              { label: "Total Revenue", val: `$${totalRevenue.toLocaleString()}`, color: "var(--green)" },
              { label: "Total Costs", val: `$${Math.round(totalCosts).toLocaleString()}`, color: "var(--red)" },
              { label: "Net Profit", val: `${netProfit >= 0 ? "+" : ""}$${Math.round(netProfit).toLocaleString()}`, color: netProfit >= 0 ? "var(--green)" : "var(--red)" },
              { label: "Margin", val: `${margin}%`, color: "var(--blue-bright)" },
            ].map(k => (
              <div key={k.label} style={{ textAlign: "right" }}>
                <div style={{ fontSize: "0.62rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 3 }}>{k.label}</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: k.color }}>{k.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MODALS ───────────────────────────────────────────────────────────────────
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
        <div className="modal-header"><h3>{sow ? "✏️ Edit Sow" : "🐷 Add New Sow"}</h3><button className="modal-close" onClick={onClose}>×</button></div>
        <div className="modal-body">
          <div><label style={labelStyle}>Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Duchess" style={inputStyle} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>Tag *</label><input value={tag} onChange={e => setTag(e.target.value)} placeholder="e.g. A-112" style={inputStyle} /></div>
            <div><label style={labelStyle}>Date of Birth</label><input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} /></div>
          </div>
          <div><label style={labelStyle}>Breed *</label><input value={breed} onChange={e => setBreed(e.target.value)} placeholder="e.g. Hampshire x Duroc" style={inputStyle} /></div>
          <div style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 10 }}>🧬 Lineage</div>
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
        <div className="modal-header"><h3>{boar ? "✏️ Edit Service Sire" : "🐗 Add Service Sire"}</h3><button className="modal-close" onClick={onClose}>×</button></div>
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
              {[["on-farm","🏠 On-Farm"],["off-farm","🔗 Off-Farm / External"]].map(([v,l]) => (
                <button key={v} onClick={() => { setLocation(v); if (v === "on-farm") setOwner("On-farm"); }} style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700, background: location === v ? "var(--blue-dim)" : "transparent", color: location === v ? "var(--blue-bright)" : "var(--muted)", transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          {location === "off-farm" && <div><label style={labelStyle}>Owner / Farm Name</label><input value={owner} onChange={e => setOwner(e.target.value)} placeholder="e.g. JB Farms" style={inputStyle} /></div>}
          {/* Method */}
          <div>
            <label style={labelStyle}>Breeding Method</label>
            <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
              {[["Natural","🐗 Natural Service"],["AI","🧪 Artificial Insemination"]].map(([v,l]) => (
                <button key={v} onClick={() => setMethod(v)} style={{ flex: 1, padding: "7px 8px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontSize: "0.78rem", fontWeight: 700, background: method === v ? "var(--blue-dim)" : "transparent", color: method === v ? "var(--blue-bright)" : "var(--muted)", transition: "all 0.15s" }}>{l}</button>
              ))}
            </div>
          </div>
          {/* AI semen cost section */}
          {method === "AI" && (
            <div style={{ background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, padding: "14px 16px" }}>
              <div style={{ fontSize: "0.72rem", color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 12 }}>🧪 Semen Cost Settings</div>
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
          <h3>{showman ? "✏️ Edit Customer" : "🤠 Add Customer"}</h3>
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
            💡 To assign pigs to this customer, open the individual pig's page and use the <strong style={{ color: "var(--text)" }}>Assign Customer</strong> button.
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
        <div className="modal-header"><h3>🐖 Add Pig</h3><button className="modal-close" onClick={onClose}>×</button></div>
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

// ─── RECORD FARROW MODAL ─────────────────────────────────────────────────────
function RecordFarrowModal({ sows, boars, defaultSowId, onSave, onClose }) {
  const today = new Date().toISOString().split("T")[0];
  const [sowId, setSowId] = useState(defaultSowId || sows[0]?.id || "");
  const [farrowDate, setFarrowDate] = useState(today);
  const [boarId, setBoarId] = useState(boars[0]?.id || "");
  const [numberBorn, setNumberBorn] = useState("");
  const [numberBornAlive, setNumberBornAlive] = useState("");
  const [numberWeaned, setNumberWeaned] = useState("");
  const [weanDate, setWeanDate] = useState(addDays(today, 21));
  const [notes, setNotes] = useState("");

  // Auto-update wean date when farrow date changes (default 21 days)
  const handleFarrowDateChange = (d) => {
    setFarrowDate(d);
    setWeanDate(addDays(d, 21));
  };

  const ageAtWean = farrowDate && weanDate ? daysBetween(farrowDate, weanDate) : null;
  const isValid = sowId && farrowDate && boarId && numberBorn && numberBornAlive;

  const handleSave = () => {
    if (!isValid) return;
    onSave({
      id: uid(),
      sowId,
      boarId,
      farrowDate,
      numberBorn: parseInt(numberBorn) || 0,
      numberBornAlive: parseInt(numberBornAlive) || 0,
      numberWeaned: parseInt(numberWeaned) || parseInt(numberBornAlive) || 0,
      weanDate: weanDate || null,
      ageWeanedDays: ageAtWean || null,
      vaccinations: [],
      notes: notes.trim() || ""
    });
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h3>🐖 Record Farrowing</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Sow *</label>
              <select value={sowId} onChange={e => setSowId(e.target.value)} style={inputStyle}>
                {sows.map(s => <option key={s.id} value={s.id}>{s.name} ({s.tag})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Service Sire *</label>
              <select value={boarId} onChange={e => setBoarId(e.target.value)} style={inputStyle}>
                {boars.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Farrow Date *</label>
            <input type="date" value={farrowDate} onChange={e => handleFarrowDateChange(e.target.value)} style={inputStyle} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div>
              <label style={labelStyle}>Total Born *</label>
              <input type="number" min="0" value={numberBorn} onChange={e => setNumberBorn(e.target.value)} placeholder="11" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Born Alive *</label>
              <input type="number" min="0" value={numberBornAlive} onChange={e => setNumberBornAlive(e.target.value)} placeholder="10" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Number Weaned</label>
              <input type="number" min="0" value={numberWeaned} onChange={e => setNumberWeaned(e.target.value)} placeholder={numberBornAlive || "9"} style={inputStyle} />
            </div>
          </div>

          <div style={{ background: "var(--surface)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--border)" }}>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--green)", marginBottom: 10 }}>📅 Wean Date</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }}>
              <div>
                <label style={labelStyle}>Planned Wean Date</label>
                <input type="date" value={weanDate} onChange={e => setWeanDate(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ paddingBottom: 2, textAlign: "center" }}>
                <div style={{ fontSize: "0.65rem", color: "var(--muted)", marginBottom: 3 }}>Age at wean</div>
                <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--green)", lineHeight: 1 }}>{ageAtWean !== null ? ageAtWean : "—"}</div>
                <div style={{ fontSize: "0.6rem", color: "var(--muted)" }}>days</div>
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="e.g. Excellent litter, strong birthweights" style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="btn btn-outline" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={!isValid} style={{ opacity: isValid ? 1 : 0.45 }}>Save Farrowing Record</button>
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
          <h3>{mode === 'open' ? '🔓 Log Open Cycle' : '🐗 Log Breeding'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {/* Mode toggle */}
          <div style={{ display: "flex", gap: 0, background: "var(--surface)", borderRadius: 8, padding: 3, border: "1px solid var(--border)" }}>
            {[["breed","🐗 Breed Attempt"],["open","🔓 Open / Missed Heat"]].map(([val,lbl]) => (
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
                {onFarmBoars.length > 0 && <optgroup label="── On-Farm">{onFarmBoars.map(b => <option key={b.id} value={b.id}>{b.name} ({b.tag}) · {b.breed}</option>)}</optgroup>}
                {offFarmBoars.length > 0 && <optgroup label="── Off-Farm / External">{offFarmBoars.map(b => <option key={b.id} value={b.id}>{b.name} ({b.tag}) · {b.breed} — {b.owner}</option>)}</optgroup>}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div>
                <label style={labelStyle}>Method</label>
                <select value={method} onChange={e => setMethod(e.target.value)} style={inputStyle}>
                  <option value="Natural">🐗 Natural Service</option>
                  <option value="AI">🧪 Artificial Insemination</option>
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
                <div style={{ fontSize: "0.62rem", color: "var(--blue-bright)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginBottom: 6 }}>💰 Auto-Charge on Save</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>{doses} dose{doses > 1 ? "s" : ""} × ${selectedBoar?.semenDosePrice || 0} ({selectedBoar?.name})</span>
                  <span style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.2rem", fontWeight: 800, color: "var(--green)" }}>${semenCost.toFixed(2)}</span>
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 4 }}>Added to {selectedSowName}'s expense log automatically.</div>
              </div>
            )}

            {/* Pending notice */}
            <div style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.25)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>🔬</span>
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
                <label style={labelStyle}>🔥 Next Heat (auto)</label>
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
        <div className="modal-header"><h3>💸 Add Expense</h3><button className="modal-close" onClick={onClose}>×</button></div>
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

// ─── CUSTOMER PORTAL ─────────────────────────────────────────────────────────
// ─── WEIGHT CHART (SVG) ──────────────────────────────────────────────────────
function WeightChart({ weightLog, targetWeight, showDate }) {
  const W = 600, H = 220, PAD = { top: 20, right: 20, bottom: 48, left: 48 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  if (!weightLog || weightLog.length === 0) {
    return (
      <div style={{ background: "var(--surface)", borderRadius: 10, padding: "40px", textAlign: "center", color: "var(--muted)", fontSize: "0.82rem" }}>
        No weight entries yet — add a weigh-in to see your chart.
      </div>
    );
  }

  // Build data points — include show date as a future point if provided
  const allDates = weightLog.map(w => new Date(w.date));
  if (showDate) allDates.push(new Date(showDate));
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const dateRange = Math.max(1, maxDate - minDate);

  const allWeights = weightLog.map(w => parseFloat(w.weight));
  if (targetWeight) allWeights.push(parseFloat(targetWeight));
  const minW = Math.max(0, Math.min(...allWeights) - 10);
  const maxW = Math.max(...allWeights) + 15;
  const weightRange = maxW - minW;

  const toX = (date) => PAD.left + ((new Date(date) - minDate) / dateRange) * cW;
  const toY = (w) => PAD.top + cH - ((parseFloat(w) - minW) / weightRange) * cH;

  // Grid lines
  const yTicks = 5;
  const gridLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = minW + (weightRange / yTicks) * i;
    const y = toY(val);
    return { y, val: Math.round(val) };
  });

  // Actual weight path
  const pts = weightLog.map(w => `${toX(w.date)},${toY(w.weight)}`).join(" L ");
  const pathD = `M ${pts}`;
  const areaD = `M ${toX(weightLog[0].date)},${PAD.top + cH} L ${pts} L ${toX(weightLog[weightLog.length - 1].date)},${PAD.top + cH} Z`;

  // Target line
  const targetY = targetWeight ? toY(targetWeight) : null;
  // Show date line
  const showX = showDate ? toX(showDate) : null;
  const todayX = toX(new Date().toISOString().split("T")[0]);

  // X axis labels — sample a few dates
  const xLabels = weightLog.filter((_, i) => i === 0 || i === weightLog.length - 1 || i === Math.floor(weightLog.length / 2));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block", borderRadius: 10, overflow: "visible" }}>
      {/* Grid lines */}
      {gridLines.map(({ y, val }) => (
        <g key={val}>
          <line x1={PAD.left} y1={y} x2={PAD.left + cW} y2={y} stroke="var(--border)" strokeWidth="1" />
          <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="11" fill="#5C6B88" fontFamily="Space Grotesk, sans-serif">{val}</text>
        </g>
      ))}

      {/* Today line */}
      {todayX >= PAD.left && todayX <= PAD.left + cW && (
        <line x1={todayX} y1={PAD.top} x2={todayX} y2={PAD.top + cH} stroke="rgba(59,130,246,0.3)" strokeWidth="1" strokeDasharray="3,3" />
      )}

      {/* Target weight line */}
      {targetY !== null && (
        <g>
          <line x1={PAD.left} y1={targetY} x2={PAD.left + cW} y2={targetY} stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5,4" />
          <rect x={PAD.left + cW - 80} y={targetY - 16} width={80} height={16} rx="3" fill="rgba(245,158,11,0.15)" />
          <text x={PAD.left + cW - 4} y={targetY - 4} textAnchor="end" fontSize="10" fill="#F59E0B" fontFamily="Space Grotesk, sans-serif" fontWeight="700">Target: {targetWeight} lbs</text>
        </g>
      )}

      {/* Show date line */}
      {showX !== null && showX >= PAD.left && showX <= PAD.left + cW && (
        <g>
          <line x1={showX} y1={PAD.top} x2={showX} y2={PAD.top + cH} stroke="#10B981" strokeWidth="1.5" strokeDasharray="4,3" />
          <rect x={showX - 24} y={PAD.top} width={48} height={16} rx="3" fill="rgba(16,185,129,0.15)" />
          <text x={showX} y={PAD.top + 11} textAnchor="middle" fontSize="10" fill="#10B981" fontFamily="Space Grotesk, sans-serif" fontWeight="700">SHOW</text>
        </g>
      )}

      {/* Area fill */}
      {weightLog.length > 1 && (
        <path d={areaD} fill="url(#weightGrad)" opacity="0.3" />
      )}

      {/* Line */}
      {weightLog.length > 1 && (
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      )}

      {/* Data points */}
      {weightLog.map((w, i) => (
        <g key={i}>
          <circle cx={toX(w.date)} cy={toY(w.weight)} r="5" fill="#3B82F6" stroke="var(--card-bg)" strokeWidth="2" />
          {i === weightLog.length - 1 && (
            <text x={toX(w.date)} y={toY(w.weight) - 10} textAnchor="middle" fontSize="11" fill="#10B981" fontFamily="Space Grotesk, sans-serif" fontWeight="700">{w.weight} lbs</text>
          )}
        </g>
      ))}

      {/* X axis labels */}
      {xLabels.map((w, i) => (
        <text key={i} x={toX(w.date)} y={PAD.top + cH + 16} textAnchor="middle" fontSize="11" fill="#5C6B88" fontFamily="Space Grotesk, sans-serif">
          {new Date(w.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </text>
      ))}

      {/* Gradient def */}
      <defs>
        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ─── CUSTOMER PIG DETAIL (FULL FEATURED) ─────────────────────────────────────
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
  const latest = pig.weightLog[pig.weightLog.length - 1];
  const firstWeight = pig.weightLog[0];
  const gain = latest && firstWeight ? (latest.weight - firstWeight.weight).toFixed(1) : null;

  const showmanExpenses = pig.showmanExpenses || [];
  const totalExpenses = showmanExpenses.reduce((a, e) => a + (parseFloat(e.amount) || 0), 0);

  const EXPENSE_CATS = {
    feed: { label: "Feed & Supplies", icon: "🌾" },
    entry: { label: "Show Entry Fees", icon: "🏆" },
    transport: { label: "Transport", icon: "🚛" },
    equipment: { label: "Equipment", icon: "🔧" },
    vet: { label: "Vet & Health", icon: "🩺" },
    other: { label: "Other", icon: "💰" },
  };

  // Handlers
  const addWeight = () => {
    if (!newWeightVal || !newWeightDate) return;
    const updated = { ...pig, weightLog: [...pig.weightLog, { date: newWeightDate, weight: parseFloat(newWeightVal), notes: newWeightNote.trim() || "" }].sort((a, b) => new Date(a.date) - new Date(b.date)) };
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
    { id: "overview", label: "📊 Overview" },
    { id: "weight", label: "⚖️ Weight" },
    { id: "feed", label: "🌾 Feed" },
    { id: "health", label: "💉 Health" },
    { id: "shows", label: "🏆 Shows" },
    { id: "photos", label: "📸 Photos" },
    { id: "expenses", label: "💸 My Expenses" },
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
  const headerPhoto = pig.photos?.[pig.photos.length - 1];

  return (
    <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", overflow: "hidden", marginBottom: 20 }}>
      {/* Pig header */}
      <div onClick={() => setOpen(o => !o)} style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: open ? "rgba(59,130,246,0.04)" : "transparent", transition: "background 0.15s" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.2)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", flexShrink: 0 }}>
            {headerPhoto ? <img src={headerPhoto.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🐖"}
          </div>
          <div>
            <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 3 }}>{pig.tag}</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "-0.02em" }}>{pig.color}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
              {sexIcon(pig.sex)} {pig.sex} · Born {fmt(litter?.farrowDate)}
              {pig.showGoal?.showDate && <span style={{ marginLeft: 10, color: "var(--green)", fontWeight: 600 }}>🏟 Show: {fmt(pig.showGoal.showDate)}</span>}
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
          <div style={{ color: "var(--muted)", fontSize: "1rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</div>
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

            {/* ── OVERVIEW ── */}
            {activeTab === "overview" && (
              <div>
                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
                  {[
                    { label: "Sire", val: boar?.name || "—" },
                    { label: "Dam", val: sow?.name || "—" },
                    { label: "Birth Weight", val: firstWeight ? `${firstWeight.weight} lbs` : "—" },
                    { label: "Total Gain", val: gain ? `+${gain} lbs` : "—" },
                    { label: "Shows Entered", val: pig.showResults.length || 0 },
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
                    <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--amber)" }}>🎯 Show Goal</div>
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
                      {pig.showGoal?.targetWeight && latest && <div><div style={{ fontSize: "0.65rem", color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Still Needed</div><div style={{ fontWeight: 700, marginTop: 3, color: (pig.showGoal.targetWeight - latest.weight) > 0 ? "var(--amber)" : "var(--green)" }}>{pig.showGoal.targetWeight - latest.weight > 0 ? `+${(pig.showGoal.targetWeight - latest.weight).toFixed(1)} lbs` : "✓ At weight"}</div></div>}
                    </div>
                  ) : (
                    <div style={{ color: "var(--muted)", fontSize: "0.82rem" }}>No show goal set yet. Click Edit to add your target weight and show date.</div>
                  )}
                </div>

                {/* Mini weight chart */}
                <SectionHeader title="⚖️ Weight Progress" />
                <WeightChart weightLog={pig.weightLog} targetWeight={pig.showGoal?.targetWeight} showDate={pig.showGoal?.showDate} />
              </div>
            )}

            {/* ── WEIGHT ── */}
            {activeTab === "weight" && (
              <div>
                <div style={{ marginBottom: 24 }}>
                  <WeightChart weightLog={pig.weightLog} targetWeight={pig.showGoal?.targetWeight} showDate={pig.showGoal?.showDate} />
                </div>
                <SectionHeader title="⚖️ Weight Log" onAdd={() => setShowAddWeight(true)} addLabel="+ Log Weight" />
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
                  {pig.weightLog.length === 0 ? <div className="empty">No weight entries yet.</div> : (
                    <table>
                      <thead><tr><th>Date</th><th>Weight (lbs)</th><th>Notes</th></tr></thead>
                      <tbody>{[...pig.weightLog].reverse().map((w, i) => (
                        <tr key={i}>
                          <td>{fmt(w.date)}</td>
                          <td><strong style={{ color: i === 0 ? "var(--green)" : "var(--text)" }}>{w.weight}</strong>{i === 0 && <span style={{ fontSize: "0.65rem", color: "var(--green)", marginLeft: 6, fontWeight: 700 }}>▲ latest</span>}</td>
                          <td style={{ color: "var(--muted)", fontSize: "0.82rem" }}>{w.notes || "—"}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── FEED ── */}
            {activeTab === "feed" && (
              <div>
                <SectionHeader title="🌾 Feed Program" onAdd={() => setShowAddFeed(true)} addLabel="+ Add Note" />
                {showAddFeed && (
                  <AddRow onSave={addFeedNote} onCancel={() => { setShowAddFeed(false); setNewFeedNote(""); }}>
                    <div><label style={labelStyle}>Date</label><input type="date" value={newFeedDate} onChange={e => setNewFeedDate(e.target.value)} style={inputStyle} /></div>
                    <div><label style={labelStyle}>Feed Note</label><input value={newFeedNote} onChange={e => setNewFeedNote(e.target.value)} placeholder="e.g. Purina Honor Show 3lbs 2x daily, added showbloom" style={inputStyle} autoFocus /></div>
                  </AddRow>
                )}
                <div style={{ background: "var(--surface)", borderRadius: 10, overflow: "hidden" }}>
                  {pig.feedNotes.length === 0 ? <div className="empty">No feed notes yet. Add your first entry to start tracking your feed program.</div> : (
                    <table>
                      <thead><tr><th>Date</th><th>Note</th></tr></thead>
                      <tbody>{[...pig.feedNotes].reverse().map((f, i) => <tr key={i}><td>{fmt(f.date)}</td><td>{f.note}</td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── HEALTH ── */}
            {activeTab === "health" && (
              <div>
                <SectionHeader title="💉 Vaccinations" onAdd={() => setShowAddVax(true)} addLabel="+ Log Vaccine" />
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
                  {pig.vaccinations.length === 0 ? <div className="empty">No vaccinations logged yet.</div> : (
                    <table>
                      <thead><tr><th>Vaccine</th><th>Date</th><th>Given By</th></tr></thead>
                      <tbody>{pig.vaccinations.map((v, i) => <tr key={i}><td>{v.name}</td><td>{fmt(v.date)}</td><td>{v.givenBy}</td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── SHOWS ── */}
            {activeTab === "shows" && (
              <div>
                <SectionHeader title="🏆 Show Results" onAdd={() => setShowAddResult(true)} addLabel="+ Add Result" />
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
                  {pig.showResults.length === 0 ? <div className="empty">No show results yet. Add your first placing!</div> : (
                    <table>
                      <thead><tr><th>Show</th><th>Date</th><th>Class</th><th>Placing</th></tr></thead>
                      <tbody>{pig.showResults.map((r, i) => <tr key={i}><td>{r.show}</td><td>{fmt(r.date)}</td><td>{r.class}</td><td><strong style={{ color: "var(--amber)" }}>{r.placing}</strong></td></tr>)}</tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── PHOTOS ── */}
            {activeTab === "photos" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)" }}>📸 Photos</div>
                  <button onClick={() => photoInputRef.current?.click()} className="btn btn-primary" style={{ fontSize: "0.75rem", padding: "6px 14px" }}>+ Upload Photos</button>
                  <input ref={photoInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} style={{ display: "none" }} />
                </div>
                {(pig.photos || []).length === 0 ? (
                  <div style={{ background: "var(--surface)", borderRadius: 12, border: "2px dashed var(--border)", padding: "48px 24px", textAlign: "center", cursor: "pointer" }} onClick={() => photoInputRef.current?.click()}>
                    <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📷</div>
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

            {/* ── EXPENSES ── */}
            {activeTab === "expenses" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--blue-bright)" }}>💸 My Expenses</div>
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

function CustomerPortal({ customer, data, onUpdatePig, onLogout }) {
  const myPigs = (customer.pigIds || []).map(id => data.pigs.find(p => p.id === id)).filter(Boolean);

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)" }}>
      <style>{css}</style>
      {/* Top bar */}
      <div style={{ background: "var(--charcoal)", borderBottom: "1px solid var(--border)", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #fff 0%, var(--blue-bright) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>ShowPig Connect</div>
          <div style={{ width: 1, height: 18, background: "var(--border)" }} />
          <div style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>My Pigs</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{customer.name}</div>
            <div style={{ fontSize: "0.65rem", color: "var(--muted)" }}>{customer.club || customer.city}</div>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--blue-dim)", border: "1px solid rgba(59,130,246,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem" }}>🤠</div>
          <button onClick={onLogout} className="btn btn-outline" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>Sign Out</button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 6 }}>Welcome back</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "2rem", fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8 }}>Hey, {customer.name.split(" ")[0]} 👋</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {data.farm.name} · {myPigs.length} pig{myPigs.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>

        {myPigs.length === 0 ? (
          <div style={{ background: "var(--card-bg)", borderRadius: 16, border: "1px solid var(--border)", padding: "60px 40px", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", marginBottom: 16 }}>🐖</div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.3rem", fontWeight: 800, marginBottom: 8 }}>No Pigs Assigned Yet</div>
            <div style={{ color: "var(--muted)", fontSize: "0.88rem" }}>Your breeder hasn't assigned any pigs to your account yet. Check back soon!</div>
          </div>
        ) : (
          myPigs.map((pig, i) => (
            <CustomerPigCard key={pig.id} pig={pig} data={data} onUpdatePig={onUpdatePig} defaultOpen={myPigs.length === 1 || i === 0} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── CUSTOMER LOGIN ────────────────────────────────────────────────────────────
function CustomerLogin({ data, onLogin, onBack }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setError("");
    if (!name.trim() || !email.trim()) { setError("Please enter both your name and email address."); return; }
    setLoading(true);
    setTimeout(() => {
      const match = data.showmen.find(sm =>
        sm.name.toLowerCase().trim() === name.toLowerCase().trim() &&
        sm.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      setLoading(false);
      if (match) { onLogin(match); }
      else { setError("No account found matching that name and email. Contact your breeder to confirm your details."); }
    }, 600);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🤠</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Customer Sign In</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>Enter the name and email your breeder has on file for you.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="Tyler Owens" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="tyler@example.com" style={inputStyle} />
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)", lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px" }}>
              {loading ? "Checking..." : "View My Pigs →"}
            </button>
          </div>
          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.73rem", color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>
            <strong style={{ color: "var(--text)" }}>Demo credentials:</strong><br />
            Name: <em>Tyler Owens</em> · Email: <em>tyler@example.com</em>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BREEDER LOGIN ─────────────────────────────────────────────────────────────
function BreederLogin({ onLogin, onBack }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // Demo password — in production this would be real auth
  const DEMO_PASSWORD = "breeder123";

  const handleLogin = () => {
    setError("");
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (password === DEMO_PASSWORD) { onLogin(); }
      else { setError("Incorrect password. (Hint: try 'breeder123')"); }
    }, 500);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <style>{css}</style>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.82rem", fontFamily: "'Space Grotesk', sans-serif", marginBottom: 28, display: "flex", alignItems: "center", gap: 6, padding: 0, fontWeight: 600 }}>← Back</button>
        <div style={{ background: "var(--card-bg)", borderRadius: 20, border: "1px solid var(--border)", padding: "36px 32px", boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🐷</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 8 }}>Breeder Sign In</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.84rem", lineHeight: 1.6 }}>
              Access your full farm management dashboard.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelStyle}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} placeholder="••••••••" style={inputStyle} autoFocus />
            </div>
            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", fontSize: "0.8rem", color: "var(--red)" }}>
                {error}
              </div>
            )}
            <button className="btn btn-primary" onClick={handleLogin} disabled={loading} style={{ width: "100%", justifyContent: "center", marginTop: 4, opacity: loading ? 0.7 : 1, fontSize: "0.9rem", padding: "12px" }}>
              {loading ? "Signing in..." : "Enter Dashboard →"}
            </button>
          </div>
          <div style={{ marginTop: 20, padding: "12px 14px", background: "var(--surface)", borderRadius: 8, fontSize: "0.73rem", color: "var(--muted)", lineHeight: 1.6, textAlign: "center" }}>
            <strong style={{ color: "var(--text)" }}>Demo password:</strong> breeder123
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onSelectBreeder, onSelectCustomer, farmName }) {
  return (
    <div style={{ minHeight: "100vh", background: "var(--black)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" }}>
      <style>{css}</style>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "radial-gradient(ellipse, rgba(29,78,216,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "30%", width: 300, height: 200, background: "radial-gradient(ellipse, rgba(59,130,246,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 52, position: "relative" }}>
        <div style={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 14, opacity: 0.8 }}>{farmName}</div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(2.4rem, 6vw, 3.8rem)", fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1, background: "linear-gradient(135deg, #ffffff 0%, var(--blue-bright) 60%, #93c5fd 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 16 }}>
          ShowPig Connect
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1rem", maxWidth: 380, margin: "0 auto", lineHeight: 1.7 }}>
          Farm management & customer portal for show pig breeders.
        </p>
      </div>

      {/* Role selection */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, width: "100%", maxWidth: 640, position: "relative" }}>
        {/* Breeder card */}
        <button onClick={onSelectBreeder} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.6)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(29,78,216,0.25)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: 140, background: "radial-gradient(circle, rgba(29,78,216,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🐷</div>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--blue-bright)", marginBottom: 8 }}>For the Breeder</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>Breeder Dashboard</div>
          <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
            Full farm management — sow herd, breeding cycles, litters, financials, and customer management.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--blue-bright)", fontSize: "0.82rem", fontWeight: 700 }}>
            Sign In <span style={{ fontSize: "1rem" }}>→</span>
          </div>
        </button>

        {/* Customer card */}
        <button onClick={onSelectCustomer} style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 20, padding: "36px 28px", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", textAlign: "left", transition: "all 0.2s", position: "relative", overflow: "hidden" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(16,185,129,0.5)"; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 20px 48px rgba(16,185,129,0.15)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 140, height: 140, background: "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ fontSize: "2.8rem", marginBottom: 16 }}>🤠</div>
          <div style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--green)", marginBottom: 8 }}>For the Showman</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.4rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-0.02em", marginBottom: 10 }}>Customer Portal</div>
          <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6, marginBottom: 20 }}>
            View your pig's weight log, feed program, vaccinations, and show results — nothing more, nothing less.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: "0.82rem", fontWeight: 700 }}>
            Sign In <span style={{ fontSize: "1rem" }}>→</span>
          </div>
        </button>
      </div>

      <div style={{ marginTop: 36, fontSize: "0.72rem", color: "var(--subtle)", textAlign: "center" }}>
        Secure access · Customers only see their own pigs
      </div>
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────────
// Portal state: "landing" | "breeder-login" | "breeder" | "customer-login" | "customer"
export default function App() {
  const [portal, setPortal] = useState("landing");
  const [loggedInCustomer, setLoggedInCustomer] = useState(null);

  const [data, setData] = useState(initialData);
  const [view, setView] = useState({ page: "dashboard" });

  // Modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseDefaultSow, setExpenseDefaultSow] = useState(null);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [breedDefaultSow, setBreedDefaultSow] = useState(null);
  const [showSowModal, setShowSowModal] = useState(false);
  const [editSow, setEditSow] = useState(null);
  const [showBoarModal, setShowBoarModal] = useState(false);
  const [editBoar, setEditBoar] = useState(null);
  const [showShowmanModal, setShowShowmanModal] = useState(false);
  const [editShowman, setEditShowman] = useState(null);
  const [showAddPigModal, setShowAddPigModal] = useState(false);
  const [addPigLitterId, setAddPigLitterId] = useState(null);
  const [showFarrowModal, setShowFarrowModal] = useState(false);
  const [farrowDefaultSow, setFarrowDefaultSow] = useState(null);

  // Data mutations
  const logBreedDate = (sowId, cycle, autoExpenses = []) => {
    setData(prev => {
      let updated = { ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: [...(s.breedingCycles || []), { id: uid(), ...cycle }] }) };
      if (autoExpenses.length > 0) {
        updated = { ...updated, sows: updated.sows.map(s => { const mine = autoExpenses.filter(e => e.sowId === s.id); return mine.length === 0 ? s : { ...s, costs: [...(s.costs || []), ...mine.map(e => e.cost)] }; }) };
      }
      return updated;
    });
  };
  const addExpenses = (entries) => {
    setData(prev => ({ ...prev, sows: prev.sows.map(s => { const mine = entries.filter(e => e.sowId === s.id); return mine.length === 0 ? s : { ...s, costs: [...(s.costs || []), ...mine.map(e => e.cost)] }; }) }));
  };
  const saveSow = (sow) => {
    setData(prev => {
      const exists = prev.sows.find(s => s.id === sow.id);
      return { ...prev, sows: exists ? prev.sows.map(s => s.id === sow.id ? sow : s) : [...prev.sows, sow] };
    });
  };
  const deleteSow = (id) => {
    if (!window.confirm("Delete this sow? This won't delete associated litters or pigs.")) return;
    setData(prev => ({ ...prev, sows: prev.sows.filter(s => s.id !== id) }));
  };
  const saveBoar = (boar) => {
    setData(prev => {
      const exists = prev.boars.find(b => b.id === boar.id);
      return { ...prev, boars: exists ? prev.boars.map(b => b.id === boar.id ? boar : b) : [...prev.boars, boar] };
    });
  };
  const deleteBoar = (id) => {
    if (!window.confirm("Delete this boar?")) return;
    setData(prev => ({ ...prev, boars: prev.boars.filter(b => b.id !== id) }));
  };
  const saveShowman = (sm) => {
    setData(prev => {
      const exists = prev.showmen.find(s => s.id === sm.id);
      // Update pig sold status
      const updatedPigs = prev.pigs.map(p => {
        if (sm.pigIds.includes(p.id)) return { ...p, sold: true, showmanName: sm.name, showmanContact: sm.email, showmanPhone: sm.phone };
        if (exists?.pigIds?.includes(p.id) && !sm.pigIds.includes(p.id)) return { ...p, sold: false, showmanName: null, showmanContact: null, showmanPhone: null };
        return p;
      });
      const updatedShowmen = exists ? prev.showmen.map(s => s.id === sm.id ? sm : s) : [...prev.showmen, sm];
      return { ...prev, showmen: updatedShowmen, pigs: updatedPigs };
    });
  };
  const deleteShowman = (id) => {
    if (!window.confirm("Delete this customer?")) return;
    setData(prev => {
      const sm = prev.showmen.find(s => s.id === id);
      const updatedPigs = prev.pigs.map(p => sm?.pigIds?.includes(p.id) ? { ...p, sold: false, showmanName: null, showmanContact: null, showmanPhone: null } : p);
      return { ...prev, showmen: prev.showmen.filter(s => s.id !== id), pigs: updatedPigs };
    });
  };
  const addPig = (pig) => setData(prev => ({ ...prev, pigs: [...prev.pigs, pig] }));

  const addLitter = (litter) => setData(prev => ({ ...prev, litters: [...prev.litters, litter] }));

  const assignCustomer = (customerId, pigId) => {
    setData(prev => {
      // Remove pig from any existing customer first
      const prevOwner = prev.showmen.find(sm => (sm.pigIds || []).includes(pigId));
      const pig = prev.pigs.find(p => p.id === pigId);
      const customer = prev.showmen.find(sm => sm.id === customerId);
      const updatedShowmen = prev.showmen.map(sm => {
        if (sm.id === customerId) return { ...sm, pigIds: [...new Set([...(sm.pigIds || []), pigId])] };
        if (sm.id === prevOwner?.id) return { ...sm, pigIds: (sm.pigIds || []).filter(id => id !== pigId) };
        return sm;
      });
      const updatedPigs = prev.pigs.map(p => p.id === pigId ? { ...p, sold: true, showmanName: customer?.name || null, showmanContact: customer?.email || null, showmanPhone: customer?.phone || null } : p);
      return { ...prev, showmen: updatedShowmen, pigs: updatedPigs };
    });
  };

  const unassignCustomer = (customerId, pigId) => {
    setData(prev => {
      const updatedShowmen = prev.showmen.map(sm => sm.id === customerId ? { ...sm, pigIds: (sm.pigIds || []).filter(id => id !== pigId) } : sm);
      const updatedPigs = prev.pigs.map(p => p.id === pigId ? { ...p, sold: false, showmanName: null, showmanContact: null, showmanPhone: null } : p);
      return { ...prev, showmen: updatedShowmen, pigs: updatedPigs };
    });
  };

  const navItems = [
    { id: "dashboard", icon: "🏠", label: "Dashboard", section: null },
    { id: "sows", icon: "🐷", label: "Sow Herd", section: "Herd Management" },
    { id: "boars", icon: "🐗", label: "Service Sires", section: null },
    { id: "breeding", icon: "📅", label: "Breeding Calendar", section: null },
    { id: "pigs", icon: "🐖", label: "Individual Pigs", section: "Marketplace" },
    { id: "showmen", icon: "🤠", label: "Customers", section: null },
    { id: "reports", icon: "📊", label: "Financial Reports", section: "Analytics" },
  ];

  const activePage = view.page.replace("Detail", "").replace("litter", "sow").replace("breeding", "breeding");

  const renderPage = () => {
    switch (view.page) {
      case "dashboard": return <Dashboard data={data} />;
      case "sows": return <SowsView data={data} setView={setView} onAddExpense={(id) => { setExpenseDefaultSow(id); setShowExpenseModal(true); }} onAddSow={() => { setEditSow(null); setShowSowModal(true); }} onEditSow={(sow) => { setEditSow(sow); setShowSowModal(true); }} onDeleteSow={deleteSow} />;
      case "sowDetail": return <SowDetail data={data} id={view.id} setView={setView} onAddExpense={(id) => { setExpenseDefaultSow(id); setShowExpenseModal(true); }} onLogBreed={(id) => { setBreedDefaultSow(id); setShowBreedModal(true); }} onRecordFarrow={(id) => { setFarrowDefaultSow(id); setShowFarrowModal(true); }} onMarkMissed={(sowId, cycleId) => setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: (s.breedingCycles||[]).map(c => c.id !== cycleId ? c : { ...c, missed: true, missedDate: new Date().toISOString().split("T")[0] }) }) }))} onConfirmConceived={(sowId, cycleId) => setData(prev => ({ ...prev, sows: prev.sows.map(s => s.id !== sowId ? s : { ...s, breedingCycles: (s.breedingCycles||[]).map(c => c.id !== cycleId ? c : { ...c, conceived: true, conceiveDate: new Date().toISOString().split("T")[0] }) }) }))} />;
      case "litterDetail": return <LitterDetail data={data} id={view.id} setView={setView} onUpdateLitter={() => {}} onAddPigToLitter={(litterId) => { setAddPigLitterId(litterId); setShowAddPigModal(true); }} />;
      case "boars": return <BoarsView data={data} onAddBoar={() => { setEditBoar(null); setShowBoarModal(true); }} onEditBoar={(boar) => { setEditBoar(boar); setShowBoarModal(true); }} onDeleteBoar={deleteBoar} />;
      case "breeding": return <BreedingCalendar data={data} setView={setView} onLogBreed={(id) => { setBreedDefaultSow(id); setShowBreedModal(true); }} />;
      case "pigs": return <PigsView data={data} setView={setView} onAddPig={() => { setAddPigLitterId(null); setShowAddPigModal(true); }} />;
      case "pigDetail": return <PigDetail data={data} id={view.id} setView={setView} onAssignCustomer={assignCustomer} onUnassignCustomer={unassignCustomer} />;
      case "showmen": return <ShowmenView data={data} setView={setView} onAddShowman={() => { setEditShowman(null); setShowShowmanModal(true); }} onEditShowman={(sm) => { setEditShowman(sm); setShowShowmanModal(true); }} onDeleteShowman={deleteShowman} />;
      case "reports": return <FinancialReports data={data} />;
      default: return <div className="empty" style={{ padding: 80 }}>Coming soon...</div>;
    }
  };

  // ── Portal routing ───────────────────────────────────────────────────────
  if (portal === "landing") {
    return <LandingPage farmName={data.farm.name} onSelectBreeder={() => setPortal("breeder-login")} onSelectCustomer={() => setPortal("customer-login")} />;
  }
  if (portal === "breeder-login") {
    return <BreederLogin onLogin={() => setPortal("breeder")} onBack={() => setPortal("landing")} />;
  }
  if (portal === "customer-login") {
    return <CustomerLogin data={data} onLogin={(customer) => { setLoggedInCustomer(customer); setPortal("customer"); }} onBack={() => setPortal("landing")} />;
  }
  if (portal === "customer" && loggedInCustomer) {
    const freshCustomer = data.showmen.find(sm => sm.id === loggedInCustomer.id) || loggedInCustomer;
    const updatePig = (updatedPig) => setData(prev => ({ ...prev, pigs: prev.pigs.map(p => p.id === updatedPig.id ? updatedPig : p) }));
    return <CustomerPortal customer={freshCustomer} data={data} onUpdatePig={updatePig} onLogout={() => { setLoggedInCustomer(null); setPortal("landing"); }} />;
  }

  // ── Breeder portal ────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="sidebar">
          <div className="sidebar-brand">
            <h1>ShowPig<br />Connect</h1>
            <p>{data.farm.name}</p>
          </div>
          <nav className="sidebar-nav">
            {navItems.map((item, i) => {
              const prevItem = i > 0 ? navItems[i - 1] : null;
              const showSection = item.section && item.section !== prevItem?.section;
              return (
                <div key={item.id}>
                  {showSection && <div className="nav-section">{item.section}</div>}
                  <div className={`nav-item ${activePage === item.id ? "active" : ""}`} onClick={() => setView({ page: item.id })}>
                    <span className="nav-icon">{item.icon}</span>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </nav>
          <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.03)", display: "flex", flexDirection: "column", gap: 8 }}>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", background: "var(--blue-bright)", color: "var(--text)" }} onClick={() => { setExpenseDefaultSow(null); setShowExpenseModal(true); }}>+ Add Expense</button>
            <button className="btn btn-outline" style={{ width: "100%", justifyContent: "center", fontSize: "0.75rem" }} onClick={() => setPortal("landing")}>← Switch Portal</button>
          </div>
        </div>
        <div className="main">{renderPage()}</div>

        {showBreedModal && <LogBreedModal sows={data.sows} boars={data.boars} defaultSowId={breedDefaultSow} onSave={(sowId, cycle, autoExpenses) => { logBreedDate(sowId, cycle, autoExpenses); setShowBreedModal(false); setBreedDefaultSow(null); }} onClose={() => setShowBreedModal(false)} />}
        {showFarrowModal && <RecordFarrowModal sows={data.sows} boars={data.boars} defaultSowId={farrowDefaultSow} onSave={(litter) => { addLitter(litter); setShowFarrowModal(false); setFarrowDefaultSow(null); }} onClose={() => { setShowFarrowModal(false); setFarrowDefaultSow(null); }} />}
        {showExpenseModal && <AddExpenseModal sows={data.sows} defaultSowId={expenseDefaultSow} onSave={(entries) => { addExpenses(entries); setShowExpenseModal(false); setExpenseDefaultSow(null); }} onClose={() => { setShowExpenseModal(false); setExpenseDefaultSow(null); }} />}
        {showSowModal && <SowModal sow={editSow} onSave={(sow) => { saveSow(sow); setShowSowModal(false); setEditSow(null); }} onClose={() => { setShowSowModal(false); setEditSow(null); }} />}
        {showBoarModal && <BoarModal boar={editBoar} onSave={(boar) => { saveBoar(boar); setShowBoarModal(false); setEditBoar(null); }} onClose={() => { setShowBoarModal(false); setEditBoar(null); }} />}
        {showShowmanModal && <ShowmanModal showman={editShowman} onSave={(sm) => { saveShowman(sm); setShowShowmanModal(false); setEditShowman(null); }} onClose={() => { setShowShowmanModal(false); setEditShowman(null); }} />}
        {showAddPigModal && <AddPigModal litterId={addPigLitterId} litters={data.litters} sows={data.sows} onSave={(pig) => { addPig(pig); setShowAddPigModal(false); setAddPigLitterId(null); }} onClose={() => { setShowAddPigModal(false); setAddPigLitterId(null); }} />}
      </div>
    </>
  );
}
