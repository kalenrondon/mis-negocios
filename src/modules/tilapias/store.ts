import { useSyncExternalStore, useCallback } from 'react'
import type { LoteTilapia, BajaTilapia, VentaTilapia, Gasto } from './types'
import * as mock from './mockData'

interface TilapiasStore {
  lotes: LoteTilapia[]
  bajas: BajaTilapia[]
  ventas: VentaTilapia[]
  gastos: Gasto[]
}

let store: TilapiasStore = {
  lotes: mock.lotesMock,
  bajas: mock.bajasMock,
  ventas: mock.ventasMock,
  gastos: mock.gastosMock,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function vivosActuales(loteId: string): number {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l) return 0
  const bajas = store.bajas.filter((b) => b.loteId === loteId).reduce((s, b) => s + b.cantidad, 0)
  const vendidos = store.ventas.filter((v) => v.loteId === loteId).reduce((s, v) => s + v.cantidad, 0)
  return l.cantidadInicial - bajas - vendidos
}

function autoCerrarSiAplica(loteId: string) {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l || !l.activo) return
  if (vivosActuales(loteId) > 0) return
  store = { ...store, lotes: store.lotes.map((x) => (x.id === loteId ? { ...x, activo: false } : x)) }
  emit()
}

export function addLote(lote: LoteTilapia) {
  store = { ...store, lotes: [...store.lotes, lote] }
  emit()
}

export function updateLote(id: string, data: Partial<LoteTilapia>) {
  store = { ...store, lotes: store.lotes.map((l) => (l.id === id ? { ...l, ...data } : l)) }
  emit()
}

export function deleteLote(id: string) {
  store = {
    ...store,
    lotes: store.lotes.filter((l) => l.id !== id),
    bajas: store.bajas.filter((b) => b.loteId !== id),
    ventas: store.ventas.filter((v) => v.loteId !== id),
    gastos: store.gastos.filter((g) => g.loteId !== id),
  }
  emit()
}

export function addBaja(baja: BajaTilapia) {
  const disponibles = vivosActuales(baja.loteId)
  if (baja.cantidad > disponibles) {
    alert(`No podés registrar ${baja.cantidad} bajas, solo hay ${disponibles} tilapias vivas`)
    return
  }
  store = { ...store, bajas: [...store.bajas, baja] }
  emit()
  autoCerrarSiAplica(baja.loteId)
}

export function deleteBaja(id: string) {
  const b = store.bajas.find((x) => x.id === id)
  store = { ...store, bajas: store.bajas.filter((b) => b.id !== id) }
  emit()
  if (b) autoCerrarSiAplica(b.loteId)
}

export function addVenta(venta: VentaTilapia) {
  const disponibles = vivosActuales(venta.loteId)
  if (venta.cantidad > disponibles) {
    alert(`No podés vender ${venta.cantidad} tilapias, solo hay ${disponibles} disponibles`)
    return
  }
  store = { ...store, ventas: [...store.ventas, venta] }
  emit()
  autoCerrarSiAplica(venta.loteId)
}

export function deleteVenta(id: string) {
  const v = store.ventas.find((x) => x.id === id)
  store = { ...store, ventas: store.ventas.filter((v) => v.id !== id) }
  emit()
  if (v) autoCerrarSiAplica(v.loteId)
}

export function addGasto(gasto: Gasto) {
  store = { ...store, gastos: [...store.gastos, gasto] }
  emit()
}

export function deleteGasto(id: string) {
  store = { ...store, gastos: store.gastos.filter((g) => g.id !== id) }
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return store
}

export function useTilapiasStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const getBajasByLote = useCallback((loteId: string) => state.bajas.filter((b) => b.loteId === loteId), [state.bajas])
  const getVentasByLote = useCallback((loteId: string) => state.ventas.filter((v) => v.loteId === loteId), [state.ventas])
  const getGastosByLote = useCallback((loteId: string) => state.gastos.filter((g) => g.loteId === loteId), [state.gastos])
  const getLoteById = useCallback((id: string) => state.lotes.find((l) => l.id === id), [state.lotes])

  return { state, getBajasByLote, getVentasByLote, getGastosByLote, getLoteById }
}
