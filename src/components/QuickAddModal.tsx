import { useState } from 'react'
import { addMovimiento } from '../modules/gastos-personales/store'
import { addRecordatorio } from '../modules/recordatorios/store'
import { addNota } from '../modules/notas/store'
import { X } from 'lucide-react'
import MoneyInput from './MoneyInput'
import type { CategoriaGasto } from '../modules/gastos-personales/types'
import type { Prioridad } from '../modules/recordatorios/types'

const tabs = [
  { id: 'gasto', label: 'Gasto' },
  { id: 'nota', label: 'Nota' },
  { id: 'recordatorio', label: 'Recordatorio' },
] as const

type Tab = (typeof tabs)[number]['id']

const categoriasGasto: CategoriaGasto[] = ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Ropa', 'Hogar', 'Varios']

export default function QuickAddModal({ onClose }: { onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('gasto')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">Agregar Rápido</h2>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
        </div>
        <div className="flex gap-1 mb-5 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${tab === t.id ? 'bg-white dark:bg-slate-600 text-slate-800 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}>{t.label}</button>
          ))}
        </div>
        <div className="min-h-[380px]">
          {tab === 'gasto' && <GastoForm onClose={onClose} />}
          {tab === 'nota' && <NotaForm onClose={onClose} />}
          {tab === 'recordatorio' && <RecordatorioForm onClose={onClose} />}
        </div>
      </div>
    </div>
  )
}

function GastoForm({ onClose }: { onClose: () => void }) {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [categoria, setCategoria] = useState('Comida')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const m = Number(monto)
    if (!descripcion || m <= 0) return
    addMovimiento({ id: crypto.randomUUID(), fecha, tipo, categoria, descripcion, monto: m })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={() => { setTipo('gasto'); setCategoria('Comida') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'gasto' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Gasto</button>
        <button type="button" onClick={() => { setTipo('ingreso'); setCategoria('Sueldo') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'ingreso' ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Ingreso</button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha</label>
          <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Categoría</label>
          <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {(tipo === 'gasto' ? categoriasGasto : ['Sueldo', 'Freelance', 'Inversiones', 'Ventas', 'Otro']).map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
        <input type="text" required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Ej: Supermercado" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monto $</label>
        <MoneyInput value={monto} onChange={setMonto} placeholder="Ej: 5.000" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium">Agregar {tipo === 'gasto' ? 'Gasto' : 'Ingreso'}</button>
    </form>
  )
}

function NotaForm({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    const now = new Date().toISOString()
    addNota({ id: crypto.randomUUID(), titulo: titulo.trim(), contenido: contenido.trim(), createdAt: now, updatedAt: now })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 min-h-[340px] flex flex-col">
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
        <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título de la nota" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contenido</label>
        <textarea value={contenido} onChange={e => setContenido(e.target.value)} rows={3} placeholder="Escribí algo..." className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-full min-h-[80px]" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium">Crear Nota</button>
    </form>
  )
}

function RecordatorioForm({ onClose }: { onClose: () => void }) {
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [hora, setHora] = useState('')
  const [prioridad, setPrioridad] = useState<Prioridad>('media')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    addRecordatorio({ id: crypto.randomUUID(), titulo: titulo.trim(), descripcion: '', fecha, hora: hora || '', prioridad, completado: false })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 min-h-[340px]">
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Título</label>
        <input type="text" required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ej: Pagar factura" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha</label>
          <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Prioridad</label>
          <select value={prioridad} onChange={e => setPrioridad(e.target.value as Prioridad)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Hora <span className="text-slate-400 font-normal">(opcional)</span></label>
        <input type="time" value={hora} onChange={e => setHora(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 text-sm font-medium">Crear Recordatorio</button>
    </form>
  )
}