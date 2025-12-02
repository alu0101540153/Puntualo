<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader :show-back="true" />
    
    <main class="max-w-6xl mx-auto px-6 py-8">
      <div class="relative bg-gradient-to-b from-gray-700 via-gray-600 to-gray-500 bg-opacity-30 rounded-2xl p-8 shadow-lg">
        <div class="flex items-center gap-4 mb-6">
          <button @click="router.back()" aria-label="Volver" title="Volver" class="w-10 h-10 rounded-full bg-white text-gray-600 flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" class="w-5 h-5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 class="text-3xl font-bold text-white">Información</h2>
        </div>

        <div class="flex gap-8 items-start">
          <img :src="itemImage || '/img/placeholder-book.png'" alt="cover" class="w-48 h-64 object-cover rounded-md shadow-2xl border border-white/10" />

          <div class="flex-1">
            <h3 class="text-3xl font-semibold text-gray-100 mb-3">{{ item.title || 'Sin título' }}</h3>
            <div class="mb-4">
              <span v-if="itemTypeLabel" class="inline-block text-xs text-gray-800 bg-white/10 px-3 py-1 rounded-full">{{ itemTypeLabel }}</span>
            </div>
            <div class="text-gray-300 text-lg leading-relaxed mb-6">
              <div v-if="isBook" v-html="sanitizedDescription"></div>
              <p v-else>{{ item.description || item.synopsis || 'Sin descripción disponible.' }}</p>
            </div>

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

            <div class="mt-4 flex items-center gap-3">
              <button @click="openRatingModal" class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold px-5 py-2 rounded-lg hover:brightness-95 transition">Puntuar / Escribir reseña</button>
              <button @click="toggleWishlist" :disabled="wishlistLoading" class="px-4 py-2 rounded-lg text-black font-semibold" :class="inWishlist ? 'bg-yellow-400' : 'bg-sky-400'">
                {{ inWishlist ? 'En mi lista' : 'Añadir a mi lista' }}
              </button>
            </div>

            <div v-if="showCompletePrompt" class="mt-4 bg-white/6 p-4 rounded-lg flex items-center gap-4">
              <div class="flex-1 text-gray-200">¿Quieres puntuar y escribir una reseña ahora que lo has terminado?</div>
              <div class="flex items-center gap-2">
                <button @click="confirmCompleteWithReview" class="px-4 py-2 bg-emerald-500 text-black rounded font-semibold">Sí, puntuar</button>
                <button @click="confirmCompleteWithoutReview" class="px-4 py-2 bg-white/6 text-gray-200 rounded">No, sólo marcar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Rating Modal -->
      <RatingModal 
        :show="showRatingModal" 
        :item="ratingItemData"
        @close="showRatingModal = false"
        @success="handleRatingSuccess"
      />

      <section class="mt-8 bg-gradient-to-b from-gray-700 to-gray-600 bg-opacity-25 rounded-2xl p-6 shadow-inner">
        <h3 class="text-xl font-bold text-white mb-4">Puntuación de amigos</h3>

        <div v-if="friendRatingsLoading" class="text-gray-300">Cargando puntuaciones de amigos...</div>
        <div v-else-if="friendRatings.length === 0" class="text-gray-300">Tus amigos no han puntuado este ítem todavía.</div>

        <ul v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <li v-for="r in friendRatings" :key="r.id" class="flex items-start gap-4 p-4 rounded bg-gray-800/40">
            <!-- Avatar / initial -->
            <button @click="router.push({ name: 'profile', query: { userId: r.userId } })" class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" :style="{ backgroundColor: r.avatarColor || '#6B7280' }" aria-label="Ver perfil">
              {{ (r.name && String(r.name).charAt(0)) || '?' }}
            </button>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0">
                  <router-link :to="{ name: 'profile', query: { userId: r.userId } }" class="text-white font-semibold truncate no-underline">{{ r.name }}</router-link>
                  <span class="text-xs text-gray-400">· {{ r.lastModified ? new Date(r.lastModified).toLocaleString() : '' }}</span>
                </div>
                <div>
                  <div :class="['w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm', ratingClass(r.score)]" role="img" :aria-label="r.score != null ? `Puntuación ${r.score} de 10` : 'Sin puntuación'">
                    {{ (r.score != null && r.score !== '') ? (String(r.score) + '/10') : '—' }}
                  </div>
                </div>
              </div>
              <div v-if="r.comment" class="mt-2 text-gray-300 text-sm truncate">{{ r.comment }}</div>
            </div>
          </li>
        </ul>

        <div class="mt-4 flex justify-center">
          <button v-if="!friendRatingsLoading && friendRatings.length < friendRatingsTotal" @click="loadMoreFriendRatings" class="px-4 py-2 rounded bg-gray-600 text-white">Ver más</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getItemById, createItem } from '@/services/item'
import { getFriendsRatings } from '@/services/item'
import localRecommendations from '@/data/recommendations'
import { getUser } from '@/services/auth'
import { getMyRatings, addRating, addItemToUser, removeItemFromUser, getUserById } from '@/services/user'
import { success as notifySuccess, error as notifyError } from '@/services/notify'
import { useRouter } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import RatingModal from '@/components/RatingModal.vue'

const route = useRoute()
const id = String(route.params.id || '')

const item = ref<any>({})
const itemImage = ref('')
const userScore = ref<number>(9)
const userScoreRaw = ref<string>(String(userScore.value))
const userScoreError = ref<string>('')
const showReview = ref(false)
const showRatingModal = ref(false)
const userStatus = ref<string>('watching')
const userComment = ref<string>('')
const isSubmitting = ref(false)
const successMessage = ref('')
const router = useRouter()
const inWishlist = ref(false)
const wishlistSubId = ref<string | null>(null)
const wishlistLoading = ref(false)
const showCompletePrompt = ref(false)
const completeProcessing = ref(false)

// Computed property for rating modal data
const ratingItemData = computed(() => ({
  id: item.value._id || item.value.id,
  _id: item.value._id || item.value.id,
  title: item.value.title || '',
  image: itemImage.value || '',
  itemType: item.value.itemType || 'book',
  description: item.value.description || item.value.synopsis || '',
  externalId: item.value.externalId || '',
  originType: item.value.itemType || 'book',
  genres: item.value.genre ? String(item.value.genre).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
  author: item.value.author || '',
  pages: item.value.pages || '',
  language: item.value.language || ''
}))

function openRatingModal() {
  showRatingModal.value = true
}

function handleRatingSuccess() {
  // Reload friend ratings after successful rating
  loadFriendRatings(true)
  // Dispatch event to update other components
  try {
    window.dispatchEvent(new CustomEvent('ratingsChanged'))
  } catch (err) {
    // ignore
  }
}

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

// Puntuaciones de amigos (fetched)
  const friendRatings = ref<Array<any>>([])
const friendRatingsPage = ref(1)
const friendRatingsLimit = ref(8)
const friendRatingsTotal = ref(0)
const friendRatingsLoading = ref(false)

function ratingClass(score: number) {
  if (score == null || typeof score === 'undefined' || Number.isNaN(Number(score))) return 'bg-gray-500'
  if (score >= 9) return 'bg-emerald-600'
  if (score >= 7) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-rose-500'
}

async function loadFriendRatings(reset = false) {
  try {
    if (reset) {
      friendRatingsPage.value = 1
      friendRatings.value = []
    }
    friendRatingsLoading.value = true
    const page = friendRatingsPage.value
    const limit = friendRatingsLimit.value
    const res: any = await getFriendsRatings(id, page, limit)
    // res expected: { items, total, page, limit }
    const items = res && res.items ? res.items : []
    // map server items to UI-friendly objects
    const mapped = items.map((it: any) => {
      const user = it.user || it.userId || {}
      const uid = (user && (user._id || user.id)) || (it.user && it.user._id) || null
      const rawColor = (user && user.avatarBgColor) || null
      const avatarColor = rawColor && String(rawColor).startsWith('#') ? rawColor : '#6B7280'
      return {
        id: it._id || `${uid || ''}-${it.itemId || ''}`,
        userId: uid,
        name: (user && (user.name || user.handle)) || 'Usuario',
        avatarColor,
        score: typeof it.score !== 'undefined' && it.score !== null ? Number(it.score) : (it.rating != null ? Number(it.rating) : null),
        comment: it.comment || '',
        status: it.status || '',
        lastModified: it.lastModified || it.addedAt || null
      }
    })

    if (reset) friendRatings.value = mapped
    else friendRatings.value = friendRatings.value.concat(mapped)
    friendRatingsTotal.value = res && typeof res.total === 'number' ? res.total : (friendRatings.value.length)
  } catch (err) {
    // ignore errors silently for now
    console.error('Error cargando puntuaciones de amigos', err)
  } finally {
    friendRatingsLoading.value = false
  }
}

function loadMoreFriendRatings() {
  friendRatingsPage.value += 1
  loadFriendRatings(false)
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

function mapTypeToLabel(raw: string) {
  if (!raw) return ''
  const low = String(raw).toLowerCase()
  if (low.includes('book') || low.includes('lib')) return 'Libro'
  if (low.includes('film') || low.includes('movie') || low.includes('pel') || low.includes('cine')) return 'Película'
  if (low.includes('serie') || low.includes('tv') || low.includes('show')) return 'Serie'
  if (low.includes('game') || low.includes('juego') || low.includes('video')) return 'Videojuego'
  if (low.includes('manga') || low.includes('comic') || low.includes('cómic')) return 'Cómic/Manga'
  return 'Otro'
}

const itemTypeLabel = ref<string>('')

// reactively update itemTypeLabel when item changes
watch(item, (val) => {
  try {
    const raw = (val && (val.itemType || (val.data && val.data.type))) || ''
    itemTypeLabel.value = mapTypeToLabel(raw)
  } catch (e) {
    itemTypeLabel.value = ''
  }
}, { immediate: true, deep: true })

// Small sanitizer to remove scripts, style tags and event attributes.
function sanitizeHtml(html: string) {
  if (!html) return ''
  try {
    const div = document.createElement('div')
    div.innerHTML = html
    // remove scripts and styles
    const bad = div.querySelectorAll('script,style')
    bad.forEach(n => n.remove())
    // remove on* attributes and javascript: hrefs
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_ELEMENT, null)
    const nodes: Element[] = []
    while (walker.nextNode()) nodes.push(walker.currentNode as Element)
    nodes.forEach((el) => {
      for (const a of Array.from(el.attributes)) {
        const name = String(a.name || '').toLowerCase()
        const val = String(a.value || '')
        if (name.startsWith('on')) el.removeAttribute(a.name)
        if (name === 'href' && val.trim().toLowerCase().startsWith('javascript:')) el.removeAttribute(a.name)
        if (name === 'style') el.removeAttribute(a.name)
      }
    })
    return div.innerHTML
  } catch (e) {
    return ''
  }
}

const isBook = computed(() => {
  try {
    const raw = (item.value && (item.value.itemType || (item.value.data && item.value.data.type))) || ''
    const low = String(raw).toLowerCase()
    return low.includes('book') || low.includes('lib')
  } catch (e) { return false }
})

const sanitizedDescription = computed(() => {
  const raw = (item.value && (item.value.description || item.value.synopsis)) || ''
  if (!isBook.value) return ''
  const s = sanitizeHtml(String(raw))
  return s && s.length ? s : '<i>Sin descripción disponible.</i>'
})

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
      // if route requests to open the review form, open the modal instead
      if (route.query && (route.query.openReview === '1' || route.query.openReview === 'true' || route.query.openReview === '')) {
        showRatingModal.value = true
      }
      // prefill user's rating now that item is available
      await tryPrefillForItem()
        // check if item is in my wishlist
        await checkWishlist()
      // load first page of friend ratings
      await loadFriendRatings(true)
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

    // If the user set the status to "watching" and the item is in their wishlist,
    // remove it from the wishlist so it no longer appears there.
    try {
      if (userStatus.value === 'watching' && inWishlist.value) {
        // wishlistSubId holds the user's item-subdocument id if present
        if (wishlistSubId.value) {
          await removeItemFromUser(user._id, wishlistSubId.value)
          // refresh local wishlist state
          await checkWishlist()
        } else {
          // fallback: attempt to refresh wishlist state anyway
          await checkWishlist()
        }
      }
    } catch (err) {
      // don't block the main flow if wishlist removal fails; just log
      console.error('Error removing item from wishlist after setting to watching', err)
    }

    // Update local UI: close form and show success
    successMessage.value = 'Puntuación enviada correctamente'
    showReview.value = false
    // clear comment optionally
    // userComment.value = ''
    try { notifySuccess('Puntuación enviada correctamente') } catch (err) {}
  } catch (e) {
    console.error('Error al enviar puntuación', e)
    successMessage.value = 'Error al enviar la puntuación'
    try { notifyError('No se ha podido enviar la puntuación. Intenta de nuevo.') } catch (err) {}
  } finally {
    isSubmitting.value = false
  }
}

async function checkWishlist() {
  try {
    const user = getUser()
    if (!user || !user._id) {
      inWishlist.value = false
      wishlistSubId.value = null
      return
    }
    const me: any = await getUserById(user._id)
    const itemsArr = me && me.items ? me.items : []
    // detect by comparing itemId._id or externalId
    const rawId = item.value && (item.value._id || item.value.id || id)
    const found = itemsArr.find((it: any) => {
      const iid = (it.itemId && (it.itemId._id || it.itemId.id)) || null
      if (iid && rawId && String(iid) === String(rawId)) return true
      if (it.externalId && rawId && String(it.externalId) === String(rawId)) return true
      return false
    })
    if (found) {
      inWishlist.value = true
      wishlistSubId.value = found._id || null
    } else {
      inWishlist.value = false
      wishlistSubId.value = null
    }
  } catch (err) {
    inWishlist.value = false
    wishlistSubId.value = null
  }
}

async function toggleWishlist() {
  const user = getUser()
  if (!user || !user._id) {
    router.push('/login')
    return
  }
  wishlistLoading.value = true
  try {
    if (!inWishlist.value) {
      // ensure item exists in DB
      let dbItemId = item.value._id || item.value.id || null
      if (dbItemId) {
        try {
          const existing = await getItemById(String(dbItemId))
          if (existing && existing._id) dbItemId = existing._id
          else dbItemId = null
        } catch (e) {
          dbItemId = null
        }
      }

      if (!dbItemId) {
        try {
          const payloadCreate = {
            title: item.value.title || item.value.title,
            itemType: item.value.itemType || 'book',
            data: {
              title: item.value.title || '',
              description: item.value.description || item.value.synopsis || '',
              cover: itemImage.value || '',
              genres: item.value.genre ? String(item.value.genre).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
              author: item.value.author || '',
              pages: item.value.pages || '',
              language: item.value.language || ''
            }
          }
          const created: any = await createItem(payloadCreate)
          dbItemId = created && (created._id || created.id)
        } catch (err) {
          console.error('Error creando item para wishlist', err)
        }
      }

      const payload: any = {
        itemId: dbItemId,
        itemType: item.value.itemType || 'book',
        title: item.value.title || ''
      }
      await addItemToUser(user._id, payload)
      // refresh local state
      await checkWishlist()
      try { notifySuccess('Añadido a tu lista') } catch (err) {}
    } else {
      // remove
      if (wishlistSubId.value) {
        await removeItemFromUser(user._id, wishlistSubId.value)
        await checkWishlist()
        try { notifySuccess('Eliminado de tu lista') } catch (err) {}
      }
    }
  } catch (err) {
    console.error('Error toggling wishlist', err)
    try { notifyError('No se pudo actualizar tu lista. Intenta de nuevo.') } catch (err) {}
  } finally {
    wishlistLoading.value = false
  }
}

async function ensureDbItem() {
  let dbItemId = item.value._id || item.value.id || null

  if (dbItemId) {
    try {
      const existing = await getItemById(String(dbItemId))
      if (existing && existing._id) dbItemId = existing._id
      else dbItemId = null
    } catch (e) {
      dbItemId = null
    }
  }

  if (!dbItemId) {
    try {
      const payloadCreate = {
        title: item.value.title || item.value.title,
        itemType: item.value.itemType || 'book',
        data: {
          title: item.value.title || '',
          description: item.value.description || item.value.synopsis || '',
          cover: itemImage.value || '',
          genres: item.value.genre ? String(item.value.genre).split(',').map((s: string) => s.trim()).filter(Boolean) : [],
          author: item.value.author || '',
          pages: item.value.pages || '',
          language: item.value.language || ''
        }
      }
      const created: any = await createItem(payloadCreate)
      dbItemId = created && (created._id || created.id)
    } catch (err) {
      console.error('Error creando item en servidor', err)
    }
  }

  return dbItemId
}

function markAsCompleted() {
  const user = getUser()
  if (!user || !user._id) {
    router.push('/login')
    return
  }
  // show inline prompt offering to rate or just mark as completed
  showCompletePrompt.value = true
}

async function confirmCompleteWithReview() {
  // open the rating modal instead of the inline form
  showCompletePrompt.value = false
  showRatingModal.value = true
}

async function confirmCompleteWithoutReview() {
  const user = getUser()
  if (!user || !user._id) {
    router.push('/login')
    return
  }
  completeProcessing.value = true
  try {
    const dbItemId = await ensureDbItem()
    const payload: any = {
      itemId: dbItemId,
      itemType: item.value.itemType || 'book',
      status: 'completed'
    }
    await addRating(user._id, payload)
    try { window.dispatchEvent(new CustomEvent('ratingsChanged')) } catch (e) {}
    try { notifySuccess('Marcado como terminado') } catch (err) {}
  } catch (err) {
    console.error('Error marking completed without review', err)
    try { notifyError('No se pudo marcar como terminado. Intenta de nuevo.') } catch (err) {}
  } finally {
    completeProcessing.value = false
    showCompletePrompt.value = false
  }
}
</script>

<style scoped>
/* estilos adicionales si se desean */
</style>
