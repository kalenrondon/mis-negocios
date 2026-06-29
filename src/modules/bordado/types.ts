export type EstadoPedido = 'pendiente' | 'en_proceso' | 'terminado' | 'entregado'
export type TipoPuntada = 'plana' | 'cadena' | 'cruz' | 'realce' | 'festón' | 'otro'

export interface PedidoBordado {
  id: string
  cliente: string
  descripcion: string
  tipoPuntada: TipoPuntada
  cantidad: number
  precioUnitario: number
  total: number
  senia: number
  fechaIngreso: string
  fechaEntrega: string
  estado: EstadoPedido
  notas: string
}
