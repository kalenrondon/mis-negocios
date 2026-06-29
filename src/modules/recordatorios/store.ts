import { useSyncExternalStore } from 'react'
import type { Recordatorio } from './types'

let store: Recordatorio[] = (() => {
  try { return JSON.parse(localStorage.getItem('recordatorios') || '[]') as Recordatorio[] }
  catch { return [] }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function persist() {
  localStorage.setItem('recordatorios', JSON.stringify(store))
}

export function addRecordatorio(r: Recordatorio) {
  store = [...store, r]
  persist()
  emit()
}

export function updateRecordatorio(id: string, data: Partial<Recordatorio>) {
  store = store.map((r) => (r.id === id ? { ...r, ...data } : r))
  persist()
  emit()
}

export function deleteRecordatorio(id: string) {
  store = store.filter((r) => r.id !== id)
  persist()
  emit()
}

export function toggleCompletado(id: string) {
  store = store.map((r) => (r.id === id ? { ...r, completado: !r.completado } : r))
  persist()
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return store
}

export function useRecordatoriosStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const pendientes = state.filter((r) => !r.completado).sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora))
  const completados = state.filter((r) => r.completado).sort((a, b) => b.fecha.localeCompare(a.fecha) || b.hora.localeCompare(a.hora))
  const proximos = pendientes.filter((r) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const upper = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    if (!r.hora) {
      const d = new Date(r.fecha + 'T00:00:00')
      return d >= today && d <= upper
    }
    const d = new Date(`${r.fecha}T${r.hora}`)
    return d >= new Date() && d <= upper
  })
  return { state, pendientes, completados, proximos }
}
