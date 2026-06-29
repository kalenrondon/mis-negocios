import { supabase } from './supabase'

export async function pullFromSupabase<T extends { id: string }>(table: string, userId: string): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
  if (error) throw error
  return (data ?? []) as T[]
}

export async function pushToSupabase<T extends { id: string }>(table: string, records: T[]): Promise<void> {
  for (const record of records) {
    const { error } = await supabase.from(table).upsert(record, { onConflict: 'id' })
    if (error) throw error
  }
}

export async function deleteFromSupabase(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}
