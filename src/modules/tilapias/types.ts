export interface LoteTilapia {
  id: string
  nombre: string
  cantidadInicial: number
  fechaInicio: string
  costoInicial: number
  activo: boolean
}

export interface BajaTilapia {
  id: string
  loteId: string
  cantidad: number
  fecha: string
  causa: string
}

export interface VentaTilapia {
  id: string
  loteId: string
  fecha: string
  cantidad: number
  pesoTotal: number
  precioKg: number
  comprador: string
}

export interface Gasto {
  id: string
  loteId: string
  fecha: string
  descripcion: string
  monto: number
  categoria: string
}
