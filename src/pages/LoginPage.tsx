import { useState, useEffect } from 'react'
import { login, register } from '../lib/auth-store'

export default function LoginPage() {
  const [email, setEmail] = useState(() => localStorage.getItem('recordarEmail') || '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [recordar, setRecordar] = useState(() => !!localStorage.getItem('recordarEmail'))

  useEffect(() => {
    if (recordar && email) localStorage.setItem('recordarEmail', email)
    else if (!recordar) localStorage.removeItem('recordarEmail')
  }, [recordar, email])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (isRegister && password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password)
        setSuccess('Cuenta creada. Revisá tu email para confirmar (si es necesario).')
      } else {
        await login(email, password)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-black p-4">
      <div className="w-full max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-300/50 dark:border-slate-700/50 p-8">
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
          {!isRegister && (
            <label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 cursor-pointer select-none">
              <input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} className="rounded border-slate-300 dark:border-slate-600" />
              Recordar email
            </label>
          )}
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Repetir Contraseña</label>
              <input type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {loading && <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
            {loading ? 'Procesando...' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-6">
          {isRegister ? '¿Ya tenés cuenta?' : '¿No tenés cuenta?'}{' '}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); setSuccess(''); setConfirmPassword('') }}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium">
            {isRegister ? 'Iniciar sesión' : 'Registrarme'}
          </button>
        </p>
      </div>
    </div>
  )
}
