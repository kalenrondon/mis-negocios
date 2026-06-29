import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Key, Smartphone, Shield, Eye, EyeOff, Copy, Check, ExternalLink, PenBox } from 'lucide-react'
import { getSettings, saveSettings, generateApiToken, API_URL, useQuickEntries, clearQuickEntries } from '../modules/quick-entry/store'

export default function SettingsPage() {
  const navigate = useNavigate()
  const { entries } = useQuickEntries()
  const [openAiKey, setOpenAiKey] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [copied, setCopied] = useState<'key' | 'token' | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const s = getSettings()
    setOpenAiKey(s.openAiKey)
    setApiToken(s.apiToken)
  }, [])

  function handleSave() {
    saveSettings({ openAiKey, apiToken })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleGenerateToken() {
    const token = generateApiToken()
    setApiToken(token)
    saveSettings({ openAiKey, apiToken: token })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function copyToClipboard(text: string, type: 'key' | 'token') {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"><ArrowLeft size={20} /></button>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Ajustes</h1>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Key size={18} className="text-amber-500" /> API de OpenAI</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Necesitás una API Key de OpenAI para que la IA procese el texto. Obtenela en{' '}
            <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 inline-flex items-center gap-0.5">
              platform.openai.com <ExternalLink size={12} />
            </a>
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={openAiKey}
                onChange={e => { setOpenAiKey(e.target.value); setSaved(false) }}
                placeholder="sk-..."
                className="w-full px-3 py-2 pr-20 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
              <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                <button onClick={() => copyToClipboard(openAiKey, 'key')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Copiar">
                  {copied === 'key' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
                <button onClick={() => setShowKey(!showKey)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Shield size={18} className="text-green-500" /> Token de API</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Token personal para autenticar las llamadas desde Atajos de iPhone u otros dispositivos.
          </p>
          {apiToken ? (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={apiToken}
                  readOnly
                  className="w-full px-3 py-2 pr-20 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm focus:outline-none font-mono text-xs"
                />
                <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => copyToClipboard(apiToken, 'token')} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" title="Copiar">
                    {copied === 'token' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => setShowToken(!showToken)} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleGenerateToken} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium">
              Generar Token
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50" disabled={saved}>
            {saved ? 'Guardado ✓' : 'Guardar configuración'}
          </button>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><Smartphone size={18} className="text-blue-500" /> Widget para iPhone</h2>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
              <p className="font-medium text-blue-700 dark:text-blue-300 mb-1">URL del API</p>
              <code className="text-xs bg-white dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600 break-all font-mono">{API_URL}</code>
            </div>

            <div>
              <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-2">Configuración en Atajos (Shortcuts)</h3>
              <ol className="list-decimal list-inside space-y-2">
                <li>Abrí la app <strong>Atajos</strong> en tu iPhone</li>
                <li>Tocá <strong>+</strong> para crear un nuevo atajo</li>
                <li>Buscá y agregá la acción <strong>"Dictar texto"</strong></li>
                <li>Agregá <strong>"Añadir URL"</strong> con la URL del API de arriba</li>
                <li>Agregá <strong>"Añadir solicitud de obtención de contenido"</strong>:
                  <div className="ml-4 mt-1 text-xs space-y-1">
                    <p>Método: <strong>POST</strong></p>
                    <p>Tipo de contenido: <strong>JSON</strong></p>
                    <p>Cuerpo JSON: <strong>{'{"text": "Dictado", "device": "iphone"}'}</strong></p>
                    <p className="mt-2">Encabezados:</p>
                    <p className="ml-2"><strong>Authorization:</strong> Bearer TU_TOKEN</p>
                    <p className="ml-2"><strong>X-OpenAI-Key:</strong> TU_OPENAI_KEY</p>
                    <p className="ml-2"><strong>X-User-Id:</strong> TU_TOKEN</p>
                  </div>
                </li>
                <li>Agregá <strong>"Obtener contenido de..."</strong> y seleccioná Contenido de la solicitud</li>
                <li>Agregá <strong>"Mostrar notificación"</strong> con el mensaje del resultado</li>
                <li>Guardá el atajo con el nombre <strong>"➕ Registrar Movimiento"</strong></li>
              </ol>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
              <p className="font-medium text-amber-700 dark:text-amber-300 mb-1">💡 Widget</p>
              <p className="text-xs">
                En tu iPhone, mantené presionado la pantalla de inicio, tocá <strong>+</strong>, buscá <strong>Atajos</strong>, seleccioná el widget, y elegí el atajo <strong>"➕ Registrar Movimiento"</strong>. 
                Al tocar el widget se activará el dictado por voz y se registrará el movimiento automáticamente.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2"><PenBox size={18} className="text-purple-500" /> Modo Manual (sin OpenAI)</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Sin API Key de OpenAI. Creá un Atajo que envíe los datos directamente.
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>Abrí la app <strong>Atajos</strong> en tu iPhone</li>
            <li>Tocá <strong>+</strong> para crear un nuevo atajo</li>
            <li>Agregá <strong>"Solicitar entrada"</strong> para cada campo:
              <div className="ml-4 mt-1 text-xs space-y-1">
                <p>• <strong>Tipo</strong> — texto (gasto / ingreso)</p>
                <p>• <strong>Monto</strong> — número</p>
                <p>• <strong>Categoría</strong> — texto (Alimentación, Transporte, etc.)</p>
                <p>• <strong>Descripción</strong> — texto</p>
              </div>
            </li>
            <li>Agregá <strong>"Añadir URL"</strong> con la URL del API de arriba</li>
            <li>Agregá <strong>"Añadir solicitud de obtención de contenido"</strong>:
              <div className="ml-4 mt-1 text-xs space-y-1">
                <p>Método: <strong>POST</strong></p>
                <p>Tipo de contenido: <strong>JSON</strong></p>
                <p>Cuerpo JSON: <strong>{'{"tipo": "Tipo", "monto": Monto, "categoria": "Categoría", "descripcion": "Descripción", "device": "iphone"}'}</strong></p>
                <p className="mt-2">Encabezados:</p>
                <p className="ml-2"><strong>Authorization:</strong> Bearer TU_TOKEN</p>
                <p className="ml-2"><strong>X-User-Id:</strong> TU_TOKEN</p>
                <p className="text-amber-600 dark:text-amber-400 mt-1">⚠ Sin X-OpenAI-Key = modo manual</p>
              </div>
            </li>
            <li>Agregá <strong>"Mostrar notificación"</strong> con el resultado</li>
            <li>Guardá el atajo con el nombre <strong>"➕ Gasto Manual"</strong></li>
          </ol>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
          <h2 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Historial de Capturas Rápidas</h2>
          {entries.length === 0 ? (
            <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-4">Sin capturas aún</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {entries.map((e) => (
                <div key={e.id} className="flex items-start justify-between gap-2 text-sm bg-slate-50 dark:bg-slate-700/30 rounded-lg p-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-400 truncate">{e.texto_original}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-medium px-1 py-0.5 rounded ${e.tipo === 'ingreso' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                        {e.tipo === 'ingreso' ? '+' : '-'}${e.monto.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] text-slate-400">{e.categoria}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{new Date(e.fecha + 'T00:00:00').toLocaleDateString('es-AR')}</span>
                </div>
              ))}
            </div>
          )}
          {entries.length > 0 && (
            <button onClick={() => { if (confirm('¿Borrar todo el historial de capturas?')) clearQuickEntries() }} className="text-xs text-red-500 hover:text-red-600 mt-2">
              Borrar historial
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
