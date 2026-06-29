import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePollosStore, addBaja, deleteBaja, addPesaje, deletePesaje, addVenta, deleteVenta, addEmpacado, deleteEmpacado, addGasto, deleteGasto, updateLote, deleteLote, getVivosActuales, getEmpacadosActuales } from '../store'
import { ArrowLeft, X, Trash2 } from 'lucide-react'
import { formatMoney, formatNumber, parseMoney } from '../utils'
import NumberInput from '../../../components/NumberInput'
import MoneyInput from '../../../components/MoneyInput'

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoteById, getBajasByLote, getPesajesByLote, getVentasByLote, getEmpacadosByLote, getGastosByLote } = usePollosStore()

  const lote = getLoteById(id!)
  const bajas = getBajasByLote(id!)
  const pesajes = getPesajesByLote(id!)
  const ventas = getVentasByLote(id!)
  const empacados = getEmpacadosByLote(id!)
  const gastos = getGastosByLote(id!)

  const [showForm, setShowForm] = useState<'baja' | 'pesaje' | 'venta' | 'empacar' | 'gasto' | null>(null)

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
  const [vTipo, setVTipo] = useState<'vivo' | 'empacado'>('vivo')
  const [vFiado, setVFiado] = useState(false)
  const [vPagado, setVPagado] = useState('')

  const [eFecha, setEFecha] = useState(new Date().toISOString().split('T')[0])
  const [eCant, setECant] = useState('')
  const [ePeso, setEPeso] = useState('')

  const [gFecha, setGFecha] = useState(new Date().toISOString().split('T')[0])
  const [gDesc, setGDesc] = useState('')
  const [gMonto, setGMonto] = useState('')
  const [gCat, setGCat] = useState('Alimento')

  if (!lote) return <p className="text-slate-500 dark:text-slate-400">Lote no encontrado</p>

  const cl = lote
  const vivos = getVivosActuales(cl.id)
  const empStock = getEmpacadosActuales(cl.id)
  const tBajas = bajas.reduce((s, b) => s + b.cantidad, 0)
  const tEmp = empacados.reduce((s, e) => s + e.cantidad, 0)
  const tVen = ventas.reduce((s, v) => s + v.cantidad, 0)
  const ingresos = ventas.reduce((s, v) => s + v.pesoTotal * v.precioKg, 0)
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const ganancia = ingresos - cl.costoInicial - totalGastos

  function err(msg: string) { alert(msg) }

  function hBaja(e: React.FormEvent) { e.preventDefault()
    const c = Number(bCant)
    if (c > vivos) return err(`Solo hay ${vivos} vivos, no podés registrar ${c} bajas`)
    addBaja({ id: crypto.randomUUID(), loteId: cl.id, cantidad: c, fecha: bFecha, causa: bCausa })
    setShowForm(null); setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('') }

  function hPesaje(e: React.FormEvent) { e.preventDefault()
    addPesaje({ id: crypto.randomUUID(), loteId: cl.id, fecha: pFecha, pesoPromedio: Number(pPeso), muestra: Number(pMuestra) })
    setShowForm(null); setPFecha(new Date().toISOString().split('T')[0]); setPPeso(''); setPMuestra('') }

  function hVenta(e: React.FormEvent) { e.preventDefault()
    const c = Number(vCant)
    if (vTipo === 'vivo' && c > vivos) return err(`Solo hay ${vivos} vivos disponibles`)
    if (vTipo === 'empacado' && c > empStock) return err(`Solo hay ${empStock} empacados en stock`)
    const total = Number(vPeso) * parseMoney(vPrecio)
    addVenta({ id: crypto.randomUUID(), loteId: cl.id, fecha: vFecha, cantidad: c, precioKg: parseMoney(vPrecio), pesoTotal: Number(vPeso), comprador: vComp, tipo: vTipo, fiado: vFiado, pagado: vFiado ? Number(vPagado) : total })
    setShowForm(null); setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp(''); setVTipo('vivo'); setVFiado(false); setVPagado('') }

  function hEmpacar(e: React.FormEvent) { e.preventDefault()
    const c = Number(eCant)
    if (c > vivos) return err(`Solo hay ${vivos} vivos, no podés empacar ${c}`)
    addEmpacado({ id: crypto.randomUUID(), loteId: cl.id, fecha: eFecha, cantidad: c, pesoTotal: Number(ePeso) })
    setShowForm(null); setEFecha(new Date().toISOString().split('T')[0]); setECant(''); setEPeso('') }

  function hGasto(e: React.FormEvent) { e.preventDefault()
    addGasto({ id: crypto.randomUUID(), loteId: cl.id, fecha: gFecha, descripcion: gDesc, monto: parseMoney(gMonto), categoria: gCat })
    setShowForm(null); setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento') }

  function cerrar() { updateLote(cl.id, { activo: false }) }
  function borrar() { if (confirm('¿Eliminar este lote?')) { deleteLote(cl.id); navigate('/pollos') } }

  function of(t: 'baja' | 'pesaje' | 'venta' | 'empacar' | 'gasto') {
    setShowForm(t)
    setBCant(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('')
    setPFecha(new Date().toISOString().split('T')[0]); setPPeso(''); setPMuestra('')
    setVFecha(new Date().toISOString().split('T')[0]); setVCant(''); setVPeso(''); setVPrecio(''); setVComp(''); setVTipo('vivo'); setVFiado(false); setVPagado('')
    setEFecha(new Date().toISOString().split('T')[0]); setECant(''); setEPeso('')
    setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento')
  }

  return (
    <div>
      <button onClick={() => navigate('/pollos')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate">{cl.nombre}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
              {cl.raza} · Inicio: {cl.fechaInicio} · Costo inicial: {formatMoney(cl.costoInicial)}
              {totalGastos > 0 ? ` · Gastos: ${formatMoney(totalGastos)}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`px-3 py-1 rounded text-sm font-medium ${cl.activo ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
              {cl.activo ? 'Activo' : 'Cerrado'}
            </span>
            <button onClick={borrar} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar lote"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center text-sm mb-4">
          {[
            { label: 'Inicial', val: formatNumber(cl.cantidadInicial), bg: 'bg-slate-50 dark:bg-slate-700/50', txt: 'text-slate-800 dark:text-white' },
            { label: 'Bajas', val: formatNumber(tBajas), bg: 'bg-red-50 dark:bg-red-900/20', txt: 'text-red-600 dark:text-red-400' },
            { label: 'Vivos', val: formatNumber(vivos), bg: 'bg-blue-50 dark:bg-blue-900/20', txt: 'text-blue-600 dark:text-blue-400' },
            { label: 'Empacados', val: formatNumber(tEmp), bg: 'bg-purple-50 dark:bg-purple-900/20', txt: 'text-purple-600 dark:text-purple-400' },
            { label: 'Vendidos', val: formatNumber(tVen), bg: 'bg-green-50 dark:bg-green-900/20', txt: 'text-green-600 dark:text-green-400' },
            { label: 'Gastos', val: formatMoney(totalGastos), bg: 'bg-amber-50 dark:bg-amber-900/20', txt: 'text-amber-600 dark:text-amber-400' },
            { label: 'Ganancia', val: formatMoney(ganancia), bg: 'bg-amber-50 dark:bg-amber-900/20', txt: ganancia >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
          ].map((s) => (
            <div key={s.label} className={`${s.bg} rounded-lg p-3`}>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{s.label}</p>
              <p className={`font-bold ${s.txt} truncate`}>{s.val}</p>
            </div>
          ))}
        </div>

        {cl.activo && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => of('empacar')} className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors">+ Empacar</button>
            <button onClick={() => of('baja')} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors">+ Baja</button>
            <button onClick={() => of('pesaje')} className="text-xs px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded-lg hover:bg-blue-200 transition-colors">+ Pesaje</button>
            <button onClick={() => of('venta')} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">+ Venta</button>
            <button onClick={() => of('gasto')} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition-colors">+ Gasto</button>
            <button onClick={cerrar} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors ml-auto">Cerrar Lote</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {showForm === 'empacar' && 'Empacar pollos'}
                {showForm === 'baja' && 'Registrar Baja'}
                {showForm === 'pesaje' && 'Registrar Pesaje'}
                {showForm === 'venta' && 'Registrar Venta'}
                {showForm === 'gasto' && 'Registrar Gasto'}
              </h2>
              <button onClick={() => setShowForm(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {showForm === 'empacar' && (
              <form onSubmit={hEmpacar} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Disponibles: {formatNumber(vivos)} vivos</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={eFecha} onChange={e => setEFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={eCant} onChange={setECant} required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso total (kg)</label><input type="text" inputMode="decimal" required value={ePeso} onChange={e => setEPeso(e.target.value.replace(/[^0-9.,]/g, ''))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" /></div>
                <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'baja' && (
              <form onSubmit={hBaja} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Vivos disponibles: {formatNumber(vivos)}</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={bCant} onChange={setBCant} required /></div>
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

            {showForm === 'venta' && (
              <form onSubmit={hVenta} className="space-y-3">
                <div className="grid grid-cols-2 gap-2 mb-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-center">Vivos: <strong className="text-blue-600">{formatNumber(vivos)}</strong></p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 bg-purple-50 dark:bg-purple-900/20 p-2 rounded text-center">Empacados: <strong className="text-purple-600">{formatNumber(empStock)}</strong></p>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={vFecha} onChange={e => setVFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de venta</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setVTipo('vivo')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${vTipo === 'vivo' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Vivo <span className="text-xs opacity-75">({formatNumber(vivos)})</span></button>
                    <button type="button" onClick={() => setVTipo('empacado')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${vTipo === 'empacado' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Empacado <span className="text-xs opacity-75">({formatNumber(empStock)})</span></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={vCant} onChange={setVCant} required /></div>
                  <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Peso total (kg)</label><input type="text" inputMode="decimal" required value={vPeso} onChange={e => setVPeso(e.target.value.replace(/[^0-9.,]/g, ''))} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Precio por kg ($)</label><MoneyInput value={vPrecio} onChange={setVPrecio} placeholder="Ej: 4500" /></div>
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

            {showForm === 'gasto' && (
              <form onSubmit={hGasto} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={gFecha} onChange={e => setGFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label><input type="text" required value={gDesc} onChange={e => setGDesc(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Ej: Bolsas de alimento" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Categoría</label>
                  <select value={gCat} onChange={e => setGCat(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                    <option>Alimento</option><option>Vacunas</option><option>Mano de obra</option><option>Infraestructura</option><option>Transporte</option><option>Otro</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Monto ($)</label><MoneyInput value={gMonto} onChange={setGMonto} placeholder="Ej: 5000" /></div>
                <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">Guardar</button>
              </form>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Empacados</h3>
          {empacados.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...empacados].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((e) => (
              <div key={e.id} className="flex justify-between items-center text-xs bg-purple-50 dark:bg-purple-900/20 rounded p-1.5">
                <span className="text-purple-700 dark:text-purple-300 truncate">{e.fecha} · {formatNumber(e.cantidad)} pollos</span>
                <button onClick={() => deleteEmpacado(e.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-1"><Trash2 size={12} /></button>
              </div>
            ))}</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Pesajes</h3>
          {pesajes.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...pesajes].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((p) => (
              <div key={p.id} className="flex justify-between items-center text-xs bg-slate-50 dark:bg-slate-700/30 rounded p-1.5">
                <span className="text-slate-600 dark:text-slate-300 truncate">{p.fecha} · {p.pesoPromedio} kg · {p.muestra} pollos</span>
                <button onClick={() => deletePesaje(p.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-1"><Trash2 size={12} /></button>
              </div>
            ))}</div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Bajas</h3>
          {bajas.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">{[...bajas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((b) => (
              <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 dark:bg-red-900/20 rounded p-1.5">
                <span className="text-red-600 dark:text-red-400 truncate">{b.cantidad} pollos · {b.fecha} · {b.causa}</span>
                <button onClick={() => deleteBaja(b.id)} className="text-red-400 hover:text-red-600 shrink-0 ml-1"><Trash2 size={12} /></button>
              </div>
            ))}</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Ventas</h3>
          {ventas.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500">Sin registros</p> : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {[...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((v) => {
                const deuda = v.pesoTotal * v.precioKg - v.pagado
                return (
                <div key={v.id} className={`text-xs rounded-lg p-3 ${v.fiado && deuda > 0 ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700' : 'bg-green-50 dark:bg-green-900/20'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${v.tipo === 'vivo' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>{v.tipo === 'vivo' ? 'Vivo' : 'Empac'}</span>
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{v.comprador}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400 font-medium">{formatMoney(v.pesoTotal * v.precioKg)}</span>
                      <button onClick={() => deleteVenta(v.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                    </div>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {v.fecha} · {formatNumber(v.cantidad)} pollos · {v.pesoTotal}kg · ${v.precioKg.toLocaleString('es-AR')}/kg
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    Pagado: {formatMoney(v.pagado)}
                    {v.fiado && deuda > 0 && <span className="text-red-500 font-medium ml-2">Debe {formatMoney(deuda)}</span>}
                    {v.fiado && deuda <= 0 && <span className="text-green-600 ml-2">✓ Pagado completo</span>}
                  </div>
                </div>
              )})}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Gastos</h3>
          {gastos.length === 0 ? <p className="text-xs text-slate-400 dark:text-slate-500">Sin registros</p> : (
            <div className="space-y-1.5 max-h-80 overflow-y-auto">{[...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((g) => (
              <div key={g.id} className="flex justify-between items-center text-xs bg-amber-50 dark:bg-amber-900/20 rounded p-2">
                <div className="min-w-0 flex-1">
                  <span className="text-amber-700 dark:text-amber-300 font-medium">{g.categoria}</span>
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
  )
}
