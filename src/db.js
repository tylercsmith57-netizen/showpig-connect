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

  const [sows, boars, litters, pigs, customers, cycles, expenses] = await Promise.all([
    supabase.from('sows').select('*').eq('farm_id', farmId),
    supabase.from('boars').select('*').eq('farm_id', farmId),
    supabase.from('litters').select('*').eq('farm_id', farmId),
    supabase.from('pigs').select('*').eq('farm_id', farmId),
    supabase.from('customers').select('*').eq('farm_id', farmId),
    supabase.from('breeding_cycles').select('*').eq('farm_id', farmId),
    supabase.from('sow_expenses').select('*').eq('farm_id', farmId),
  ])

  const cyclesData = cycles.data || []
  const expensesData = expenses.data || []

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

  return {
    farmId: farm.id,
    farmData: {
      farm: { name: farm.name, owner: farm.owner_name, location: farm.location },
      sows: sowsWithData,
      boars: boars.data || [],
      litters: litters.data || [],
      pigs: pigs.data || [],
      showmen: customers.data || [],
    }
  }
}