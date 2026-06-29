import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePonedorasStore, addPostura, deletePostura, addBaja, deleteBaja, addVenta, deleteVenta, addGasto, deleteGasto, updateLote, deleteLote } from '../store'
import { ArrowLeft, X, Trash2 } from 'lucide-react'
import { formatMoney, formatNumber, parseMoney } from '../utils'
import NumberInput from '../../../components/NumberInput'
import MoneyInput from '../../../components/MoneyInput'

const GASTO_CATEGORIAS = ['Alimento', 'Vacunas', 'Mano de obra', 'Infraestructura', 'Transporte', 'Otro']

export default function LoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoteById, getPosturasByLote, getBajasByLote, getVentasByLote, getGastosByLote } = usePonedorasStore()

  const lote = getLoteById(id!)
  const posturas = getPosturasByLote(id!)
  const bajas = getBajasByLote(id!)
  const ventas = getVentasByLote(id!)
  const gastos = getGastosByLote(id!)

  const [showForm, setShowForm] = useState<'postura' | 'baja' | 'venta' | 'gasto' | null>(null)

  const [pFecha, setPFecha] = useState(new Date().toISOString().split('T')[0])
  const [pHuevos, setPHuevos] = useState('')
  const [pGallinas, setPGallinas] = useState('')

  const [bCantidad, setBCantidad] = useState('')
  const [bFecha, setBFecha] = useState(new Date().toISOString().split('T')[0])
  const [bCausa, setBCausa] = useState('')

  const [vFecha, setVFecha] = useState(new Date().toISOString().split('T')[0])
  const [vCantidad, setVCantidad] = useState('')
  const [vPrecio, setVPrecio] = useState('')
  const [vComprador, setVComprador] = useState('')

  const [gFecha, setGFecha] = useState(new Date().toISOString().split('T')[0])
  const [gDesc, setGDesc] = useState('')
  const [gMonto, setGMonto] = useState('')
  const [gCat, setGCat] = useState('Alimento')
  const [gEtapa, setGEtapa] = useState<'cria' | 'postura'>('cria')

  if (!lote) {
    return <p className="text-slate-500 dark:text-slate-400">Lote no encontrado</p>
  }

  const cl = lote
  const enPostura = cl.fechaInicioPostura !== null
  const gallinasV = cl.cantidadInicial - bajas.reduce((s, b) => s + b.cantidad, 0)
  const totalHuevos = posturas.reduce((s, p) => s + p.huevos, 0)
  const totalVentas = ventas.reduce((s, v) => s + v.cantidad * v.precioPorUnidad, 0)
  const totalGastos = gastos.reduce((s, g) => s + g.monto, 0)
  const gastosCria = gastos.filter((g) => g.etapa === 'cria').reduce((s, g) => s + g.monto, 0)
  const gastosPostura = gastos.filter((g) => g.etapa === 'postura').reduce((s, g) => s + g.monto, 0)

  const ganancia = totalVentas - cl.costoInicial - totalGastos
  const posturasOrdenadas = [...posturas].sort((a, b) => b.fecha.localeCompare(a.fecha))

  function err(msg: string) { alert(msg) }

  function handleAddPostura(e: React.FormEvent) {
    e.preventDefault()
    addPostura({ id: crypto.randomUUID(), loteId: cl.id, fecha: pFecha, huevos: Number(pHuevos), gallinas: Number(pGallinas) })
    setShowForm(null); setPFecha(new Date().toISOString().split('T')[0]); setPHuevos(''); setPGallinas('')
  }

  function handleAddBaja(e: React.FormEvent) {
    e.preventDefault()
    const c = Number(bCantidad)
    if (c > gallinasV) return err(`Solo hay ${gallinasV} gallinas vivas, no podés dar de baja ${c}`)
    addBaja({ id: crypto.randomUUID(), loteId: cl.id, cantidad: c, fecha: bFecha, causa: bCausa })
    setShowForm(null); setBCantidad(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('')
  }

  function handleAddVenta(e: React.FormEvent) {
    e.preventDefault()
    const c = Number(vCantidad)
    if (c > totalHuevos - ventas.reduce((s, v) => s + v.cantidad, 0)) {
      return err(`Solo hay ${formatNumber(totalHuevos - ventas.reduce((s, v) => s + v.cantidad, 0))} huevos disponibles para vender`)
    }
    addVenta({ id: crypto.randomUUID(), loteId: cl.id, fecha: vFecha, cantidad: c, precioPorUnidad: parseMoney(vPrecio), comprador: vComprador })
    setShowForm(null); setVFecha(new Date().toISOString().split('T')[0]); setVCantidad(''); setVPrecio(''); setVComprador('')
  }

  function handleAddGasto(e: React.FormEvent) {
    e.preventDefault()
    addGasto({ id: crypto.randomUUID(), loteId: cl.id, fecha: gFecha, descripcion: gDesc, monto: parseMoney(gMonto), categoria: gCat, etapa: gEtapa })
    setShowForm(null); setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento'); setGEtapa('cria')
  }

  function handleCerrarLote() {
    if (gallinasV > 0 && !confirm('Todavía hay gallinas vivas. ¿Cerrar de todas formas?')) return
    updateLote(cl.id, { activo: false })
  }

  function handleDeleteLote() {
    if (confirm('¿Eliminar este lote y todos sus registros?')) { deleteLote(cl.id); navigate('/ponedoras') }
  }

  function openForm(type: 'postura' | 'baja' | 'venta' | 'gasto') {
    setShowForm(type)
    setPFecha(new Date().toISOString().split('T')[0]); setPHuevos(''); setPGallinas('')
    setBCantidad(''); setBFecha(new Date().toISOString().split('T')[0]); setBCausa('')
    setVFecha(new Date().toISOString().split('T')[0]); setVCantidad(''); setVPrecio(''); setVComprador('')
    setGFecha(new Date().toISOString().split('T')[0]); setGDesc(''); setGMonto(''); setGCat('Alimento'); setGEtapa(enPostura ? 'postura' : 'cria')
  }

  return (
    <div>
      <button onClick={() => navigate('/ponedoras')} className="flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 mb-4"><ArrowLeft size={18} /> Volver</button>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white truncate">{cl.nombre}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
              {cl.raza} · Inicio: {cl.fechaInicio}{cl.fechaInicioPostura ? ` · Postura desde: ${cl.fechaInicioPostura}` : ' · En etapa de cría'}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <span className={`px-3 py-1 rounded text-sm font-medium ${cl.activo ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
              {cl.activo ? 'Activo' : 'Cerrado'}
            </span>
            <button onClick={handleDeleteLote} className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Eliminar lote"><Trash2 size={16} /></button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 text-center text-sm mb-4">
          {[
            { label: 'Inicial', val: formatNumber(cl.cantidadInicial), bg: 'bg-slate-50 dark:bg-slate-700/50', txt: 'text-slate-800 dark:text-white' },
            { label: 'Bajas', val: formatNumber(bajas.reduce((s, b) => s + b.cantidad, 0)), bg: 'bg-red-50 dark:bg-red-900/20', txt: 'text-red-600 dark:text-red-400' },
            { label: 'Vivas', val: formatNumber(gallinasV), bg: 'bg-green-50 dark:bg-green-900/20', txt: 'text-green-600 dark:text-green-400' },
            { label: 'Huevos', val: formatNumber(totalHuevos), bg: 'bg-amber-50 dark:bg-amber-900/20', txt: 'text-amber-600 dark:text-amber-400' },
            { label: 'Gastos Cría', val: formatMoney(gastosCria), bg: 'bg-rose-50 dark:bg-rose-900/20', txt: 'text-rose-600 dark:text-rose-400' },
            { label: 'Gastos Post', val: formatMoney(gastosPostura), bg: 'bg-purple-50 dark:bg-purple-900/20', txt: 'text-purple-600 dark:text-purple-400' },
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
            <button onClick={() => openForm('postura')} className="text-xs px-3 py-1.5 bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 rounded-lg hover:bg-amber-200 transition-colors">+ Postura</button>
            <button onClick={() => openForm('baja')} className="text-xs px-3 py-1.5 bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors">+ Baja</button>
            <button onClick={() => openForm('venta')} className="text-xs px-3 py-1.5 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded-lg hover:bg-green-200 transition-colors">+ Venta Huevos</button>
            <button onClick={() => openForm('gasto')} className="text-xs px-3 py-1.5 bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 rounded-lg hover:bg-rose-200 transition-colors">+ Gasto</button>
            {!enPostura && (
              <button onClick={() => updateLote(cl.id, { fechaInicioPostura: new Date().toISOString().split('T')[0] })} className="text-xs px-3 py-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 rounded-lg hover:bg-purple-200 transition-colors">Iniciar Postura</button>
            )}
            <button onClick={handleCerrarLote} className="text-xs px-3 py-1.5 bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 transition-colors ml-auto">Cerrar Lote</button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                {showForm === 'postura' && 'Registrar Postura'}
                {showForm === 'baja' && 'Registrar Baja'}
                {showForm === 'venta' && 'Vender Huevos'}
                {showForm === 'gasto' && 'Registrar Gasto'}
              </h2>
              <button onClick={() => setShowForm(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>

            {showForm === 'postura' && (
              <form onSubmit={handleAddPostura} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={pFecha} onChange={e => setPFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Huevos recolectados</label><NumberInput value={pHuevos} onChange={setPHuevos} required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Gallinas en postura</label><NumberInput value={pGallinas} onChange={setPGallinas} required placeholder="Cantidad de gallinas que pusieron" /></div>
                <button type="submit" className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'baja' && (
              <form onSubmit={handleAddBaja} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Gallinas vivas: {formatNumber(gallinasV)}</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad</label><NumberInput value={bCantidad} onChange={setBCantidad} required max={gallinasV || 1} /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={bFecha} onChange={e => setBFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Causa</label><input type="text" required value={bCausa} onChange={e => setBCausa(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Ej: Muerte natural" /></div>
                <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'venta' && (
              <form onSubmit={handleAddVenta} className="space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Huevos disponibles: {formatNumber(totalHuevos - ventas.reduce((s, v) => s + v.cantidad, 0))}</p>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={vFecha} onChange={e => setVFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Cantidad de huevos</label><NumberInput value={vCantidad} onChange={setVCantidad} required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Precio por unidad ($)</label><MoneyInput value={vPrecio} onChange={setVPrecio} placeholder="Ej: 250" required /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comprador</label><input type="text" required value={vComprador} onChange={e => setVComprador(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" /></div>
                <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium">Guardar</button>
              </form>
            )}

            {showForm === 'gasto' && (
              <form onSubmit={handleAddGasto} className="space-y-3">
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Etapa</label>
                  <div className="flex gap-2 mt-1">
                    <button type="button" onClick={() => setGEtapa('cria')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${gEtapa === 'cria' ? 'bg-rose-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Cría</button>
                    <button type="button" onClick={() => setGEtapa('postura')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${gEtapa === 'postura' ? 'bg-purple-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>Postura</button>
                  </div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Fecha</label><input type="date" required value={gFecha} onChange={e => setGFecha(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Descripción</label><input type="text" required value={gDesc} onChange={e => setGDesc(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" placeholder="Ej: Bolsas de alimento" /></div>
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:col-span-1">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Postura</h3>
          {posturasOrdenadas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {posturasOrdenadas.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-xs bg-amber-50 dark:bg-amber-900/20 rounded p-1.5">
                  <span className="text-amber-700 dark:text-amber-300">{p.fecha} · {formatNumber(p.huevos)} huevos · {formatNumber(p.gallinas)} gallinas</span>
                  <button onClick={() => deletePostura(p.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:col-span-1">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Bajas</h3>
          {bajas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[...bajas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((b) => (
                <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 dark:bg-red-900/20 rounded p-1.5">
                  <span className="text-red-600 dark:text-red-400">{b.cantidad} gallinas · {b.fecha} · {b.causa}</span>
                  <button onClick={() => deleteBaja(b.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:col-span-1">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Ventas de Huevos</h3>
          {ventas.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[...ventas].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((v) => (
                <div key={v.id} className="text-xs bg-green-50 dark:bg-green-900/20 rounded p-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-green-700 dark:text-green-300 font-medium">{v.comprador}</span>
                    <div className="flex items-center gap-1"><span className="text-green-600 dark:text-green-400 font-medium">{formatMoney(v.cantidad * v.precioPorUnidad)}</span><button onClick={() => deleteVenta(v.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">{v.fecha} · {formatNumber(v.cantidad)} huevos · ${v.precioPorUnidad.toLocaleString('es-AR')}/ud.</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 lg:col-span-2">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3 text-sm">Gastos</h3>
          {gastos.length === 0 ? <p className="text-xs text-slate-400">Sin registros</p> : (
            <div className="space-y-1.5 max-h-60 overflow-y-auto">
              {[...gastos].sort((a, b) => b.fecha.localeCompare(a.fecha)).map((g) => (
                <div key={g.id} className="flex justify-between items-center text-xs bg-rose-50 dark:bg-rose-900/20 rounded p-1.5">
                  <div className="min-w-0 flex-1">
                    <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${g.etapa === 'cria' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'}`}>{g.etapa === 'cria' ? 'Cría' : 'Post'}</span>
                    <span className="text-rose-700 dark:text-rose-300 font-medium ml-1">{g.categoria}</span>
                    <span className="text-slate-500 dark:text-slate-400 ml-1">· {g.fecha}</span>
                    <p className="text-slate-600 dark:text-slate-300 truncate">{g.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2"><span className="text-red-600 font-medium">{formatMoney(g.monto)}</span><button onClick={() => deleteGasto(g.id)} className="text-red-400 hover:text-red-600"><Trash2 size={12} /></button></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
