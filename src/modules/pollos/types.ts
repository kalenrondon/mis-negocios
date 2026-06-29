export interface Lote {
  id: string
  nombre: string
  raza: string
  cantidadInicial: number
  fechaInicio: string
  costoInicial: number
  activo: boolean
}

export interface Baja {
  id: string
  loteId: string
  cantidad: number
  fecha: string
  causa: string
}

export interface Pesaje {
  id: string
  loteId: string
  fecha: string
  pesoPromedio: number
  muestra: number
}

export interface Venta {
  id: string
  loteId: string
  fecha: string
  cantidad: number
  precioKg: number
  pesoTotal: number
  comprador: string
  tipo: 'vivo' | 'empacado'
  fiado: boolean
  pagado: number
}

export interface Empacado {
  id: string
  loteId: string
  fecha: string
  cantidad: number
  pesoTotal: number
}

export interface Gasto {
  id: string
  loteId: string
  fecha: string
  descripcion: string
  monto: number
  categoria: string
}
