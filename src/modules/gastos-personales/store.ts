import { useSyncExternalStore } from 'react'
import type { MovimientoPersonal, PresupuestoMensual } from './types'

const STORAGE_KEY = 'gastos-personales'
const BUDGET_KEY = 'gastos-presupuestos'

;(() => {
  const old = localStorage.getItem('movimientosPersonales')
  if (old) { localStorage.setItem(STORAGE_KEY, old); localStorage.removeItem('movimientosPersonales') }
  const oldBudget = localStorage.getItem('presupuestoMensual')
  if (oldBudget) { localStorage.setItem(BUDGET_KEY, oldBudget); localStorage.removeItem('presupuestoMensual') }
})()

let store: MovimientoPersonal[] = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as MovimientoPersonal[] }
  catch { return [] }
})()

let presupuestoStore: PresupuestoMensual[] = (() => {
  try { return JSON.parse(localStorage.getItem(BUDGET_KEY) || '[]') as PresupuestoMensual[] }
  catch { return [] }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function persistMovimientos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

function persistPresupuestos() {
  localStorage.setItem(BUDGET_KEY, JSON.stringify(presupuestoStore))
}

export function addMovimiento(m: MovimientoPersonal) {
  store = [...store, m]
  persistMovimientos()
  emit()
}

export function deleteMovimiento(id: string) {
  store = store.filter((m) => m.id !== id)
  persistMovimientos()
  emit()
}

export function setPresupuesto(mes: string, presupuesto: number) {
  const idx = presupuestoStore.findIndex((p) => p.mes === mes)
  if (idx >= 0) {
    presupuestoStore = presupuestoStore.map((p) => (p.mes === mes ? { ...p, presupuesto } : p))
  } else {
    presupuestoStore = [...presupuestoStore, { mes, presupuesto }]
  }
  persistPresupuestos()
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return store
}

export function useGastosPersonalesStore() {
  const movimientos = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  return {
    state: movimientos,
    totalIngresos: movimientos.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0),
    totalGastos: movimientos.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0),
    getMovimientosDelMes: (mes: string) => movimientos.filter((m) => m.fecha.startsWith(mes)),
    getResumenDelMes: (mes: string) => {
      const delMes = movimientos.filter((m) => m.fecha.startsWith(mes))
      const ingresos = delMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.monto, 0)
      const gastos = delMes.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
      const porCategoria = [...new Set(delMes.map((m) => m.categoria))].map((cat) => {
        const items = delMes.filter((m) => m.categoria === cat)
        return { categoria: cat, total: items.reduce((s, m) => s + m.monto, 0), cantidad: items.length, tipo: items[0]?.tipo || 'gasto' }
      }).sort((a, b) => b.total - a.total)
      const presupuesto = presupuestoStore.find((p) => p.mes === mes)?.presupuesto || 0
      return { ingresos, gastos, balance: ingresos - gastos, porCategoria, presupuesto, usadoPresupuesto: presupuesto > 0 ? (gastos / presupuesto) * 100 : 0 }
    },
  }
}
