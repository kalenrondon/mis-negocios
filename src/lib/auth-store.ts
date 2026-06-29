import { getSession, onAuthChange, signIn, signUp, signOut } from './supabase'

type Listener = () => void

let userId: string | null = null
let loading = true
const listeners = new Set<Listener>()

function emit() {
  listeners.forEach((l) => l())
}

export function getUserId() {
  return userId
}

export function isAuthenticated() {
  return userId !== null
}

export function isAuthLoading() {
  return loading
}

export function subscribeToAuth(listener: Listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function initAuth() {
  const { data } = await getSession()
  userId = data.session?.user?.id ?? null
  loading = false
  emit()

  onAuthChange((newUserId) => {
    userId = newUserId
    emit()
  })
}

export async function login(email: string, password: string) {
  const { error } = await signIn(email, password)
  if (error) throw error
}

export async function register(email: string, password: string) {
  const { error } = await signUp(email, password)
  if (error) throw error
}

export async function logout() {
  await signOut()
}
