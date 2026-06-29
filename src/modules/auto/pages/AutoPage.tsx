import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAutoStore, addTarea, updateTarea, deleteTarea } from '../store'
import type { TareaAuto } from '../types'
import { formatMoney } from '../../trading/utils'
import MoneyInput from '../../../components/MoneyInput'
import { Car, Plus, Trash2, Pencil, ArrowLeft, Filter, Wrench, FileText, Shield, DollarSign, Clock, CheckCircle2 } from 'lucide-react'

const categoriaConfig: Record<TareaAuto['categoria'], { label: string; icon: any; cls: string }> = {
  ahorro: { label: 'Ahorro', icon: DollarSign, cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
  compra: { label: 'Compra', icon: Car, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  mecanica: { label: 'Mecánica', icon: Wrench, cls: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  documentacion: { label: 'Documentación', icon: FileText, cls: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  seguro: { label: 'Seguro', icon: Shield, cls: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300' },
  otro: { label: 'Otro', icon: Filter, cls: 'bg-slate-100 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300' },
}

const estadoConfig: Record<TareaAuto['estado'], { label: string; icon: any; cls: string }> = {
  pendiente: { label: 'Pendiente', icon: Clock, cls: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300' },
  en_progreso: { label: 'En Progreso', icon: Wrench, cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  completado: { label: 'Completado', icon: CheckCircle2, cls: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' },
}

export default function AutoPage() {
  const navigate = useNavigate()
  const { state, ordenadas } = useAutoStore()

  const [editId, setEditId] = useState<string | null>(null)
  const [tarea, setTarea] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [costo, setCosto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [categoria, setCategoria] = useState<TareaAuto['categoria']>('otro')
  const [estado, setEstado] = useState<TareaAuto['estado']>('pendiente')

  const [filtroCategoria, setFiltroCategoria] = useState<TareaAuto['categoria'] | 'todas'>('todas')
  const [filtroEstado, setFiltroEstado] = useState<TareaAuto['estado'] | 'todos'>('todos')

  function resetForm() {
    setEditId(null)
    setTarea('')
    setDescripcion('')
    setCosto('')
    setFecha(new Date().toISOString().slice(0, 10))
    setCategoria('otro')
    setEstado('pendiente')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tarea.trim()) return
    const costoNum = Number(costo) || 0
    if (editId) {
      updateTarea(editId, { tarea: tarea.trim(), descripcion, costo: costoNum, fecha, categoria, estado })
    } else {
      addTarea({ id: crypto.randomUUID(), tarea: tarea.trim(), descripcion, costo: costoNum, fecha, categoria, estado })
    }
    resetForm()
  }

  function startEdit(t: TareaAuto) {
    setEditId(t.id)
    setTarea(t.tarea)
    setDescripcion(t.descripcion)
    setCosto(String(t.costo))
    setFecha(t.fecha)
    setCategoria(t.categoria)
    setEstado(t.estado)
  }

  const filtradas = ordenadas.filter((t) => {
    if (filtroCategoria !== 'todas' && t.categoria !== filtroCategoria) return false
    if (filtroEstado !== 'todos' && t.estado !== filtroEstado) return false
    return true
  })

  const totalTareas = state.length
  const completadas = state.filter((t) => t.estado === 'completado').length
  const costoTotal = state.reduce((s, t) => s + t.costo, 0)
  const costoRestante = state.filter((t) => t.estado !== 'completado').reduce((s, t) => s + t.costo, 0)

  const categorias: TareaAuto['categoria'][] = ['ahorro', 'compra', 'mecanica', 'documentacion', 'seguro', 'otro']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Auto</h1>
        </div>
        <button onClick={() => { resetForm(); document.getElementById('auto-form')?.scrollIntoView({ behavior: 'smooth' }) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Nueva Tarea</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Tareas</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{totalTareas}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Completadas</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{completadas}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Costo Total</p>
          <p className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{formatMoney(costoTotal)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">Costo Restante</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{formatMoney(costoRestante)}</p>
        </div>
      </div>

      <form id="auto-form" onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
        <h2 className="font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nueva'} Tarea</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tarea</label>
            <input required value={tarea} onChange={e => setTarea(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Cambio de aceite" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Costo ($)</label>
            <MoneyInput value={costo} onChange={setCosto} placeholder="0" className="w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha</label>
            <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value as TareaAuto['categoria'])} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {categorias.map((c) => <option key={c} value={c}>{categoriaConfig[c].label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
              <select value={estado} onChange={e => setEstado(e.target.value as TareaAuto['estado'])} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editId ? 'Guardar' : 'Agregar Tarea'}</button>
          {editId && <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg">Cancelar</button>}
        </div>
      </form>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <Filter size={16} className="text-slate-400" />
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value as TareaAuto['categoria'] | 'todas')} className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{categoriaConfig[c].label}</option>)}
        </select>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as TareaAuto['estado'] | 'todos')} className="rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_progreso">En Progreso</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {filtradas.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Car size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay tareas</p>
          <p className="text-sm">Agregá una tarea para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map((t) => {
            const catConf = categoriaConfig[t.categoria]
            const estConf = estadoConfig[t.estado]
            const IconCat = catConf.icon
            const IconEst = estConf.icon
            return (
              <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-slate-800 dark:text-white text-sm leading-tight">{t.tarea}</h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => startEdit(t)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Pencil size={14} /></button>
                    <button onClick={() => { if (confirm('¿Eliminar tarea?')) deleteTarea(t.id) }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={14} /></button>
                  </div>
                </div>
                {t.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2">{t.descripcion}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${catConf.cls}`}><IconCat size={10} />{catConf.label}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${estConf.cls}`}><IconEst size={10} />{estConf.label}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-xs text-slate-400">{new Date(t.fecha + 'T12:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatMoney(t.costo)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
