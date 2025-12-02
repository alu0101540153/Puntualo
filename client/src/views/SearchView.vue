<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <!-- Reuse the dashboard header for consistency -->
    <DashboardHeader />

    <main class="max-w-screen-2xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">Buscar</h2>
          <p class="text-gray-300 mb-6">Busca películas, libros, series o amigos. Selecciona el tipo y usa la paginación.</p>

        <div class="grid gap-4">
          <!-- Input on its own row so it has breathing room -->
          <div class="w-full">
            <Input v-model="query" @keyup.enter="onSearch" :placeholder="selectedType === 'friends' ? 'Introduce un username...' : 'Introduce un título...'" class="w-full min-w-0" />
          </div>

          <!-- Selection buttons grouped on the next row, wrap when needed -->
          <div class="relative">
            <div class="flex flex-wrap gap-4 items-center">
              <button @click="selectType('movies')" :class="buttonClass('movies')">🎬 Películas</button>
              <button @click="selectType('books')" :class="buttonClass('books')">📖 Libros</button>
              <button @click="selectType('series')" :class="buttonClass('series')">📺 Series</button>
              <button @click="selectType('friends')" :class="buttonClass('friends')">👥 Amigos</button>
              <button ref="filtersButton" @click="toggleFilters" class="ml-2 px-3 py-2 rounded-full bg-slate-700 text-white hover:bg-slate-600 transition">Filtros</button>
            </div>

            <!-- Inline filter panel: appears below the type buttons and above the Buscar area (in-flow, pushes content) -->
            <div v-if="showFilters" ref="filtersPanel" class="mt-4 z-50 w-full max-w-[760px] p-6 mx-auto rounded-xl shadow-2xl border border-slate-700 bg-slate-900/90 transition-all duration-200">
              <div class="flex items-center gap-4">
                <label class="text-gray-200 mr-2">Género:</label>
                <select v-model="genre" class="rounded px-3 py-2 bg-slate-800 text-white w-56">
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

                <div class="ml-auto flex gap-2">
                  <button @click="applyFilters" class="px-4 py-2 rounded bg-green-500 text-black font-semibold">Aplicar</button>
                  <button @click="resetFilters" class="px-4 py-2 rounded bg-transparent border border-slate-600 text-gray-200">Reset</button>
                </div>
              </div>
            </div>
          </div>
        </div>

          <!-- acciones principales: apilar en móvil, alinear en desktop -->
          <div class="flex flex-col md:flex-row gap-4 mt-8">
            <Button @click="onSearch" class="flex-1" size="lg">{{ 'Buscar' }}</Button>
            <Button @click="clear" class="flex-1" size="lg" variant="secondary">Limpiar</Button>
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
                    <button v-else @click="handleFollow(u._id, idx)" class="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-black">
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

          <div v-if="totalPages > 1" class="flex items-center justify-center gap-3 mt-4">
            <button @click="prevPage" :disabled="page === 1" class="px-4 py-2 rounded bg-gray-700 text-white transition hover:bg-gray-600">Anterior</button>
            <div class="text-gray-300">Página {{ page }} de {{ totalPages }}</div>
            <button @click="nextPage" :disabled="page === totalPages" class="px-4 py-2 rounded bg-gray-700 text-white transition hover:bg-gray-600">Siguiente</button>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Card from '@/components/Card.vue'
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

function selectType(t: 'movies' | 'books' | 'series' | 'friends') {
  selectedType.value = t
  page.value = 1
  results.value = []
  total.value = 0
}

function toggleFilters() {
  showFilters.value = !showFilters.value
}

function applyFilters() {
  page.value = 1
  showFilters.value = false
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
}

const pageSize = 10
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))

const gridClass = 'grid grid-cols-1 lg:grid-cols-2 gap-6'

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
  }
}

// If navigated with ?type=friends, preselect and auto-search
onMounted(() => {
  document.addEventListener('click', handleDocClick)
  const t = (route.query.type as string) || ''
  if (t === 'friends') {
    selectType('friends')
    // perform a search immediately (allow empty query)
    onSearch()
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleDocClick)
})

function prevPage() {
  if (page.value > 1) {
    page.value--
    onSearch()
  }
}

function nextPage() {
  if (page.value < totalPages.value) {
    page.value++
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
  // ensure buttons don't shrink awkwardly and keep their text on a single line
  const base = 'px-4 py-2 rounded-full font-semibold transition transform hover:-translate-y-1 hover:scale-105 shrink-0 whitespace-nowrap'
  return [
    base,
    selectedType.value === type ? 'bg-white text-black shadow-lg' : 'bg-black/60 text-white hover:bg-black/50'
  ].join(' ')
}
</script>

<style scoped>
/* Ensure Card centers and responsive spacing is preserved by utility classes. */
</style>
