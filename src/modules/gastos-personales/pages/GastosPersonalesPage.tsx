import { useState } from 'react'
import { useGastosPersonalesStore, addMovimiento, deleteMovimiento, setPresupuesto } from '../store'
import { formatMoney } from '../../trading/utils'
import type { CategoriaGasto } from '../types'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, Trash2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import MoneyInput from '../../../components/MoneyInput'

const categoriasGasto: CategoriaGasto[] = ['Comida', 'Transporte', 'Servicios', 'Entretenimiento', 'Salud', 'Ropa', 'Hogar', 'Varios']
const categoriasIngreso = ['Sueldo', 'Freelance', 'Inversiones', 'Ventas', 'Otro']

const coloresCat: Record<string, string> = {
  Comida: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Transporte: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  Servicios: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  Entretenimiento: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Salud: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Ropa: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Hogar: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  Sueldo: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  Freelance: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300',
  Inversiones: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  Ventas: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
  Otro: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  Varios: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

function labelMes(mes: string): string {
  const [y, m] = mes.split('-').map(Number)
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return `${meses[m - 1]} ${y}`
}

function cambiarMes(mes: string, dif: number): string {
  const d = new Date(mes + '-01')
  d.setMonth(d.getMonth() + dif)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function GastosPersonalesPageInner() {
  const navigate = useNavigate()
  const { getResumenDelMes, getMovimientosDelMes } = useGastosPersonalesStore()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [categoria, setCategoria] = useState('Comida')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7))
  const [editPresupuesto, setEditPresupuesto] = useState(false)
  const [presupuestoInput, setPresupuestoInput] = useState('')

  const resumen = getResumenDelMes(mesSeleccionado)
  const movimientos = getMovimientosDelMes(mesSeleccionado)
  const ordenados = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))

  const gastosCat = resumen.porCategoria.filter((c) => c.tipo === 'gasto')
  const maxGasto = Math.max(...gastosCat.map((c) => c.total), 1)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const m = Number(monto)
    if (!descripcion || m <= 0) return
    addMovimiento({ id: crypto.randomUUID(), fecha, tipo, categoria, descripcion, monto: m })
    setDescripcion(''); setMonto('')
  }

  function guardarPresupuesto() {
    const val = Number(presupuestoInput)
    if (val > 0) setPresupuesto(mesSeleccionado, val)
    setEditPresupuesto(false)
  }

  return (
    <div>
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Dashboard</button>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Finanzas Personales</h1>

      <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3">
        <button onClick={() => setMesSeleccionado(cambiarMes(mesSeleccionado, -1))} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronLeft size={20} /></button>
        <h2 className="font-semibold text-slate-700 dark:text-slate-200 text-lg">{labelMes(mesSeleccionado)}</h2>
        <button onClick={() => setMesSeleccionado(cambiarMes(mesSeleccionado, 1))} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><ChevronRight size={20} /></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-green-600 mb-1"><TrendingUp size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ingresos</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-green-600">{formatMoney(resumen.ingresos)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-red-600 mb-1"><TrendingDown size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Gastos</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-red-600">{formatMoney(resumen.gastos)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><DollarSign size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Balance</span></div>
          <p className={`text-xl lg:text-2xl font-bold truncate ${resumen.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {resumen.balance >= 0 ? '+' : ''}{formatMoney(resumen.balance)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><PiggyBank size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ahorro</span></div>
          <p className={`text-xl lg:text-2xl font-bold truncate ${resumen.ingresos > 0 ? (resumen.balance >= 0 ? 'text-green-600' : 'text-red-600') : 'text-slate-400'}`}>
            {resumen.ingresos > 0 ? ((resumen.balance / resumen.ingresos) * 100).toFixed(0) + '%' : '—'}
          </p>
        </div>
      </div>

      {resumen.presupuesto > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Presupuesto del mes</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {formatMoney(resumen.gastos)} / {formatMoney(resumen.presupuesto)}
              <span className={`ml-2 font-medium ${resumen.usadoPresupuesto > 100 ? 'text-red-500' : resumen.usadoPresupuesto > 80 ? 'text-amber-500' : 'text-green-500'}`}>
                ({resumen.usadoPresupuesto.toFixed(0)}%)
              </span>
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${resumen.usadoPresupuesto > 100 ? 'bg-red-500' : resumen.usadoPresupuesto > 80 ? 'bg-amber-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min(resumen.usadoPresupuesto, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Plus size={18} /> Nuevo Movimiento</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha</label>
              <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => { setTipo('gasto'); setCategoria('Comida') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'gasto' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Gasto</button>
                <button type="button" onClick={() => { setTipo('ingreso'); setCategoria('Sueldo') }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'ingreso' ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Ingreso</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {(tipo === 'gasto' ? categoriasGasto : categoriasIngreso).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monto $</label>
              <MoneyInput value={monto} onChange={setMonto} placeholder={tipo === 'gasto' ? 'Ej: 5.000' : 'Ej: 50.000'} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
              <div className="flex gap-2">
                <input type="text" required value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder={tipo === 'gasto' ? 'Ej: Supermercado' : 'Ej: Sueldo Junio'} className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium whitespace-nowrap">Agregar</button>
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Resumen</h2>
            <button onClick={() => { setPresupuestoInput(String(resumen.presupuesto || '')); setEditPresupuesto(!editPresupuesto) }} className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
              {editPresupuesto ? 'Cancelar' : resumen.presupuesto > 0 ? 'Editar Presup.' : '+ Presupuesto'}
            </button>
          </div>

          {editPresupuesto && (
            <div className="flex gap-2 mb-3">
              <MoneyInput value={presupuestoInput} onChange={setPresupuestoInput} placeholder="Presupuesto mensual" />
              <button onClick={guardarPresupuesto} className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap">OK</button>
            </div>
          )}

          {resumen.porCategoria.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Sin movimientos</p>
          ) : (
            <div className="space-y-3">
              {resumen.porCategoria
                .sort((a, b) => {
                  if (a.tipo !== b.tipo) return a.tipo === 'ingreso' ? -1 : 1
                  return b.total - a.total
                })
                .map((c) => (
                  <div key={c.categoria}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${coloresCat[c.categoria] || coloresCat['Varios']}`}>{c.categoria}</span>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <span className={`font-medium ${c.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                          {c.tipo === 'ingreso' ? '+' : '-'}{formatMoney(c.total)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">({c.cantidad})</span>
                      </div>
                    </div>
                    {c.tipo === 'gasto' && (
                      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                        <div className="h-full rounded-full bg-rose-500" style={{ width: `${(c.total / maxGasto) * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Movimientos de {labelMes(mesSeleccionado)}</h2>
        {ordenados.length === 0 ? (
          <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Sin movimientos este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-2 pr-3 text-xs font-medium uppercase tracking-wider">Fecha</th>
                  <th className="text-left py-2 pr-3 text-xs font-medium uppercase tracking-wider">Tipo</th>
                  <th className="text-left py-2 pr-3 text-xs font-medium uppercase tracking-wider">Categoría</th>
                  <th className="text-left py-2 pr-3 text-xs font-medium uppercase tracking-wider">Descripción</th>
                  <th className="text-right py-2 pr-3 text-xs font-medium uppercase tracking-wider">Monto</th>
                  <th className="text-right py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {ordenados.map((m) => (
                  <tr key={m.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{m.fecha}</td>
                    <td className="py-2 pr-3">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${m.tipo === 'ingreso' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                      </span>
                    </td>
                    <td className="py-2 pr-3">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${coloresCat[m.categoria] || coloresCat['Varios']}`}>{m.categoria}</span>
                    </td>
                    <td className="py-2 pr-3 text-slate-700 dark:text-slate-200 max-w-[200px] truncate">{m.descripcion}</td>
                    <td className={`text-right py-2 pr-3 font-medium ${m.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.tipo === 'ingreso' ? '+' : '-'}{formatMoney(m.monto)}
                    </td>
                    <td className="text-right py-2 pr-3">
                      <button onClick={() => { if (confirm('¿Eliminar?')) deleteMovimiento(m.id) }} className="text-red-300 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GastosPersonalesPage() {
  return <GastosPersonalesPageInner />
}
