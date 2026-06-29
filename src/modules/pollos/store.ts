import { useSyncExternalStore, useCallback } from 'react'
import type { Lote, Baja, Pesaje, Venta, Empacado, Gasto } from './types'
import { lotesMock, bajasMock, pesajesMock, ventasMock, empacadosMock, gastosMock } from './mockData'

interface PollosStore {
  lotes: Lote[]
  bajas: Baja[]
  pesajes: Pesaje[]
  ventas: Venta[]
  empacados: Empacado[]
  gastos: Gasto[]
}

let store: PollosStore = {
  lotes: lotesMock,
  bajas: bajasMock,
  pesajes: pesajesMock,
  ventas: ventasMock,
  empacados: empacadosMock,
  gastos: gastosMock,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function vivosActuales(loteId: string): number {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l) return 0
  const bajas = store.bajas.filter((b) => b.loteId === loteId).reduce((s, b) => s + b.cantidad, 0)
  const empacados = store.empacados.filter((e) => e.loteId === loteId).reduce((s, e) => s + e.cantidad, 0)
  const vendidosVivos = store.ventas.filter((v) => v.loteId === loteId && v.tipo === 'vivo').reduce((s, v) => s + v.cantidad, 0)
  return l.cantidadInicial - bajas - empacados - vendidosVivos
}

function empacadosActuales(loteId: string): number {
  const empacados = store.empacados.filter((e) => e.loteId === loteId).reduce((s, e) => s + e.cantidad, 0)
  const vendidosEmp = store.ventas.filter((v) => v.loteId === loteId && v.tipo === 'empacado').reduce((s, v) => s + v.cantidad, 0)
  return empacados - vendidosEmp
}

function autoCerrarSiAplica(loteId: string) {
  const l = store.lotes.find((x) => x.id === loteId)
  if (!l || !l.activo) return
  if (vivosActuales(loteId) > 0 || empacadosActuales(loteId) > 0) return
  const adeuda = store.ventas.some((v) => v.loteId === loteId && v.fiado && v.pesoTotal * v.precioKg - v.pagado > 0)
  if (adeuda) return
  store = { ...store, lotes: store.lotes.map((x) => (x.id === loteId ? { ...x, activo: false } : x)) }
  emit()
}

export function addLote(lote: Lote) {
  store = { ...store, lotes: [...store.lotes, lote] }
  emit()
}

export function updateLote(id: string, data: Partial<Lote>) {
  store = { ...store, lotes: store.lotes.map((l) => (l.id === id ? { ...l, ...data } : l)) }
  emit()
}

export function deleteLote(id: string) {
  store = {
    ...store,
    lotes: store.lotes.filter((l) => l.id !== id),
    bajas: store.bajas.filter((b) => b.loteId !== id),
    pesajes: store.pesajes.filter((p) => p.loteId !== id),
    ventas: store.ventas.filter((v) => v.loteId !== id),
    empacados: store.empacados.filter((e) => e.loteId !== id),
    gastos: store.gastos.filter((g) => g.loteId !== id),
  }
  emit()
}

export function addBaja(baja: Baja) {
  const disponibles = vivosActuales(baja.loteId)
  if (baja.cantidad > disponibles) {
    alert(`No podés registrar ${baja.cantidad} bajas, solo hay ${disponibles} pollos vivos`)
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

export function addPesaje(pesaje: Pesaje) {
  store = { ...store, pesajes: [...store.pesajes, pesaje] }
  emit()
}

export function deletePesaje(id: string) {
  store = { ...store, pesajes: store.pesajes.filter((p) => p.id !== id) }
  emit()
}

export function addVenta(venta: Venta) {
  if (venta.tipo === 'vivo') {
    const disponibles = vivosActuales(venta.loteId)
    if (venta.cantidad > disponibles) {
      alert(`No podés vender ${venta.cantidad} pollos vivos, solo hay ${disponibles} disponibles`)
      return
    }
  } else {
    const disponibles = empacadosActuales(venta.loteId)
    if (venta.cantidad > disponibles) {
      alert(`No podés vender ${venta.cantidad} empacados, solo hay ${disponibles} en stock`)
      return
    }
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

export function updateVenta(id: string, data: Partial<Venta>) {
  store = { ...store, ventas: store.ventas.map((v) => (v.id === id ? { ...v, ...data } : v)) }
  emit()
}

export function addEmpacado(emp: Empacado) {
  const disponibles = vivosActuales(emp.loteId)
  if (emp.cantidad > disponibles) {
    alert(`No podés empacar ${emp.cantidad} pollos, solo hay ${disponibles} vivos`)
    return
  }
  store = { ...store, empacados: [...store.empacados, emp] }
  emit()
  autoCerrarSiAplica(emp.loteId)
}

export function deleteEmpacado(id: string) {
  const e = store.empacados.find((x) => x.id === id)
  store = { ...store, empacados: store.empacados.filter((p) => p.id !== id) }
  emit()
  if (e) autoCerrarSiAplica(e.loteId)
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

export function usePollosStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const getBajasByLote = useCallback((loteId: string) => state.bajas.filter((b) => b.loteId === loteId), [state.bajas])
  const getPesajesByLote = useCallback((loteId: string) => state.pesajes.filter((p) => p.loteId === loteId), [state.pesajes])
  const getVentasByLote = useCallback((loteId: string) => state.ventas.filter((v) => v.loteId === loteId), [state.ventas])
  const getEmpacadosByLote = useCallback((loteId: string) => state.empacados.filter((p) => p.loteId === loteId), [state.empacados])
  const getGastosByLote = useCallback((loteId: string) => state.gastos.filter((g) => g.loteId === loteId), [state.gastos])
  const getLoteById = useCallback((id: string) => state.lotes.find((l) => l.id === id), [state.lotes])

  return { state, getBajasByLote, getPesajesByLote, getVentasByLote, getEmpacadosByLote, getGastosByLote, getLoteById }
}

export function getVivosActuales(loteId: string) { return vivosActuales(loteId) }
export function getEmpacadosActuales(loteId: string) { return empacadosActuales(loteId) }
