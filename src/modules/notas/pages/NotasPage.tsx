import { useState } from 'react'
import { useNotasStore, addNota, updateNota, deleteNota } from '../store'
import { FileText, Plus, Trash2, Edit2, X, Save, Search } from 'lucide-react'

export default function NotasPage() {
  const { ordenadas } = useNotasStore()
  const [editId, setEditId] = useState<string | null>(null)
  const [busquedaNotas, setBusquedaNotas] = useState('')
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  function reset() { setEditId(null); setTitulo(''); setContenido('') }

  function startNew() { reset(); setEditId('__new__') }

  function startEdit(n: typeof ordenadas[0]) { setEditId(n.id); setTitulo(n.titulo); setContenido(n.contenido) }

  function handleSave() {
    if (!titulo.trim()) return
    const now = new Date().toISOString()
    if (editId === '__new__') {
      addNota({ id: crypto.randomUUID(), titulo: titulo.trim(), contenido, createdAt: now, updatedAt: now })
    } else if (editId) {
      updateNota(editId, { titulo: titulo.trim(), contenido })
    }
    reset()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Notas</h1>
        <button onClick={startNew} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Nueva</button>
      </div>

      {editId === '__new__' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">Nueva Nota</h2>
            <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
          <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribí algo..." rows={6} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          <button onClick={handleSave} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"><Save size={16} /> Guardar</button>
        </div>
      )}

      {ordenadas.length > 0 && (
        <div className="relative max-w-xs mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" value={busquedaNotas} onChange={e => setBusquedaNotas(e.target.value)} placeholder="Buscar notas..." className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
      )}
      {ordenadas.length === 0 && editId !== '__new__' ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <FileText size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay notas</p>
          <p className="text-sm">Creá una nueva nota para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {ordenadas.filter(n => !busquedaNotas || n.titulo.toLowerCase().includes(busquedaNotas.toLowerCase()) || n.contenido.toLowerCase().includes(busquedaNotas.toLowerCase())).map((n) => (
            <div key={n.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md transition-shadow">
              {editId === n.id ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-700 dark:text-slate-300">Editar</h2>
                    <button onClick={reset} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                  </div>
                  <input value={titulo} onChange={e => setTitulo(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
                  <textarea value={contenido} onChange={e => setContenido(e.target.value)} rows={4} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  <div className="flex gap-2">
                    <button onClick={handleSave} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-medium"><Save size={14} /> Guardar</button>
                    <button onClick={reset} className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">Cancelar</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-medium text-slate-800 dark:text-white truncate">{n.titulo}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => startEdit(n)} className="p-1 text-slate-400 hover:text-blue-600"><Edit2 size={13} /></button>
                      <button onClick={() => { if (confirm('¿Eliminar nota?')) deleteNota(n.id) }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 whitespace-pre-wrap line-clamp-4">{n.contenido}</p>
                  <p className="text-[10px] text-slate-400 mt-2">{new Date(n.updatedAt).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
