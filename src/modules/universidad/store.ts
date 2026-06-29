import { useSyncExternalStore } from 'react'
import type { Materia } from './types'

const STORAGE_KEY = 'universidad-materias'

function load(): Materia[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function save(data: Materia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emit()
}

let store = load()
const listeners = new Set<() => void>()
function emit() { listeners.forEach(l => l()) }

export function useUniversidadStore() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => store,
    () => store,
  )
}

export function addMateria(m: Materia) {
  store = [...store, { ...m, promedio: (m.nota1 + m.nota2 + m.nota3) / 3 }]
  save(store)
}

export function updateMateria(id: string, data: Partial<Materia>) {
  store = store.map(m => {
    if (m.id !== id) return m
    const updated = { ...m, ...data }
    const n1 = updated.nota1 ?? m.nota1
    const n2 = updated.nota2 ?? m.nota2
    const n3 = updated.nota3 ?? m.nota3
    return { ...updated, promedio: (n1 + n2 + n3) / 3 }
  })
  save(store)
}

export function deleteMateria(id: string) {
  store = store.filter(m => m.id !== id)
  save(store)
}
