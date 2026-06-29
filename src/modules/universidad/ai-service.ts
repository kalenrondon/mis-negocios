import { getSettings } from '../quick-entry/store'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const FEATURE_PROMPTS: Record<string, string> = {
  'Resumir documento': 'Sos un asistente académico. Resumí el texto que te envíe el usuario de forma clara y concisa, destacando los puntos principales. Respondé en español.',
  'Explicar tema': 'Sos un tutor académico. Explicá el tema que el usuario pregunte de forma clara, didáctica y con ejemplos. Respondé en español.',
  'Generar preguntas': 'Sos un profesor. Generá preguntas de práctica sobre el tema indicado, con distintos niveles de dificultad. Incluí las respuestas breves al final. Respondé en español.',
  'Crear flashcards': 'Sos un asistente de estudio. Creá flashcards (tarjetas de repaso) sobre el tema indicado. Formateá cada flashcard como "PREGUNTA: ... RESPUESTA: ...". Respondé en español.',
  'Generar examen': 'Sos un profesor. Generá un examen completo con 5 preguntas de distintos tipos (multiple choice, desarrollo, verdadero/falso) sobre el tema indicado. Incluí las respuestas al final. Respondé en español.',
  'Buscar conceptos': 'Sos un diccionario académico. Definí los conceptos que el usuario pregunte, de forma precisa y clara. Respondé en español.',
  'Crear mapa mental': 'Sos un asistente de organización. Creá la estructura de un mapa mental sobre el tema indicado, con jerarquías y conexiones entre conceptos. Respondé en español.',
  'Resolver dudas': 'Sos un tutor personal. Respondé las dudas del usuario sobre la materia de forma clara, paciente y con ejemplos prácticos. Respondé en español.',
}

export function getFeaturePrompt(feature: string, materiaContext: string): string {
  const base = FEATURE_PROMPTS[feature] || FEATURE_PROMPTS['Resolver dudas']
  return `${base}

Contexto de la materia:
${materiaContext}
---
Importante: si el usuario no especifica un tema, usá el contexto de la materia para ayudarlo. Si preguntá algo fuera de la materia, respondé igual pero orientado al contexto académico.`
}

async function callOpenAI(key: string, messages: ChatMessage[], systemPrompt: string, signal?: AbortSignal): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ model: 'gpt-4o-mini', messages: [{ role: 'system', content: systemPrompt }, ...messages.map(m => ({ role: m.role, content: m.content }))], temperature: 0.7, max_tokens: 2000 }),
    signal,
  })
  if (!res.ok) throw new Error(`Error OpenAI: ${res.status} - ${await res.text()}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() || 'Sin respuesta'
}

async function callGemini(key: string, messages: ChatMessage[], systemPrompt: string, signal?: AbortSignal): Promise<string> {
  const chatHistory = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: systemPrompt }] }, contents: chatHistory }),
    signal,
  })
  if (!res.ok) throw new Error(`Error Gemini: ${res.status} - ${await res.text()}`)
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'Sin respuesta'
}

export async function sendChatMessage(
  feature: string,
  messages: ChatMessage[],
  materiaContext: string,
  signal?: AbortSignal,
): Promise<string> {
  const settings = getSettings()
  const systemPrompt = getFeaturePrompt(feature, materiaContext)

  if (settings.aiProvider === 'gemini' && settings.geminiKey) {
    return callGemini(settings.geminiKey, messages, systemPrompt, signal)
  }
  if (settings.openAiKey) {
    return callOpenAI(settings.openAiKey, messages, systemPrompt, signal)
  }
  throw new Error('Configurá una API Key de OpenAI o Gemini en Ajustes')
}

export function buildMateriaContext(materia: any, apuntes: any[], examenes: any[], horarios: any[], tareas: any[]): string {
  const parts: string[] = []
  if (materia) {
    parts.push(`Materia: ${materia.nombre} (${materia.codigo || 'sin código'})`)
    parts.push(`Profesor: ${materia.profesor || 'No especificado'}`)
    parts.push(`Descripción: ${materia.descripcion || 'Sin descripción'}`)
    parts.push(`Estado: ${materia.estado}`)
    if (materia.promedio !== undefined) parts.push(`Promedio actual: ${materia.promedio.toFixed(2)}`)
  }
  if (apuntes.length > 0) {
    parts.push(`\nApuntes disponibles (${apuntes.length}):`)
    apuntes.slice(0, 5).forEach(a => parts.push(`- ${a.titulo}: ${a.contenido.slice(0, 300)}`))
  }
  if (examenes.length > 0) {
    parts.push(`\nExámenes registrados (${examenes.length}):`)
    examenes.forEach(e => parts.push(`- ${e.tipo}: ${e.notaObtenida}/${e.notaMaxima} (${e.porcentaje}%)`))
  }
  if (tareas.length > 0) {
    parts.push(`\nTareas (${tareas.length}):`)
    tareas.slice(0, 5).forEach(t => parts.push(`- ${t.titulo} (${t.estado}, vence: ${t.fechaLimite})`))
  }
  if (horarios.length > 0) {
    const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    parts.push(`\nHorario:`)
    horarios.forEach(h => parts.push(`- ${dias[h.dia]} ${h.horaInicio}-${h.horaFin} (${h.aula || 'sin aula'})`))
  }
  return parts.join('\n')
}
