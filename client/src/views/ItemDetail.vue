<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader :show-back="true" />
    
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500 bg-opacity-30 rounded-2xl p-8 shadow-lg">
        <h2 class="text-3xl font-bold text-white mb-6">Información del ítem</h2>

        <div class="flex gap-8 items-start">
          <img :src="itemImage || '/img/placeholder-book.png'" alt="cover" class="w-48 h-64 object-cover rounded-md shadow-2xl border border-white/10" />

          <div class="flex-1">
            <h3 class="text-3xl font-semibold text-gray-100 mb-3">{{ item.title || 'Sin título' }}</h3>
            <p class="text-gray-300 text-lg leading-relaxed mb-6">{{ item.description || item.synopsis || 'Sin descripción disponible.' }}</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-200 mb-6">
              <div>
                <p class="text-sm text-gray-100 font-semibold">Título:</p>
                <p class="text-gray-200">{{ item.title }}</p>
              </div>
              <div v-if="item.author">
                <p class="text-sm text-gray-100 font-semibold">Autor/Autora:</p>
                <p class="text-gray-200">{{ item.author }}</p>
              </div>
              <div v-if="item.pages">
                <p class="text-sm text-gray-100 font-semibold">Páginas:</p>
                <p class="text-gray-200">{{ item.pages }}</p>
              </div>
              <div v-if="item.genre">
                <p class="text-sm text-gray-100 font-semibold">Género:</p>
                <p class="text-gray-200">{{ item.genre }}</p>
              </div>
              <div v-if="item.language">
                <p class="text-sm text-gray-100 font-semibold">Idioma:</p>
                <p class="text-gray-200">{{ item.language }}</p>
              </div>
            </div>

            <div class="mt-4">
              <button @click="showReview = !showReview" class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold px-5 py-2 rounded-lg hover:brightness-95 transition">Puntuar / Escribir reseña</button>
            </div>

            <div v-if="showReview" class="mt-6 bg-white/5 rounded-lg p-6">
              <h3 class="text-2xl font-bold mb-4">Puntúa el ítem: {{ item.title }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="md:col-span-1">
                  <img :src="itemImage || '/img/placeholder-book.png'" alt="cover" class="w-full h-auto object-cover rounded-md" />
                </div>
                <div class="md:col-span-2">
                  <div class="mb-3">
                    <label class="block text-sm text-gray-300">Tu puntuación (1-10) — opcional</label>
                    <input v-model="userScoreRaw" type="text" inputmode="decimal" placeholder="0 - 10 (dejar vacío para solo marcar como viéndolo/leyéndolo)" class="w-72 mt-2 p-2 rounded bg-white/6 text-gray-900" />
                    <div v-if="userScoreError" class="text-rose-400 text-sm mt-1">{{ userScoreError }}</div>
                  </div>

                  <div class="mb-3">
                    <label class="block text-sm text-gray-300">Estado</label>
                    <select v-model="userStatus" class="w-48 mt-2 p-2 rounded bg-white/6 text-gray-900">
                      <option value="watching">Leyendo/Viéndolo</option>
                      <option value="completed">Terminado</option>
                    </select>
                  </div>

                  <div class="mb-3">
                    <label class="block text-sm text-gray-300">Reseña</label>
                    <textarea v-model="userComment" rows="4" class="w-full mt-2 p-2 rounded bg-white/6 text-gray-900"></textarea>
                  </div>

                  <div class="flex justify-end">
                    <button @click="submitRating" class="px-4 py-2 bg-emerald-500 rounded text-black font-semibold">Enviar</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section class="mt-8 bg-gradient-to-b from-gray-700 to-gray-600 bg-opacity-25 rounded-2xl p-6 shadow-inner">
        <h3 class="text-xl font-bold text-white mb-4">Puntuación de amigos</h3>
        <div class="flex items-end gap-8 min-h-[120px]">
          <div v-for="r in friendRatings" :key="r.name" class="flex flex-col items-center">
            <div :class="['w-20 h-20 rounded-full flex items-center justify-center text-xl font-extrabold text-white', ratingClass(r.score)]">
              {{ r.score }}/10
            </div>
            <span class="mt-2 text-gray-300">{{ r.name }}</span>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { getItemById, createItem } from '@/services/item'
import localRecommendations from '@/data/recommendations'
import { getUser } from '@/services/auth'
import { getMyRatings } from '@/services/user'
import { addRating } from '@/services/user'
import { useRouter } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'

const route = useRoute()
const id = String(route.params.id || '')

const item = ref<any>({})
const itemImage = ref('')
const userScore = ref<number>(9)
const userScoreRaw = ref<string>(String(userScore.value))
const userScoreError = ref<string>('')
const showReview = ref(false)
const userStatus = ref<string>('watching')
const userComment = ref<string>('')
const isSubmitting = ref(false)
const successMessage = ref('')
const router = useRouter()

function inferGenresFromTitle(title: string) {
  if (!title) return []
  const t = title.toLowerCase()
  const genres: string[] = []
  // heuristics
  if (t.includes('fast') || t.includes('furious') || t.includes('toretto') || t.includes('race')) {
    genres.push('Acción', 'Coches')
  }
  if (t.includes('love') || t.includes('amor') || t.includes('romance')) genres.push('Romance')
  if (t.includes('king') || t.includes('trono') || t.includes('game of')) genres.push('Fantasy')
  if (t.includes('stranger') || t.includes('things')) genres.push('Drama')
  if (t.includes('crime') || t.includes('murder') || t.includes('detective')) genres.push('Crimen')
  return Array.from(new Set(genres))
}

// Puntuaciones de amigos (mock) — se pueden sustituir por datos reales
const friendRatings = ref([
  { name: 'Saray', score: 9 },
  { name: 'Víctor', score: 7 },
  { name: 'Pablo', score: 10 }
])

function ratingClass(score: number) {
  if (score >= 9) return 'bg-emerald-600'
  if (score >= 7) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-rose-500'
}

function mapServerItem(data: any) {
  return {
    _id: data._id || data.id || '',
    itemType: data.itemType || (data.data && data.data.type) || 'book',
    title: data.title || (data.data && data.data.title) || '',
    description: (data.data && data.data.description) || data.description || '',
    author: (data.data && data.data.author) || data.author || '',
    pages: (data.data && data.data.pages) || data.pages || '',
    genre: (data.data && Array.isArray(data.data.genres) ? data.data.genres.join(', ') : data.data?.genres) || data.genre || '',
    language: (data.data && data.data.language) || data.language || '',
    image: (data.data && data.data.cover) || data.cover || data.image || ''
  }
}

onMounted(async () => {
  if (!id) return

  async function tryPrefillForItem() {
    try {
      const user = getUser()
      if (user && user._id && item.value && (item.value._id || item.value.id)) {
        const myRatings: any = await getMyRatings(user._id)
        if (Array.isArray(myRatings) && myRatings.length) {
          const rawId = item.value._id || item.value.id || String(item.value._id || '')
          if (!rawId) return
          const mine = myRatings.filter((x: any) => {
            const id = x.itemId?._id || x.itemId?.id || String(x.itemId || x._id || '')
            return String(id) === String(rawId)
          }).sort((a: any, b: any) => {
            const ta = a.lastModified ? new Date(a.lastModified).getTime() : 0
            const tb = b.lastModified ? new Date(b.lastModified).getTime() : 0
            return tb - ta
          })[0]

          if (mine) {
            userScore.value = Number(mine.score) || userScore.value
            userScoreRaw.value = String(userScore.value).replace('.', ',')
            userStatus.value = mine.status || userStatus.value
            userComment.value = mine.comment || userComment.value
          }
        }
      }
    } catch (err) {
      // ignore prefill errors
    }
  }

  try {
    const data: any = await getItemById(id)
    if (data && typeof data === 'object') {
      const mapped = mapServerItem(data)
      item.value = mapped
      itemImage.value = mapped.image
      // if route requests to open the review form, enable it
      if (route.query && (route.query.openReview === '1' || route.query.openReview === 'true' || route.query.openReview === '')) {
        showReview.value = true
      }
      // prefill user's rating now that item is available
      await tryPrefillForItem()
      return
    }
  } catch (err) {
    // console.warn('No encontrado en servidor, usando fallback local', err)
  }

  // Fallback: buscar en datos locales por id (string or number)
  const local = (localRecommendations as any[]).find((r: any) => r.id === id || r.id === Number(id))
  if (local) {
    item.value = {
      _id: local.id || local._id || '',
      itemType: local.itemType || 'book',
      title: local.title,
      description: local.description,
      author: local.author || '',
      pages: local.pages || '',
      genre: (local.genres || []).join(', '),
      language: local.language || '',
    }
    itemImage.value = local.image
  }

  // Try to prefill user's existing rating for this item (latest)
  await tryPrefillForItem()
})

async function submitRating() {
  const user = getUser()
  if (!user || !user._id) {
    // redirect to login
    router.push('/login')
    return
  }

  // Asegurarnos de que el item exista en la BD; si no, crearlo para que las recomendaciones
  // puedan usar sus géneros y demás metadatos.
  let dbItemId = item.value._id || item.value.id || null

  // Intentamos obtener el item en el servidor (si dbItemId corresponde a un documento)
  if (dbItemId) {
    try {
      const existing = await getItemById(String(dbItemId))
      if (existing && existing._id) {
        dbItemId = existing._id
      } else {
        dbItemId = null
      }
    } catch (err) {
      // no existe en server
      dbItemId = null
    }
  }

  // Si no está en la BD, creamos un documento usando los datos visibles
    if (!dbItemId) {
    try {
      const payloadCreate = {
        title: item.value.title || item.value.title,
        itemType: item.value.itemType || 'book',
        data: {
          title: item.value.title || '',
          description: item.value.description || '',
          cover: itemImage.value || '',
          genres: item.value.genre ? String(item.value.genre).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          author: item.value.author || '',
          pages: item.value.pages || '',
          language: item.value.language || ''
        }
      }

        // If we couldn't extract genres from the UI, try to infer from title
        if ((!payloadCreate.data.genres || payloadCreate.data.genres.length === 0) && payloadCreate.title) {
          const inferred = inferGenresFromTitle(String(payloadCreate.title))
          if (inferred.length) payloadCreate.data.genres = inferred
        }

      const created: any = await createItem(payloadCreate)
      dbItemId = created && (created._id || created.id)
    } catch (err) {
      console.error('Error al crear item en servidor antes de puntuar', err)
    }
  }

  // Parse and validate userScoreRaw only if the user provided a value.
  const raw = String(userScoreRaw.value || '').trim()
  let payloadScore: number | undefined = undefined
  if (raw.length > 0) {
    const parsed = parseFloat(raw.replace(',', '.'))
    if (isNaN(parsed)) {
      userScoreError.value = 'Introduce un número válido entre 0 y 10 (puedes usar coma o punto), o deja vacío.'
      isSubmitting.value = false
      return
    }

    // Round to one decimal place
    let normalized = Math.round(parsed * 10) / 10

    // Validate range explicitly and show error if out of bounds
    if (normalized < 0) {
      userScoreError.value = 'La nota no puede ser menor que 0.'
      isSubmitting.value = false
      return
    }
    if (normalized > 10) {
      userScoreError.value = 'La nota no puede ser mayor que 10.'
      isSubmitting.value = false
      return
    }

    // update displayed values
    userScore.value = normalized
    userScoreRaw.value = String(normalized).replace('.', ',')
    userScoreError.value = ''
    payloadScore = Number(userScore.value)
  }

  const payload: any = {
    itemId: dbItemId,
    itemType: item.value.itemType || 'book',
    comment: userComment.value || '',
    status: userStatus.value || 'watching'
  }
  if (typeof payloadScore !== 'undefined') payload.score = payloadScore

  try {
    isSubmitting.value = true
    await addRating(user._id, payload)

    // Notify other components that the user's ratings have changed
    try {
      window.dispatchEvent(new CustomEvent('ratingsChanged'))
    } catch (err) {
      // ignore if custom events not supported
    }

    // Update local UI: close form and show success
    successMessage.value = 'Puntuación enviada correctamente'
    showReview.value = false
    // clear comment optionally
    // userComment.value = ''
  } catch (e) {
    console.error('Error al enviar puntuación', e)
    successMessage.value = 'Error al enviar la puntuación'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* estilos adicionales si se desean */
</style>
