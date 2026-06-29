export interface Materia {
  id: string
  nombre: string
  profesor: string
  horario: string
  aula: string
  semestre: string
  nota1: number
  nota2: number
  nota3: number
  examenFinal: number
  promedio?: number
  estado: 'cursando' | 'aprobada' | 'desaprobada'
}
