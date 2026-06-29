import { getUserId } from './auth-store'
import { supabase } from './supabase'

const TABLES = [
  'pollos_lotes', 'pollos_bajas', 'pollos_pesajes', 'pollos_ventas', 'pollos_empacados', 'pollos_gastos',
  'ponedoras_lotes', 'ponedoras_posturas', 'ponedoras_bajas', 'ponedoras_ventas', 'ponedoras_gastos',
  'tilapias_lotes', 'tilapias_bajas', 'tilapias_cosechas', 'tilapias_gastos',
  'vacuno_lotes', 'vacuno_bajas', 'vacuno_ventas', 'vacuno_gastos',
  'trading_operaciones',
  'recordatorios',
  'notas',
  'auto_tareas',
  'gastos_personales', 'gastos_presupuestos', 'gastos_metas',
]

export const LOCAL_KEYS: Record<string, string> = {
  pollos_lotes: 'pollos-lotes',
  pollos_bajas: 'pollos-bajas',
  pollos_pesajes: 'pollos-pesajes',
  pollos_ventas: 'pollos-ventas',
  pollos_empacados: 'pollos-empacados',
  pollos_gastos: 'pollos-gastos',
  ponedoras_lotes: 'ponedoras-lotes',
  ponedoras_posturas: 'ponedoras-posturas',
  ponedoras_bajas: 'ponedoras-bajas',
  ponedoras_ventas: 'ponedoras-ventas',
  ponedoras_gastos: 'ponedoras-gastos',
  tilapias_lotes: 'tilapias-lotes',
  tilapias_bajas: 'tilapias-bajas',
  tilapias_cosechas: 'tilapias-cosechas',
  tilapias_gastos: 'tilapias-gastos',
  vacuno_lotes: 'vacuno-lotes',
  vacuno_bajas: 'vacuno-bajas',
  vacuno_ventas: 'vacuno-ventas',
  vacuno_gastos: 'vacuno-gastos',
  trading_operaciones: 'trading-operaciones',
  recordatorios: 'recordatorios',
  notas: 'notas',
  auto_tareas: 'auto-tareas',
  gastos_personales: 'gastos-personales',
  gastos_presupuestos: 'gastos-presupuestos',
  gastos_metas: 'gastos-metas',
}

export async function pullAllFromSupabase() {
  const userId = getUserId()
  if (!userId) return
  ;(window as any).__ignoreSync = true
  for (const table of TABLES) {
    const { data, error } = await supabase.from(table).select('*').eq('user_id', userId)
    if (!error && data) {
      const key = LOCAL_KEYS[table]
      if (key) localStorage.setItem(key, JSON.stringify(data))
    }
  }
  ;(window as any).__ignoreSync = false
  window.dispatchEvent(new CustomEvent('sync-pulled'))
}

export async function pushAllToSupabase() {
  const userId = getUserId()
  if (!userId) return
  for (const table of TABLES) {
    const key = LOCAL_KEYS[table]
    if (!key) continue
    const raw = localStorage.getItem(key)
    if (!raw) continue
    const records = JSON.parse(raw)
    for (const record of records) {
      const { error } = await supabase.from(table).upsert(
        { ...record, user_id: userId },
        { onConflict: 'id' }
      )
      if (error) console.error(`Error syncing ${table}:`, error)
    }
  }
}
