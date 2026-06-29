import { useNavigate } from 'react-router-dom'
import { ArrowLeft, SearchX } from 'lucide-react'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX size={64} className="text-slate-300 dark:text-slate-600 mb-4" />
      <h1 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">Página no encontrada</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-6">La página que buscas no existe</p>
      <button onClick={() => navigate('/')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
        <ArrowLeft size={16} /> Volver al inicio
      </button>
    </div>
  )
}
