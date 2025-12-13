<template>
  <div class="min-h-screen bg-gradient-dark">
    <!-- Reuse the dashboard header for consistency -->
    <DashboardHeader />

    <main class="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div class="w-full bg-gradient-to-br from-dark-900/80 to-black/80 text-white rounded-2xl p-6 md:p-8 shadow-cinema backdrop-blur-md border border-primary-500/20 hover:border-primary-500/30 transition-all">
        <div class="mb-6">
          <h2 class="text-2xl sm:text-3xl font-bold text-white mb-2">Buscar</h2>
          <p class="text-sm sm:text-base text-gray-300 mb-6">Busca películas, libros, series o amigos</p>

        <div class="space-y-5">
          <!-- Input con diseño mejorado -->
          <div class="w-full">
            <Input v-model="query" @keyup.enter="onSearch" :placeholder="selectedType === 'friends' ? 'Introduce un username...' : 'Introduce un título...'" class="w-full min-w-0" />
          </div>

          <!-- Selection buttons en grid 2x2 para móvil, flex horizontal en web -->
          <div class="relative">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
              <div class="grid grid-cols-2 sm:flex gap-3">
                <button @click="selectType('movies')" :class="buttonClass('movies')">🎬 Películas</button>
                <button @click="selectType('books')" :class="buttonClass('books')">📖 Libros</button>
                <button @click="selectType('series')" :class="buttonClass('series')">📺 Series</button>
                <button @click="selectType('friends')" :class="buttonClass('friends')">👥 Amigos</button>
              </div>
              <button ref="filtersButton" @click="toggleFilters" class="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-700/80 text-white hover:bg-slate-600 transition-all font-medium shadow-md">Filtros avanzados</button>
            </div>

            <!-- Inline filter panel mejorado -->
            <div v-if="showFilters" ref="filtersPanel" class="mt-4 z-50 w-full p-5 rounded-xl shadow-xl border border-primary-500/20 bg-dark-800/95 backdrop-blur-sm transition-all duration-200">
              <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <label class="text-gray-200 font-medium">Género:</label>
                <select v-model="genre" class="rounded-lg px-4 py-2.5 bg-slate-700/80 text-white flex-1 sm:flex-initial sm:w-56 border border-slate-600 focus:border-primary-500 transition">
                  <option value="">-- Selecciona --</option>
                  <option value="action">Acción</option>
                  <option value="drama">Drama</option>
                  <option value="comedy">Comedia</option>
                  <option value="sci-fi">Ciencia ficción</option>
                  <option value="thriller">Thriller</option>
                  <option value="romance">Romance</option>
                  <option value="animation">Animación</option>
                  <option value="documentary">Documental</option>
                </select>

                <div class="flex gap-3 sm:ml-auto">
                  <button @click="applyFilters" class="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-black font-semibold hover:brightness-110 shadow-md transition-all">Aplicar</button>
                  <button @click="resetFilters" class="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-slate-700/80 text-white font-semibold hover:bg-slate-600 shadow-md transition-all">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- Botones de acción mejorados -->
          <div class="flex flex-col sm:flex-row gap-3 mt-6">
            <Button @click="onSearch" class="flex-1 !py-3 !text-base !font-bold" size="lg">Buscar</Button>
            <Button @click="clear" class="flex-1 !py-3 !text-base !font-bold" size="lg" variant="secondary">Limpiar</Button>
          </div>

          <!-- (filters are shown via the floating panel when 'Filtros' is pressed) -->

          <div v-if="loading" class="text-gray-300">Buscando...</div>

          <div v-if="!loading && searched" class="text-gray-300">
            <div v-if="errorMsg">{{ errorMsg }}</div>
            <div v-else-if="results.length === 0">No se han encontrado resultados.</div>
          </div>

          <!-- Search Results Grid with rating modal -->
          <div v-if="recommendationsList.length" class="mt-6">
            <div :class="gridClass">
              <SearchResultCard 
                v-for="recommendation in recommendationsList"
                :key="recommendation.id"
                :recommendation="recommendation"
              />
            </div>
          </div>

          <!-- Friends list: simple list with add button -->
          <div v-if="selectedType === 'friends' && results.length" class="bg-slate-800/60 rounded p-6 mt-6 border border-slate-700">
            <ul class="space-y-4">
              <li v-for="(u, idx) in results" :key="u._id" class="py-0">
                <div class="flex items-center justify-between p-4 rounded-md bg-slate-900/80 border border-slate-700 shadow-sm">
                  <div class="flex items-center gap-4">
                    <div class="flex flex-col">
                      <div class="text-white font-bold text-lg">{{ u.name || u.handle || 'Sin nombre' }}</div>
                      <div class="text-gray-300 text-sm truncate">@{{ u.handle }}</div>
                    </div>
                  </div>
                  <div class="flex items-center">
                    <!-- View profile button -->
                    <button @click="viewProfile(u._id)" class="w-10 h-10 mr-2 flex items-center justify-center rounded-full bg-white/6 text-white" title="Ver perfil">
                      <!-- eye icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    </button>

                    <div v-if="String(u._id) === String(me?._id || me?.id)" class="w-10 h-10"></div>
                    <button v-else-if="following.includes(String(u._id)) || u.__followed" disabled class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 text-white">
                      <!-- check mark -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                      </svg>
                    </button>
                    <button v-else @click="handleFollow(u._id, idx)" class="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110 shadow-glow transition-all">
                      <!-- user-plus icon -->
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <div v-if="totalPages > 1" class="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 bg-dark-800/40 backdrop-blur-sm rounded-xl p-5 border border-primary-500/20">
            <div class="text-sm sm:text-base text-gray-300 font-medium order-1 sm:order-2">Página {{ page }} de {{ totalPages }}</div>
            <div class="flex items-center gap-3 order-2 sm:order-1">
              <button @click="prevPage" :disabled="page === 1" class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-black font-semibold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md text-sm">Anterior</button>
              <button @click="nextPage" :disabled="page === totalPages" class="px-5 py-2.5 rounded-lg bg-gradient-to-r from-primary-500 to-accent-500 text-black font-semibold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md text-sm">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Input from '@/components/Input.vue'
import SearchResultCard from '@/components/dashboard/SearchResultCard.vue'
import Button from '@/components/Button.vue'
import { searchBooks, searchMovies, searchSeries, searchFriends } from '@/services/search'
import { followUser } from '@/services/user'
import { getUser } from '@/services/auth'
import { success as notifySuccess, error as notifyError } from '@/services/notify'

import type { Recommendation } from '@/components/dashboard/types'

const query = ref('')
const selectedType = ref<'movies' | 'books' | 'series' | 'friends'>('movies')
const sortBy = ref<'relevance'|'rating'|'year'>('relevance')
const sortOrder = ref<'desc'|'asc'>('desc')
const filterYear = ref<number | null>(null)
const genre = ref<string | null>(null)
const showFilters = ref(false)
const loading = ref(false)
const results = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const searched = ref(false)
const errorMsg = ref('')

const route = useRoute()
const router = useRouter()

// Helper: sincroniza los parámetros de búsqueda en la URL
function updateRouteParams(replace = true) {
  const q: Record<string, string> = {}
  if (query.value && String(query.value).trim() !== '') q.q = String(query.value)
  if (selectedType.value) q.type = String(selectedType.value)
  if (page.value && page.value > 1) q.page = String(page.value)
  if (genre.value) q.genre = String(genre.value)
  if (sortBy.value) q.sortBy = String(sortBy.value)
  if (sortOrder.value) q.order = String(sortOrder.value)

  try {
    if (replace) router.replace({ query: q })
    else router.push({ query: q })
  } catch (e) {
    // fallback
    router.replace({ query: q })
  }
}

function selectType(t: 'movies' | 'books' | 'series' | 'friends') {
  selectedType.value = t
  page.value = 1
  results.value = []
  total.value = 0
  // reflejar en la URL
  updateRouteParams(true)
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function applyFilters() {
  page.value = 1
  showFilters.value = false
  // apply filters and update url
  updateRouteParams(true)
  onSearch()
}

function resetFilters() {
  sortBy.value = 'relevance'
  sortOrder.value = 'desc'
  filterYear.value = null
}

const filtersPanel = ref<HTMLElement | null>(null)
const filtersButton = ref<HTMLElement | null>(null)
function handleDocClick(e: MouseEvent) {
  if (!showFilters.value) return
  const target = e.target as Node
  if (filtersPanel.value && filtersButton.value) {
    if (!filtersPanel.value.contains(target) && !filtersButton.value.contains(target)) {
      showFilters.value = false
    }
  }
}

function clear() {
  query.value = ''
  results.value = []
  total.value = 0
  page.value = 1
  searched.value = false
  // limpiar query en URL pero mantener el tipo seleccionado
  updateRouteParams(true)
}

const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const gridClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'

async function onSearch() {
  // Allow empty query for all types so an empty search returns everything
  // (server will ignore empty title param; client buildQuery strips it)
  loading.value = true
  searched.value = true
    try {
    let res: any = null
    const opts: any = { sortBy: sortBy.value, order: sortOrder.value, year: filterYear.value, genre: genre.value }
    if (selectedType.value === 'books') {
      res = await searchBooks(query.value, page.value, opts)
    } else if (selectedType.value === 'movies') {
      res = await searchMovies(query.value, page.value, opts)
    } else if (selectedType.value === 'series') {
      res = await searchSeries(query.value, page.value, opts)
    } else if (selectedType.value === 'friends') {
      // friends search supports ordering but not year
      res = await searchFriends(query.value, page.value, { sortBy: opts.sortBy, order: opts.order })
    }

    // dedupe results: prefer handle (users), then try several id fields ("_id", "id", "externalId")
    const items = res.items || []
    const seen = new Set<string>()
    const deduped: any[] = []
    for (const it of items) {
      const handle = (it && (it.handle || it.name || '')).toString().toLowerCase()
      if (handle) {
        if (!seen.has(handle)) {
          seen.add(handle)
          deduped.push(it)
        }
        continue
      }

      // try multiple id-like fields to dedupe generic items (movies/books/series)
      const idCandidate = String(it && (it._id ?? it.id ?? it.externalId ?? ''))
      if (!seen.has(idCandidate)) {
        seen.add(idCandidate)
        deduped.push(it)
      }
    }
    // mark entries that are already followed so UI shows the tick
    try {
      const followedSet = new Set((following.value || []).map((id: string) => String(id)))
      for (const it of deduped) {
        if (it && it._id && followedSet.has(String(it._id))) {
          it.__followed = true
        } else {
          it.__followed = false
        }
      }
    } catch (e) {
      // ignore marking errors
    }
    results.value = deduped
    total.value = res.total || results.value.length

    // Si buscamos amigos con nombre concreto y no hay resultados -> mensaje específico
    if (selectedType.value === 'friends' && query.value.trim()) {
      if (!results.value || results.value.length === 0) {
        errorMsg.value = 'No existe el usuario.'
      } else {
        errorMsg.value = ''
      }
    } else {
      // limpiar mensaje para otras búsquedas o búsqueda vacía
      errorMsg.value = ''
    }
  } catch (e: any) {
    console.error('Search error', e)
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
      // actualizar URL con los parámetros actuales después de la búsqueda
      updateRouteParams(true)
  }
}

// If navigated with ?type=friends, preselect and auto-search
onMounted(() => {
  document.addEventListener('click', handleDocClick)
  // Leer parámetros de la URL para inicializar la búsqueda
  const t = (route.query.type as string) || ''
  const qParam = (route.query.q as string) || (route.query.query as string) || ''
  const pageParam = parseInt((route.query.page as string) || '1', 10) || 1
  const genreParam = (route.query.genre as string) || ''
  const sortByParam = (route.query.sortBy as string) || ''
  const orderParam = (route.query.order as string) || ''

  if (t && ['movies', 'books', 'series', 'friends'].includes(t)) {
    selectedType.value = t as any
  }
  if (qParam) query.value = qParam
  if (pageParam && pageParam > 1) page.value = pageParam
  if (genreParam) genre.value = genreParam
  if (sortByParam) sortBy.value = sortByParam as any
  if (orderParam) sortOrder.value = orderParam as any

  // perform a search automatically if any param exists or if type is friends
  const shouldAuto = Boolean(t || qParam || route.query.page || route.query.genre || route.query.sortBy || route.query.order)
  if (shouldAuto) {
    onSearch()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
})

function prevPage() {
  if (page.value > 1) {
    page.value--
    // actualizar url y volver a buscar
    updateRouteParams(true)
    onSearch()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
    updateRouteParams(true)
    onSearch()
  }
}

// Map API items into Recommendation[] expected by RecommendationsGrid
const recommendationsList = computed<Recommendation[]>(() => {
  if (selectedType.value === 'friends') return []
  return results.value.map((r: any, idx: number) => ({
    id: String(r.id || idx),
    title: r.title || r.name || 'Sin título',
    description: r.overview || r.description || '',
    image: r.thumbnail || r.cover || '',
    mediaType: selectedType.value === 'movies' ? '🎬' : selectedType.value === 'books' ? '📖' : '📺',
    genres: r.genres || r.categories || [],
    ageRating: r.ageRating || '',
    externalId: String(r.id || idx),
    originType: (selectedType.value === 'movies' || selectedType.value === 'books' || selectedType.value === 'series') ? selectedType.value : 'movies'
  }))
})

// Helpers for friends UI
const me = getUser()
const following = ref<string[]>((me && me.follows) ? Array.from(new Set(me.follows.map((s: any) => String(s)))) : [])

async function handleFollow(targetId: string, index: number) {
  try {
    await followUser(targetId)
    // ensure following is unique
    following.value = Array.from(new Set([...(following.value || []), String(targetId)]))
    // mark all results with same handle or id as followed
    const followedHandle = results.value[index] && results.value[index].handle
    for (let i = 0; i < results.value.length; i++) {
      const r = results.value[i]
      if (!r) continue
      if (String(r._id) === String(targetId) || (followedHandle && String((r.handle || '')).toLowerCase() === String(followedHandle).toLowerCase())) {
        results.value[i].__followed = true
      }
    }
    // persist follows in localStorage.user so tick remains after navigation/reload
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (!Array.isArray(user.follows)) user.follows = []
        if (!user.follows.includes(targetId)) {
          user.follows.push(String(targetId))
          // ensure uniqueness
          user.follows = Array.from(new Set(user.follows.map((id: any) => String(id))))
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }
    // notify success to give feedback to user
    try {
      const name = results.value[index] && (results.value[index].name || results.value[index].handle || 'usuario')
      notifySuccess(`Has seguido a ${name}`)
    } catch (e) {
      // ignore notification errors
    }
  } catch (err) {
    console.error('Follow error', err)
    notifyError('No se pudo seguir al usuario. Intenta de nuevo.')
  }
}

function viewProfile(userId: string) {
  // navigate to public profile view with query param userId
  try {
    router.push({ path: '/profile', query: { userId: String(userId) } })
  } catch (e) {
    // fallback: direct path
    router.push(`/profile?userId=${encodeURIComponent(String(userId))}`)
  }
}

function buttonClass(type: 'movies' | 'books' | 'series' | 'friends') {
  const base = 'px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md text-sm sm:text-base shrink-0 whitespace-nowrap'
  return [
    base,
    selectedType.value === type 
      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110 shadow-glow' 
      : 'bg-slate-700/80 text-gray-200 hover:bg-slate-600 border border-slate-600'
  ].join(' ')
}
</script>

<style scoped>
/* Ensure Card centers and responsive spacing is preserved by utility classes. */
</style>
