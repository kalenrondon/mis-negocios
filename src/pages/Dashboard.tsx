import { useState } from 'react'
import { Bird, Egg, Fish, Beef, LineChart, Shirt, Bell, FileText, ArrowRight, Wallet, GraduationCap, Car, ChevronDown, ChevronRight, TrendingDown, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRecordatoriosStore } from '../modules/recordatorios/store'
import { useNotasStore } from '../modules/notas/store'
import { useGastosPersonalesStore } from '../modules/gastos-personales/store'
import QuickAddModal from '../components/QuickAddModal'
import type { Prioridad } from '../modules/recordatorios/types'
import { formatMoney } from '../modules/trading/utils'

const secciones: { titulo: string; icono: string; defaultOpen?: boolean; items: { to: string; label: string; desc: string; icon: any; color: string; bg: string }[] }[] = [
  { titulo: 'Personal', icono: '📋', defaultOpen: true, items: [
    { to: '/gastos-personales', label: 'Gastos Personales', desc: 'Control de gastos diarios', icon: Wallet, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
    { to: '/recordatorios', label: 'Recordatorios', desc: 'Tareas, fechas y pendientes', icon: Bell, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { to: '/notas', label: 'Notas', desc: 'Apuntes rápidos', icon: FileText, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ]},
  { titulo: 'Proyectos', icono: '🚀', defaultOpen: true, items: [
    { to: '/universidad', label: 'Universidad', desc: 'Materias, notas y horarios', icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { to: '/auto', label: 'Trabajo', desc: 'Ahorro, gastos y plan del auto', icon: Car, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
  ]},
  { titulo: 'Negocios Agros', icono: '🌾', items: [
    { to: '/pollos', label: 'Pollos de Engorde', desc: 'Lotes, empacados, ventas y fiados', icon: Bird, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { to: '/ponedoras', label: 'Gallinas Ponedoras', desc: 'Postura, huevos, ventas y gastos', icon: Egg, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { to: '/tilapias', label: 'Tilapias', desc: 'Estanques, ventas y gastos', icon: Fish, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { to: '/vacuno', label: 'Ganado Vacuno', desc: 'Feedlot, ventas, pesajes y gastos', icon: Beef, color: 'text-amber-700', bg: 'bg-amber-50 dark:bg-orange-900/20' },
  ]},
  { titulo: 'Inversiones', icono: '💰', items: [
    { to: '/trading', label: 'Trading', desc: 'Ganancias y pérdidas', icon: LineChart, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
  ]},
  { titulo: 'Otros', icono: '🧵', items: [
    { to: '/bordado', label: 'Bordado', desc: 'Pedidos y clientes', icon: Shirt, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ]},
]

function PrioridadBadge({ p }: { p: Prioridad }) {
  const map: Record<Prioridad, { cls: string }> = {
    alta: { cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    media: { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    baja: { cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  }
  return <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${map[p].cls}`}>{p === 'alta' ? 'Alta' : p === 'media' ? 'Media' : 'Baja'}</span>
}

export default function Dashboard() {
  const { proximos, pendientes } = useRecordatoriosStore()
  const { ordenadas } = useNotasStore()
  const { getResumenDelMes } = useGastosPersonalesStore()
  const [quickOpen, setQuickOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    secciones.forEach(s => { if (s.defaultOpen) initial[s.titulo] = true })
    return initial
  })

  const h = new Date().getHours()
  const saludo = h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
  const hoy = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const mesActual = new Date().toISOString().slice(0, 7)
  const resumen = getResumenDelMes(mesActual)
  const proxRecordatorio = proximos[0]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{saludo} 👋</h1>
        <p className="text-slate-500 dark:text-slate-400 capitalize">{hoy}</p>
      </div>
      {quickOpen && <QuickAddModal onClose={() => setQuickOpen(false)} />}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {proximos.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Bell size={18} className="text-blue-500" /> Próximos recordatorios</h2>
              <Link to="/recordatorios" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5">Ver todos <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2">
              {proximos.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-2 text-sm bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-500 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-200">{r.titulo}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <PrioridadBadge p={r.prioridad} />
                    <span className="text-xs text-slate-400">{new Date(r.fecha + (r.hora ? 'T' + r.hora : '')).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
              {pendientes.length > 5 && <p className="text-xs text-slate-400 text-center pt-1">+{pendientes.length - 5} pendientes más</p>}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"><FileText size={18} className="text-amber-500" /> Notas recientes</h2>
            <Link to="/notas" className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-0.5">Ver todas <ArrowRight size={12} /></Link>
          </div>
          {ordenadas.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Todavía no hay notas</p>
          ) : (
            <div className="space-y-2">
              {ordenadas.slice(0, 4).map((n) => (
                <Link key={n.id} to="/notas" className="block bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2.5 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{n.titulo}</p>
                  {n.contenido && <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{n.contenido}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-[84px] right-5 z-30 hidden lg:block">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-3 min-w-[180px]">
          <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">Resumen del mes</div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <TrendingUp size={14} />
              <span className="font-semibold">{formatMoney(resumen.ingresos)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-red-600">
              <TrendingDown size={14} />
              <span className="font-semibold">{formatMoney(resumen.gastos)}</span>
            </div>
          </div>
          <div className={`text-xs font-semibold mt-1 ${resumen.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            Balance: {resumen.balance >= 0 ? '+' : ''}{formatMoney(resumen.balance)}
          </div>
          {proxRecordatorio && (
            <div className="mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-500 dark:text-slate-400 truncate">
              <span className="text-blue-500 font-medium">📌</span> {proxRecordatorio.titulo}
            </div>
          )}
        </div>
      </div>

      {secciones.map((sec) => {
        const open = expanded[sec.titulo] ?? false
        return (
          <div key={sec.titulo} className="mb-4">
            <button onClick={() => setExpanded(prev => ({ ...prev, [sec.titulo]: !open }))} className="w-full flex items-center justify-between text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3 px-1 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
              <span className="flex items-center gap-2"><span>{sec.icono}</span> {sec.titulo}</span>
              {open ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
            </button>
            {open && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sec.items.map((m) => (
                  <Link
                    key={m.to}
                    to={m.to}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                  >
                    <div className={`w-10 h-10 ${m.bg} rounded-lg flex items-center justify-center mb-2.5`}>
                      <m.icon size={20} className={m.color} />
                    </div>
                    <h3 className="font-semibold text-sm text-slate-800 dark:text-white">{m.label}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
