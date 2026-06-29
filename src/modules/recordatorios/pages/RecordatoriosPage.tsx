import { useState, useEffect } from 'react'
import { useRecordatoriosStore, addRecordatorio, updateRecordatorio, deleteRecordatorio, toggleCompletado } from '../store'
import type { Prioridad } from '../types'
import { Bell, Plus, Trash2, Check, Edit2, X, AlertCircle, AlertTriangle, Info, Search } from 'lucide-react'

function PrioridadBadge({ p }: { p: Prioridad }) {
  const map: Record<Prioridad, { label: string; cls: string; icon: typeof AlertCircle }> = {
    alta: { label: 'Alta', cls: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300', icon: AlertCircle },
    media: { label: 'Media', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', icon: AlertTriangle },
    baja: { label: 'Baja', cls: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', icon: Info },
  }
  const m = map[p]
  return <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${m.cls}`}><m.icon size={10} />{m.label}</span>
}

export default function RecordatoriosPage() {
  const { pendientes, completados } = useRecordatoriosStore()
  const [showForm, setShowForm] = useState(false)
  const [busquedaRec, setBusquedaRec] = useState('')

  useEffect(() => {
    const hoy = new Date().toISOString().slice(0, 10)
    const horaActual = new Date().toTimeString().slice(0, 5)
    const vencidos = pendientes.filter(r => r.fecha === hoy && (!r.hora || r.hora <= horaActual))
    for (const r of vencidos) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(r.titulo, { body: r.descripcion || 'Recordatorio para hoy', icon: '/pwa-192x192.png' })
      }
    }
  }, [])
  const [editId, setEditId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('media')

  function resetForm() {
    setTitulo(''); setDescripcion(''); setFecha(new Date().toISOString().slice(0, 10)); setHora(''); setPrioridad('media')
    setEditId(null); setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    if (editId) {
      updateRecordatorio(editId, { titulo: titulo.trim(), descripcion, fecha, hora, prioridad })
    } else {
      addRecordatorio({ id: crypto.randomUUID(), titulo: titulo.trim(), descripcion, fecha, hora, prioridad, completado: false })
    }
    resetForm()
  }

  function startEdit(r: typeof pendientes[0]) {
    setEditId(r.id); setTitulo(r.titulo); setDescripcion(r.descripcion); setFecha(r.fecha); setHora(r.hora); setPrioridad(r.prioridad)
    setShowForm(true)
  }

  const hoy = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Recordatorios</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Nuevo</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nuevo'} Recordatorio</h2>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
            <input required value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Comprar insumos" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción (opcional)</label>
            <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hora (opcional)</label>
              <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Prioridad</label>
              <select value={prioridad} onChange={e => setPrioridad(e.target.value as Prioridad)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editId ? 'Guardar' : 'Agregar Recordatorio'}</button>
        </form>
      )}

      {(pendientes.length > 0 || completados.length > 0) && (
        <div className="relative max-w-xs mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={busquedaRec} onChange={e => setBusquedaRec(e.target.value)} placeholder="Buscar recordatorios..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}
      {pendientes.length === 0 && completados.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Bell size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay recordatorios</p>
          <p className="text-sm">Creá uno nuevo para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendientes.filter(r => !busquedaRec || r.titulo.toLowerCase().includes(busquedaRec.toLowerCase()) || (r.descripcion || '').toLowerCase().includes(busquedaRec.toLowerCase())).map((r) => (
            <div key={r.id} className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border p-4 ${r.fecha === hoy ? 'border-blue-300 dark:border-blue-700' : 'border-slate-200 dark:border-slate-700'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button onClick={() => toggleCompletado(r.id)} className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${r.completado ? 'bg-green-500 border-green-500' : 'border-slate-300 dark:border-slate-500 hover:border-green-400'}`}>
                    {r.completado && <Check size={12} className="text-white" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-medium text-slate-800 dark:text-white ${r.completado ? 'line-through opacity-50' : ''}`}>{r.titulo}</span>
                      <PrioridadBadge p={r.prioridad} />
                    </div>
                    {r.descripcion && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{r.descripcion}</p>}
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span>{new Date(r.fecha + 'T' + (r.hora || '00:00')).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                      {r.hora && <span>{r.hora.slice(0, 5)} hs</span>}
                      {r.fecha === hoy && <span className="text-blue-500 font-medium">Hoy</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => startEdit(r)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 size={14} /></button>
                  <button onClick={() => { if (confirm('¿Eliminar recordatorio?')) deleteRecordatorio(r.id) }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}

          {completados.length > 0 && (
            <>
              <div className="flex items-center gap-2 pt-4 pb-2">
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Completados ({completados.length})</span>
                <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
              </div>
              {completados.filter(r => !busquedaRec || r.titulo.toLowerCase().includes(busquedaRec.toLowerCase()) || (r.descripcion || '').toLowerCase().includes(busquedaRec.toLowerCase())).map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 opacity-60 hover:opacity-100 transition-opacity">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button onClick={() => toggleCompletado(r.id)} className="mt-0.5 w-5 h-5 rounded-full border-2 border-green-500 bg-green-500 flex items-center justify-center shrink-0"><Check size={12} className="text-white" /></button>
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-slate-500 dark:text-slate-400 line-through">{r.titulo}</span>
                        <div className="text-xs text-slate-400 mt-0.5">{new Date(r.fecha + 'T' + (r.hora || '00:00')).toLocaleDateString('es-AR')}</div>
                      </div>
                    </div>
                    <button onClick={() => { if (confirm('¿Eliminar recordatorio?')) deleteRecordatorio(r.id) }} className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
