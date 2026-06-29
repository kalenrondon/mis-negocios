import { useState } from 'react'
import { useBordadoStore, addPedido, updatePedido, deletePedido } from '../store'
import type { PedidoBordado, EstadoPedido, TipoPuntada } from '../types'
import { Shirt, Plus, X, Search, ArrowLeft } from 'lucide-react'
import MoneyInput from '../../../components/MoneyInput'
import { useNavigate } from 'react-router-dom'

const estados: EstadoPedido[] = ['pendiente', 'en_proceso', 'terminado', 'entregado']
const puntadas: TipoPuntada[] = ['plana', 'cadena', 'cruz', 'realce', 'festón', 'otro']

const coloresEstado: Record<EstadoPedido, string> = {
  pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  en_proceso: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  terminado: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  entregado: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
}

function parseMoney(v: string) { return Number(v) || 0 }

export default function BordadoPage() {
  const navigate = useNavigate()
  const pedidos = useBordadoStore()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | 'todas'>('todas')
  const [cliente, setCliente] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [tipoPuntada, setTipoPuntada] = useState<TipoPuntada>('plana')
  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio] = useState('')
  const [senia, setSenia] = useState('')
  const [fechaIngreso, setFechaIngreso] = useState(new Date().toISOString().slice(0, 10))
  const [fechaEntrega, setFechaEntrega] = useState('')
  const [notas, setNotas] = useState('')
  const [editEstado, setEditEstado] = useState<EstadoPedido>('pendiente')

  function resetForm() {
    setCliente(''); setDescripcion(''); setTipoPuntada('plana'); setCantidad(''); setPrecio(''); setSenia('')
    setFechaIngreso(new Date().toISOString().slice(0, 10)); setFechaEntrega(''); setNotas('')
    setEditId(null); setEditEstado('pendiente'); setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!cliente.trim() || !descripcion.trim()) return
    const total = parseMoney(precio) * (Number(cantidad) || 0)
    if (editId) {
      updatePedido(editId, { cliente: cliente.trim(), descripcion: descripcion.trim(), tipoPuntada, cantidad: Number(cantidad) || 0, precioUnitario: parseMoney(precio), total, senia: parseMoney(senia), fechaIngreso, fechaEntrega, notas })
    } else {
      addPedido({ id: crypto.randomUUID(), cliente: cliente.trim(), descripcion: descripcion.trim(), tipoPuntada, cantidad: Number(cantidad) || 0, precioUnitario: parseMoney(precio), total, senia: parseMoney(senia), fechaIngreso, fechaEntrega, estado: 'pendiente', notas })
    }
    resetForm()
  }

  function startEdit(p: PedidoBordado) {
    setEditId(p.id); setCliente(p.cliente); setDescripcion(p.descripcion); setTipoPuntada(p.tipoPuntada)
    setCantidad(String(p.cantidad)); setPrecio(String(p.precioUnitario)); setSenia(String(p.senia))
    setFechaIngreso(p.fechaIngreso); setFechaEntrega(p.fechaEntrega); setNotas(p.notas)
    setEditEstado(p.estado); setShowForm(true)
  }

  const filtrados = pedidos.filter(p => {
    if (filtroEstado !== 'todas' && p.estado !== filtroEstado) return false
    if (busqueda && !p.cliente.toLowerCase().includes(busqueda.toLowerCase()) && !p.descripcion.toLowerCase().includes(busqueda.toLowerCase())) return false
    return true
  })

  const totalPendiente = filtrados.filter(p => p.estado !== 'entregado').reduce((s, p) => s + p.total - p.senia, 0)
  const totalEntregado = filtrados.filter(p => p.estado === 'entregado').reduce((s, p) => s + p.total, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bordado</h1>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Nuevo Pedido</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Total Pedidos</p>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{pedidos.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Pendientes</p>
          <p className="text-xl font-bold text-amber-600">{pedidos.filter(p => p.estado !== 'entregado').length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Por Cobrar</p>
          <p className="text-xl font-bold text-red-600">${totalPendiente.toLocaleString('es-AR')}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">Total Entregado</p>
          <p className="text-xl font-bold text-green-600">${totalEntregado.toLocaleString('es-AR')}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar cliente..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value as EstadoPedido | 'todas')} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="todas">Todos</option>
          {estados.map(e => <option key={e}>{e}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nuevo'} Pedido</h2>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cliente</label>
              <input required value={cliente} onChange={e => setCliente(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Tipo Puntada</label>
              <select value={tipoPuntada} onChange={e => setTipoPuntada(e.target.value as TipoPuntada)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {puntadas.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Cantidad</label>
              <input type="number" required min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Precio Unitario $</label>
              <MoneyInput value={precio} onChange={setPrecio} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Seña $</label>
              <MoneyInput value={senia} onChange={setSenia} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha Ingreso</label>
              <input type="date" required value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Fecha Entrega</label>
              <input type="date" value={fechaEntrega} onChange={e => setFechaEntrega(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {editId && (
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Estado</label>
                <select value={editEstado} onChange={e => { setEditEstado(e.target.value as EstadoPedido); if (editId) updatePedido(editId, { estado: e.target.value as EstadoPedido }) }} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {estados.map(e => <option key={e}>{e}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Descripción</label>
            <textarea required value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Ej: Toalla con iniciales..." />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Notas (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editId ? 'Guardar' : 'Crear Pedido'}</button>
        </form>
      )}

      {filtrados.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Shirt size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay pedidos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.sort((a, b) => a.fechaIngreso > b.fechaIngreso ? -1 : 1).map(p => (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-white">{p.cliente}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.descripcion}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${coloresEstado[p.estado]}`}>{p.estado.replace('_', ' ')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap mb-2">
                <span className="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">{p.tipoPuntada}</span>
                <span>x{p.cantidad}</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">${p.total.toLocaleString('es-AR')}</span>
                {p.senia > 0 && <span className="text-green-600">Seña: ${p.senia.toLocaleString('es-AR')}</span>}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between">
                <span>Ingreso: {new Date(p.fechaIngreso + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                {p.fechaEntrega && <span>Entrega: {new Date(p.fechaEntrega + 'T00:00:00').toLocaleDateString('es-AR')}</span>}
              </div>
              {p.notas && <p className="text-[10px] text-slate-400 italic mt-1">{p.notas}</p>}
              <div className="flex gap-1 mt-3 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => startEdit(p)} className="flex-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1 rounded transition-colors">Editar</button>
                <button onClick={() => { if (confirm('¿Eliminar pedido?')) deletePedido(p.id) }} className="flex-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-1 rounded transition-colors">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
