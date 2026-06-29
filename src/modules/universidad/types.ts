export type MateriaEstado = 'cursando' | 'aprobada' | 'desaprobada'
export type SemestreEstado = 'activo' | 'finalizado'
export type TareaEstado = 'pendiente' | 'entregada' | 'vencida'
export type TareaPrioridad = 'alta' | 'media' | 'baja'
export type ExamenTipo = 'parcial' | 'final' | 'quiz' | 'taller'
export type Modalidad = 'presencial' | 'virtual' | 'hibrida'

export interface Semestre {
  id: string
  nombre: string
  anio: string
  fechaInicio: string
  fechaFin: string
  estado: SemestreEstado
}

export interface Materia {
  id: string
  semestreId: string
  nombre: string
  codigo: string
  color: string
  profesor: string
  creditos: number
  horario: string
  aula: string
  modalidad: Modalidad
  descripcion: string
  estado: MateriaEstado
  promedio?: number
  created_at: string
}

export interface Tarea {
  id: string
  materiaId: string
  titulo: string
  descripcion: string
  fechaLimite: string
  prioridad: TareaPrioridad
  porcentaje: number
  estado: TareaEstado
  archivos: string
  comentarios: string
}

export interface Examen {
  id: string
  materiaId: string
  tipo: ExamenTipo
  fecha: string
  porcentaje: number
  notaObtenida: number
  notaMaxima: number
  observaciones: string
}

export interface HorarioClase {
  id: string
  materiaId: string
  dia: number
  horaInicio: string
  horaFin: string
  aula: string
}

export interface Apunte {
  id: string
  materiaId: string
  titulo: string
  contenido: string
  updated_at: string
}

export interface SesionEstudio {
  id: string
  materiaId: string
  fecha: string
  minutos: number
  notas: string
}

export interface UniversidadStore {
  semestres: Semestre[]
  materias: Materia[]
  tareas: Tarea[]
  examenes: Examen[]
  horarios: HorarioClase[]
  apuntes: Apunte[]
  sesiones: SesionEstudio[]
}