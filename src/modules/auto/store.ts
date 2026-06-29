import { useSyncExternalStore } from 'react'
import type { TareaAuto } from './types'

let store: TareaAuto[] = (() => {
  try { return JSON.parse(localStorage.getItem('auto-tareas') || '[]') as TareaAuto[] }
  catch { return [] }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function persist() {
  localStorage.setItem('auto-tareas', JSON.stringify(store))
}

export function addTarea(t: TareaAuto) {
  store = [...store, t]
  persist()
  emit()
}

export function updateTarea(id: string, data: Partial<TareaAuto>) {
  store = store.map((t) => (t.id === id ? { ...t, ...data } : t))
  persist()
  emit()
}

export function deleteTarea(id: string) {
  store = store.filter((t) => t.id !== id)
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

export function useAutoStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const ordenadas = [...state].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))
  return { state, ordenadas }
}
