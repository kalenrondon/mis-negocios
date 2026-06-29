import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useUniversidadStore, updateMateria, deleteMateria,
  addTarea, updateTarea, deleteTarea,
  addExamen, updateExamen, deleteExamen,
  addHorario, deleteHorario,
  addApunte, updateApunte,
  addSesion, deleteSesion,
} from '../store'
import type { TareaEstado, ExamenTipo, TareaPrioridad } from '../types'
import type { ChatMessage } from '../ai-service'
import { sendChatMessage, buildMateriaContext } from '../ai-service'
import {
  ArrowLeft, Info, CheckSquare, Brain, Clock, Calendar, BookOpen, Mic, FileText,
  Plus, Trash2, Pencil, Save, Play, Square, Send, Sparkles, Settings2,
} from 'lucide-react'

type Tab = 'info' | 'tareas' | 'examenes' | 'horario' | 'apuntes' | 'tiempo' | 'ia'

const tabs: { key: Tab; label: string; icon: any }[] = [
  { key: 'info', label: 'Info', icon: Info },
  { key: 'tareas', label: 'Tareas', icon: CheckSquare },
  { key: 'examenes', label: 'Exámenes', icon: Brain },
  { key: 'horario', label: 'Horario', icon: Calendar },
  { key: 'apuntes', label: 'Apuntes', icon: FileText },
  { key: 'tiempo', label: 'Tiempo', icon: Clock },
  { key: 'ia', label: 'IA', icon: Mic },
]

export default function MateriaDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const store = useUniversidadStore()
  const materia = store.materias.find(m => m.id === id)
  const [tab, setTab] = useState<Tab>('info')

  if (!materia) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-400 text-lg">Materia no encontrada</p>
        <button onClick={() => navigate('/universidad')} className="text-blue-600 hover:text-blue-700 mt-2 text-sm">Volver</button>
      </div>
    )
  }

  const tareas = store.tareas.filter(t => t.materiaId === id)
  const examenes = store.examenes.filter(e => e.materiaId === id)
  const horarios = store.horarios.filter(h => h.materiaId === id)
  const apuntes = store.apuntes.filter(a => a.materiaId === id)
  const sesiones = store.sesiones.filter(s => s.materiaId === id)

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => navigate('/universidad')} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><ArrowLeft size={20} /></button>
        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: materia.color || '#3b82f6' }} />
        <h1 className="text-xl font-bold text-slate-800 dark:text-white">{materia.nombre}</h1>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${materia.estado === 'cursando' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : materia.estado === 'aprobada' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
          {materia.estado}
        </span>
      </div>

      <div className="flex gap-1 mb-6 border-b border-slate-200 dark:border-slate-700 overflow-x-auto pb-px">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${tab === t.key ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'info' && <InfoTab materia={materia} updateMateria={updateMateria} deleteMateria={deleteMateria} navigate={navigate} />}
      {tab === 'tareas' && <TareasTab materiaId={id!} tareas={tareas} />}
      {tab === 'examenes' && <ExamenesTab materiaId={id!} examenes={examenes} />}
      {tab === 'horario' && <HorarioTab materiaId={id!} horarios={horarios} />}
      {tab === 'apuntes' && <ApuntesTab materiaId={id!} apuntes={apuntes} />}
      {tab === 'tiempo' && <TiempoTab materiaId={id!} sesiones={sesiones} />}
      {tab === 'ia' && <IATab materia={materia} apuntes={apuntes} examenes={examenes} horarios={horarios} tareas={tareas} />}
    </div>
  )
}

function InfoTab({ materia, updateMateria, deleteMateria, navigate }: any) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ ...materia })

  function handleSave() {
    updateMateria(materia.id, {
      nombre: form.nombre, codigo: form.codigo, profesor: form.profesor,
      creditos: Number(form.creditos) || 0, horario: form.horario, aula: form.aula,
      modalidad: form.modalidad, descripcion: form.descripcion, color: form.color, estado: form.estado,
    })
    setEditing(false)
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[{ key: 'nombre', label: 'Nombre' }, { key: 'codigo', label: 'Código' }, { key: 'profesor', label: 'Profesor' }, { key: 'horario', label: 'Horario' }, { key: 'aula', label: 'Aula' }].map(f => (
              <div key={f.key}>
                <label className="text-xs text-slate-500 mb-0.5 block">{f.label}</label>
                <input value={(form as any)[f.key] || ''} onChange={e => setForm({ ...form, [f.key]: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-500 mb-0.5 block">Créditos</label>
              <input type="number" value={form.creditos || ''} onChange={e => setForm({ ...form, creditos: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-0.5 block">Modalidad</label>
              <select value={form.modalidad} onChange={e => setForm({ ...form, modalidad: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="presencial">Presencial</option>
                <option value="virtual">Virtual</option>
                <option value="hibrida">Híbrida</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-0.5 block">Estado</label>
              <select value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="cursando">Cursando</option>
                <option value="aprobada">Aprobada</option>
                <option value="desaprobada">Desaprobada</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Color:</span>
              {['#3b82f6','#ef4444','#10b981','#f59e0b','#8b5cf6','#ec4899','#06b6d4','#f97316'].map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className={`w-5 h-5 rounded-full border-2 ${form.color === c ? 'border-slate-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-slate-500 mb-0.5 block">Descripción</label>
              <textarea value={form.descripcion || ''} onChange={e => setForm({ ...form, descripcion: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Save size={14} /> Guardar</button>
            <button onClick={() => setEditing(false)} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div><span className="text-xs text-slate-400">Profesor</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{materia.profesor || '—'}</p></div>
            <div><span className="text-xs text-slate-400">Código</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{materia.codigo || '—'}</p></div>
            <div><span className="text-xs text-slate-400">Créditos</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{materia.creditos || '—'}</p></div>
            <div><span className="text-xs text-slate-400">Horario</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{materia.horario || '—'}</p></div>
            <div><span className="text-xs text-slate-400">Aula</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200">{materia.aula || '—'}</p></div>
            <div><span className="text-xs text-slate-400">Modalidad</span><p className="text-sm font-medium text-slate-700 dark:text-slate-200 capitalize">{materia.modalidad || '—'}</p></div>
          </div>
          {materia.descripcion && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{materia.descripcion}</p>}
          <div className="flex items-center gap-2">
            {materia.promedio !== undefined && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-1.5 text-sm">
                <span className="text-blue-700 dark:text-blue-300 font-bold">{materia.promedio.toFixed(2)}</span>
                <span className="text-blue-500 text-xs ml-1">promedio</span>
              </div>
            )}
            <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil size={12} /> Editar</button>
            <button onClick={() => { if (confirm('¿Eliminar materia?')) { deleteMateria(materia.id); navigate('/universidad') } }} className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 size={12} /> Eliminar</button>
          </div>
        </div>
      )}
    </div>
  )
}

function TareasTab({ materiaId, tareas }: { materiaId: string; tareas: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [fechaLimite, setFechaLimite] = useState('')
  const [prioridad, setPrioridad] = useState<TareaPrioridad>('media')
  const [porcentaje, setPorcentaje] = useState('')
  const [estado, setEstado] = useState<TareaEstado>('pendiente')

  function resetForm() {
    setTitulo(''); setDescripcion(''); setFechaLimite(''); setPrioridad('media'); setPorcentaje(''); setEstado('pendiente')
    setEditId(null); setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !fechaLimite) return
    if (editId) {
      updateTarea(editId, { titulo: titulo.trim(), descripcion, fechaLimite, prioridad, porcentaje: Number(porcentaje) || 0, estado })
    } else {
      addTarea({ id: crypto.randomUUID(), materiaId, titulo: titulo.trim(), descripcion, fechaLimite, prioridad, porcentaje: Number(porcentaje) || 0, estado: 'pendiente', archivos: '', comentarios: '' })
    }
    resetForm()
  }

  function startEdit(t: any) {
    setEditId(t.id); setTitulo(t.titulo); setDescripcion(t.descripcion); setFechaLimite(t.fechaLimite)
    setPrioridad(t.prioridad); setPorcentaje(String(t.porcentaje)); setEstado(t.estado); setShowForm(true)
  }

  const prioridadColors: Record<string, string> = { alta: 'text-red-600', media: 'text-amber-600', baja: 'text-blue-600' }
  const estadoColors: Record<string, string> = { pendiente: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', entregada: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', vencida: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' }

  return (
    <div>
      <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 mb-4"><Plus size={14} /> Nueva Tarea</button>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nueva'} Tarea</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" required value={fechaLimite} onChange={e => setFechaLimite(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={prioridad} onChange={e => setPrioridad(e.target.value as TareaPrioridad)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="baja">Baja prioridad</option>
              <option value="media">Media prioridad</option>
              <option value="alta">Alta prioridad</option>
            </select>
            <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} placeholder="Porcentaje (ej: 20)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {editId && (
              <select value={estado} onChange={e => setEstado(e.target.value as TareaEstado)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pendiente">Pendiente</option>
                <option value="entregada">Entregada</option>
                <option value="vencida">Vencida</option>
              </select>
            )}
            <div className="sm:col-span-2">
              <textarea value={descripcion} onChange={e => setDescripcion(e.target.value)} placeholder="Descripción" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Guardar</button>
            <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </form>
      )}
      {tareas.length === 0 && !showForm ? (
        <p className="text-sm text-slate-400 text-center py-8">Sin tareas</p>
      ) : (
        <div className="space-y-2">
          {tareas.sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite)).map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-slate-800 dark:text-white">{t.titulo}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${estadoColors[t.estado]}`}>{t.estado}</span>
                  <span className={`text-xs ${prioridadColors[t.prioridad]}`}>⬤</span>
                </div>
                {t.descripcion && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t.descripcion}</p>}
                <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-400">
                  <span>📅 {new Date(t.fechaLimite + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                  {t.porcentaje > 0 && <span>Ponderación: {t.porcentaje}%</span>}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => startEdit(t)} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={12} /></button>
                <button onClick={() => { if (confirm('¿Eliminar tarea?')) deleteTarea(t.id) }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ExamenesTab({ materiaId, examenes }: { materiaId: string; examenes: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [tipo, setTipo] = useState<ExamenTipo>('parcial')
  const [fecha, setFecha] = useState('')
  const [porcentaje, setPorcentaje] = useState('')
  const [nota, setNota] = useState('')
  const [notaMax, setNotaMax] = useState('')
  const [obs, setObs] = useState('')

  function resetForm() { setTipo('parcial'); setFecha(''); setPorcentaje(''); setNota(''); setNotaMax(''); setObs(''); setEditId(null); setShowForm(false) }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fecha) return
    if (editId) {
      updateExamen(editId, { tipo, fecha, porcentaje: Number(porcentaje) || 0, notaObtenida: Number(nota) || 0, notaMaxima: Number(notaMax) || 10, observaciones: obs })
    } else {
      addExamen({ id: crypto.randomUUID(), materiaId, tipo, fecha, porcentaje: Number(porcentaje) || 0, notaObtenida: Number(nota) || 0, notaMaxima: Number(notaMax) || 10, observaciones: obs })
    }
    resetForm()
  }
  function startEdit(e: any) { setEditId(e.id); setTipo(e.tipo); setFecha(e.fecha); setPorcentaje(String(e.porcentaje)); setNota(String(e.notaObtenida)); setNotaMax(String(e.notaMaxima)); setObs(e.observaciones); setShowForm(true) }

  const notaFinal = examenes.filter(e => e.notaObtenida > 0 && e.notaMaxima > 0).reduce((acc, e) => {
    return acc + (e.notaObtenida / e.notaMaxima) * (e.porcentaje || 0)
  }, 0)
  const tipoColors: Record<string, string> = { parcial: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300', final: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', quiz: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', taller: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' }

  return (
    <div>
      <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 mb-4"><Plus size={14} /> Nuevo Examen</button>
      {examenes.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2 mb-4 text-sm inline-block">
          <span className="text-blue-700 dark:text-blue-300 font-bold">Nota acumulada: {notaFinal.toFixed(2)}%</span>
        </div>
      )}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nuevo'} Examen</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <select value={tipo} onChange={e => setTipo(e.target.value as ExamenTipo)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="parcial">Parcial</option>
              <option value="final">Final</option>
              <option value="quiz">Quiz</option>
              <option value="taller">Taller</option>
            </select>
            <input type="date" required value={fecha} onChange={e => setFecha(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" value={porcentaje} onChange={e => setPorcentaje(e.target.value)} placeholder="Porcentaje %" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" step="0.1" value={nota} onChange={e => setNota(e.target.value)} placeholder="Nota obtenida" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="number" step="0.1" value={notaMax} onChange={e => setNotaMax(e.target.value)} placeholder="Nota máxima (ej: 10)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={obs} onChange={e => setObs(e.target.value)} placeholder="Observaciones" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Guardar</button>
            <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </form>
      )}
      {examenes.length === 0 && !showForm ? (
        <p className="text-sm text-slate-400 text-center py-8">Sin exámenes</p>
      ) : (
        <div className="space-y-2">
          {examenes.sort((a, b) => a.fecha.localeCompare(b.fecha)).map(e => (
            <div key={e.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${tipoColors[e.tipo]}`}>{e.tipo}</span>
                <div>
                  <p className="text-xs text-slate-500">{new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</p>
                  {e.notaObtenida > 0 && <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{e.notaObtenida} / {e.notaMaxima} ({e.porcentaje}%)</p>}
                  {e.observaciones && <p className="text-[10px] text-slate-400">{e.observaciones}</p>}
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => startEdit(e)} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={12} /></button>
                <button onClick={() => { if (confirm('¿Eliminar examen?')) deleteExamen(e.id) }} className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HorarioTab({ materiaId, horarios }: { materiaId: string; horarios: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [dia, setDia] = useState('1')
  const [horaInicio, setHoraInicio] = useState('')
  const [horaFin, setHoraFin] = useState('')
  const [aula, setAula] = useState('')

  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!horaInicio || !horaFin) return
    addHorario({ id: crypto.randomUUID(), materiaId, dia: Number(dia), horaInicio, horaFin, aula })
    setHoraInicio(''); setHoraFin(''); setAula(''); setShowForm(false)
  }

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 mb-4"><Plus size={14} /> Agregar Horario</button>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <select value={dia} onChange={e => setDia(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {dias.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
            <input type="time" required value={horaInicio} onChange={e => setHoraInicio(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="time" required value={horaFin} onChange={e => setHoraFin(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={aula} onChange={e => setAula(e.target.value)} placeholder="Aula" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Guardar</button>
        </form>
      )}
      {horarios.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Sin horarios registrados</p>
      ) : (
        <div className="space-y-2">
          {horarios.sort((a, b) => a.dia - b.dia || a.horaInicio.localeCompare(b.horaInicio)).map(h => (
            <div key={h.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 w-20">{dias[h.dia]}</span>
                <span className="text-sm text-slate-500">{h.horaInicio.slice(0,5)} - {h.horaFin.slice(0,5)}</span>
                {h.aula && <span className="text-xs text-slate-400 ml-2">📍 {h.aula}</span>}
              </div>
              <button onClick={() => { if (confirm('¿Eliminar horario?')) deleteHorario(h.id) }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ApuntesTab({ materiaId, apuntes }: { materiaId: string; apuntes: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [titulo, setTitulo] = useState('')
  const [contenido, setContenido] = useState('')

  function resetForm() { setTitulo(''); setContenido(''); setEditId(null); setShowForm(false) }
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim()) return
    if (editId) {
      updateApunte(editId, { titulo: titulo.trim(), contenido })
    } else {
      addApunte({ id: crypto.randomUUID(), materiaId, titulo: titulo.trim(), contenido, updated_at: new Date().toISOString() })
    }
    resetForm()
  }
  function startEdit(a: any) { setEditId(a.id); setTitulo(a.titulo); setContenido(a.contenido); setShowForm(true) }

  return (
    <div>
      <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 mb-4"><Plus size={14} /> Nuevo Apunte</button>
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Título" className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <textarea value={contenido} onChange={e => setContenido(e.target.value)} placeholder="Escribí tu apunte con **Markdown**..." rows={6} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono" />
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Save size={14} /> Guardar</button>
            <button type="button" onClick={resetForm} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </form>
      )}
      {apuntes.length === 0 && !showForm ? (
        <p className="text-sm text-slate-400 text-center py-8">Sin apuntes</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {apuntes.sort((a, b) => b.updated_at.localeCompare(a.updated_at)).map(a => (
            <div key={a.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-slate-800 dark:text-white">{a.titulo}</h4>
                <button onClick={() => startEdit(a)} className="p-1 text-slate-400 hover:text-blue-600"><Pencil size={12} /></button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 whitespace-pre-wrap line-clamp-4 font-mono">{a.contenido}</p>
              <p className="text-[10px] text-slate-400 mt-2">{new Date(a.updated_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TiempoTab({ materiaId, sesiones }: { materiaId: string; sesiones: any[] }) {
  const [showForm, setShowForm] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [minutos, setMinutos] = useState('')
  const [notas, setNotas] = useState('')

  const totalMinutos = sesiones.reduce((s, ses) => s + ses.minutos, 0)
  const horas = Math.floor(totalMinutos / 60)
  const mins = totalMinutos % 60

  function startTimer() { setStartTime(new Date()) }
  function stopTimer() {
    if (startTime) {
      const diff = Math.floor((Date.now() - startTime.getTime()) / 60000)
      if (diff >= 1) {
        addSesion({ id: crypto.randomUUID(), materiaId, fecha: new Date().toISOString().slice(0, 10), minutos: diff, notas: '' })
      }
      setStartTime(null)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!minutos || Number(minutos) <= 0) return
    addSesion({ id: crypto.randomUUID(), materiaId, fecha: new Date().toISOString().slice(0, 10), minutos: Number(minutos), notas })
    setMinutos(''); setNotas(''); setShowForm(false)
  }

  // Agrupar por día para estadísticas
  const porDia: Record<string, number> = {}
  sesiones.forEach(s => { porDia[s.fecha] = (porDia[s.fecha] || 0) + s.minutos })
  const maxMinutos = Math.max(...Object.values(porDia), 1)

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{horas}h {mins}m</p>
          <p className="text-[10px] text-slate-400">Total estudiado</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{sesiones.length}</p>
          <p className="text-[10px] text-slate-400">Sesiones</p>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {!startTime ? (
          <button onClick={startTimer} className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"><Play size={16} /> Iniciar</button>
        ) : (
          <button onClick={stopTimer} className="flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700"><Square size={16} /> Detener ({(Math.floor((Date.now() - startTime.getTime()) / 60000))} min)</button>
        )}
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600"><Plus size={14} /> Registrar manual</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
          <input type="number" required value={minutos} onChange={e => setMinutos(e.target.value)} placeholder="Minutos" className="w-24 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <input value={notas} onChange={e => setNotas(e.target.value)} placeholder="¿Qué estudiaste?" className="flex-1 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700">OK</button>
        </form>
      )}

      {Object.keys(porDia).length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4">
          <h4 className="text-xs font-medium text-slate-500 mb-2">Últimos días</h4>
          <div className="flex items-end gap-1 h-20">
            {Object.entries(porDia).slice(-14).map(([fecha, mins]) => (
              <div key={fecha} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-full bg-blue-500 rounded-t" style={{ height: `${(mins / maxMinutos) * 100}%`, minHeight: mins > 0 ? 4 : 0 }} />
                <span className="text-[8px] text-slate-400">{fecha.slice(8, 10)}/{fecha.slice(5, 7)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sesiones.length === 0 && !showForm && !startTime ? (
        <p className="text-sm text-slate-400 text-center py-8">Sin sesiones de estudio</p>
      ) : (
        <div className="space-y-1">
          {[...sesiones].reverse().slice(0, 20).map(s => (
            <div key={s.id} className="flex items-center justify-between text-xs bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-2">
              <span className="text-slate-500">{new Date(s.fecha + 'T00:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
              <span className="font-medium text-slate-700 dark:text-slate-200">{s.minutos} min</span>
              {s.notas && <span className="text-slate-400 flex-1 text-right truncate ml-2">{s.notas}</span>}
              <button onClick={() => { if (confirm('¿Eliminar?')) deleteSesion(s.id) }} className="text-red-300 hover:text-red-600 p-1 ml-1"><Trash2 size={10} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function IATab({ materia, apuntes, examenes, horarios, tareas }: { materia: any; apuntes: any[]; examenes: any[]; horarios: any[]; tareas: any[] }) {
  const [feature, setFeature] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showFeatures, setShowFeatures] = useState(true)

  const materiaContext = useMemo(() => buildMateriaContext(materia, apuntes, examenes, horarios, tareas), [materia, apuntes, examenes, horarios, tareas])

  const features = [
    { key: 'Resumir documento', icon: FileText, desc: 'Resume PDFs, apuntes o textos largos' },
    { key: 'Explicar tema', icon: Brain, desc: 'Obtené explicaciones claras de cualquier concepto' },
    { key: 'Generar preguntas', icon: CheckSquare, desc: 'Preguntas de práctica sobre el temario' },
    { key: 'Crear flashcards', icon: BookOpen, desc: 'Tarjetas de repaso automáticas' },
    { key: 'Generar examen', icon: Mic, desc: 'Exámenes personalizados con respuestas' },
    { key: 'Buscar conceptos', icon: Info, desc: 'Buscá definiciones y explicaciones' },
    { key: 'Crear mapa mental', icon: Brain, desc: 'Mapas conceptuales del contenido' },
    { key: 'Resolver dudas', icon: Clock, desc: 'Chat con IA sobre la materia' },
  ]

  function startFeature(name: string) {
    setFeature(name)
    setMessages([])
    setError('')
    setShowFeatures(false)
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || loading || !feature) return

    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await sendChatMessage(feature, newMessages, materiaContext)
      setMessages(prev => [...prev, { role: 'assistant', content: response }])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-3 text-xs text-red-700 dark:text-red-300">
          {error}
          <button onClick={() => setError('')} className="ml-2 underline">Cerrar</button>
        </div>
      )}

      {showFeatures ? (
        <>
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-4 mb-4">
            <h3 className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-2"><Sparkles size={18} /> Asistente IA</h3>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">Elegí una función para empezar a usar IA en esta materia.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map(f => (
              <button key={f.key} onClick={() => startFeature(f.key)}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all text-left cursor-pointer group"
              >
                <f.icon size={24} className="text-purple-500 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-medium text-sm text-slate-800 dark:text-white">{f.key}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowFeatures(true)} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1"><Settings2 size={12} /> Cambiar función</button>
              <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded font-medium">{feature}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-4 max-h-96 overflow-y-auto p-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                Escribí tu consulta sobre <strong>{materia?.nombre}</strong>
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-bl-sm'}`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl rounded-bl-sm px-3 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={feature === 'Resumir documento' ? 'Pegá el texto a resumir...' : `Escribí tu consulta sobre ${materia?.nombre}...`}
              className="flex-1 px-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="bg-purple-600 text-white px-4 py-2.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
