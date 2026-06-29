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
