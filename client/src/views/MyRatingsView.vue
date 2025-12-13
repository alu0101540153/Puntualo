<template>
  <div class="min-h-screen bg-gradient-dark">
    <!-- Colocar la cabecera en el tope para que su posición sea consistente -->
    <DashboardHeader />
    <main class="max-w-5xl mx-auto px-4 py-6 sm:py-8 mt-4 sm:mt-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h2 class="text-3xl sm:text-4xl font-bold text-white">Mis puntuados</h2>

        <!-- Ordenación: fecha / puntuación -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <label class="text-sm sm:text-sm text-gray-400 font-medium">Ordenar:</label>
          <div class="relative w-full sm:w-auto">
            <select v-model="sortOption" @change="onSortChange" class="w-full sm:w-auto bg-gradient-to-br from-slate-800/80 to-slate-700/60 border border-slate-600/50 text-white text-base sm:text-sm font-semibold px-4 py-3 sm:py-2.5 pr-10 rounded-xl sm:rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-md appearance-none cursor-pointer">
              <option value="date:desc">Más reciente</option>
              <option value="date:asc">Más antiguo</option>
              <option value="score:asc">Puntuación: más baja</option>
              <option value="score:desc">Puntuación: más alta</option>
            </select>
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Filters: Tipo -->
      <div class="grid grid-cols-2 sm:flex sm:items-center gap-3 mb-6">
        <button :class="['px-5 py-2.5 rounded-full text-sm font-extrabold transition-all shadow-md whitespace-nowrap', filterType === '' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110' : 'bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600']" @click="filterType = ''; loadRatings()">Todos</button>
        <button :class="['px-5 py-2.5 rounded-full text-sm font-extrabold transition-all shadow-md whitespace-nowrap', filterType === 'movie' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110' : 'bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600']" @click="filterType = 'movie'; loadRatings()">🎬 Película</button>
        <button :class="['px-5 py-2.5 rounded-full text-sm font-extrabold transition-all shadow-md whitespace-nowrap', filterType === 'series' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110' : 'bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600']" @click="filterType = 'series'; loadRatings()">📺 Serie</button>
        <button :class="['px-5 py-2.5 rounded-full text-sm font-extrabold transition-all shadow-md whitespace-nowrap', filterType === 'book' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black hover:brightness-110' : 'bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600']" @click="filterType = 'book'; loadRatings()">📖 Libro</button>
      </div>

      <div v-if="loading" class="text-gray-300">Cargando tus puntuados...</div>
      <div v-else-if="ratings.length === 0" class="text-gray-300">No tienes puntuaciones todavía.</div>

      <div class="space-y-4">
        <div v-for="r in ratings" :key="r._id || r.itemId" class="bg-gradient-to-br from-dark-800/80 to-black/60 border border-primary-500/20 rounded-2xl p-5 sm:p-6 shadow-lg hover:shadow-xl transition-shadow">
          <!-- Mobile Layout: Stacked -->
          <div class="flex flex-col sm:hidden gap-4">
            <!-- Header with user info and actions -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" :style="{ backgroundColor: (currentUser && currentUser.avatarBgColor) || '#ec4899' }">{{ userInitial }}</div>
                <div class="min-w-0 flex-1">
                  <div class="text-white font-semibold truncate">{{ userName }}</div>
                  <div class="text-xs text-gray-400">{{ formatTimeAgo(r.lastModified || r._id) }}</div>
                </div>
              </div>
              <div class="flex-shrink-0">
                <div :class="['w-16 h-16 rounded-full flex items-center justify-center text-xl font-extrabold text-white shadow-lg', displayClass(r)]">{{ displayScore(r) }}</div>
              </div>
            </div>

            <!-- Content with poster and details -->
            <div class="flex gap-4">
              <div class="w-24 flex-shrink-0">
                <div class="cursor-pointer transform hover:scale-105 transition-transform" @click.stop.prevent="goToDetail(r)">
                  <img :src="getImage(r)" alt="poster" class="w-full h-32 object-cover rounded-xl shadow-lg" />
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-gray-300 text-sm mb-2">ha puntuado <span class="text-white font-bold">{{ getTitle(r) }}</span></p>
                <div v-if="getDescription(r)" class="bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-l-4 border-primary-500/40 rounded-lg p-3 text-gray-200 italic text-xs leading-relaxed shadow-md line-clamp-3">"{{ getDescription(r) }}"</div>
                <div class="mt-2 text-xs text-gray-400">{{ getGenres(r) }}</div>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2">
              <button @click="goToDetail(r)" class="flex-1 text-sm font-extrabold text-white bg-gradient-to-r from-primary-500/20 to-accent-500/20 hover:from-primary-500/30 hover:to-accent-500/30 border border-primary-500/30 px-4 py-2.5 rounded-full transition-all">Ver detalle</button>
              <button @click="onDelete(r)" class="flex-1 text-sm font-extrabold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-4 py-2.5 rounded-full transition-all">Eliminar</button>
            </div>
          </div>

          <!-- Desktop Layout: Original with absolute positioning -->
          <div class="hidden sm:flex relative gap-6 items-start justify-between">
            <!-- Poster -->
            <div class="w-36 flex-shrink-0">
              <div class="cursor-pointer transform hover:scale-105 transition-transform" @click.stop.prevent="goToDetail(r)">
                <img :src="getImage(r)" alt="poster" class="w-full h-56 object-cover rounded-xl shadow-lg" />
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0 pr-52">
              <div class="flex items-start justify-start">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md" :style="{ backgroundColor: (currentUser && currentUser.avatarBgColor) || '#ec4899' }">{{ userInitial }}</div>
                  <div>
                    <div class="text-white font-bold">{{ userName }}</div>
                    <div class="text-sm text-gray-400">{{ formatTimeAgo(r.lastModified || r._id) }}</div>
                  </div>
                </div>
              </div>

              <div class="mt-6">
                <p class="text-gray-300">ha puntuado <span class="text-white font-bold text-lg">{{ getTitle(r) }}</span></p>
              </div>

              <!-- Review box (only show user's comment) -->
              <div v-if="getDescription(r)" class="mt-4 bg-gradient-to-br from-slate-800/60 to-slate-900/40 border-l-4 border-primary-500/40 rounded-lg p-4 text-gray-200 italic leading-relaxed shadow-md">"{{ getDescription(r) }}"</div>

              <div class="mt-6 text-sm text-gray-400 font-medium">{{ getGenres(r) }}</div>
            </div>

            <!-- Actions at top-right (absolute) -->
            <div class="absolute top-2 right-6 z-10">
              <div class="flex flex-row gap-3">
                <button @click="goToDetail(r)" class="text-sm text-white bg-white/6 px-3 py-1 rounded">Ver detalle</button>
                <button @click="onDelete(r)" class="text-sm text-rose-500 bg-white/6 px-3 py-1 rounded">Eliminar</button>
              </div>
            </div>

            <!-- Score centered vertically on the right (absolute) -->
            <div class="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col items-center z-10 mt-6">
              <div :class="['w-24 h-24 rounded-full flex items-center justify-center text-2xl font-extrabold text-white shadow-xl', displayClass(r)]">{{ displayScore(r) }}</div>
              <div class="mt-3 text-sm text-gray-400 text-center font-semibold">{{ displayScoreLabel(r) }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getUser } from '@/services/auth'
import { getMyRatings } from '@/services/user'
import { deleteRating } from '@/services/user'
import { success as notifySuccess, error as notifyError } from '@/services/notify'
import { useRouter } from 'vue-router'

const ratings = ref<any[]>([])
const loading = ref(true)
// sortOption stored as '<sortBy>:<order>' e.g. 'date:desc' or 'score:asc'
const sortOption = ref<string>('date:desc')
const filterType = ref<string>('')
const router = useRouter()
const currentUser = getUser()
const userName = (currentUser && (currentUser.name || currentUser.handle)) || 'Tú'
const userInitial = (currentUser && (currentUser.name || currentUser.handle || currentUser.email) ? String((currentUser.name || currentUser.handle || currentUser.email)[0]).toUpperCase() : 'U')

async function loadRatings() {
  loading.value = true
  const user = getUser()
  if (!user || !user._id) {
    loading.value = false
    ratings.value = []
    return
  }

    try {
      // parse sort option
      const [sortBy, order] = (sortOption.value || 'date:desc').split(':') as [any, any]
      const data: any = await getMyRatings(user._id, (sortBy === 'score' ? 'score' : 'date') as any, (order === 'asc' ? 'asc' : 'desc'))
      let items = data || []

      // Apply client-side filter by item type if requested. The item type may be stored in
      // the rated item itself or inside the populated itemId. Normalize to lowercase.
      const tfilter = (filterType.value || '').toString().toLowerCase()
      if (tfilter) {
        items = items.filter((r: any) => {
          const candidate = (r.itemType || (r.itemId && (r.itemId.itemType || r.itemId.data?.type)) || '')
          const t = String(candidate || '').toLowerCase()
          // normalize common variants
          if (t === 'tv' || t === 'tvshow') return tfilter === 'series'
          if (t === 'show' && tfilter === 'series') return true
          return t === tfilter
        })
      }

      ratings.value = items
  } catch (e) {
    console.error('Error cargando mis puntuados', e)
    ratings.value = []
  } finally {
    loading.value = false
  }
}

function onSortChange() {
  // recargar con nuevo orden
  loadRatings()
}

function ratingClass(score: number) {
  if (score >= 9) return 'bg-emerald-500'
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
  // Only return the user's own comment. Do not fall back to the item description.
  return (r.comment && String(r.comment).trim().length > 0) ? r.comment : ''
}

function formatTimeAgo(value: any) {
  // value can be a Date string or timestamp; if not available show 'Ahora'
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

async function onDelete(r: any) {
  const user = getUser()
  if (!user || !user._id) return
  // r._id should be the id of the ratedItems subdocument when returned from server
  const ratingId = r._id
  if (!ratingId) return
  try {
    await deleteRating(user._id, ratingId)
    // remove locally
    ratings.value = ratings.value.filter(x => (x._id || x.itemId) !== (ratingId || r.itemId))
    try { notifySuccess('Puntuación eliminada') } catch (e) {}
  } catch (e) {
    console.error('Error eliminando puntuación', e)
    try { notifyError('No se pudo eliminar la puntuación. Intenta de nuevo.') } catch (e) {}
  }
}

onMounted(() => {
  loadRatings()
  window.addEventListener('ratingsChanged', loadRatings)
})

onUnmounted(() => {
  window.removeEventListener('ratingsChanged', loadRatings)
})
</script>

<style scoped>
/* small visual tweaks handled by Tailwind classes */
</style>
