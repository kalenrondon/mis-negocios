export type Prioridad = 'baja' | 'media' | 'alta'

export interface Recordatorio {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  prioridad: Prioridad
  completado: boolean
}
