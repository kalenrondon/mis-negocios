import { useSyncExternalStore } from 'react'
import type { PedidoBordado } from './types'

const STORAGE_KEY = 'bordado-pedidos'

function load(): PedidoBordado[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function save(data: PedidoBordado[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emit()
}

let store = load()
const listeners = new Set<() => void>()
function emit() { listeners.forEach(l => l()) }

export function useBordadoStore() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb) },
    () => store,
    () => store,
  )
}

export function addPedido(p: PedidoBordado) {
  store = [...store, p]
  save(store)
}

export function updatePedido(id: string, data: Partial<PedidoBordado>) {
  store = store.map(p => p.id === id ? { ...p, ...data } : p)
  save(store)
}

export function deletePedido(id: string) {
  store = store.filter(p => p.id !== id)
  save(store)
}
