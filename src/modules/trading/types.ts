export interface Trade {
  id: string
  fecha: string
  tipo: 'ganada' | 'perdida'
  activo: string
  monto: number
  notas: string
}

export interface ResumenActivo {
  activo: string
  ganado: number
  perdido: number
  neto: number
  trades: number
}

export interface ResumenPeriodo {
  key: string
  label: string
  ganado: number
  perdido: number
  neto: number
  trades: number
}
