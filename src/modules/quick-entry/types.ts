export interface QuickEntry {
  id: string
  fecha: string
  tipo: 'ingreso' | 'gasto'
  categoria: string
  descripcion: string
  monto: number
  texto_original: string
  dispositivo: string
  created_at: string
}

export interface AppSettings {
  openAiKey: string
  apiToken: string
}