import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const SYSTEM_PROMPT = `Eres un asistente financiero experto. Convierte el texto del usuario en un JSON válido con la siguiente estructura:
{
  "tipo": "ingreso" | "gasto",
  "moneda": "ARS",
  "movimientos": [
    {
      "monto": number,
      "categoria": string,
      "descripcion": string
    }
  ]
}

Reglas:
- Detecta si es ingreso o gasto según el contexto
- Extrae montos en pesos argentinos. "mil" = 1000, "millón" = 1000000
- "Gasté", "compré", "pagué", "costó" = gasto. "Me pagaron", "recibí", "cobré" = ingreso
- Divide en múltiples movimientos si hay varios items (ej: "gasolina 20 mil y peajes 15 mil" = 2 movimientos)
- Categorías posibles: Alimentación, Transporte, Salud, Vivienda, Educación, Servicios, Tecnología, Entretenimiento, Compras, Mascotas, Préstamos, Inversiones, Salario, Otros
- No inventes datos. Si no hay suficiente info, usa "Otros" como categoría
- Devuelve ÚNICAMENTE el JSON, sin explicaciones ni markdown`

async function callOpenAI(apiKey: string, text: string) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.1,
      max_tokens: 500,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI error: ${res.status} ${err}`)
  }

  const data = await res.json()
  const content = data.choices?.[0]?.message?.content?.trim() || ''
  const cleaned = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
  return JSON.parse(cleaned)
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Authorization, Content-Type, X-OpenAI-Key, X-User-Id',
    },
  })
}

function makeMovimiento(body: any, device: string, textoOriginal: string) {
  return {
    id: crypto.randomUUID(),
    fecha: new Date().toISOString().slice(0, 10),
    tipo: body.tipo || 'gasto',
    categoria: body.categoria || 'Otros',
    descripcion: body.descripcion || '',
    monto: body.monto || 0,
    texto_original: textoOriginal,
    dispositivo: device || 'unknown',
    created_at: new Date().toISOString(),
  }
}

export async function POST(req: Request) {

  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '')
    const openAIKey = req.headers.get('x-openai-key')
    const userId = req.headers.get('x-user-id')

    const body = await req.json()
    const { text, device } = body

    let movimientos: any[]

    if (openAIKey && text && typeof text === 'string') {
      // MODO INTELIGENTE: usa OpenAI para parsear texto natural
      const resultado = await callOpenAI(openAIKey, text)

      movimientos = (resultado.movimientos || []).map((m: any) => ({
        id: crypto.randomUUID(),
        fecha: new Date().toISOString().slice(0, 10),
        tipo: resultado.tipo || 'gasto',
        categoria: m.categoria || 'Otros',
        descripcion: m.descripcion || text.slice(0, 100),
        monto: m.monto || 0,
        texto_original: text,
        dispositivo: device || 'unknown',
        created_at: new Date().toISOString(),
      }))
    } else if (body.tipo && body.monto) {
      // MODO MANUAL: datos directos sin OpenAI
      movimientos = [makeMovimiento(body, device, body.descripcion || '')]
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Enviá { text } con X-OpenAI-Key para modo inteligente, o { tipo, monto, categoria, descripcion } para modo manual'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      })
    }

    if (userId && SUPABASE_URL && SUPABASE_SERVICE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
      const { error } = await supabase.from('quick_entries').insert(
        movimientos.map((m: any) => ({
          ...m,
          user_id: userId,
        }))
      )
      if (error) console.error('Supabase error:', error)
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${movimientos.length} movimiento(s) registrado(s) correctamente.`,
      data: movimientos,
    }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })

  } catch (err) {
    return new Response(JSON.stringify({
      success: false,
      error: err instanceof Error ? err.message : 'Error interno',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    })
  }
}
