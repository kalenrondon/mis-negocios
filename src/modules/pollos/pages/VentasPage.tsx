import { useState } from 'react'
import { usePollosStore, updateVenta } from '../store'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Search, X } from 'lucide-react'
import { formatMoney, formatNumber } from '../utils'
import MoneyInput from '../../../components/MoneyInput'

export default function VentasPage() {
  const navigate = useNavigate()
  const { state, getLoteById } = usePollosStore()
  const [tab, setTab] = useState<'todas' | 'fiados'>('todas')
  const [busqueda, setBusqueda] = useState('')
  const [pagoVentaId, setPagoVentaId] = useState<string | null>(null)
  const [pagoMonto, setPagoMonto] = useState('')

  const ventas = [...state.ventas].sort((a, b) => b.fecha.localeCompare(a.fecha))

  const filtradas = ventas.filter((v) => {
    const lote = getLoteById(v.loteId)
    const nombreLote = lote?.nombre ?? ''
    const match = busqueda === '' || v.comprador.toLowerCase().includes(busqueda.toLowerCase()) || nombreLote.toLowerCase().includes(busqueda.toLowerCase())
    if (tab === 'fiados') return match && v.fiado && v.pesoTotal * v.precioKg - v.pagado > 0
    return match
  })

  const totalGeneral = filtradas.reduce((s, v) => s + v.pesoTotal * v.precioKg, 0)
  const totalDeuda = filtradas.filter((v) => v.fiado).reduce((s, v) => s + v.pesoTotal * v.precioKg - v.pagado, 0)

  function abrirPago(id: string) {
    const v = state.ventas.find((x) => x.id === id)
    if (!v) return
    setPagoVentaId(id)
    setPagoMonto(String(v.pesoTotal * v.precioKg - v.pagado))
  }

  function confirmarPago() {
    if (!pagoVentaId) return
    const v = state.ventas.find((x) => x.id === pagoVentaId)
    if (!v) return
    const monto = Number(pagoMonto)
    if (monto <= 0) return
    updateVenta(pagoVentaId, { pagado: v.pagado + monto })
    setPagoVentaId(null)
    setPagoMonto('')
  }

  return (
    <div>
      <button onClick={() => navigate('/pollos')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Ventas / Fiados</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total Ventas</p><p className="text-xl font-bold text-green-600">{formatMoney(totalGeneral)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Deuda Total</p><p className="text-xl font-bold text-red-500">{formatMoney(totalDeuda)}</p></div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700"><p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Clientes Fiados</p><p className="text-xl font-bold text-amber-600">{new Set(filtradas.filter(v => v.fiado && v.pesoTotal * v.precioKg - v.pagado > 0).map(v => v.comprador)).size}</p></div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setTab('todas')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'todas' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>Todas</button>
          <button onClick={() => setTab('fiados')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'fiados' ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>Fiados</button>
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar por comprador o lote..." className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      </div>

      {filtradas.length === 0 ? (
        <p className="text-center py-16 text-slate-400 dark:text-slate-500">No hay ventas registradas</p>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                  <th className="text-left py-3 px-4">Fecha</th>
                  <th className="text-left py-3 px-4">Lote</th>
                  <th className="text-left py-3 px-4">Comprador</th>
                  <th className="text-center py-3 px-3">Tipo</th>
                  <th className="text-right py-3 px-3">Pollos</th>
                  <th className="text-right py-3 px-3">Kg</th>
                  <th className="text-right py-3 px-3">$/kg</th>
                  <th className="text-right py-3 px-3">Total</th>
                  <th className="text-right py-3 px-3">Pagado</th>
                  <th className="text-right py-3 px-3">Deuda</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((v) => {
                  const lote = getLoteById(v.loteId)
                  const total = v.pesoTotal * v.precioKg
                  const deuda = total - v.pagado
                  return (
                    <tr key={v.id} className={`border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30 ${v.fiado && deuda > 0 ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">{v.fecha}</td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">{lote?.nombre ?? '—'}</td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">{v.comprador}</td>
                      <td className="py-3 px-3 text-center"><span className={`text-xs font-medium px-1.5 py-0.5 rounded ${v.tipo === 'vivo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>{v.tipo === 'vivo' ? 'Vivo' : 'Empac'}</span></td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{formatNumber(v.cantidad)}</td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{v.pesoTotal}</td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">${v.precioKg.toLocaleString('es-AR')}</td>
                      <td className="py-3 px-3 text-right font-medium text-green-600">{formatMoney(total)}</td>
                      <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-300">{formatMoney(v.pagado)}</td>
                      <td className="py-3 px-3 text-right">
                        {v.fiado && deuda > 0 ? (
                          <span className="text-red-500 font-medium">{formatMoney(deuda)}</span>
                        ) : v.fiado ? (
                          <span className="text-green-600 text-xs">✓</span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {v.fiado && deuda > 0 && (
                          <button onClick={() => abrirPago(v.id)} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 rounded hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors">Pagar</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pagoVentaId && (() => {
        const v = state.ventas.find((x) => x.id === pagoVentaId)
        if (!v) return null
        const total = v.pesoTotal * v.precioKg
        const deuda = total - v.pagado
        const lote = getLoteById(v.loteId)
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Registrar Pago</h2>
                <button onClick={() => setPagoVentaId(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                <span className="font-medium text-slate-800 dark:text-white">{v.comprador}</span> · {lote?.nombre} <br />
                Total: <strong>{formatMoney(total)}</strong> · Pagado: {formatMoney(v.pagado)} · <span className="text-red-500 font-medium">Debe: {formatMoney(deuda)}</span>
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto a pagar ($)</label>
                  <div className="flex gap-2">
                    <MoneyInput value={pagoMonto} onChange={setPagoMonto} />
                    <button onClick={() => setPagoMonto(String(deuda))} className="px-3 py-2 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 whitespace-nowrap">Todo</button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={confirmarPago} className="flex-1 bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition-colors font-medium">Confirmar Pago</button>
                  <button onClick={() => setPagoVentaId(null)} className="flex-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors font-medium">Cancelar</button>
                </div>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
