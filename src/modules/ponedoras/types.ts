export interface LotePonedora {
  id: string
  nombre: string
  raza: string
  cantidadInicial: number
  fechaInicio: string
  fechaInicioPostura: string | null
  costoInicial: number
  activo: boolean
}

export interface RegistroPostura {
  id: string
  loteId: string
  fecha: string
  huevos: number
  gallinas: number
}

export interface BajaPonedora {
  id: string
  loteId: string
  cantidad: number
  fecha: string
  causa: string
}

export interface VentaHuevo {
  id: string
  loteId: string
  fecha: string
  cantidad: number
  precioPorUnidad: number
  comprador: string
}

export interface GastoPonedora {
  id: string
  loteId: string
  fecha: string
  descripcion: string
  monto: number
  categoria: string
  etapa: 'cria' | 'postura'
}

export type GastoEtapa = 'cria' | 'postura'
