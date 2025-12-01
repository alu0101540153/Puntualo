import { Request, Response } from 'express'
import { askLocalModel } from '../services/ai.service'
import { AIRecommendationService } from '../services/ai_recommendation.service'
import { ItemType } from '../models/enums'

export async function chat(req: Request, res: Response) {
  try {
    const { message, context } = req.body || {}
    if (!message) return res.status(400).json({ error: 'message is required' })

    // System prompt: limit assistant to only answer about the website and basic greetings
    const system = `Eres el asistente de la web "Puntualo". Tu comportamiento:
  - Da la bienvenida a los usuarios cuando se conectan (p. ej. "¡Bienvenido a Puntualo!").
  - Atiende saludos, despedidas y pequeñas conversaciones corteses (hola, ¿cómo estás?, adiós).
  - Responde preguntas sobre la web "Puntualo" cuando correspondan.
  - Ofrece recomendaciones de entretenimiento basadas en el catálogo/local data: películas, series y libros (hasta 3 sugerencias).
  Si la pregunta está claramente fuera de la web o de recomendaciones básicas, di brevemente que no puedes ayudar con eso.
  Contesta en español y sé claro y amable.`

    // Build user content including a short context (if provided)
    let userContent = `Usuario pregunta:\n${message}`
    if (context) {
      try {
        const ctxText = typeof context === 'string' ? context : JSON.stringify(context)
        userContent = `Contexto:\n${ctxText}\n\nPregunta:\n${message}`
      } catch (e) {
        // ignore
      }
    }

    const messages = [
      { role: 'system', content: system },
      { role: 'user', content: userContent }
    ]
    // If message clearly requests recommendations by genre, try DB lookup first
    const recRequest = parseRecommendationRequest(message)
    if (recRequest) {
      try {
        const { type, genre } = recRequest
        const items = await AIRecommendationService.findByTypeAndGenre(type, genre, 3)
        console.log('Recommendation lookup:', { type, genre, found: (items && items.length) || 0 })
        // If we found DB items, first try delegating to the local model with those items
        if (items && items.length > 0) {
          try {
            const response = await askLocalModel(messages, { db_items: items })
            if (response !== null) return res.json({ reply: response, fallback: false })
          } catch (e) {
            console.error('Error delegating to local model with db_items:', e)
            // continue to format and return a simple reply below
          }
        }
        if (items && items.length > 0) {
          // Format a human-friendly reply
          const lines = items.map((it: any) => {
            const title = it.title || (it.data && it.data.title) || 'Untitled'
            const desc = (it.data && it.data.description) ? ` — ${it.data.description}` : ''
            return `- ${title}${desc}`
          })
          const reply = `Aquí tienes ${items.length} ${type === ItemType.MOVIE ? 'películas' : type === ItemType.SERIES ? 'series' : 'libros'} de ${genre}:\n` + lines.join('\n')
          return res.json({ reply, fallback: false })
        }
        // if none found, fall through to LLM path
      } catch (e) {
        console.error('Recommendation DB lookup failed:', e)
      }
    }

    try {
      // If a local model CLI is configured, delegate to it
      console.log('Delegating to local model with messages (preview):', (messages && messages.length) ? messages[1].content?.slice(0,200) : '<no-user-content>')
      const response = await askLocalModel(messages)
      console.log('Local model responded (length):', response ? String(response).length : 0)
      if (response === null) throw new Error('No response from local model')
      return res.json({ reply: response, fallback: false })
    } catch (err) {
      console.error('AI provider failed, returning fallback recommendations:', err)
      // Fallback: return a short set of local recommendations to avoid user-facing error
      const fallback = [
        'La La Land — Un músico y una actriz persiguen sus sueños en Los Ángeles mientras se enamoran.',
        'Antes del Amanecer — Dos jóvenes se conocen en un tren y pasan una noche conversando en Viena.',
        'Notebook — Una historia de amor intensa que sigue a una pareja a través de los años.'
      ]
      const msg = 'Lo siento, no puedo conectar con la IA ahora. Aquí tienes algunas recomendaciones:' + '\n' + fallback.join('\n')
      return res.json({ reply: msg, fallback: true })
    }
  } catch (err: any) {
    console.error('AI chat error:', err?.message || err)
    return res.status(500).json({ error: err?.message || 'Internal error' })
  }
}

export async function recommendations(req: Request, res: Response) {
  try {
    const { type, genre, limit } = req.query as any
    if (!type || !genre) return res.status(400).json({ error: 'type and genre are required' })
    const t = String(type)
    const g = String(genre)
    const lim = Number(limit) || 3
    try {
      const items = await (AIRecommendationService as any).findByTypeAndGenre(t, g, lim)
      return res.json({ items })
    } catch (e) {
      console.error('recommendations lookup failed', e)
      return res.status(500).json({ error: 'lookup failed' })
    }
  } catch (err: any) {
    console.error('recommendations error', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

/**
 * Detecta si el mensaje pide recomendaciones y extrae tipo/genre.
 * Ejemplos:
 *  - "Dime 3 peliculas de accion"
 *  - "Quiero series de comedia"
 */
function parseRecommendationRequest(message: string): { type: string; genre: string } | null {
  if (!message || !message.trim()) return null
  // normalize: lowercase and remove diacritics
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')

  const m = norm(message)

  // helper: levenshtein distance for small fuzzy matching
  const levenshtein = (a: string, b: string) => {
    if (a === b) return 0
    const la = a.length
    const lb = b.length
    if (la === 0) return lb
    if (lb === 0) return la
    let prev = Array.from({ length: lb + 1 }, (_, i) => i)
    for (let i = 1; i <= la; i++) {
      const cur = [i]
      for (let j = 1; j <= lb; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
      }
      prev = cur
    }
    return prev[lb]
  }

  const tokenMatch = (text: string, candidate: string) => {
    const cand = candidate.replace(/[^a-z0-9]/g, '')
    if (!cand) return false
    if (text.includes(cand)) return true
    const toks = text.split(/\s+/).filter(Boolean)
    for (const t of toks) {
      const tt = t.replace(/[^a-z0-9]/g, '')
      const thresh = cand.length <= 4 ? 1 : 2
      if (levenshtein(tt, cand) <= thresh) return true
    }
    return false
  }

  // detect type (movie / series / book) with tolerant matching
  let type: string | null = null
  if (tokenMatch(m, 'pelicula') || tokenMatch(m, 'peliculas') || tokenMatch(m, 'pelis') || tokenMatch(m, 'film') || tokenMatch(m, 'movie')) type = ItemType.MOVIE
  else if (tokenMatch(m, 'serie') || tokenMatch(m, 'series') || tokenMatch(m, 'tv') || tokenMatch(m, 'show')) type = ItemType.SERIES
  else if (tokenMatch(m, 'libro') || tokenMatch(m, 'libros') || tokenMatch(m, 'novela') || tokenMatch(m, 'book')) type = ItemType.BOOK

  // Known genres list (extendable)
  const genres = [
    'accion', 'romance', 'romantica', 'comedia', 'drama', 'cienciaficcion', 'suspense', 'misterio', 'aventura', 'terror', 'fantasia'
  ]

  // Try to find a genre token anywhere in the message (first match wins)
  let genreFound = ''
  for (const g of genres) {
    if (tokenMatch(m, g)) {
      genreFound = g
      break
    }
  }

  // If not found, try pattern 'de <word>' or last meaningful token
  if (!genreFound) {
    const deMatch = m.match(/de\s+([a-z0-9\-]+)/)
    if (deMatch && deMatch[1]) {
      genreFound = deMatch[1].replace(/[^a-z0-9]/g, '')
    } else {
      const tokens = m.split(/\s+/).filter(Boolean)
      if (tokens.length > 0) {
        const last = tokens[tokens.length - 1].replace(/[^a-z0-9]/g, '')
        if (last.length > 2) genreFound = last
      }
    }
  }

  if (type && genreFound) return { type, genre: genreFound }
  return null
}
