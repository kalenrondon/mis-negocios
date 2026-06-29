import { getUserId } from './auth-store'
import { supabase } from './supabase'
import { LOCAL_KEYS } from './sync-manager'

const SYNC_KEYS = new Set(Object.values(LOCAL_KEYS))

let ignoreNext = false
let timer: ReturnType<typeof setTimeout> | null = null

export function setIgnoreNextSync() {
  ignoreNext = true
}

async function doPush() {
  const userId = getUserId()
  if (!userId) return
  for (const [table, key] of Object.entries(LOCAL_KEYS)) {
    const raw = localStorage.getItem(key)
    if (!raw) continue
    const records = JSON.parse(raw)
    for (const record of records) {
      const { error } = await supabase.from(table).upsert(
        { ...record, user_id: userId },
        { onConflict: 'id' }
      )
      if (error) console.error(`Auto-sync error ${table}:`, error)
    }
  }
}

function schedulePush() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    if (!getUserId()) return
    doPush()
  }, 2000)
}

export function initAutoSync() {
  const original = localStorage.setItem.bind(localStorage)
  localStorage.setItem = function (key, value) {
    original(key, value)
    if (ignoreNext) { ignoreNext = false; return }
    if ((window as any).__ignoreSync) return
    if (SYNC_KEYS.has(key)) schedulePush()
  }
}
