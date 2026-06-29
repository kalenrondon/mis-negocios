import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Bird, Egg, Fish, Beef, LineChart, Shirt, Bell, FileText, Wallet, Sun, Moon, RefreshCw, LogOut, Download, Upload, X, GraduationCap, Car, Sprout, ChevronDown, ChevronRight, Settings, Archive } from 'lucide-react'
import { useState, useEffect } from 'react'
import { pushAllToSupabase, pullAllFromSupabase, LOCAL_KEYS } from '../lib/sync-manager'
import { logout } from '../lib/auth-store'

const agroItems = [
  { to: '/pollos', label: 'Pollos de Engorde', icon: Bird },
  { to: '/ponedoras', label: 'Gallinas Ponedoras', icon: Egg },
  { to: '/tilapias', label: 'Tilapias', icon: Fish },
  { to: '/vacuno', label: 'Ganado Vacuno', icon: Beef },
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
  const [agroOpen, setAgroOpen] = useState(false)
  const [avanzadoOpen, setAvanzadoOpen] = useState(false)

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

  const isAgroActive = agroItems.some(item => window.location.hash.includes(item.to))

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between mb-6 px-2">
        <h1 className="text-xl font-bold">Mis Negocios</h1>
        <button onClick={onClose} className="lg:hidden p-1 text-slate-400 hover:text-white"><X size={22} /></button>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">Dashboard</p>
          <NavItem to="/" end icon={LayoutDashboard} label="Dashboard" onClick={onClose} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">MÁS USADO</p>
          <NavItem to="/gastos-personales" icon={Wallet} label="Gastos Personales" onClick={onClose} />
          <NavItem to="/recordatorios" icon={Bell} label="Recordatorios" onClick={onClose} />
          <NavItem to="/notas" icon={FileText} label="Notas" onClick={onClose} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">PROYECTOS</p>
          <NavItem to="/universidad" icon={GraduationCap} label="Universidad" onClick={onClose} />
          <NavItem to="/auto" icon={Car} label="Trabajo" onClick={onClose} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">AGRO</p>
          <button onClick={() => setAgroOpen(!agroOpen)} className={`w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors ${isAgroActive ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><Sprout size={20} /><span className="text-sm">Agro</span></span>
            {agroOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {agroOpen && (
            <div className="ml-3 mt-1 flex flex-col gap-0.5">
              {agroItems.map(item => <NavItem key={item.to} to={item.to} icon={item.icon} label={item.label} onClick={() => { onClose(); setAgroOpen(false) }} />)}
            </div>
          )}
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">INVERSIONES</p>
          <NavItem to="/trading" icon={LineChart} label="Trading" onClick={onClose} />
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-3 pb-1">OTROS</p>
          <NavItem to="/bordado" icon={Shirt} label="Bordado" onClick={onClose} />
          <NavItem to="/ajustes" icon={Settings} label="Ajustes" onClick={onClose} />
        </div>
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
      <button onClick={() => setAvanzadoOpen(!avanzadoOpen)} className="w-full flex items-center justify-between gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 mt-1">
        <span className="flex items-center gap-3"><Archive size={18} /><span className="text-sm">Avanzado</span></span>
        {avanzadoOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </button>
      {avanzadoOpen && (
        <>
          <button onClick={() => {
            const data: Record<string, any> = {}
            for (const [, localKey] of Object.entries(LOCAL_KEYS)) {
              const raw = localStorage.getItem(localKey)
              if (raw) data[localKey] = JSON.parse(raw)
            }
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = `mis-negocios-backup-${new Date().toISOString().slice(0,10)}.json`
            a.click()
          }} className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 ml-4">
            <Download size={16} />
            <span className="text-sm">Exportar Backup</span>
          </button>
          <label className="flex items-center gap-3 px-3 py-3 min-h-[44px] rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer ml-4">
            <Upload size={16} />
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
        </>
      )}
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
      <aside className="hidden lg:flex w-64 bg-slate-900 text-white h-screen p-4 flex-col overflow-y-auto fixed left-0 top-0 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded">
        {sidebarContent}
      </aside>
      {open && (
        <aside className="lg:hidden fixed inset-y-0 left-0 z-30 w-72 bg-slate-900 text-white p-4 flex flex-col overflow-y-auto shadow-2xl [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded">
          {sidebarContent}
        </aside>
      )}
    </>
  )
}
