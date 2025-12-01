<template>
  <div class="chat-overlay" @click.self="close">
    <div class="chat-card">
        <button class="btn-top-close" @click="close" aria-label="Cerrar">✕</button>
        <div class="chat-logo">
          <img src="/icon_logo.svg" alt="Puntúalo" />
        </div>
      <header class="chat-header">
        <div>Asistente</div>
        <button class="close" @click="close">✕</button>
      </header>

      <div class="messages" ref="messagesRef">
        <div v-for="(m, i) in convo" :key="i" :class="['msg', m.from]">
          <div class="bubble">
            <span v-if="m.fallback" class="fallback-tag">Respuesta local</span>
            {{ m.text }}
          </div>
        </div>
        <div v-if="typing" class="msg bot">
          <div class="bubble typing">•••</div>
        </div>
      </div>

      <form class="chat-form" @submit.prevent="send">
        <input v-model="input" placeholder="Escribe aquí... p.ej. 'Dime 3 peliculas romanticas'" />
        <button type="submit">Enviar</button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import movies from '@/data/movies'
import { recommendations as recs } from '@/data/recommendations'
import siteContent from '@/data/siteContent'

const props = defineProps({})
const emit = defineEmits(['close'])

const input = ref('')
const convo = ref<Array<{ from: string; text: string; fallback?: boolean }>>([
  { from: 'bot', text: '¡Bienvenido a Puntualo! Soy tu asistente. Puedo saludar, conversar brevemente y recomendar películas, series o libros. Pruébame con: "Dime 3 peliculas de accion".', fallback: false }
])
const messagesRef = ref<HTMLElement | null>(null)
const typing = ref(false)

function close() {
  emit('close')
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function pushBot(text: string, fallback = false) {
  console.log('[Chat] pushBot:', text, 'fallback:', fallback)
  convo.value.push({ from: 'bot', text, fallback })
  scrollToBottom()
}

function pushUser(text: string) {
  console.log('[Chat] pushUser:', text)
  convo.value.push({ from: 'user', text })
  scrollToBottom()
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesRef.value) messagesRef.value.scrollTop = messagesRef.value.scrollHeight
  })
}

async function respond(messages: string | string[], options?: { fallback?: boolean }) {
  typing.value = true
  await sleep(500 + Math.random() * 700)
  const list = Array.isArray(messages) ? messages : [messages]
    for (let i = 0; i < list.length; i++) {
    pushBot(String(list[i]), !!options?.fallback)
    await sleep(300 + Math.random() * 600)
  }
  typing.value = false
}

async function send() {
  const txt = input.value && input.value.trim()
  if (!txt) return
  console.log('[Chat] send:', txt)
  pushUser(txt)
  input.value = ''
  await handleQuery(txt.toLowerCase())
}

async function handleQuery(q: string) {
  q = (q || '').trim()
  if (!q) return

  typing.value = true
  try {
    // Delegate recommendation detection and DB lookup to the backend.
    // Centralize logic server-side to avoid mismatch between client and server genre detection.

    const payload = {
      message: q,
      context: {
        siteContent,
        movies: movies.slice(0, 10),
        recommendations: recs.slice(0, 10)
      }
    }

    const res = await fetch('/api/v1/puntualo/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const json = await res.json()
    if (res.ok && json.reply) {
      // If server indicates this was a fallback response, pass that info
      await respond(json.reply, { fallback: !!json.fallback })
    } else {
      console.error('AI error', json)
      // Try a local fallback if provider returned error
      await localFallbackHandler(q)
    }
  } catch (err) {
    console.error('AI request failed', err)
    // On network or provider errors, use local fallback so user still gets useful replies
    await localFallbackHandler(q)
  } finally {
    typing.value = false
  }
}

// Local fallback handler: responds using local datasets (movies/recs) for greetings and recommendations
async function localFallbackHandler(q: string) {
  const raw = (q || '')
  // Normalize: remove diacritics and lower-case for more tolerant matching
  const normalize = (s: string) => s.normalize?.('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  const nq = normalize(raw)

  // greetings
  if (/\b(hola|buenas|buenos dias|buenas tardes|que tal|buenas noches)\b/.test(nq)) {
    const variants = [
      '¡Hola! ¿Cómo estás? Puedo recomendarte películas si quieres.',
      '¡Hola! Dime qué tipo de películas te gustan y te doy 3 recomendaciones.',
      '¡Hola! Estoy aquí para ayudarte. Pide por ejemplo: "Dime 3 peliculas romanticas".'
    ]
    const v = variants[Math.floor(Math.random() * variants.length)] || variants[0]
    await respond(String(v))
    return
  }

  // recommendation intent: broadened triggers to include 'quiero', 'busco', etc.
  const numMatch = nq.match(/(\d+)/)
  let n = numMatch ? Math.min(5, Math.max(1, Number(numMatch[1]))) : 3
  const intentTriggers = ['recomiend', 'dime', 'sugier', 'sugiere', 'busca', 'quiero', 'necesito', 'me gustari', 'me gustaria']
  const hasIntent = intentTriggers.some(t => nq.includes(t))

  // genre detection: be forgiving with small typos like 'acion' vs 'accion'
  const genreMap: Record<string, string[]> = {
    Romance: ['romant', 'romance'],
    Action: ['accion', 'acion', 'accion'],
    Drama: ['drama'],
    Comedy: ['comedi', 'comedia'],
    Horror: ['terror', 'horror'],
    Fantasy: ['fantas', 'fantasia']
  }
  let detectedGenre: string | null = null
  for (const [genre, tokens] of Object.entries(genreMap)) {
    for (const tk of tokens) {
      if (nq.includes(tk)) { detectedGenre = genre; break }
    }
    if (detectedGenre) break
  }

  if (hasIntent) {
    let results: Array<any> = []
    if (detectedGenre) {
      results = movies.filter(m => m.genres.map(g => normalize(g)).includes(normalize(detectedGenre))).slice(0, n)
    } else {
      results = movies.slice(0, n)
      if (results.length < n) results = results.concat(recs.slice(0, n - results.length))
    }
    if (!results.length) {
      const msgs = ['No encontré recomendaciones concretas ahora mismo. Aquí tienes algunas opciones generales:'].concat(recs.slice(0, n).map(r => `${r.title} — ${r.description}`))
      await respond(msgs)
      return
    }
    const label = detectedGenre ? `de ${detectedGenre.toLowerCase()}` : ''
    const msgs = [`Aquí tienes ${results.length} recomendaci${results.length === 1 ? 'ón' : 'ones'} ${label}:`].concat(results.map(it => `${it.title} — ${it.description}`))
    await respond(msgs)
    return
  }

  // Search by keyword (try normalized search)
  const keyword = nq
  const foundInRecs = recs.filter(r => normalize(r.title).includes(keyword) || normalize(r.description).includes(keyword))
  const foundInMovies = movies.filter(m => normalize(m.title).includes(keyword) || normalize(m.description).includes(keyword))
  const found = [...foundInMovies, ...foundInRecs].slice(0, 5)
  if (found.length) {
    const msgs = ['He encontrado estas coincidencias:'].concat(found.map(f => `${f.title} — ${f.description}`))
    await respond(msgs)
    return
  }

  // final fallback message
  await respond('Lo siento, no pude conectar con la IA ahora. Puedo recomendar películas si me pides: "Dime 3 peliculas romanticas".')
}

onMounted(() => scrollToBottom())
// Close on Escape for better UX
onMounted(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') close()
  }
  window.addEventListener('keydown', onKey)
  ;(window as any)._chat_onKey = onKey
})
// cleanup
onUnmounted(() => {
  const h = (window as any)._chat_onKey
  if (h) window.removeEventListener('keydown', h)
})
</script>

<style scoped>
.chat-overlay {
  position: fixed;
  right: 20px;
  bottom: 90px;
  z-index: 9999;
}
.chat-card {
  width: 320px;
  max-height: 480px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.chat-header { display:flex; justify-content:space-between; align-items:center; padding:10px 12px; background:#f3f4f6; font-weight:600 }
.close { background:none; border:none; font-size:14px; cursor:pointer }
.messages { padding:12px; overflow:auto; flex:1 }
.msg { margin-bottom:8px; display:flex }
.msg.bot { justify-content:flex-start }
.msg.user { justify-content:flex-end }
.bubble { max-width:85%; padding:8px 10px; border-radius:8px; background:#e5e7eb; color:#111827 }
.msg.bot .bubble { background:#f3f4f6; color:#111827 }
.msg.user .bubble { background:#2563eb; color:white }
.chat-form { display:flex; gap:8px; padding:8px; border-top:1px solid #eee }
.chat-form input { flex:1; padding:8px; border-radius:8px; border:1px solid #ddd }
.chat-form input { color: #111827; background: white; caret-color: #111827 }
.chat-form input::placeholder { color: #9ca3af }
.chat-logo { display:flex; justify-content:center; padding-top:10px }
.chat-logo img { width:56px; height:auto; display:block }
.chat-form button[type="submit"] { padding:8px 12px; background:#2563eb; color:white; border:none; border-radius:8px }
.btn-top-close {
  position: absolute;
  right: 10px;
  top: 10px;
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #374151;
}
.fallback-tag { display:inline-block; margin-right:8px; font-size:11px; color:#6b7280; background:#f3f4f6; padding:2px 6px; border-radius:6px }
</style>
