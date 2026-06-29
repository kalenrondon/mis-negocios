import { useState } from 'react'
import { useTradingStore, addTrade, deleteTrade } from '../store'
import { formatMoney, formatNumber } from '../utils'
import type { ResumenPeriodo } from '../types'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Trash2, Plus, Calendar, PieChart, List, Search, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import MoneyInput from '../../../components/MoneyInput'

type PeriodoTab = 'dia' | 'semana' | 'mes' | 'anio'
type ViewTab = 'periodos' | 'activos' | 'historial'

export default function TradingDashboard() {
  const { state, tradesOrdenados, totalGanado, totalPerdido, balance, cantidadTrades, resumenActivos, getResumenPeriodos } = useTradingStore()

  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10))
  const [tipo, setTipo] = useState<'ganada' | 'perdida'>('ganada')
  const [activo, setActivo] = useState('')
  const [monto, setMonto] = useState('')
  const [notas, setNotas] = useState('')

  const [viewTab, setViewTab] = useState<ViewTab>('periodos')
  const [periodoTab, setPeriodoTab] = useState<PeriodoTab>('mes')
  const [searchActivo, setSearchActivo] = useState('')

  const periodos = getResumenPeriodos(periodoTab)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const m = Number(monto)
    if (!activo || m <= 0) return
    addTrade({
      id: crypto.randomUUID(),
      fecha,
      tipo,
      activo: activo.toUpperCase().trim(),
      monto: m,
      notas,
    })
    setActivo(''); setMonto(''); setNotas('')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Trading</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-green-600 mb-1"><TrendingUp size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Ganado</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-green-600">{formatMoney(totalGanado)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-red-600 mb-1"><TrendingDown size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Perdido</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-red-600">{formatMoney(totalPerdido)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><DollarSign size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Balance</span></div>
          <p className={`text-xl lg:text-2xl font-bold truncate ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {balance >= 0 ? '+' : ''}{formatMoney(balance)}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><BarChart3 size={18} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Operaciones</span></div>
          <p className="text-xl lg:text-2xl font-bold truncate text-blue-600">{formatNumber(cantidadTrades)}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-8">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Plus size={20} /> Nueva Operación</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Fecha</label>
            <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Resultado</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setTipo('ganada')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'ganada' ? 'bg-green-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}><ArrowUpCircle size={16} /> Ganada</button>
              <button type="button" onClick={() => setTipo('perdida')} className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${tipo === 'perdida' ? 'bg-red-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}><ArrowDownCircle size={16} /> Perdida</button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Activo / Mercado</label>
            <input type="text" value={activo} onChange={e => setActivo(e.target.value)} placeholder="ej. BTC, ETH, AAPL" list="activos-list" className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <datalist id="activos-list">
              {[...new Set(state.trades.map(t => t.activo))].map(a => <option key={a} value={a} />)}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Monto $</label>
            <MoneyInput value={monto} onChange={setMonto} placeholder={tipo === 'ganada' ? 'Ej: 50.000' : 'Ej: 10.000'} />
          </div>
          <div className="sm:col-span-2 lg:col-span-4">
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Notas (opcional)</label>
            <div className="flex gap-2">
              <input type="text" value={notas} onChange={e => setNotas(e.target.value)} placeholder="Motivo, estrategia, etc." className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium whitespace-nowrap">Agregar</button>
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center gap-1 mb-4 border-b border-slate-200 dark:border-slate-700">
        <button onClick={() => setViewTab('periodos')} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${viewTab === 'periodos' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><Calendar size={16} /> Por Períodos</button>
        <button onClick={() => setViewTab('activos')} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${viewTab === 'activos' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><PieChart size={16} /> Por Activo</button>
        <button onClick={() => setViewTab('historial')} className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${viewTab === 'historial' ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}><List size={16} /> Historial</button>
      </div>

      {viewTab === 'periodos' && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            {(['dia', 'semana', 'mes', 'anio'] as PeriodoTab[]).map((p) => (
              <button key={p} onClick={() => setPeriodoTab(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${periodoTab === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                {p === 'dia' ? 'Día' : p === 'semana' ? 'Semana' : p === 'mes' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
          {periodos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <BarChart3 size={40} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">Sin datos</p>
              <p className="text-sm">Agregá operaciones para ver el resumen</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Período</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ganado</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perdido</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Neto</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {[...periodos].reverse().map((p) => (
                      <PeriodoRow key={p.key} p={p} />
                    ))}
                    <tr className="bg-slate-50 dark:bg-slate-700/30 font-medium">
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-200">Total</td>
                      <td className="text-right py-3 px-4 text-green-600">{formatMoney(totalGanado)}</td>
                      <td className="text-right py-3 px-4 text-red-600">{formatMoney(totalPerdido)}</td>
                      <td className={`text-right py-3 px-4 ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>{balance >= 0 ? '+' : ''}{formatMoney(balance)}</td>
                      <td className="text-right py-3 px-4 text-slate-600 dark:text-slate-300">{formatNumber(cantidadTrades)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {viewTab === 'activos' && (
        <div>
          {resumenActivos.length === 0 ? (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <PieChart size={40} className="mx-auto mb-2 opacity-50" />
              <p className="font-medium">Sin activos registrados</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50">
                      <th className="text-left py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activo</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ganado</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perdido</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Neto</th>
                      <th className="text-right py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Operaciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {resumenActivos.map((a) => (
                      <tr key={a.activo} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="py-3 px-4 font-medium text-slate-800 dark:text-white">{a.activo}</td>
                        <td className="text-right py-3 px-4 text-green-600">{formatMoney(a.ganado)}</td>
                        <td className="text-right py-3 px-4 text-red-600">{formatMoney(a.perdido)}</td>
                        <td className={`text-right py-3 px-4 font-medium ${a.neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>{a.neto >= 0 ? '+' : ''}{formatMoney(a.neto)}</td>
                        <td className="text-right py-3 px-4 text-slate-500 dark:text-slate-400">{formatNumber(a.trades)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {viewTab === 'historial' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Todas las Operaciones</h2>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Filtrar activo..." value={searchActivo} onChange={e => setSearchActivo(e.target.value.toUpperCase())} className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-40" />
            </div>
          </div>
          {tradesOrdenados.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8">Sin operaciones registradas</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400">
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">Fecha</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">Resultado</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">Activo</th>
                    <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider">Monto</th>
                    <th className="text-left py-3 px-4 text-xs font-medium uppercase tracking-wider">Notas</th>
                    <th className="text-right py-3 px-4 text-xs font-medium uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {tradesOrdenados
                    .filter((t) => !searchActivo || t.activo.includes(searchActivo))
                    .map((t) => (
                    <tr key={t.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{t.fecha}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${t.tipo === 'ganada' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                          {t.tipo === 'ganada' ? <ArrowUpCircle size={10} /> : <ArrowDownCircle size={10} />}
                          {t.tipo === 'ganada' ? 'Ganada' : 'Perdida'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-200">{t.activo}</td>
                      <td className={`text-right py-3 px-4 font-medium ${t.tipo === 'ganada' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.tipo === 'ganada' ? '+' : '-'}{formatMoney(t.monto)}
                      </td>
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-[160px] truncate">{t.notas || '—'}</td>
                      <td className="text-right py-3 px-4">
                        <button onClick={() => { if (confirm('¿Eliminar esta operación?')) deleteTrade(t.id) }} className="text-red-300 hover:text-red-600 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20" title="Eliminar"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PeriodoRow({ p }: { p: ResumenPeriodo }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
      <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-medium">{p.label}</td>
      <td className="text-right py-3 px-4 text-green-600">{formatMoney(p.ganado)}</td>
      <td className="text-right py-3 px-4 text-red-600">{formatMoney(p.perdido)}</td>
      <td className={`text-right py-3 px-4 font-medium ${p.neto >= 0 ? 'text-green-600' : 'text-red-600'}`}>{p.neto >= 0 ? '+' : ''}{formatMoney(p.neto)}</td>
      <td className="text-right py-3 px-4 text-slate-500 dark:text-slate-400">{formatNumber(p.trades)}</td>
    </tr>
  )
}
