import { useState } from 'react'
import { usePollosStore, deleteLote } from '../store'
import { Link } from 'react-router-dom'
import { Bird, DollarSign, TrendingUp, Package, Eye, Plus, Trash2, Calendar, Beef, CreditCard, Wallet } from 'lucide-react'
import { formatMoney, formatNumber, getMonthKey, getMesLabel } from '../utils'

export default function PollosDashboard() {
  const { state, getVentasByLote, getBajasByLote, getEmpacadosByLote, getGastosByLote } = usePollosStore()
  const [tab, setTab] = useState<'activos' | 'cerrados'>('activos')

  const lotesActivos = state.lotes.filter((l) => l.activo).length

  const pollosVivos = state.lotes
    .filter((l) => l.activo)
    .reduce((sum, l) => {
      const bajas = getBajasByLote(l.id).reduce((s, b) => s + b.cantidad, 0)
      const empacados = getEmpacadosByLote(l.id).reduce((s, p) => s + p.cantidad, 0)
      const vendidosVivos = getVentasByLote(l.id).filter((v) => v.tipo === 'vivo').reduce((s, v) => s + v.cantidad, 0)
      return sum + l.cantidadInicial - bajas - empacados - vendidosVivos
    }, 0)

  const totalProcesados = state.empacados.reduce((s, p) => s + p.cantidad, 0)
  const vendidosEmpacados = state.ventas.filter((v) => v.tipo === 'empacado').reduce((s, v) => s + v.cantidad, 0)
  const totalVentas = state.ventas.reduce((sum, v) => sum + v.pesoTotal * v.precioKg, 0)
  const totalCostos = state.lotes.reduce((sum, l) => sum + l.costoInicial, 0)
  const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0)
  const ganancia = totalVentas - totalCostos - totalGastos

  const fiados = state.ventas.filter((v) => v.fiado && v.pesoTotal * v.precioKg - v.pagado > 0)

  const lotesFiltrados = state.lotes.filter((l) => (tab === 'activos' ? l.activo : !l.activo))

  const meses: Record<string, { ventas: number; costos: number; gastos: number; bajas: number; procesados: number }> = {}
  state.ventas.forEach((v) => {
    const key = getMonthKey(v.fecha)
    if (!meses[key]) meses[key] = { ventas: 0, costos: 0, gastos: 0, bajas: 0, procesados: 0 }
    meses[key].ventas += v.pesoTotal * v.precioKg
  })
  state.lotes.forEach((l) => {
    const key = getMonthKey(l.fechaInicio)
    if (!meses[key]) meses[key] = { ventas: 0, costos: 0, gastos: 0, bajas: 0, procesados: 0 }
    meses[key].costos += l.costoInicial
  })
  state.gastos.forEach((g) => {
    const key = getMonthKey(g.fecha)
    if (!meses[key]) meses[key] = { ventas: 0, costos: 0, gastos: 0, bajas: 0, procesados: 0 }
    meses[key].gastos += g.monto
  })
  state.bajas.forEach((b) => {
    const key = getMonthKey(b.fecha)
    if (!meses[key]) meses[key] = { ventas: 0, costos: 0, gastos: 0, bajas: 0, procesados: 0 }
    meses[key].bajas += b.cantidad
  })
  state.empacados.forEach((p) => {
    const key = getMonthKey(p.fecha)
    if (!meses[key]) meses[key] = { ventas: 0, costos: 0, gastos: 0, bajas: 0, procesados: 0 }
    meses[key].procesados += p.cantidad
  })

  const mesesOrdenados = Object.entries(meses).sort(([a], [b]) => a.localeCompare(b))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Pollos de Engorde</h1>
        <div className="flex gap-2">
          <Link to="/pollos/ventas" className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors text-sm">
            <CreditCard size={18} /> Ventas / Fiados
          </Link>
          <Link to="/pollos/historial" className="flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-colors text-sm">
            <Calendar size={18} /> Historial
          </Link>
          <Link to="/pollos/nuevo" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
            <Plus size={18} /> Nuevo Lote
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-blue-600 mb-1"><Package size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Lotes Activos</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-slate-800 dark:text-white">{lotesActivos}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-green-600 mb-1"><Bird size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Vivos</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-slate-800 dark:text-white">{formatNumber(pollosVivos)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-purple-600 mb-1"><Beef size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Empacados</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-purple-700 dark:text-purple-400">{formatNumber(totalProcesados - vendidosEmpacados)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-emerald-600 mb-1"><TrendingUp size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ventas</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-slate-800 dark:text-white">{formatMoney(totalVentas)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-red-600 mb-1"><Wallet size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Gastos</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-red-500 dark:text-red-400">{formatMoney(totalGastos)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-amber-600 mb-1"><CreditCard size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Fiados</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-amber-600 dark:text-amber-400">{formatNumber(fiados.length)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 text-amber-600 mb-1"><DollarSign size={20} /><span className="text-xs font-medium text-slate-500 dark:text-slate-400">Ganancia</span></div>
          <p className={`text-xl lg:text-2xl font-bold truncate ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMoney(ganancia)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setTab('activos')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'activos' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
          Activos ({state.lotes.filter((l) => l.activo).length})
        </button>
        <button onClick={() => setTab('cerrados')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'cerrados' ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
          Cerrados ({state.lotes.filter((l) => !l.activo).length})
        </button>
      </div>

      {lotesFiltrados.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <Bird size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-lg">No hay lotes {tab === 'activos' ? 'activos' : 'cerrados'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lotesFiltrados.map((lote) => {
            const bajas = getBajasByLote(lote.id).reduce((s, b) => s + b.cantidad, 0)
            const procesados = getEmpacadosByLote(lote.id).reduce((s, p) => s + p.cantidad, 0)
            const gastosL = getGastosByLote(lote.id).reduce((s, g) => s + g.monto, 0)
            const ventasLote = getVentasByLote(lote.id)
            const vendidosVivos = ventasLote.filter((v) => v.tipo === 'vivo').reduce((s, v) => s + v.cantidad, 0)
            const vendidosEmp = ventasLote.filter((v) => v.tipo === 'empacado').reduce((s, v) => s + v.cantidad, 0)
            const vivos = lote.cantidadInicial - bajas - procesados - vendidosVivos
            const empaInventario = procesados - vendidosEmp
            const isActive = lote.activo
            return (
              <div key={lote.id} className={`rounded-xl shadow-sm border p-4 transition-all ${
                isActive
                  ? 'bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 border-slate-200 dark:border-slate-700 hover:shadow-md'
                  : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-90'
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold truncate ${isActive ? 'text-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{lote.nombre}</h3>
                    <p className={`text-xs truncate ${isActive ? 'text-slate-500 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>{lote.raza} · Inicio: {lote.fechaInicio}{!isActive ? ' · Completado' : ''}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>{isActive ? 'Activo' : 'Cerrado'}</span>
                    <button onClick={() => { if (confirm('¿Eliminar este lote?')) deleteLote(lote.id) }} className="text-red-300 hover:text-red-600" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-3 text-center text-sm mb-3">
                  <div><p className="text-slate-400 dark:text-slate-500 text-xs truncate">Inicial</p><p className={`font-semibold truncate ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>{formatNumber(lote.cantidadInicial)}</p></div>
                  <div><p className="text-slate-400 dark:text-slate-500 text-xs truncate">Vivos</p><p className="font-semibold text-green-600 truncate">{formatNumber(vivos)}</p></div>
                  <div><p className="text-slate-400 dark:text-slate-500 text-xs truncate">Empac</p><p className="font-semibold text-purple-600 truncate">{formatNumber(empaInventario)}</p></div>
                  <div><p className="text-slate-400 dark:text-slate-500 text-xs truncate">Vend</p><p className={`font-semibold truncate ${isActive ? 'text-slate-700 dark:text-slate-200' : 'text-slate-500'}`}>{formatNumber(vendidosVivos + vendidosEmp)}</p></div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 dark:text-slate-500">Gastos: <strong className="text-rose-600">{formatMoney(gastosL)}</strong></span>
                  <div className="flex items-center gap-2">
                    <Link to={`/pollos/${lote.id}`} className="text-xs text-rose-600 hover:text-rose-800 dark:text-rose-400">+ Gasto</Link>
                    <Link to={`/pollos/${lote.id}`} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"><Eye size={16} />Detalle</Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {tab === 'activos' && mesesOrdenados.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mt-8">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Calendar size={20} /> Resumen por Mes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-2 px-3">Mes</th>
                  <th className="text-right py-2 px-3">Ventas</th>
                  <th className="text-right py-2 px-3">Costos</th>
                  <th className="text-right py-2 px-3">Gastos</th>
                  <th className="text-right py-2 px-3">Bajas</th>
                  <th className="text-right py-2 px-3">Empacados</th>
                  <th className="text-right py-2 px-3">Balance</th>
                </tr>
              </thead>
              <tbody>
                {mesesOrdenados.map(([key, m]) => (
                  <tr key={key} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2 px-3 font-medium text-slate-700 dark:text-slate-300">{getMesLabel(key + '-01')}</td>
                    <td className="text-right py-2 px-3 text-green-600">{formatMoney(m.ventas)}</td>
                    <td className="text-right py-2 px-3 text-red-600">{formatMoney(m.costos)}</td>
                    <td className="text-right py-2 px-3 text-rose-600">{formatMoney(m.gastos)}</td>
                    <td className="text-right py-2 px-3 text-red-500">{formatNumber(m.bajas)}</td>
                    <td className="text-right py-2 px-3 text-purple-600">{formatNumber(m.procesados)}</td>
                    <td className={`text-right py-2 px-3 font-medium ${m.ventas - m.costos - m.gastos >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMoney(m.ventas - m.costos - m.gastos)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
