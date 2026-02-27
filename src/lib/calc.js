// ─── CALCULATION HELPERS ─────────────────────────────────────────────────────
import { COST_CATEGORIES, cycleCalc } from './constants';

const fmt = (d) => {
  if (!d) return "—";
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

const getSowStage = (sow) => {
  const cycles = (sow.breedingCycles || []).filter(c => c.breedDate);
  if (!cycles.length) return "open";
  const latest = cycles.sort((a, b) => new Date(b.breedDate) - new Date(a.breedDate))[0];
  if (latest.farrowDateActual) return "open";
  if (latest.missed) return "open";
  if (latest.conceived) return "gestating";
  if (latest.breedDate) return "bred";
  return "open";
};

//  CSS 
export { sowCashKPIs, fmt, getSowStage };
export { cycleCalc } from './constants';

