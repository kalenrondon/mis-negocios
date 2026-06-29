import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bird, Egg, Fish, Beef, LineChart, Shirt, Bell, FileText, Wallet, Sun, Moon, RefreshCw, LogOut, Download, Upload, X } from 'lucide-react'
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

function NavItem({ to, end, icon: Icon, label, onClick }: { to: string; end?: boolean; icon: any; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors ${
          isActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
        }`
      }
    >
      <Icon size={20} />
      <span className="text-sm">{label}</span>
    </NavLink>
  )
}

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
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

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-xl font-bold">Mis Negocios</h1>
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white"><X size={22} /></button>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {sections.map((sec) => (
          <div key={sec.label}>
            {sec.label && (
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">{sec.label}</p>
            )}
            {sec.links.map((link) => (
              <NavItem key={link.to} to={link.to} end={link.to === '/'} icon={link.icon} label={link.label} onClick={onClose} />
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
        className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
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
        className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <Download size={20} />
        <span className="text-sm">Exportar Backup</span>
      </button>
      <label className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer">
        <Upload size={20} />
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
        onClick={() => { logout(); onClose() }}
        className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800"
      >
        <LogOut size={20} />
        <span className="text-sm">Cerrar Sesión</span>
      </button>
      <button
        onClick={toggle}
        className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 mt-1"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
        <span className="text-sm">{dark ? 'Modo Claro' : 'Modo Oscuro'}</span>
      </button>
    </>
  )

  return (
    <>
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white min-h-screen p-4 flex-col overflow-y-auto fixed left-0 top-0">
        {sidebarContent}
      </aside>
      {open && (
        <aside className="lg:hidden fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white p-4 flex flex-col overflow-y-auto shadow-2xl">
          {sidebarContent}
        </aside>
      )}
    </>
  )
}
