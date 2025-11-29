<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    <main class="max-w-5xl mx-auto px-4 py-8 mt-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-white">Puntuados de {{ userName }}</h2>

        <div class="flex items-center gap-3">
          <label class="text-sm text-gray-300">Ordenar:</label>
          <select v-model="sortOption" @change="onSortChange" class="bg-gray-800 text-white text-sm px-3 py-1 rounded">
            <option value="date:desc">Más reciente</option>
            <option value="date:asc">Más antiguo</option>
            <option value="score:asc">Puntuación: más baja</option>
            <option value="score:desc">Puntuación: más alta</option>
          </select>
        </div>
      </div>

      <!-- Filters: Tipo -->
      <div class="flex items-center gap-2 mb-6">
        <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'all' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'all'">Todos</button>
        <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'movie' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'movie'">🎬 Película</button>
        <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'series' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'series'">📺 Serie</button>
        <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'book' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'book'">📖 Libro</button>
      </div>

  <div v-if="loading" class="text-gray-300">Cargando puntuados...</div>

      <div class="space-y-6">
        <div v-for="r in displayedRatings" :key="r._id || r.itemId" class="relative bg-gradient-to-b from-gray-800 to-gray-700 bg-opacity-40 rounded-2xl p-6 flex gap-6 items-start justify-between">
          <div class="w-36 flex-shrink-0">
            <img :src="getImage(r)" alt="poster" class="w-full h-56 object-cover rounded-lg shadow-lg" />
          </div>

          <div class="flex-1 min-w-0 pr-52">
            <div class="flex items-start justify-start">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" :style="{ backgroundColor: (user && user.avatarBgColor) || '#ec4899' }">{{ userInitial }}</div>
                <div>
                  <div class="text-white font-semibold">{{ userName }}</div>
                  <div class="text-sm text-gray-300">{{ formatTimeAgo(r.lastModified || r._id) }}</div>
                </div>
              </div>
            </div>

            <div class="mt-6">
              <p class="text-gray-300">ha puntuado <span class="text-white font-semibold">{{ getTitle(r) }}</span></p>
            </div>

            <div v-if="getDescription(r)" class="mt-4 bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 rounded-lg p-4 text-gray-100 italic leading-relaxed shadow-md">"{{ getDescription(r) }}"</div>

            <div class="mt-6 text-sm text-gray-300">{{ getGenres(r) }}</div>
          </div>

          <div class="absolute top-4 right-6 z-10">
            <div class="flex flex-row gap-3">
              <button @click="goToDetail(r)" class="text-sm text-white bg-white/6 px-3 py-1 rounded">Ver detalle</button>
            </div>
          </div>

          <div class="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center z-10">
            <div :class="['w-24 h-24 rounded-full flex items-center justify-center text-2xl font-extrabold text-white', displayClass(r)]">{{ displayScore(r) }}</div>
            <div class="mt-3 text-sm text-gray-300 text-center">{{ displayScoreLabel(r) }}</div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getUserById } from '@/services/user'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = ref<any | null>(null)
const ratings = ref<any[]>([])
const loading = ref(true)
const sortOption = ref<string>('date:desc')

// Filter state
const selectedType = ref<'all' | 'movie' | 'series' | 'book'>('all')

const userName = ref('')
const userInitial = ref('U')

function detectType(r: any): 'movie' | 'series' | 'book' {
  const type = r.itemId?.itemType || r.itemType || r.itemId?.data?.type
  if (type === 'movie') return 'movie'
  if (type === 'series') return 'series'
  return 'book'
}

const displayedRatings = computed(() => {
  if (selectedType.value === 'all') return ratings.value
  return ratings.value.filter(r => detectType(r) === selectedType.value)
})

async function loadRatings() {
  loading.value = true
  const id = String(route.params.id || '')
  if (!id) { ratings.value = []; loading.value = false; return }
  try {
    user.value = await getUserById(id)
    userName.value = (user.value && (user.value.name || user.value.handle)) || 'Usuario'
    userInitial.value = userName.value ? String(userName.value[0]).toUpperCase() : 'U'
    const arr = Array.isArray(user.value?.ratedItems) ? user.value.ratedItems.slice() : []

    // client-side sorting based on sortOption
    const [sortBy, order] = (sortOption.value || 'date:desc').split(':') as [any, any]
    if (sortBy === 'score') {
      arr.sort((a: any, b: any) => (Number(a.score) || 0) - (Number(b.score) || 0))
      if (order === 'desc') arr.reverse()
    } else {
      // date sort: use lastModified or _id as fallback
      arr.sort((a: any, b: any) => {
        const da = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const db = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return db - da
      })
      if (order === 'asc') arr.reverse()
    }

    ratings.value = arr || []
  } catch (e) {
    console.error('Error cargando puntuados de usuario', e)
    ratings.value = []
  } finally {
    loading.value = false
  }
}

function onSortChange() {
  loadRatings()
}

function ratingClass(score: number) {
  if (score >= 9) return 'bg-emerald-600'
  if (score >= 7) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-rose-500'
}

function displayClass(r: any) {
  if (r && typeof r.score !== 'undefined' && r.score !== null && String(r.score) !== '') return ratingClass(Number(r.score))
  return 'bg-gray-600'
}

function displayScore(r: any) {
  if (r && typeof r.score !== 'undefined' && r.score !== null && String(r.score) !== '') return `${r.score}/10`
  if (r && r.status === 'watching') return '*'
  return '-/10'
}

function displayScoreLabel(r: any) {
  if (r && typeof r.score !== 'undefined' && r.score !== null && String(r.score) !== '') return scoreLabel(Number(r.score))
  if (r && r.status === 'watching') return 'En progreso'
  return ''
}

function getImage(r: any) {
  return (r.itemId && ((r.itemId.data && r.itemId.data.cover) || r.itemId.data?.cover)) || r.itemId?.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || (r.itemId.data && r.itemId.data.title))) || r.title || 'Sin título'
}

function getDescription(r: any) {
  return (r.comment && String(r.comment).trim().length > 0) ? r.comment : ''
}

function formatTimeAgo(value: any) {
  const date = value ? new Date(value) : new Date()
  const diff = Date.now() - date.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  if (seconds < 60) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  return `Hace ${days}d`
}

function getGenres(r: any) {
  const g = (r.itemId && r.itemId.data && r.itemId.data.genres) || r.itemId?.genres || r.genres || []
  if (Array.isArray(g)) return g.slice(0, 3).join(' • ')
  if (typeof g === 'string' && g.length) return g
  return ''
}

function scoreLabel(score: number) {
  if (score >= 9) return 'Excelente puntuación'
  if (score >= 7) return 'Muy buena puntuación'
  if (score >= 5) return 'Buena puntuación'
  return 'Interesante'
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId || r.itemId?.id
  if (!id) return
  router.push({ name: 'item-detail', params: { id: String(id) } })
}

onMounted(() => {
  loadRatings()
})
</script>

<style scoped>
/* small visual tweaks handled by Tailwind classes */
</style>

