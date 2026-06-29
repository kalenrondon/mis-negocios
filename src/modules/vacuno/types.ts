export interface LoteVacuno {
  id: string
  nombre: string
  raza: string
  cantidadInicial: number
  fechaInicio: string
  costoInicial: number
  activo: boolean
}

export interface BajaVacuno {
  id: string
  loteId: string
  cantidad: number
  fecha: string
  causa: string
}

export interface PesajeVacuno {
  id: string
  loteId: string
  fecha: string
  pesoPromedio: number
  muestra: number
}

export interface VentaVacuno {
  id: string
  loteId: string
  fecha: string
  cantidad: number
  pesoTotal: number
  precioKg: number
  comprador: string
  fiado: boolean
  pagado: number
}

export interface GastoVacuno {
  id: string
  loteId: string
  fecha: string
  descripcion: string
  monto: number
  categoria: string
}
