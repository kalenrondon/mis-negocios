import { useSyncExternalStore } from 'react'
import type { QuickEntry, AppSettings } from './types'

const STORAGE_KEY = 'quick-entries'
const SETTINGS_KEY = 'app-settings'

let store: QuickEntry[] = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as QuickEntry[] }
  catch { return [] }
})()

const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function addQuickEntries(entries: QuickEntry[]) {
  store = [...entries, ...store]
  persist()
  emit()
}

export function deleteQuickEntry(id: string) {
  store = store.filter((e) => e.id !== id)
  persist()
  emit()
}

export function clearQuickEntries() {
  store = []
  persist()
  emit()
}

export function getSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return { openAiKey: '', apiToken: '' }
}

export function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
}

export function generateApiToken(): string {
  return crypto.randomUUID()
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function getSnapshot() {
  return store
}

export function useQuickEntries() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return {
    entries,
    totalGastos: entries.filter((e) => e.tipo === 'gasto').reduce((s, e) => s + e.monto, 0),
    totalIngresos: entries.filter((e) => e.tipo === 'ingreso').reduce((s, e) => s + e.monto, 0),
  }
}

export const API_URL = `${window.location.origin}/api/quick-entry`

export async function sendQuickEntry(text: string, device = 'web') {
  const settings = getSettings()
  if (!settings.openAiKey) throw new Error('Configurá tu API Key de OpenAI en Ajustes')
  if (!settings.apiToken) throw new Error('Generá un token de API en Ajustes')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiToken}`,
      'X-OpenAI-Key': settings.openAiKey,
      'X-User-Id': settings.apiToken,
    },
    body: JSON.stringify({ text, device }),
  })

  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Error al procesar')

  if (data.data?.length) {
    addQuickEntries(data.data)
  }

  return data
}

export async function sendManualEntry(params: {
  tipo: string
  monto: number
  categoria: string
  descripcion: string
  device?: string
}) {
  const settings = getSettings()
  if (!settings.apiToken) throw new Error('Generá un token de API en Ajustes')

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiToken}`,
      'X-User-Id': settings.apiToken,
    },
    body: JSON.stringify({ ...params, device: params.device || 'shortcut' }),
  })

  const data = await res.json()
  if (!data.success) throw new Error(data.error || 'Error al procesar')

  if (data.data?.length) {
    addQuickEntries(data.data)
  }

  return data
}