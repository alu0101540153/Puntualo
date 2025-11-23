<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <!-- Reuse the dashboard header for consistency -->
    <DashboardHeader />

    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">Buscar</h2>
          <p class="text-gray-300">Busca películas, libros o series. Selecciona el tipo y usa la paginación.</p>

        <div class="grid gap-4">
            <div class="flex flex-col md:flex-row gap-4 items-stretch">
            <Input v-model="query" :placeholder="selectedType === 'friends' ? 'Introduce un username...' : 'Introduce un título...'" class="flex-1" />
              <button
                @click="selectType('movies')"
                :class="buttonClass('movies')"
              >🎬 Películas</button>

              <button
                @click="selectType('books')"
                :class="buttonClass('books')"
              >📖 Libros</button>

              <button
                @click="selectType('series')"
                :class="buttonClass('series')"
              >📺 Series</button>
 
              <button
                @click="selectType('friends')"
                :class="buttonClass('friends')"
              >👥 Amigos</button>
            </div>
          </div>

          <!-- separar más visualmente las opciones de los botones -->
          <div class="flex gap-3 mt-4">
            <button @click="onSearch" class="flex-1 bg-green-500 text-black py-3 rounded-full font-bold transition transform hover:-translate-y-1 hover:scale-105">Buscar</button>
            <button @click="clear" class="flex-1 bg-gray-700 text-white py-3 rounded-full transition transform hover:-translate-y-1 hover:scale-105">Limpiar</button>
          </div>

          <div v-if="loading" class="text-gray-300">Buscando...</div>

          <div v-if="!loading && searched" class="text-gray-300">
            <div v-if="errorMsg">{{ errorMsg }}</div>
            <div v-else-if="results.length === 0">No se han encontrado resultados.</div>
          </div>

          <!-- Use RecommendationsGrid to display mapped results -->
          <RecommendationsGrid v-if="recommendationsList.length" :recommendations="recommendationsList" :gridClass="gridClass" />

          <!-- Friends list: simple list with add button -->
          <div v-if="selectedType === 'friends' && results.length" class="bg-gray-800 rounded p-4">
            <ul class="space-y-3">
              <li v-for="(u, idx) in results" :key="u._id" class="py-0">
                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-900/40">
                  <div>
                    <div class="text-white font-semibold">{{ u.name }}</div>
                  </div>
                  <div>
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
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import RecommendationsGrid from '@/components/dashboard/RecommendationsGrid.vue'
import { searchBooks, searchMovies, searchSeries, searchFriends } from '@/services/search'
import { followUser } from '@/services/user'
import { getUser } from '@/services/auth'

import type { Recommendation } from '@/components/dashboard/types'

const query = ref('')
const selectedType = ref<'movies' | 'books' | 'series' | 'friends'>('movies')
const loading = ref(false)
const results = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const searched = ref(false)
const errorMsg = ref('')

const route = useRoute()

function selectType(t: 'movies' | 'books' | 'series' | 'friends') {
  selectedType.value = t
  page.value = 1
  results.value = []
  total.value = 0
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
  // Allow empty query when searching friends (we want to list all users)
  if (selectedType.value !== 'friends' && !query.value.trim()) return
  loading.value = true
  searched.value = true
  try {
    let res: any = null
    if (selectedType.value === 'books') {
      res = await searchBooks(query.value, page.value)
    } else if (selectedType.value === 'movies') {
      res = await searchMovies(query.value, page.value)
    } else if (selectedType.value === 'series') {
      res = await searchSeries(query.value, page.value)
    } else if (selectedType.value === 'friends') {
      res = await searchFriends(query.value, page.value)
    }

    // dedupe results by handle (username) to avoid showing duplicate usernames
    const items = res.items || []
    const seen = new Set<string>()
    const deduped: any[] = []
    for (const it of items) {
      const h = (it.handle || '').toLowerCase()
      if (h) {
        if (!seen.has(h)) {
          seen.add(h)
          deduped.push(it)
        }
      } else {
        // fallback to dedupe by _id if no handle
        const idStr = String(it._id)
        if (!seen.has(idStr)) {
          seen.add(idStr)
          deduped.push(it)
        }
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
  const t = (route.query.type as string) || ''
  if (t === 'friends') {
    selectType('friends')
    // perform a search immediately (allow empty query)
    onSearch()
  }
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
  } catch (err) {
    console.error('Follow error', err)
  }
}

function buttonClass(type: 'movies' | 'books' | 'series' | 'friends') {
  const base = 'px-4 py-2 rounded-full font-semibold transition transform hover:-translate-y-1 hover:scale-105'
  return [
    base,
    selectedType.value === type ? 'bg-white text-black shadow-lg' : 'bg-black/60 text-white hover:bg-black/50'
  ].join(' ')
}
</script>

<style scoped>
/* Ensure Card centers and responsive spacing is preserved by utility classes. */
</style>
