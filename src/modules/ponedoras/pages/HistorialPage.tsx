import { usePonedorasStore } from '../store'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { formatMoney, formatNumber } from '../utils'

export default function HistorialPage() {
  const navigate = useNavigate()
  const { state, getBajasByLote, getVentasByLote, getPosturasByLote, getGastosByLote } = usePonedorasStore()

  const totalHuevos = state.posturas.reduce((s, p) => s + p.huevos, 0)
  const totalVentas = state.ventas.reduce((s, v) => s + v.cantidad * v.precioPorUnidad, 0)
  const totalCostos = state.lotes.reduce((s, l) => s + l.costoInicial, 0)
  const totalGastos = state.gastos.reduce((s, g) => s + g.monto, 0)
  const totalBajas = state.bajas.reduce((s, b) => s + b.cantidad, 0)
  const ganancia = totalVentas - totalCostos - totalGastos

  const ventasOrdenadas = [...state.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha))
  const lotesCerrados = state.lotes.filter((l) => !l.activo).sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio))

  return (
    <div>
      <button onClick={() => navigate('/ponedoras')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Historial - Ponedoras</h1>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Huevos</p><p className="text-2xl font-bold text-amber-600">{formatNumber(totalHuevos)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ventas</p><p className="text-2xl font-bold text-green-600">{formatMoney(totalVentas)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Costos</p><p className="text-2xl font-bold text-red-600">{formatMoney(totalCostos)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Gastos</p><p className="text-2xl font-bold text-rose-600">{formatMoney(totalGastos)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Bajas</p><p className="text-2xl font-bold text-red-500">{formatNumber(totalBajas)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Ganancia</p><p className={`text-lg lg:text-xl font-bold truncate ${ganancia >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatMoney(ganancia)}</p></div>
      </div>

      {lotesCerrados.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Lotes Cerrados</h2>
          <div className="space-y-3">
            {lotesCerrados.map((l) => {
              const bajas = getBajasByLote(l.id).reduce((s, b) => s + b.cantidad, 0)
              const posturas = getPosturasByLote(l.id).reduce((s, p) => s + p.huevos, 0)
              const gastosL = getGastosByLote(l.id).reduce((s, g) => s + g.monto, 0)
              const ventasL = getVentasByLote(l.id)
              const ingresos = ventasL.reduce((s, v) => s + v.cantidad * v.precioPorUnidad, 0)
              return (
                <div key={l.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">{l.nombre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{l.raza} · Inicial: {formatNumber(l.cantidadInicial)} · Bajas: {formatNumber(bajas)} · Huevos: {formatNumber(posturas)} · Gastos: {formatMoney(gastosL)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="font-medium text-slate-700 dark:text-slate-200">{formatMoney(ingresos)}</p>
                    <p className={`text-xs ${ingresos - l.costoInicial - gastosL >= 0 ? 'text-green-600' : 'text-red-600'}`}>{ingresos - l.costoInicial - gastosL >= 0 ? 'Ganancia' : 'Pérdida'}: {formatMoney(ingresos - l.costoInicial - gastosL)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Todas las Ventas de Huevos</h2>
        {ventasOrdenadas.length === 0 ? <p className="text-sm text-slate-400">Sin ventas registradas</p> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-2 pr-3">Fecha</th>
                  <th className="text-left py-2 pr-3">Comprador</th>
                  <th className="text-right py-2 pr-3">Huevos</th>
                  <th className="text-right py-2 pr-3">$/unidad</th>
                  <th className="text-right py-2 pr-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {ventasOrdenadas.map((v) => (
                  <tr key={v.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="py-2 pr-3 text-slate-600 dark:text-slate-400">{v.fecha}</td>
                    <td className="py-2 pr-3 font-medium text-slate-700 dark:text-slate-200">{v.comprador}</td>
                    <td className="text-right py-2 pr-3 text-slate-600 dark:text-slate-300">{formatNumber(v.cantidad)}</td>
                    <td className="text-right py-2 pr-3 text-slate-600 dark:text-slate-300">${v.precioPorUnidad.toLocaleString('es-AR')}</td>
                    <td className="text-right py-2 pr-3 font-medium text-green-600">{formatMoney(v.cantidad * v.precioPorUnidad)}</td>
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
