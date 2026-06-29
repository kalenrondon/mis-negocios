import { useState } from 'react'
import { useGastosPersonalesStore, addMovimiento, deleteMovimiento, setPresupuesto, deletePresupuesto, addMeta, updateMeta, deleteMeta } from '../store'
import { formatMoney } from '../../trading/utils'
import type { CategoriaGasto, TipoMeta } from '../types'
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, Trash2, ArrowLeft, ChevronLeft, ChevronRight, Target, HandCoins, Wallet, Goal, Pencil, Search } from 'lucide-react'
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
  const { getResumenDelMes, getMovimientosDelMes, metas } = useGastosPersonalesStore()
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [tipo, setTipo] = useState<'gasto' | 'ingreso'>('gasto')
  const [categoria, setCategoria] = useState('Comida')
  const [descripcion, setDescripcion] = useState('')
  const [monto, setMonto] = useState('')
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().toISOString().slice(0, 7))
  const [editPresupuesto, setEditPresupuesto] = useState(false)
  const [presupuestoInput, setPresupuestoInput] = useState('')
  const [busquedaMov, setBusquedaMov] = useState('')
  const [mostrarMetas, setMostrarMetas] = useState(false)
  const [metaForm, setMetaForm] = useState<{ id?: string; tipo: TipoMeta; nombre: string; montoObjetivo: string; montoActual: string; fechaLimite: string; notas: string; estado: 'activo' | 'completado' | 'cancelado' }>({
    tipo: 'meta', nombre: '', montoObjetivo: '', montoActual: '', fechaLimite: '', notas: '', estado: 'activo'
  })

  const resumen = getResumenDelMes(mesSeleccionado)
  const movimientos = getMovimientosDelMes(mesSeleccionado)
  const filtradosMov = busquedaMov
    ? movimientos.filter(m => m.descripcion.toLowerCase().includes(busquedaMov.toLowerCase()) || m.categoria.toLowerCase().includes(busquedaMov.toLowerCase()))
    : movimientos
  const ordenados = [...filtradosMov].sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id.localeCompare(a.id))

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

  function handleMetaSubmit(e: React.FormEvent) {
    e.preventDefault()
    const obj = Number(metaForm.montoObjetivo)
    if (!metaForm.nombre || obj <= 0) return
    if (metaForm.id) {
      updateMeta(metaForm.id, {
        tipo: metaForm.tipo,
        nombre: metaForm.nombre,
        montoObjetivo: obj,
        montoActual: Number(metaForm.montoActual) || 0,
        fechaLimite: metaForm.fechaLimite,
        notas: metaForm.notas,
        estado: metaForm.estado,
      })
    } else {
      addMeta({
        id: crypto.randomUUID(),
        tipo: metaForm.tipo,
        nombre: metaForm.nombre,
        montoObjetivo: obj,
        montoActual: Number(metaForm.montoActual) || 0,
        fechaLimite: metaForm.fechaLimite,
        notas: metaForm.notas,
        estado: 'activo',
      })
    }
    setMetaForm({ id: undefined, tipo: 'meta', nombre: '', montoObjetivo: '', montoActual: '', fechaLimite: '', notas: '', estado: 'activo' })
  }

  function editarMeta(m: { id: string; tipo: TipoMeta; nombre: string; montoObjetivo: number; montoActual: number; fechaLimite: string; notas: string; estado: string }) {
    setMetaForm({
      id: m.id,
      tipo: m.tipo,
      nombre: m.nombre,
      montoObjetivo: String(m.montoObjetivo),
      montoActual: String(m.montoActual),
      fechaLimite: m.fechaLimite,
      notas: m.notas,
      estado: (m.estado as 'activo' | 'completado' | 'cancelado') || 'activo',
    })
  }

  function resetMetaForm() {
    setMetaForm({ id: undefined, tipo: 'meta', nombre: '', montoObjetivo: '', montoActual: '', fechaLimite: '', notas: '', estado: 'activo' })
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
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Presupuesto del mes</span>
              <button
                onClick={() => { if (confirm('¿Eliminar presupuesto de este mes?')) deletePresupuesto(mesSeleccionado) }}
                className="text-red-400 hover:text-red-600 p-1"
                title="Eliminar presupuesto"
              ><Trash2 size={14} /></button>
            </div>
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

      <button onClick={() => setMostrarMetas(!mostrarMetas)} className="w-full flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 text-left">
        <div className="flex items-center gap-2">
          <Target size={18} className="text-purple-600" />
          <h2 className="font-semibold text-slate-700 dark:text-slate-300">Metas y Deudas</h2>
        </div>
        <span className={`text-slate-400 text-sm transition-transform ${mostrarMetas ? 'rotate-0' : 'rotate-180'}`}>▲</span>
      </button>
      {mostrarMetas && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <form onSubmit={handleMetaSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div className="sm:col-span-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{metaForm.id ? 'Editar' : 'Nueva'} Meta/Deuda</h3>
              <button type="button" onClick={resetMetaForm} className="text-xs text-slate-400 hover:text-slate-600">Limpiar</button>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipo</label>
              <select value={metaForm.tipo} onChange={e => setMetaForm({ ...metaForm, tipo: e.target.value as TipoMeta })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="deuda">Deuda</option>
                <option value="prestamo">Préstamo</option>
                <option value="ahorro">Ahorro</option>
                <option value="meta">Meta</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
              <input type="text" required value={metaForm.nombre} onChange={e => setMetaForm({ ...metaForm, nombre: e.target.value })} placeholder="Ej: Comprar auto" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {metaForm.id && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                <select value={metaForm.estado} onChange={e => setMetaForm({ ...metaForm, estado: e.target.value as 'activo' | 'completado' | 'cancelado' })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="activo">Activo</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monto Objetivo</label>
              <MoneyInput value={metaForm.montoObjetivo} onChange={v => setMetaForm({ ...metaForm, montoObjetivo: v })} placeholder="Ej: 100.000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Monto Actual</label>
              <MoneyInput value={metaForm.montoActual} onChange={v => setMetaForm({ ...metaForm, montoActual: v })} placeholder="Ej: 10.000" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha Límite</label>
              <input type="date" value={metaForm.fechaLimite} onChange={e => setMetaForm({ ...metaForm, fechaLimite: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Notas</label>
              <div className="flex gap-2">
                <input type="text" value={metaForm.notas} onChange={e => setMetaForm({ ...metaForm, notas: e.target.value })} placeholder="Notas adicionales..." className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <button type="submit" className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium whitespace-nowrap">{metaForm.id ? 'Actualizar' : 'Agregar'}</button>
              </div>
            </div>
          </form>

          {metas.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">No hay metas ni deudas registradas</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...metas].sort((a, b) => {
                const orden: Record<string, number> = { deuda: 0, prestamo: 1, ahorro: 2, meta: 3 }
                return (orden[a.tipo] || 99) - (orden[b.tipo] || 99)
              }).map((m) => {
                const progreso = m.montoObjetivo > 0 ? (m.montoActual / m.montoObjetivo) * 100 : 0
                const iconos: Record<string, typeof Target> = { deuda: HandCoins, prestamo: HandCoins, ahorro: Wallet, meta: Goal }
                const Icono = iconos[m.tipo] || Target
                const colores: Record<string, string> = {
                  deuda: 'border-red-200 dark:border-red-800',
                  prestamo: 'border-amber-200 dark:border-amber-800',
                  ahorro: 'border-green-200 dark:border-green-800',
                  meta: 'border-purple-200 dark:border-purple-800',
                }
                const badgeColores: Record<string, string> = {
                  deuda: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
                  prestamo: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
                  ahorro: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
                  meta: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
                }
                const estadoColors: Record<string, string> = {
                  activo: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
                  completado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
                  cancelado: 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
                }
                return (
                  <div key={m.id} className={`rounded-lg border p-3 ${colores[m.tipo] || 'border-slate-200 dark:border-slate-700'} ${m.estado === 'cancelado' ? 'opacity-50' : ''}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icono size={16} className={m.tipo === 'deuda' ? 'text-red-500' : m.tipo === 'prestamo' ? 'text-amber-500' : m.tipo === 'ahorro' ? 'text-green-500' : 'text-purple-500'} />
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${badgeColores[m.tipo] || badgeColores['meta']}`}>{m.tipo.charAt(0).toUpperCase() + m.tipo.slice(1)}</span>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editarMeta(m)} className="text-slate-400 hover:text-blue-600 p-1"><Pencil size={12} /></button>
                        <button onClick={() => { if (confirm('¿Eliminar?')) deleteMeta(m.id) }} className="text-slate-400 hover:text-red-600 p-1"><Trash2 size={12} /></button>
                      </div>
                    </div>
                    <h4 className="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1 truncate">{m.nombre}</h4>
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>{formatMoney(m.montoActual)}</span>
                      <span>{formatMoney(m.montoObjetivo)}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden mb-1">
                      <div className={`h-full rounded-full ${m.estado === 'completado' ? 'bg-green-500' : progreso >= 100 ? 'bg-emerald-500' : 'bg-purple-500'}`} style={{ width: `${Math.min(progreso, 100)}%` }} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium text-slate-500">{progreso.toFixed(0)}%</span>
                      {m.estado && <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${estadoColors[m.estado] || estadoColors['activo']}`}>{m.estado}</span>}
                    </div>
                    {m.fechaLimite && <p className="text-[10px] text-slate-400 mt-1">Límite: {m.fechaLimite}</p>}
                    {m.notas && <p className="text-[10px] text-slate-400 mt-0.5 truncate">{m.notas}</p>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300">Movimientos de {labelMes(mesSeleccionado)}</h2>
          <div className="relative max-w-[180px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={busquedaMov} onChange={e => setBusquedaMov(e.target.value)} placeholder="Buscar..." className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
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
