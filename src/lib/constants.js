// ─── CONSTANTS & HELPERS ─────────────────────────────────────────────────────

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

//  HELPERS 
const fmt = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
const sexIcon = (s) => s === "Barrow" ? "" : s === "Gilt" ? "" : "—";
const uid = () => `id-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

//  BREEDING HELPERS 
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
  const dueDate = cycle.breedDate && !cycle.farrowDateActual && !cycle.missed ? addDays(cycle.breedDate, GESTATION_DAYS) : null;
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

const sowMissedInfo = (sow, litters = []) => {
  const cycles = sow.breedingCycles || [];
  const missedCycles = cycles.filter(c => c.missed || c.type === 'open');
  const consecutiveMisses = (() => {
    const sorted = [...cycles].sort((a, b) => new Date(b.breedDate || b.openDate) - new Date(a.breedDate || a.openDate));
    let count = 0;
    for (const c of sorted) { if (c.missed || c.type === 'open') count++; else if (c.farrowDateActual || (!c.missed && !c.type)) break; }
    return count;
  })();

  // Check for next heat from wean date first (wean + 21 days)
  const sowLitters = litters.filter(l => l.sowId === sow.id);
  const lastLitter = sowLitters.sort((a, b) => new Date(b.weanDate) - new Date(a.weanDate))[0];
  const weanBasedHeat = lastLitter?.weanDate ? addDays(lastLitter.weanDate, HEAT_INTERVAL_DAYS) : null;

  // Also check breeding cycle next_heat_date (saved from LitterDetail edit)
  const cycleBasedHeat = cycles
    .filter(c => c.nextHeatDate)
    .sort((a, b) => new Date(b.nextHeatDate) - new Date(a.nextHeatDate))[0]?.nextHeatDate || null;

  // Check for active breeding cycle — if sow is bred/gestating, don't show next heat
  const hasActiveCycle = cycles.some(c => !c.farrowDateActual && !c.missed && c.type !== 'open' && c.breedDate);

  // From missed cycles
  const lastMiss = missedCycles.sort((a, b) => new Date(b.missedDate || b.openDate) - new Date(a.missedDate || a.openDate))[0];
  const missBasedHeat = lastMiss
    ? (lastMiss.type === 'open'
        ? (lastMiss.nextHeatDate || addDays(lastMiss.openDate, HEAT_INTERVAL_DAYS))
        : (lastMiss.missedDate ? addDays(lastMiss.missedDate, HEAT_INTERVAL_DAYS) : null))
    : null;

  // Priority: cycle-saved next heat > wean-based > miss-based, but only if no active cycle
  const nextHeat = hasActiveCycle ? null : (cycleBasedHeat || weanBasedHeat || missBasedHeat);
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
  const futureCycles = cycles.filter(c => !c.farrowDateActual && !c.missed && c.type !== 'open' && c.breedDate);
  const nextScheduled = futureCycles.sort((a, b) => new Date(b.breedDate) - new Date(a.breedDate))[0] || null;
  const lastFarrowed = cycles.filter(c => c.farrowDateActual).sort((a,b) => new Date(b.farrowDateActual) - new Date(a.farrowDateActual))[0] || null;
  return { projNextBreed, projDueDate, nextScheduled, lastFarrowed, lastWeanDate, cycles };
};

//  COST DATA 
const COST_CATEGORIES = {
  feed:     { label: "Feed & Supplies", icon: "feed", color: "#60a5fa" },
  vet:      { label: "Vet & Medications", icon: "vet", color: "#a78bfa" },
  vaccine:  { label: "Vaccinations", icon: "vaccine", color: "#34d399" },
  breeding: { label: "Breeding Fees", icon: "", color: "#fb923c" },
};

export { initialData, cycleCalc, COST_CATEGORIES, sowMissedInfo, sexIcon, addDays, daysBetween, uid, daysFromToday, sowNextCycle };
