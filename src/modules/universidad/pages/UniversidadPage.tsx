import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUniversidadStore, addMateria, updateMateria, deleteMateria } from '../store'
import type { Materia } from '../types'
import { GraduationCap, Plus, Trash2, Pencil, ArrowLeft, Filter, BookOpen, CheckCircle2, XCircle } from 'lucide-react'

function parseNum(v: string) { return Number(v) || 0 }

export default function UniversidadPage() {
  const materias = useUniversidadStore()
  const navigate = useNavigate()
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [filtroSemestre, setFiltroSemestre] = useState('')

  const [nombre, setNombre] = useState('')
  const [profesor, setProfesor] = useState('')
  const [horario, setHorario] = useState('')
  const [aula, setAula] = useState('')
  const [semestre, setSemestre] = useState('')
  const [nota1, setNota1] = useState('')
  const [nota2, setNota2] = useState('')
  const [nota3, setNota3] = useState('')

  function resetForm() {
    setNombre(''); setProfesor(''); setHorario(''); setAula(''); setSemestre('')
    setNota1(''); setNota2(''); setNota3('')
    setEditId(null); setShowForm(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !semestre.trim()) return
    const n1 = parseNum(nota1)
    const n2 = parseNum(nota2)
    const n3 = parseNum(nota3)

    if (editId) {
      updateMateria(editId, {
        nombre: nombre.trim(), profesor: profesor.trim(), horario: horario.trim(),
        aula: aula.trim(), semestre: semestre.trim(), nota1: n1, nota2: n2, nota3: n3,
      })
    } else {
      addMateria({
        id: crypto.randomUUID(), nombre: nombre.trim(), profesor: profesor.trim(),
        horario: horario.trim(), aula: aula.trim(), semestre: semestre.trim(),
        nota1: n1, nota2: n2, nota3: n3, examenFinal: 0,
        estado: 'cursando',
      })
    }
    resetForm()
  }

  function startEdit(m: Materia) {
    setEditId(m.id); setNombre(m.nombre); setProfesor(m.profesor); setHorario(m.horario)
    setAula(m.aula); setSemestre(m.semestre)
    setNota1(String(m.nota1)); setNota2(String(m.nota2)); setNota3(String(m.nota3))
    setShowForm(true)
  }

  const semestres = [...new Set(materias.map(m => m.semestre))].sort()
  const filtradas = filtroSemestre
    ? materias.filter(m => m.semestre === filtroSemestre)
    : materias

  const enCurso = filtradas.filter(m => m.estado === 'cursando').length
  const aprobadas = filtradas.filter(m => m.estado === 'aprobada').length
  const desaprobadas = filtradas.filter(m => m.estado === 'desaprobada').length

  const colorEstado: Record<string, string> = {
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
        <button onClick={() => { resetForm(); setShowForm(true) }} className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"><Plus size={16} /> Agregar Materia</button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-500" />
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cursando</p>
          </div>
          <p className="text-xl font-bold text-blue-600">{enCurso}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Aprobadas</p>
          </div>
          <p className="text-xl font-bold text-green-600">{aprobadas}</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-500" />
            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Desaprobadas</p>
          </div>
          <p className="text-xl font-bold text-red-600">{desaprobadas}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Filter size={16} className="text-slate-400" />
        <select value={filtroSemestre} onChange={e => setFiltroSemestre(e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos los semestres</option>
          {semestres.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-700 dark:text-slate-300">{editId ? 'Editar' : 'Nueva'} Materia</h2>
            <button type="button" onClick={resetForm} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nombre</label>
              <input required value={nombre} onChange={e => setNombre(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Profesor</label>
              <input value={profesor} onChange={e => setProfesor(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Horario</label>
              <input value={horario} onChange={e => setHorario(e.target.value)} placeholder="Ej: Lun y Mie 14-16" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Aula</label>
              <input value={aula} onChange={e => setAula(e.target.value)} className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Semestre</label>
              <input required value={semestre} onChange={e => setSemestre(e.target.value)} placeholder="Ej: 2026-1" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div />
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nota 1</label>
              <input type="number" step="0.01" min="0" max="10" value={nota1} onChange={e => setNota1(e.target.value)} placeholder="0" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nota 2</label>
              <input type="number" step="0.01" min="0" max="10" value={nota2} onChange={e => setNota2(e.target.value)} placeholder="0" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Nota 3</label>
              <input type="number" step="0.01" min="0" max="10" value={nota3} onChange={e => setNota3(e.target.value)} placeholder="0" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium">{editId ? 'Guardar Cambios' : 'Agregar Materia'}</button>
        </form>
      )}

      {filtradas.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <GraduationCap size={48} className="mx-auto mb-3 opacity-50" />
          <p className="font-medium">No hay materias</p>
          <p className="text-sm">Agregá tu primera materia para empezar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtradas.map(m => (
            <div key={m.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 dark:text-white truncate">{m.nombre}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{m.profesor || 'Sin profesor'}</p>
                </div>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ml-2 ${colorEstado[m.estado]}`}>
                  {m.estado === 'cursando' ? 'Cursando' : m.estado === 'aprobada' ? 'Aprobada' : 'Desaprobada'}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-2">
                <p><span className="font-medium">Horario:</span> {m.horario || '—'}</p>
                <p><span className="font-medium">Aula:</span> {m.aula || '—'}</p>
                <p><span className="font-medium">Semestre:</span> {m.semestre}</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                <GraduationCap size={16} className="text-blue-500" />
                Promedio: {m.promedio?.toFixed(2) ?? '—'}
              </div>
              <div className="flex gap-1 pt-2 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => startEdit(m)} className="flex items-center justify-center gap-1 flex-1 text-xs text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-1.5 rounded transition-colors"><Pencil size={13} /> Editar</button>
                <button onClick={() => { if (confirm('¿Eliminar materia?')) deleteMateria(m.id) }} className="flex items-center justify-center gap-1 flex-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 py-1.5 rounded transition-colors"><Trash2 size={13} /> Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
