import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addLote } from '../store'
import { parseMoney } from '../utils'
import NumberInput from '../../../components/NumberInput'
import MoneyInput from '../../../components/MoneyInput'

export default function LoteFormPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [cantidad, setCantidad] = useState('')
  const [fechaInicio, setFechaInicio] = useState(new Date().toISOString().split('T')[0])
  const [costo, setCosto] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    addLote({
      id: crypto.randomUUID(),
      nombre,
      cantidadInicial: Number(cantidad),
      fechaInicio,
      costoInicial: parseMoney(costo),
      activo: true,
    })
    navigate('/tilapias')
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Nuevo Lote de Tilapias</h1>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del lote</label>
          <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ej: Estanque 1" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cantidad inicial</label>
          <NumberInput value={cantidad} onChange={setCantidad} required placeholder="Ej: 500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha de inicio</label>
          <input type="date" required value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo inicial ($)</label>
          <MoneyInput value={costo} onChange={setCosto} placeholder="Ej: 15.000" required />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">Guardar Lote</button>
          <button type="button" onClick={() => navigate('/tilapias')} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">Cancelar</button>
        </div>
      </form>
    </div>
  )
}
