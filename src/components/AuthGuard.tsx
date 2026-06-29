import { useSyncExternalStore, useEffect, useState, useRef } from 'react'
import { subscribeToAuth, isAuthenticated, isAuthLoading, initAuth } from '../lib/auth-store'
import { pullAllFromSupabase } from '../lib/sync-manager'
import LoginPage from '../pages/LoginPage'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const auth = useSyncExternalStore(subscribeToAuth, isAuthenticated, isAuthenticated)
  const loading = useSyncExternalStore(subscribeToAuth, isAuthLoading, isAuthLoading)
  const [initialized, setInitialized] = useState(false)
  const pulled = useRef(false)

  useEffect(() => {
    initAuth().then(() => setInitialized(true))
  }, [])

  useEffect(() => {
    if (auth && !pulled.current) {
      pulled.current = true
      pullAllFromSupabase()
    }
    if (!auth) pulled.current = false
  }, [auth])

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">Cargando...</p>
      </div>
    )
  }

  if (!auth) return <LoginPage />
  return <>{children}</>
}
