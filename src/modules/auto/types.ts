export interface TareaAuto {
  id: string
  tarea: string
  descripcion: string
  costo: number
  fecha: string
  categoria: 'ahorro' | 'compra' | 'mecanica' | 'documentacion' | 'seguro' | 'otro'
  estado: 'pendiente' | 'en_progreso' | 'completado'
}
