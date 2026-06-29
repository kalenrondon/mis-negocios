import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bird, Egg, Fish, Beef, LineChart, Shirt, Bell, FileText, Wallet, Sun, Moon, RefreshCw, LogOut, Download, Upload } from 'lucide-react'
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
        onClick={() => {
          const data: Record<string, any> = {}
          for (const [table, key] of Object.entries({
            'pollos-lotes':'pollos_lotes','pollos-bajas':'pollos_bajas','pollos-pesajes':'pollos_pesajes',
            'pollos-ventas':'pollos_ventas','pollos-empacados':'pollos_empacados','pollos-gastos':'pollos_gastos',
            'ponedoras-lotes':'ponedoras_lotes','ponedoras-posturas':'ponedoras_posturas','ponedoras-bajas':'ponedoras_bajas',
            'ponedoras-ventas':'ponedoras_ventas','ponedoras-gastos':'ponedoras_gastos',
            'tilapias-lotes':'tilapias_lotes','tilapias-bajas':'tilapias_bajas','tilapias-cosechas':'tilapias_cosechas',
            'tilapias-gastos':'tilapias_gastos','vacuno-lotes':'vacuno_lotes','vacuno-bajas':'vacuno_bajas',
            'vacuno-ventas':'vacuno_ventas','vacuno-gastos':'vacuno_gastos',
            'trading-operaciones':'trading_operaciones','recordatorios':'recordatorios','notas':'notas',
            'gastos-personales':'gastos_personales','gastos-presupuestos':'gastos_presupuestos',
          })) {
            const raw = localStorage.getItem(key)
            if (raw) data[table] = JSON.parse(raw)
          }
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
          const a = document.createElement('a')
          a.href = URL.createObjectURL(blob)
          a.download = `mis-negocios-backup-${new Date().toISOString().slice(0,10)}.json`
          a.click()
        }}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Download size={18} />
        <span className="text-sm">Exportar Backup</span>
      </button>
      <label className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
        <Upload size={18} />
        <span className="text-sm">Importar Backup</span>
        <input type="file" accept=".json" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0]
          if (!file) return
          const reader = new FileReader()
          reader.onload = (ev) => {
            try {
              const data = JSON.parse(ev.target?.result as string)
              for (const [table, records] of Object.entries(data)) {
                localStorage.setItem(table, JSON.stringify(records))
              }
              window.location.reload()
            } catch {}
          }
          reader.readAsText(file)
        }} />
      </label>
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
