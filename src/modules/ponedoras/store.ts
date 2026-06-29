import { useSyncExternalStore, useCallback } from 'react'
import type { LotePonedora, RegistroPostura, BajaPonedora, VentaHuevo, GastoPonedora } from './types'
import * as mock from './mockData'

interface PonedorasStore {
  lotes: LotePonedora[]
  posturas: RegistroPostura[]
  bajas: BajaPonedora[]
  ventas: VentaHuevo[]
  gastos: GastoPonedora[]
}

let store: PonedorasStore = {
  lotes: mock.lotesMock,
  posturas: mock.posturasMock,
  bajas: mock.bajasMock,
  ventas: mock.ventasMock,
  gastos: mock.gastosMock,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function gallinasVivas(loteId: string): number {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l) return 0
  const bajas = store.bajas.filter((b) => b.loteId === loteId).reduce((s, b) => s + b.cantidad, 0)
  return l.cantidadInicial - bajas
}

function autoCerrarSiAplica(loteId: string) {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l || !l.activo) return
  if (gallinasVivas(loteId) > 0) return
  store = { ...store, lotes: store.lotes.map((x) => (x.id === loteId ? { ...x, activo: false } : x)) }
  emit()
}

export function addLote(lote: LotePonedora) {
  store = { ...store, lotes: [...store.lotes, lote] }
  emit()
}

export function updateLote(id: string, data: Partial<LotePonedora>) {
  store = { ...store, lotes: store.lotes.map((l) => (l.id === id ? { ...l, ...data } : l)) }
  emit()
}

export function deleteLote(id: string) {
  store = {
    ...store,
    lotes: store.lotes.filter((l) => l.id !== id),
    posturas: store.posturas.filter((p) => p.loteId !== id),
    bajas: store.bajas.filter((b) => b.loteId !== id),
    ventas: store.ventas.filter((v) => v.loteId !== id),
    gastos: store.gastos.filter((g) => g.loteId !== id),
  }
  emit()
}

export function addPostura(reg: RegistroPostura) {
  store = { ...store, posturas: [...store.posturas, reg] }
  emit()
}

export function deletePostura(id: string) {
  store = { ...store, posturas: store.posturas.filter((p) => p.id !== id) }
  emit()
}

export function addBaja(baja: BajaPonedora) {
  const disponibles = gallinasVivas(baja.loteId)
  if (baja.cantidad > disponibles) {
    alert(`No podés registrar ${baja.cantidad} bajas, solo hay ${disponibles} gallinas vivas`)
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

export function addVenta(venta: VentaHuevo) {
  store = { ...store, ventas: [...store.ventas, venta] }
  emit()
}

export function deleteVenta(id: string) {
  store = { ...store, ventas: store.ventas.filter((v) => v.id !== id) }
  emit()
}

export function addGasto(gasto: GastoPonedora) {
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

export function usePonedorasStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const getPosturasByLote = useCallback(
    (loteId: string) => state.posturas.filter((p) => p.loteId === loteId),
    [state.posturas],
  )

  const getBajasByLote = useCallback(
    (loteId: string) => state.bajas.filter((b) => b.loteId === loteId),
    [state.bajas],
  )

  const getVentasByLote = useCallback(
    (loteId: string) => state.ventas.filter((v) => v.loteId === loteId),
    [state.ventas],
  )

  const getGastosByLote = useCallback(
    (loteId: string) => state.gastos.filter((g) => g.loteId === loteId),
    [state.gastos],
  )

  const getLoteById = useCallback(
    (id: string) => state.lotes.find((l) => l.id === id),
    [state.lotes],
  )

  return { state, getPosturasByLote, getBajasByLote, getVentasByLote, getGastosByLote, getLoteById }
}
