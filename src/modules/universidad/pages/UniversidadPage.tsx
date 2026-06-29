import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUniversidadStore, addSemestre, deleteSemestre, updateSemestre, addMateria } from '../store'
import { GraduationCap, Plus, Trash2, ArrowLeft, BookOpen, CheckCircle2, Clock, Calendar, Target, Brain, ChevronDown, ChevronRight, Layers } from 'lucide-react'

const colores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export default function UniversidadPage() {
  const navigate = useNavigate()
  const {
    semestres, materias, tareasPendientes, tareasCompletadas,
    proxExamenes, proxTareas, horasSemana, promedioGeneral,
    materiasActivas, getMateriasBySemestre,
  } = useUniversidadStore()
  const [showSemestreForm, setShowSemestreForm] = useState(false)
  const [showMateriaForm, setShowMateriaForm] = useState(false)
  const [editSemestreId, setEditSemestreId] = useState<string | null>(null)
  const [semestreNombre, setSemestreNombre] = useState('')
  const [semestreAnio, setSemestreAnio] = useState(new Date().getFullYear().toString())
  const [semestreInicio, setSemestreInicio] = useState('')
  const [semestreFin, setSemestreFin] = useState('')
  const [sExpanded, setSExpanded] = useState<Record<string, boolean>>({})
  const [mNombre, setMNombre] = useState('')
  const [mProfesor, setMProfesor] = useState('')
  const [mCodigo, setMCodigo] = useState('')
  const [mColor, setMColor] = useState(colores[0])
  const [mSemestreId, setMSemestreId] = useState('')
  const [mHorario, setMHorario] = useState('')
  const [mAula, setMAula] = useState('')
  const [mModalidad, setMModalidad] = useState<'presencial' | 'virtual' | 'hibrida'>('presencial')
  const [mDesc, setMDesc] = useState('')

  function resetSemestreForm() {
    setSemestreNombre(''); setSemestreAnio(new Date().getFullYear().toString()); setSemestreInicio(''); setSemestreFin('')
    setEditSemestreId(null); setShowSemestreForm(false)
  }

  function resetMateriaForm() {
    setMNombre(''); setMProfesor(''); setMCodigo(''); setMColor(colores[0]); setMSemestreId('')
    setMHorario(''); setMAula(''); setMModalidad('presencial'); setMDesc('')
    setShowMateriaForm(false)
  }

  function handleSemestreSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!semestreNombre.trim() || !semestreAnio) return
    if (editSemestreId) {
      updateSemestre(editSemestreId, { nombre: semestreNombre.trim(), anio: semestreAnio, fechaInicio: semestreInicio, fechaFin: semestreFin })
    } else {
      addSemestre({ id: crypto.randomUUID(), nombre: semestreNombre.trim(), anio: semestreAnio, fechaInicio: semestreInicio, fechaFin: semestreFin, estado: 'activo' })
    }
    resetSemestreForm()
  }

  function handleMateriaSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!mNombre.trim() || !mSemestreId) return
    addMateria({
      id: crypto.randomUUID(), semestreId: mSemestreId, nombre: mNombre.trim(), codigo: mCodigo.trim(),
      color: mColor, profesor: mProfesor.trim(), creditos: 0, horario: mHorario.trim(), aula: mAula.trim(),
      modalidad: mModalidad, descripcion: mDesc.trim(), estado: 'cursando', created_at: new Date().toISOString(),
    })
    resetMateriaForm()
  }

  const coloresEstado: Record<string, string> = {
    activo: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    finalizado: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    cursando: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    aprobada: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
    desaprobada: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Universidad</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-blue-600 mb-1"><BookOpen size={16} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Materias</span></div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{materiasActivas.length}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-amber-600 mb-1"><Target size={16} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Promedio</span></div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{promedioGeneral ? promedioGeneral.toFixed(1) : '—'}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-green-600 mb-1"><Clock size={16} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Horas/sem</span></div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{horasSemana.toFixed(1)}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-3 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 text-purple-600 mb-1"><Brain size={16} /><span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Tareas</span></div>
          <p className="text-xl font-bold text-slate-800 dark:text-white">{tareasPendientes + tareasCompletadas}</p>
        </div>
      </div>

      {proxExamenes.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-4">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><Calendar size={14} /> Próximos exámenes</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {proxExamenes.map(e => {
              const m = materias.find(x => x.id === e.materiaId)
              return (
                <Link key={e.id} to={`/universidad/materia/${e.materiaId}`} className="shrink-0 bg-red-50 dark:bg-red-900/20 text-xs rounded-lg px-2.5 py-1.5 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/40 whitespace-nowrap">
                  {e.fecha.slice(5)} {m?.nombre} - {e.tipo}
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {proxTareas.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-3 mb-6">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-1.5"><CheckCircle2 size={14} /> Tareas pendientes</h3>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {proxTareas.map(t => {
              const m = materias.find(x => x.id === t.materiaId)
              return (
                <Link key={t.id} to={`/universidad/materia/${t.materiaId}`} className="shrink-0 bg-amber-50 dark:bg-amber-900/20 text-xs rounded-lg px-2.5 py-1.5 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900/40 whitespace-nowrap">
                  {t.titulo} ({m?.nombre})
                </Link>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setShowSemestreForm(true)} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={14} /> Semestre</button>
        <button onClick={() => { if (materias.length === 0) setShowSemestreForm(true); else setShowMateriaForm(true) }} className="flex items-center gap-1 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"><Plus size={14} /> Materia</button>
      </div>

      {showSemestreForm && (
        <form onSubmit={handleSemestreSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{editSemestreId ? 'Editar' : 'Nuevo'} Semestre</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={semestreNombre} onChange={e => setSemestreNombre(e.target.value)} placeholder="Nombre (ej: 2026-1)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required value={semestreAnio} onChange={e => setSemestreAnio(e.target.value)} placeholder="Año" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={semestreInicio} onChange={e => setSemestreInicio(e.target.value)} placeholder="Inicio" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input type="date" value={semestreFin} onChange={e => setSemestreFin(e.target.value)} placeholder="Fin" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-blue-700">Guardar</button>
            <button type="button" onClick={resetSemestreForm} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </form>
      )}

      {showMateriaForm && (
        <form onSubmit={handleMateriaSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">Nueva Materia</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={mNombre} onChange={e => setMNombre(e.target.value)} placeholder="Nombre" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={mCodigo} onChange={e => setMCodigo(e.target.value)} placeholder="Código" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={mProfesor} onChange={e => setMProfesor(e.target.value)} placeholder="Profesor" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={mSemestreId} onChange={e => setMSemestreId(e.target.value)} required className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar semestre</option>
              {semestres.map(s => <option key={s.id} value={s.id}>{s.nombre}</option>)}
            </select>
            <input value={mHorario} onChange={e => setMHorario(e.target.value)} placeholder="Horario (ej: Lun 14-16)" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={mAula} onChange={e => setMAula(e.target.value)} placeholder="Aula" className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <select value={mModalidad} onChange={e => setMModalidad(e.target.value as 'presencial' | 'virtual' | 'hibrida')} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
              <option value="hibrida">Híbrida</option>
            </select>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Color:</span>
              {colores.map(c => (
                <button key={c} type="button" onClick={() => setMColor(c)} className={`w-5 h-5 rounded-full border-2 ${mColor === c ? 'border-slate-400' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
            <div className="sm:col-span-2">
              <textarea value={mDesc} onChange={e => setMDesc(e.target.value)} placeholder="Descripción (opcional)" rows={2} className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-green-700">Crear Materia</button>
            <button type="button" onClick={resetMateriaForm} className="text-sm text-slate-500 hover:text-slate-700">Cancelar</button>
          </div>
        </form>
      )}

      {semestres.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay semestres</p>
          <p className="text-sm">Creá un semestre y agregá materias</p>
        </div>
      ) : (
        <div className="space-y-4">
          {semestres.map(s => {
            const open = sExpanded[s.id] ?? true
            const materiasSem = getMateriasBySemestre(s.id)
            return (
              <div key={s.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <button onClick={() => setSExpanded(p => ({ ...p, [s.id]: !open }))} className="w-full flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <Layers size={16} className="text-slate-400" />
                    <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">{s.nombre} ({s.anio})</span>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${coloresEstado[s.estado]}`}>{s.estado}</span>
                    <span className="text-xs text-slate-400">{materiasSem.length} materias</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={(e) => { e.stopPropagation(); updateSemestre(s.id, { estado: s.estado === 'activo' ? 'finalizado' : 'activo' }) }} className="text-xs text-blue-500 hover:text-blue-700 p-1">{s.estado === 'activo' ? 'Finalizar' : 'Activar'}</button>
                    <button onClick={(e) => { e.stopPropagation(); if (confirm('¿Eliminar semestre?')) deleteSemestre(s.id) }} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={13} /></button>
                    {open ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                  </div>
                </button>
                {open && (
                  <div className="px-3 pb-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {materiasSem.map(m => (
                      <Link
                        key={m.id}
                        to={`/universidad/materia/${m.id}`}
                        className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all"
                      >
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color || '#3b82f6' }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 dark:text-white truncate">{m.nombre}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{m.profesor || 'Sin profesor'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${coloresEstado[m.estado]}`}>
                            {m.estado === 'cursando' ? 'Cursando' : m.estado === 'aprobada' ? 'Aprob' : 'Desap'}
                          </span>
                          {m.promedio !== undefined && <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mt-0.5">{m.promedio.toFixed(1)}</p>}
                        </div>
                      </Link>
                    ))}
                    <button onClick={() => { setMSemestreId(s.id); setShowMateriaForm(true) }} className="flex items-center justify-center gap-1 p-2.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-600 text-xs text-slate-400 hover:text-blue-600 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
                      <Plus size={14} /> Agregar materia
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
