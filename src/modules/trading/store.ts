import { useSyncExternalStore, useCallback } from 'react'
import type { Trade, ResumenActivo, ResumenPeriodo } from './types'
import { tradesMock } from './mockData'

interface TradingStore {
  trades: Trade[]
}

let store: TradingStore = {
  trades: tradesMock,
}

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function addTrade(trade: Trade) {
  store = { ...store, trades: [...store.trades, trade] }
  emit()
}

export function deleteTrade(id: string) {
  store = { ...store, trades: store.trades.filter((t) => t.id !== id) }
  emit()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return store
}

function getWeekNumber(d: Date): string {
  const start = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - start.getTime()
  const week = Math.ceil((diff / 86400000 + start.getDay() + 1) / 7)
  return `W${week}`
}

function getSemanaLabel(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00')
  const week = getWeekNumber(d)
  const lunes = new Date(d)
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))
  const domingo = new Date(lunes)
  domingo.setDate(lunes.getDate() + 6)
  const fmt = (date: Date) => date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
  return `${week} (${fmt(lunes)} - ${fmt(domingo)})`
}

function getDiaLabel(fecha: string): string {
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export function useTradingStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const getTradesByActivo = useCallback((activo: string) => state.trades.filter((t) => t.activo === activo), [state.trades])

  const tradesOrdenados = [...state.trades].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))

  const totalGanado = state.trades.filter((t) => t.tipo === 'ganada').reduce((s, t) => s + t.monto, 0)
  const totalPerdido = state.trades.filter((t) => t.tipo === 'perdida').reduce((s, t) => s + t.monto, 0)
  const balance = totalGanado - totalPerdido
  const cantidadTrades = state.trades.length

  const resumenActivos: ResumenActivo[] = (() => {
    const activos = [...new Set(state.trades.map((t) => t.activo))]
    return activos.map((activo) => {
      const ganado = state.trades.filter((t) => t.tipo === 'ganada' && t.activo === activo).reduce((s, t) => s + t.monto, 0)
      const perdido = state.trades.filter((t) => t.tipo === 'perdida' && t.activo === activo).reduce((s, t) => s + t.monto, 0)
      return {
        activo,
        ganado,
        perdido,
        neto: ganado - perdido,
        trades: state.trades.filter((t) => t.activo === activo).length,
      }
    })
  })()

  function getResumenPeriodos(tipo: 'dia' | 'semana' | 'mes' | 'anio'): ResumenPeriodo[] {
    const periodMap = new Map<string, Trade[]>()

    for (const t of state.trades) {
      let key: string
      const d = new Date(t.fecha + 'T12:00:00')
      if (tipo === 'dia') key = t.fecha
      else if (tipo === 'semana') {
        const y = d.getFullYear()
        const w = getWeekNumber(d)
        key = `${y}-${w}`
      } else if (tipo === 'mes') {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      } else {
        key = String(d.getFullYear())
      }
      const arr = periodMap.get(key) || []
      arr.push(t)
      periodMap.set(key, arr)
    }

    const sortedKeys = [...periodMap.keys()].sort()

    return sortedKeys.map((key) => {
      const trades = periodMap.get(key)!
      const ganado = trades.filter((t) => t.tipo === 'ganada').reduce((s, t) => s + t.monto, 0)
      const perdido = trades.filter((t) => t.tipo === 'perdida').reduce((s, t) => s + t.monto, 0)

      let label: string
      if (tipo === 'dia') label = getDiaLabel(key)
      else if (tipo === 'semana') label = getSemanaLabel(trades[0].fecha)
      else if (tipo === 'mes') {
        const [y, m] = key.split('-')
        const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
        label = `${meses[parseInt(m) - 1]} ${y}`
      } else {
        label = key
      }

      return {
        key,
        label,
        ganado,
        perdido,
        neto: ganado - perdido,
        trades: trades.length,
      }
    })
  }

  return {
    state,
    tradesOrdenados,
    getTradesByActivo,
    totalGanado,
    totalPerdido,
    balance,
    cantidadTrades,
    resumenActivos,
    getResumenPeriodos,
  }
}
