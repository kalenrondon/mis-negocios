import { useSyncExternalStore, useMemo } from 'react'
import type { UniversidadStore, Materia, Semestre, Tarea, Examen, HorarioClase, Apunte, SesionEstudio } from './types'

const STORAGE_KEY = 'universidad-data'

;(() => {
  const old = localStorage.getItem('universidad-materias')
  if (old) {
    try {
      const oldMaterias = JSON.parse(old)
      if (Array.isArray(oldMaterias) && oldMaterias.length > 0) {
        const existing = localStorage.getItem(STORAGE_KEY)
        if (!existing || existing === 'null') {
          const semestreId = crypto.randomUUID()
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            semestres: [{ id: semestreId, nombre: 'Migrado', anio: new Date().getFullYear().toString(), fechaInicio: '', fechaFin: '', estado: 'activo' }],
            materias: oldMaterias.map((m: any) => ({ ...m, semestreId, codigo: '', color: '#3b82f6', creditos: 0, modalidad: 'presencial', descripcion: '', created_at: new Date().toISOString() })),
            tareas: [], examenes: [], horarios: [], apuntes: [], sesiones: [],
          }))
        }
      }
      localStorage.removeItem('universidad-materias')
    } catch {} // eslint-disable-line
  }
})()

function load(): UniversidadStore {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || emptyState }
  catch { return emptyState }
}

function save(data: UniversidadStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  emit()
}

const emptyState: UniversidadStore = {
  semestres: [], materias: [], tareas: [], examenes: [],
  horarios: [], apuntes: [], sesiones: [],
}

let store = load()
const listeners = new Set<() => void>()
function emit() { listeners.forEach(l => l()) }
function subscribe(cb: () => void) { listeners.add(cb); return () => listeners.delete(cb) }
function getSnapshot() { return store }

function recalcPromedios() {
  store = {
    ...store,
    materias: store.materias.map(m => {
      const examenesMateria = store.examenes.filter(e => e.materiaId === m.id)
      const notas = examenesMateria
        .filter(e => e.notaObtenida > 0 && e.notaMaxima > 0)
        .map(e => (e.notaObtenida / e.notaMaxima) * 10)
      const prom = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : undefined
      return { ...m, promedio: prom }
    }),
  }
}

export function useUniversidadStore() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const semestreActivo = useMemo(() => state.semestres.find(s => s.estado === 'activo'), [state.semestres])
  const materiasActivas = useMemo(() => state.materias.filter(m => {
    if (!semestreActivo) return true
    return m.semestreId === semestreActivo.id
  }), [state.materias, semestreActivo])
  const promedioGeneral = useMemo(() => {
    const promedios = materiasActivas.map(m => m.promedio).filter((p): p is number => p !== undefined)
    return promedios.length > 0 ? promedios.reduce((a, b) => a + b, 0) / promedios.length : 0
  }, [materiasActivas])
  const proxExamenes = useMemo(() => state.examenes
    .filter(e => state.materias.some(m => m.id === e.materiaId) && e.fecha >= new Date().toISOString().slice(0, 10))
    .sort((a, b) => a.fecha.localeCompare(b.fecha)).slice(0, 5), [state.examenes, state.materias])
  const proxTareas = useMemo(() => state.tareas
    .filter(t => t.estado === 'pendiente')
    .sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite)).slice(0, 5), [state.tareas])
  const horasSemana = useMemo(() => {
    const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().slice(0, 10)
    return state.sesiones.filter(s => s.fecha >= weekStartStr).reduce((acc, s) => acc + s.minutos, 0) / 60
  }, [state.sesiones])
  const tareasPendientes = useMemo(() => state.tareas.filter(t => t.estado === 'pendiente').length, [state.tareas])
  const tareasCompletadas = useMemo(() => state.tareas.filter(t => t.estado === 'entregada').length, [state.tareas])

  return {
    ...state,
    semestreActivo,
    materiasActivas,
    promedioGeneral,
    proxExamenes,
    proxTareas,
    horasSemana,
    tareasPendientes,
    tareasCompletadas,
    getMateriaById: (id: string) => store.materias.find(m => m.id === id),
    getTareasByMateria: (materiaId: string) => store.tareas.filter(t => t.materiaId === materiaId),
    getExamenesByMateria: (materiaId: string) => store.examenes.filter(e => e.materiaId === materiaId),
    getHorariosByMateria: (materiaId: string) => store.horarios.filter(h => h.materiaId === materiaId),
    getApuntesByMateria: (materiaId: string) => store.apuntes.filter(a => a.materiaId === materiaId),
    getSesionesByMateria: (materiaId: string) => store.sesiones.filter(s => s.materiaId === materiaId),
    getMateriasBySemestre: (semestreId: string) => store.materias.filter(m => m.semestreId === semestreId),
  }
}

// Semestres
export function addSemestre(s: Semestre) {
  store = { ...store, semestres: [...store.semestres, s] }
  save(store)
}
export function updateSemestre(id: string, data: Partial<Semestre>) {
  store = { ...store, semestres: store.semestres.map(s => s.id === id ? { ...s, ...data } : s) }
  save(store)
}
export function deleteSemestre(id: string) {
  store = { ...store, semestres: store.semestres.filter(s => s.id !== id) }
  save(store)
}

// Materias
export function addMateria(m: Materia) {
  store = { ...store, materias: [...store.materias, m] }
  save(store)
}
export function updateMateria(id: string, data: Partial<Materia>) {
  store = { ...store, materias: store.materias.map(m => m.id === id ? { ...m, ...data } : m) }
  save(store)
}
export function deleteMateria(id: string) {
  store = { ...store, materias: store.materias.filter(m => m.id !== id) }
  save(store)
}

// Tareas
export function addTarea(t: Tarea) {
  store = { ...store, tareas: [...store.tareas, t] }
  save(store)
}
export function updateTarea(id: string, data: Partial<Tarea>) {
  store = { ...store, tareas: store.tareas.map(t => t.id === id ? { ...t, ...data } : t) }
  save(store)
}
export function deleteTarea(id: string) {
  store = { ...store, tareas: store.tareas.filter(t => t.id !== id) }
  save(store)
}

// Examenes
export function addExamen(e: Examen) {
  store = { ...store, examenes: [...store.examenes, e] }
  recalcPromedios()
  save(store)
}
export function updateExamen(id: string, data: Partial<Examen>) {
  store = { ...store, examenes: store.examenes.map(e => e.id === id ? { ...e, ...data } : e) }
  recalcPromedios()
  save(store)
}
export function deleteExamen(id: string) {
  store = { ...store, examenes: store.examenes.filter(e => e.id !== id) }
  recalcPromedios()
  save(store)
}

// Horarios
export function addHorario(h: HorarioClase) {
  store = { ...store, horarios: [...store.horarios, h] }
  save(store)
}
export function deleteHorario(id: string) {
  store = { ...store, horarios: store.horarios.filter(h => h.id !== id) }
  save(store)
}

// Apuntes
export function addApunte(a: Apunte) {
  store = { ...store, apuntes: [...store.apuntes, a] }
  save(store)
}
export function updateApunte(id: string, data: Partial<Apunte>) {
  store = { ...store, apuntes: store.apuntes.map(a => a.id === id ? { ...a, ...data, updated_at: new Date().toISOString() } : a) }
  save(store)
}
export function deleteApunte(id: string) {
  store = { ...store, apuntes: store.apuntes.filter(a => a.id !== id) }
  save(store)
}

// Sesiones de estudio
export function addSesion(s: SesionEstudio) {
  store = { ...store, sesiones: [...store.sesiones, s] }
  save(store)
}
export function deleteSesion(id: string) {
  store = { ...store, sesiones: store.sesiones.filter(s => s.id !== id) }
  save(store)
}

// Reset
export function resetUniversidad() {
  store = emptyState
  save(store)
}

export { STORAGE_KEY }