import { useState } from 'react'
import { login, register } from '../lib/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      if (isRegister) {
        await register(email, password)
        setSuccess('Cuenta creada. Revisá tu email para confirmar (si es necesario).')
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 p-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-2">Mis Negocios</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          {isRegister ? 'Crear una cuenta' : 'Iniciar sesión'}
        </p>

        {error && <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3 mb-4">{error}</p>}
        {success && <p className="text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Contraseña</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            {isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess('') }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            {isRegister ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </p>
      </div>
    </div>
  )
}
