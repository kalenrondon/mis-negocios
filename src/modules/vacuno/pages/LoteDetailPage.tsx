import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVacunoStore, addBaja, deleteBaja, addPesaje, deletePesaje, addVenta, deleteVenta, addGasto, deleteGasto, updateLote, deleteLote } from '../store'
import { ArrowLeft, X, Trash2 } from 'lucide-react'
import { formatMoney, formatNumber } from '../utils'
import NumberInput from '../../../components/NumberInput'
import MoneyInput from '../../../components/MoneyInput'

const GASTO_CATEGORIAS = ['Alimento', 'Vacunas', 'Mano de obra', 'Infraestructura', 'Transporte', 'Sanidad', 'Otro']

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoteById, getBajasByLote, getPesajesByLote, getVentasByLote, getGastosByLote } = useVacunoStore()

  const lote = getLoteById(id!)
  const bajas = getBajasByLote(id!)
  const pesajes = getPesajesByLote(id!)
  const ventas = getVentasByLote(id!)
  const gastos = getGastosByLote(id!)

  const [showForm, setShowForm] = useState<'baja' | 'pesaje' | 'venta' | 'gasto' | null>(null)

  const [bCant, setBCant] = useState('')
  const [bFecha, setBFecha] = useState(new Date().toISOString().split('T')[0])
  const [bCausa, setBCausa] = useState('')

  const [pFecha, setPFecha] = useState(new Date().toISOString().split('T')[0])
  const [pPeso, setPPeso] = useState('')
  const [pMuestra, setPMuestra] = useState('')

  const [vFecha, setVFecha] = useState(new Date().toISOString().split('T')[0])
  const [vCant, setVCant] = useState('')
  const [vPeso, setVPeso] = useState('')
  const [vPrecio, setVPrecio] = useState('')
  const [vComp, setVComp] = useState('')
  const [vFiado, setVFiado] = useState(false)
  const [vPagado, setVPagado] = useState('')

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
    if (c > vivos) return err(`Solo hay ${vivos} animales vivos, no podés registrar ${c} bajas`)
    addBaja({ id: crypto.randomUUID(), loteId: cl.id, cantidad: c, fecha: bFecha, causa: bCausa })
    setShowForm(null); setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('') }

  function hPesaje(e: React.FormEvent) { e.preventDefault()
    addPesaje({ id: crypto.randomUUID(), loteId: cl.id, fecha: pFecha, pesoPromedio: Number(pPeso), muestra: Number(pMuestra) })
    setShowForm(null); setPFecha(new Date().toISOString().split('T')[0]); setPPeso(''); setPMuestra('') }

  function hVenta(e: React.FormEvent) { e.preventDefault()
    const c = Number(vCant)
    if (c > vivos) return err(`Solo hay ${vivos} animales disponibles`)
    const total = Number(vPeso) * Number(vPrecio)
    addVenta({ id: crypto.randomUUID(), loteId: cl.id, fecha: vFecha, cantidad: c, pesoTotal: Number(vPeso), precioKg: Number(vPrecio), comprador: vComp, fiado: vFiado, pagado: vFiado ? Number(vPagado) : total })
    setShowForm(null); setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp(''); setVFiado(false); setVPagado('') }

  function hGasto(e: React.FormEvent) { e.preventDefault()
    addGasto({ id: crypto.randomUUID(), loteId: cl.id, fecha: gFecha, descripcion: gDesc, monto: Number(gMonto), categoria: gCat })
    setShowForm(null); setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento') }

  function cerrar() { updateLote(cl.id, { activo: false }) }
  function borrar() { if (confirm('¿Eliminar este lote?')) { deleteLote(cl.id); navigate('/vacuno') } }

  return (
    <div>
      <button onClick={() => navigate('/vacuno')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate">{cl.nombre}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">{cl.raza} · Inicio: {cl.fechaInicio} · Costo: {formatMoney(cl.costoInicial)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
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
            <button onClick={() => { setShowForm('venta'); setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp(''); setVFiado(false); setVPagado('') }} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">+ Venta</button>
            <button onClick={() => { setShowForm('baja'); setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('') }} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors">+ Baja</button>
            <button onClick={() => { setShowForm('pesaje'); setPFecha(new Date().toISOString().split('T')[0]); setPPeso(''); setPMuestra('') }} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition-colors">+ Pesaje</button>
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
                {showForm === 'pesaje' && 'Registrar Pesaje'}
                {showForm === 'gasto' && 'Registrar Gasto'}
              </h2>
              <button onClick={() => setShowForm(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {showForm === 'venta' && (
              <form onSubmit={hVenta} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Disponibles: {formatNumber(vivos)} animales</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={vFecha} onChange={e => setVFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={vCant} onChange={setVCant} required /></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso total (kg)</label><input type="text" inputMode="decimal" required value={vPeso} onChange={e => setVPeso(e.target.value.replace(/[^0-9.,]/g, ''))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Precio por kg ($)</label><MoneyInput value={vPrecio} onChange={setVPrecio} placeholder="Ej: 2500" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comprador</label><input type="text" required value={vComp} onChange={e => setVComp(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={vFiado} onChange={e => setVFiado(e.target.checked)} className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 dark:bg-slate-700 text-amber-600 focus:ring-amber-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Es fiado / queda debiendo</span>
                  </label>
                  {vFiado && <div className="mt-2"><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pagó hoy ($)</label><MoneyInput value={vPagado} onChange={setVPagado} placeholder="Ej: 0" /></div>}
                </div>
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

            {showForm === 'pesaje' && (
              <form onSubmit={hPesaje} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={pFecha} onChange={e => setPFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso promedio (kg)</label><input type="number" required step="0.1" min={0} value={pPeso} onChange={e => setPPeso(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Muestra</label><input type="number" required min={1} value={pMuestra} onChange={e => setPMuestra(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'gasto' && (
              <form onSubmit={hGasto} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={gFecha} onChange={e => setGFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label><input type="text" required value={gDesc} onChange={e => setGDesc(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Ej:Alimento balanceado" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                  <select value={gCat} onChange={e => setGCat(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500">
                    {GASTO_CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto ($)</label><MoneyInput value={gMonto} onChange={setGMonto} placeholder="Ej: 50000" required /></div>
                <button type="submit" className="w-full bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 font-medium">Guardar</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Bajas</h3>
            {bajas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...bajas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((b) => (
                <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 dark:bg-red-900/20 rounded p-1.5">
                  <span className="text-red-600 dark:text-red-400 truncate">{b.cantidad} animales · {b.fecha} · {b.causa}</span>
                  <button onClick={() => deleteBaja(b.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-1"><Trash2 size={12} /></button>
                </div>
              ))}</div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Pesajes</h3>
            {pesajes.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
              <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...pesajes].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-700/30 rounded p-1.5">
                  <span className="text-slate-600 dark:text-slate-300 truncate">{p.fecha} · {p.pesoPromedio} kg · {p.muestra} animales</span>
                  <button onClick={() => deletePesaje(p.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-1"><Trash2 size={12} /></button>
                </div>
              ))}</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Ventas</h3>
            {ventas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {[...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((v) => {
                  const deuda = v.pesoTotal * v.precioKg - v.pagado
                  return (
                  <div key={v.id} className={`text-xs rounded-lg p-3 ${v.fiado && deuda > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' : 'bg-green-50 dark:bg-green-900/20'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-green-700 dark:text-green-300 font-medium">{v.comprador}</span>
                      <div className="flex items-center gap-2"><span className="text-green-600 dark:text-green-400 font-medium">{formatMoney(v.pesoTotal * v.precioKg)}</span><button onClick={() => deleteVenta(v.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">{v.fecha} · {v.cantidad} animales · {v.pesoTotal}kg</div>
                    <div className="text-slate-500 dark:text-slate-400">Pagado: {formatMoney(v.pagado)}{v.fiado && deuda > 0 && <span className="text-red-500 font-medium ml-2">Debe {formatMoney(deuda)}</span>}</div>
                  </div>
                )})}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Gastos</h3>
            {gastos.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto">{[...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((g) => (
                <div key={g.id} className="flex justify-between items-center text-xs bg-rose-50 dark:bg-rose-900/20 rounded p-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-rose-700 dark:text-rose-300 font-medium">{g.categoria}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">· {g.fecha}</span>
                    <p className="text-slate-600 dark:text-slate-300 truncate">{g.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2"><span className="text-red-600 font-medium">{formatMoney(g.monto)}</span><button onClick={() => deleteGasto(g.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
