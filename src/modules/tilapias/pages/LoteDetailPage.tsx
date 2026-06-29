import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTilapiasStore, addBaja, deleteBaja, addVenta, deleteVenta, addGasto, deleteGasto, updateLote, deleteLote } from '../store'
import { ArrowLeft, X, Trash2 } from 'lucide-react'
import { formatMoney, formatNumber, parseMoney } from '../utils'
import NumberInput from '../../../components/NumberInput'
import MoneyInput from '../../../components/MoneyInput'

const GASTO_CATEGORIAS = ['Alimento', 'Vacunas', 'Mano de obra', 'Infraestructura', 'Transporte', 'Otro']

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoteById, getBajasByLote, getVentasByLote, getGastosByLote } = useTilapiasStore()

  const lote = getLoteById(id!)
  const bajas = getBajasByLote(id!)
  const ventas = getVentasByLote(id!)
  const gastos = getGastosByLote(id!)

  const [showForm, setShowForm] = useState<'baja' | 'venta' | 'gasto' | null>(null)

  const [bCant, setBCant] = useState('')
  const [bFecha, setBFecha] = useState(new Date().toISOString().split('T')[0])
  const [bCausa, setBCausa] = useState('')

  const [vFecha, setVFecha] = useState(new Date().toISOString().split('T')[0])
  const [vCant, setVCant] = useState('')
  const [vPeso, setVPeso] = useState('')
  const [vPrecio, setVPrecio] = useState('')
  const [vComp, setVComp] = useState('')

  const [gFecha, setGFecha] = useState(new Date().toISOString().split('T')[0])
  const [gDesc, setGDesc] = useState('')
  const [gMonto, setGMonto] = useState('')
  const [gCat, setGCat] = useState('Alimento')

  if (!lote) return <p className="text-slate-500 dark:text-slate-400">Lote no encontrado</p>

  const cl = lote
  const tBajas = bajas.reduce((s, b) => s + b.cantidad, 0)
  const tVen = ventas.reduce((s, v) => s + v.cantidad, 0)
  const vivos = cl.cantidadInicial - tBajas - tVen
  const ingresos = ventas.reduce((s, v) => s + v.pesoTotal * v.precioKg, 0)
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const ganancia = ingresos - cl.costoInicial - totalGastos

  function err(msg: string) { alert(msg) }

  function hBaja(e: React.FormEvent) { e.preventDefault()
    const c = Number(bCant)
    if (c > vivos) return err(`Solo hay ${vivos} vivas, no podés registrar ${c} bajas`)
    addBaja({ id: crypto.randomUUID(), loteId: cl.id, cantidad: c, fecha: bFecha, causa: bCausa })
    setShowForm(null); setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('') }

  function hVenta(e: React.FormEvent) { e.preventDefault()
    const c = Number(vCant)
    if (c > vivos) return err(`Solo hay ${vivos} tilapias disponibles`)
    addVenta({ id: crypto.randomUUID(), loteId: cl.id, fecha: vFecha, cantidad: c, pesoTotal: Number(vPeso), precioKg: parseMoney(vPrecio), comprador: vComp })
    setShowForm(null); setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp('') }

  function hGasto(e: React.FormEvent) { e.preventDefault()
    addGasto({ id: crypto.randomUUID(), loteId: cl.id, fecha: gFecha, descripcion: gDesc, monto: parseMoney(gMonto), categoria: gCat })
    setShowForm(null); setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento') }

  function cerrar() { updateLote(cl.id, { activo: false }) }
  function borrar() { if (confirm('¿Eliminar este lote?')) { deleteLote(cl.id); navigate('/tilapias') } }

  return (
    <div>
      <button onClick={() => navigate('/tilapias')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{cl.nombre}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Inicio: {cl.fechaInicio} · Costo inicial: {formatMoney(cl.costoInicial)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${cl.activo ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
              {cl.activo ? 'Activo' : 'Cerrado'}
            </span>
            <button onClick={borrar} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar lote"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-sm mb-4">
          {[
            { label: 'Inicial', val: formatNumber(cl.cantidadInicial), bg: 'bg-slate-50 dark:bg-slate-700/50', txt: 'text-slate-800 dark:text-white' },
            { label: 'Bajas', val: formatNumber(tBajas), bg: 'bg-red-50 dark:bg-red-900/20', txt: 'text-red-600 dark:text-red-400' },
            { label: 'Vivos', val: formatNumber(vivos), bg: 'bg-green-50 dark:bg-green-900/20', txt: 'text-green-600 dark:text-green-400' },
            { label: 'Vendidos', val: formatNumber(tVen), bg: 'bg-blue-50 dark:bg-blue-900/20', txt: 'text-blue-600 dark:text-blue-400' },
            { label: 'Gastos', val: formatMoney(totalGastos), bg: 'bg-rose-50 dark:bg-rose-900/20', txt: 'text-rose-600 dark:text-rose-400' },
            { label: 'Ganancia', val: formatMoney(ganancia), bg: 'bg-amber-50 dark:bg-amber-900/20', txt: ganancia >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg p-3`}>
              <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`font-bold ${s.txt} truncate`}>{s.val}</p>
            </div>
          ))}
        </div>

        {cl.activo && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setShowForm('venta'); setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp('') }} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">+ Venta</button>
            <button onClick={() => { setShowForm('baja'); setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('') }} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors">+ Baja</button>
            <button onClick={() => { setShowForm('gasto'); setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento') }} className="text-xs px-3 py-1.5 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-lg hover:bg-rose-200 transition-colors">+ Gasto</button>
            <button onClick={cerrar} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors ml-auto">Cerrar Lote</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {showForm === 'venta' && 'Registrar Venta'}
                {showForm === 'baja' && 'Registrar Baja'}
                {showForm === 'gasto' && 'Registrar Gasto'}
              </h2>
              <button onClick={() => setShowForm(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {showForm === 'venta' && (
              <form onSubmit={hVenta} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Disponibles: {formatNumber(vivos)} tilapias</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={vFecha} onChange={e => setVFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={vCant} onChange={setVCant} required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso total (kg)</label><input type="text" inputMode="decimal" required value={vPeso} onChange={e => setVPeso(e.target.value.replace(/[^0-9.,]/g, ''))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Precio por kg ($)</label><MoneyInput value={vPrecio} onChange={setVPrecio} placeholder="Ej: 4500" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comprador</label><input type="text" required value={vComp} onChange={e => setVComp(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'baja' && (
              <form onSubmit={hBaja} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Vivos disponibles: {formatNumber(vivos)}</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={bCant} onChange={setBCant} required max={vivos || 1} /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={bFecha} onChange={e => setBFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Causa</label><input type="text" required value={bCausa} onChange={e => setBCausa(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
                <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'gasto' && (
              <form onSubmit={hGasto} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={gFecha} onChange={e => setGFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label><input type="text" required value={gDesc} onChange={e => setGDesc(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Ej: Alimento balanceado" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                  <select value={gCat} onChange={e => setGCat(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                    {GASTO_CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto ($)</label><MoneyInput value={gMonto} onChange={setGMonto} placeholder="Ej: 5000" required /></div>
                <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 font-medium">Guardar</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Bajas</h3>
          {bajas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...bajas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((b) => (
              <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 dark:bg-red-900/20 rounded p-1.5">
                <span className="text-red-600 dark:text-red-400">{b.cantidad} tilapias · {b.fecha} · {b.causa}</span>
                <button onClick={() => deleteBaja(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            ))}</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Ventas</h3>
          {ventas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((v) => (
              <div key={v.id} className="text-xs bg-green-50 dark:bg-green-900/20 rounded p-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 dark:text-green-300 font-medium">{v.comprador}</span>
                  <div className="flex items-center gap-1"><span className="text-green-600 dark:text-green-400 font-medium">{formatMoney(v.pesoTotal * v.precioKg)}</span><button onClick={() => deleteVenta(v.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
                </div>
                <div className="text-slate-500 dark:text-slate-400 mt-0.5">{v.fecha} · {v.cantidad} tilapias · {v.pesoTotal}kg · ${v.precioKg.toLocaleString('es-AR')}/kg</div>
              </div>
            ))}</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Gastos</h3>
          {gastos.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((g) => (
              <div key={g.id} className="flex justify-between items-center text-xs bg-rose-50 dark:bg-rose-900/20 rounded p-1.5">
                <div><span className="text-rose-700 dark:text-rose-300 font-medium">{g.categoria}</span><span className="text-slate-500 dark:text-slate-400 ml-1">· {g.fecha}</span><p className="text-slate-600 dark:text-slate-300 truncate">{g.descripcion}</p></div>
                <div className="flex items-center gap-1 shrink-0 ml-2"><span className="text-red-600 font-medium">{formatMoney(g.monto)}</span><button onClick={() => deleteGasto(g.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
              </div>
            ))}</div>
          )}
        </div>
      </div>
    </div>
  )
}
