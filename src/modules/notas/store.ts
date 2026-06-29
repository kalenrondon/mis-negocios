import { useSyncExternalStore } from 'react'
import type { Nota } from './types'

let store: Nota[] = (() => {
  try { return JSON.parse(localStorage.getItem('notas') || '[]') as Nota[] }
  catch { return [] }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function persist() {
  localStorage.setItem('notas', JSON.stringify(store))
}

export function addNota(n: Nota) {
  store = [...store, n]
  persist()
  emit()
}

export function updateNota(id: string, data: Partial<Nota>) {
  store = store.map((n) => (n.id === id ? { ...n, ...data, updatedAt: new Date().toISOString() } : n))
  persist()
  emit()
}

export function deleteNota(id: string) {
  store = store.filter((n) => n.id !== id)
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

export function useNotasStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const ordenadas = [...state].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  return { state, ordenadas }
}
