export type CategoriaGasto = 'Comida' | 'Transporte' | 'Servicios' | 'Entretenimiento' | 'Salud' | 'Ropa' | 'Hogar' | 'Varios'
export type CategoriaIngreso = 'Sueldo' | 'Freelance' | 'Inversiones' | 'Ventas' | 'Otro'

export interface MovimientoPersonal {
  id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string
  monto: number
}

export interface PresupuestoMensual {
  mes: string
  presupuesto: number
}

export type TipoMeta = 'deuda' | 'prestamo' | 'ahorro' | 'meta'
export type EstadoMeta = 'activo' | 'completado' | 'cancelado'

export interface MetaFinanciera {
  id: string
  tipo: TipoMeta
  nombre: string
  montoObjetivo: number
  montoActual: number
  fechaLimite: string
  estado: EstadoMeta
  notas: string
}
