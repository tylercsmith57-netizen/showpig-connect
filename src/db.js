import { supabase } from './supabaseClient'

export async function loadFarmData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: farm, error: farmError } = await supabase
    .from('farms')
    .select('*')
    .single()

  console.log('farm:', farm, 'error:', farmError)
  if (!farm) return null

  const farmId = farm.id

  const [sows, boars, litters, pigs, customers, cycles, expenses, sales] = await Promise.all([
    supabase.from('sows').select('*').eq('farm_id', farmId),
    supabase.from('boars').select('*').eq('farm_id', farmId),
    supabase.from('litters').select('*').eq('farm_id', farmId),
    supabase.from('pigs').select('*').eq('farm_id', farmId),
    supabase.from('customers').select('*').eq('farm_id', farmId),
    supabase.from('breeding_cycles').select('*').eq('farm_id', farmId),
    supabase.from('sow_expenses').select('*').eq('farm_id', farmId),
    supabase.from('sales').select('*').eq('farm_id', farmId),
  ])

  const cyclesData = cycles.data || []
  const expensesData = expenses.data || []
  const salesData = sales.data || []

  // Only fetch sale_items that belong to this farm's sales
  const saleIds = salesData.map(s => s.id)
  const saleItemsData = saleIds.length > 0
    ? (await supabase.from('sale_items').select('*').in('sale_id', saleIds)).data || []
    : []

  // Build a map of pig_id -> sale info
  const pigSaleMap = {}
  for (const item of saleItemsData) {
    const sale = salesData.find(s => s.id === item.sale_id)
    if (sale) {
      pigSaleMap[item.pig_id] = {
        saleId: item.sale_id,
        saleItemId: item.id,
        salePrice: item.sale_price,
        saleDate: sale.sale_date,
        customerId: sale.customer_id,
        saleNotes: sale.notes,
      }
    }
  }

  // Attach breeding cycles and expenses to their sows
  const sowsWithData = (sows.data || []).map(sow => ({
    ...sow,
    breedingCycles: cyclesData
      .filter(c => c.sow_id === sow.id)
      .map(c => ({
        id: c.id,
        breedDate: c.breed_date,
        sireId: c.boar_id,
        method: c.method,
        doses: c.doses,
        notes: c.notes,
        conceived: c.conceived,
        conceiveDate: c.conceive_date,
        farrowDateActual: c.farrow_date_actual,
        expectedFarrowDate: c.farrow_date_actual,
        missed: c.missed,
        missedDate: c.missed_date,
        nextHeatDate: c.next_heat_date || null,
        type: c.type || 'breed',
      })),
    costs: expensesData
      .filter(e => e.sow_id === sow.id)
      .map(e => ({
        id: e.id,
        date: e.date,
        category: e.category,
        description: e.description,
        amount: e.amount,
      })),
  }))

  // Map customers with their pig assignments from sales
  const customersWithPigs = (customers.data || []).map(c => {
    const pigIds = saleItemsData
      .filter(item => {
        const sale = salesData.find(s => s.id === item.sale_id)
        return sale?.customer_id === c.id
      })
      .map(item => item.pig_id)
    return { ...c, pigIds }
  })

  return {
    farmId: farm.id,
    farmData: {
      farm: { name: farm.name, owner: farm.owner_name, location: farm.location },
      sows: sowsWithData,
      boars: boars.data || [],
      litters: (litters.data || []).map(l => ({
        id: l.id,
        sowId: l.sow_id,
        boarId: l.boar_id,
        farrowDate: l.farrow_date,
        numberBorn: l.number_born,
        numberBornAlive: l.number_born_alive,
        numberWeaned: l.number_weaned,
        weanDate: l.wean_date,
        ageWeanedDays: l.age_weaned_days,
        notes: l.notes,
        cycleId: l.cycle_id || null,
        vaccinations: [],
      })),
      pigs: (pigs.data || []).map(p => {
        const saleInfo = pigSaleMap[p.id] || null
        return {
          id: p.id,
          litterId: p.litter_id,
          tag: p.tag,
          sex: p.sex,
          birthWeight: p.birth_weight,
          color: p.color,
          purchasePrice: saleInfo?.salePrice ?? p.purchase_price ?? 0,
          askingPrice: p.purchase_price ?? 0,
          sold: p.sold || !!saleInfo,
          soldDate: saleInfo?.saleDate || p.sold_date || null,
          saleId: saleInfo?.saleId || null,
          customerId: saleInfo?.customerId || p.customer_id || null,
          showmanName: saleInfo
            ? (customers.data || []).find(c => c.id === saleInfo.customerId)?.name || null
            : p.showman_name || null,
          weightLog: p.weight_log || [],
          vaccinations: p.vaccinations || [],
          feedNotes: p.feed_notes || [],
          showResults: p.show_results || [],
          photos: p.photos || [],
          showGoal: p.show_goal || null,
          showmanExpenses: p.showman_expenses || [],
        }
      }),
      showmen: customersWithPigs,
      sales: salesData.map(s => ({
        id: s.id,
        customerId: s.customer_id,
        saleDate: s.sale_date,
        notes: s.notes,
        items: saleItemsData
          .filter(i => i.sale_id === s.id)
          .map(i => ({ id: i.id, pigId: i.pig_id, salePrice: i.sale_price })),
      })),
    }
  }
}
