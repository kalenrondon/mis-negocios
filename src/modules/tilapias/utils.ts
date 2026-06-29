export function parseMoney(value: string): number {
  return Number(value.replace(/\./g, '').replace(',', '.'))
}

export function formatMoney(value: number): string {
  return '$' + Math.round(value).toLocaleString('es-AR')
}

export function formatNumber(value: number): string {
  return value.toLocaleString('es-AR')
}

export function getMonthKey(fecha: string): string {
  const d = new Date(fecha)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function getMesLabel(fecha: string): string {
  const d = new Date(fecha)
  const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${meses[d.getMonth()]} ${d.getFullYear()}`
}
