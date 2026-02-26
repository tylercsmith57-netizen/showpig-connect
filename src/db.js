import { supabase } from './supabaseClient'

export async function loadFarmData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: farm } = await supabase
    .from('farms')
    .select('*')
    .single()

  if (!farm) return null

  const farmId = farm.id

  const [sows, boars, litters, pigs, customers] = await Promise.all([
    supabase.from('sows').select('*').eq('farm_id', farmId),
    supabase.from('boars').select('*').eq('farm_id', farmId),
    supabase.from('litters').select('*').eq('farm_id', farmId),
    supabase.from('pigs').select('*').eq('farm_id', farmId),
    supabase.from('customers').select('*').eq('farm_id', farmId),
  ])

  return {
    farm: { name: farm.name, owner: farm.owner_name, location: farm.location },
    sows: sows.data || [],
    boars: boars.data || [],
    litters: litters.data || [],
    pigs: pigs.data || [],
    showmen: customers.data || [],
  }
}