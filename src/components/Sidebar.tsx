import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bird, Egg, Fish, Beef, LineChart, Shirt, Bell, FileText, Wallet, Sun, Moon, RefreshCw, LogOut } from 'lucide-react'
import { useState, useEffect } from 'react'
import { pushAllToSupabase, pullAllFromSupabase } from '../lib/sync-manager'
import { logout } from '../lib/auth-store'

const sections: { label: string; links: { to: string; label: string; icon: any }[] }[] = [
  { label: '', links: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  ]},
  { label: 'PERSONAL', links: [
    { to: '/recordatorios', label: 'Recordatorios', icon: Bell },
    { to: '/notas', label: 'Notas', icon: FileText },
    { to: '/gastos-personales', label: 'Gastos Personales', icon: Wallet },
  ]},
  { label: 'AGRO', links: [
    { to: '/pollos', label: 'Pollos de Engorde', icon: Bird },
    { to: '/ponedoras', label: 'Gallinas Ponedoras', icon: Egg },
    { to: '/tilapias', label: 'Tilapias', icon: Fish },
    { to: '/vacuno', label: 'Ganado Vacuno', icon: Beef },
  ]},
  { label: 'INVERSIONES', links: [
    { to: '/trading', label: 'Trading', icon: LineChart },
  ]},
  { label: 'OTROS', links: [
    { to: '/bordado', label: 'Bordado', icon: Shirt },
  ]},
]

export default function Sidebar() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('darkMode', String(next))
  }

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col overflow-y-auto">
      <h1 className="text-xl font-bold mb-6 px-2">Mis Negocios</h1>
      <nav className="flex flex-col gap-1 flex-1">
        {sections.map((sec) => (
          <div key={sec.label}>
            {sec.label && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">{sec.label}</p>
            )}
            {sec.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`
                }
              >
                <link.icon size={18} />
                <span className="text-sm">{link.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
      <button
        onClick={async () => {
          setSyncing(true)
          try {
            await pullAllFromSupabase()
            await pushAllToSupabase()
          } catch {}
          setSyncing(false)
        }}
        disabled={syncing}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
        <span className="text-sm">{syncing ? 'Sincronizando...' : 'Sincronizar'}</span>
      </button>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <LogOut size={18} />
        <span className="text-sm">Cerrar Sesión</span>
      </button>
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 mt-1"
      >
        {dark ? <Sun size={18} /> : <Moon size={18} />}
        <span className="text-sm">{dark ? 'Modo Claro' : 'Modo Oscuro'}</span>
      </button>
    </aside>
  )
}
