<template>
  <div class="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10 shadow-2xl">
    <div v-if="!hideHeader" class="flex items-center justify-between mb-6">
      <div>
        <h3 class="text-3xl font-bold text-white mb-1">{{ userName ? `Actualmente viendo de ${userName}` : 'Actualmente viendo' }}</h3>
        <p class="text-sm text-gray-400">Sigue lo que estás viendo ahora</p>
      </div>

      <div>
        <button 
          v-if="friendView && userId" 
          @click="goToUserWatching" 
          class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black font-semibold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
        >
          Ver más
        </button>
        <router-link 
          v-else 
          to="/search" 
          class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-110 text-black font-semibold px-5 py-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl inline-block"
        >
          + Añadir
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="text-center text-gray-300 py-16">
      <div class="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div>
      <p class="text-lg">Cargando...</p>
    </div>
    
    <div v-else-if="items.length === 0" class="text-center text-gray-400 py-16">
      <div class="text-6xl mb-4">📺</div>
      <p class="text-xl font-semibold mb-2">Nada por aquí todavía</p>
      <p class="text-sm">Añade algo para empezar a seguir tu progreso</p>
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      <div 
        v-for="r in items" 
        :key="r._id || r.itemId" 
        class="group relative cursor-pointer transform transition-all duration-500 hover:scale-105"
        @click="goToDetail(r)"
      >
        <!-- Card Container -->
        <div class="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl border-2 border-transparent hover:border-emerald-400 transition-all duration-300">
          <!-- Poster with Parallax Effect -->
          <div class="relative aspect-[2/3] overflow-hidden">
            <img 
              :src="getCover(r)" 
              :alt="getTitle(r)" 
              class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            />

            <!-- Animated gradient overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

            <!-- Animated shimmer effect on hover -->
            <div class="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent transform -skew-x-12 animate-shimmer"></div>
            </div>

            <!-- Status Badge with pulse animation -->
            <div class="absolute top-3 left-3 z-10">
              <span 
                v-if="isWatchingStatus(r.status)" 
                class="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-4 py-2 rounded-full shadow-lg animate-pulse-slow flex items-center gap-2"
              >
                <span class="w-2 h-2 bg-black rounded-full animate-ping"></span>
                {{ getWatchingLabel(r) }}
              </span>
              <span v-else class="bg-black/80 text-white text-xs font-semibold px-4 py-2 rounded-full backdrop-blur-sm">
                {{ getStatusLabel(r.status) }}
              </span>
            </div>

            <!-- Media Type Icon with bounce -->
            <div class="absolute top-3 right-3 z-10 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
              <div class="bg-white/95 backdrop-blur-sm p-2.5 rounded-full shadow-lg" :title="getMediaLabel(r)">
                <span class="text-xl">{{ getMediaIcon(r) }}</span>
              </div>
            </div>

            <!-- Interactive overlay with centered button -->
            <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-4">
              <button class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold py-3 px-8 rounded-xl shadow-2xl hover:brightness-110 transition-all duration-300 transform scale-90 group-hover:scale-100">
                Ver detalles
              </button>
              
              <!-- Progress bar moved to bottom -->
              <div class="absolute bottom-6 left-6 right-6">
                <div class="bg-gray-700/50 rounded-full h-2 overflow-hidden backdrop-blur-sm">
                  <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500" :style="{ width: getProgress(r) + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Info card at bottom -->
          <div class="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 to-transparent">
            <h4 class="text-white font-bold text-base line-clamp-2 mb-2 drop-shadow-lg">{{ getTitle(r) }}</h4>
            
            <!-- Score with animated star -->
            <div class="flex items-center justify-between">
              <div v-if="r.score" class="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span class="text-yellow-400 text-lg animate-pulse-slow">⭐</span>
                <span class="text-yellow-400 font-bold text-sm">{{ r.score }}</span>
                <span class="text-gray-400 text-xs">/10</span>
              </div>
              <div v-else class="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span class="text-gray-400 text-xs italic">Sin puntuar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% { transform: translateX(-100%) skewX(-12deg); }
  100% { transform: translateX(200%) skewX(-12deg); }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
}

.animate-pulse-slow {
  animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMyRatings } from '@/services/user'
import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'

const props = defineProps<{ userId?: string; ratings?: any[]; hideHeader?: boolean; friendView?: boolean; userName?: string }>()
const { userId, ratings, hideHeader, friendView, userName } = props

const items = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

function goToUserWatching() {
  if (!userId) return
  router.push({ name: 'user-watching', params: { id: String(userId) } })
}

function getCover(r: any) {
  return (r.itemId && r.itemId.data && r.itemId.data.cover) || r.itemId?.image || r.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || r.itemId.data?.title)) || r.title || r.itemId?.data?.title || 'Sin título'
}

function getStatusLabel(s: string) {
  if (!s) return ''
  if (s === 'watching') return 'Viéndolo'
  if (s === 'completed') return 'Terminado'
  return s
}

function isWatchingStatus(s: any) {
  if (!s) return false
  const low = String(s).toLowerCase()
  return low === 'watching' || low === 'viendo' || low === 'in-progress' || low === 'inprogress' || low === 'in_progress'
}

function getMediaIcon(r: any) {
  const media = r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book'
  if (media === 'movie') return '🎬'
  if (media === 'series') return '📺'
  return '📖'
}

function getMediaLabel(r: any) {
  const media = r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book'
  if (media === 'movie') return 'Película'
  if (media === 'series') return 'Serie'
  return 'Libro'
}

// Determine the proper label when the user is currently consuming something.
// For books we want to show "Leyéndolo" instead of "Viéndolo".
function getWatchingLabel(r: any) {
  const media = (r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book')
  const low = String(media).toLowerCase()
  if (low === 'book' || low === 'libro') return 'Leyéndolo'
  // default uses the existing wording for visual media
  return 'Viéndolo'
}

// Simulated progress based on score (just for visual effect)
function getProgress(r: any) {
  // If there's a score, use it as a rough progress indicator
  if (r.score) return (r.score / 10) * 100
  // Otherwise show a random progress between 20-70%
  return Math.floor(Math.random() * 50) + 20
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId?.id || r.itemId || r._id
  if (id) router.push({ name: 'item-detail', params: { id }, query: { openReview: '1' } })
}

async function load() {
  // allow passing ratings array via props.ratings
  loading.value = true
  try {
    const data: any = ratings && Array.isArray(ratings) ? ratings : (userId ? await getMyRatings(userId) : (getUser() ? await getMyRatings(getUser()._id) : []))
    const arr = Array.isArray(data) ? data : []

    // normalize item id and compute latest per item
    const map = new Map<string, any>()
    for (const entry of arr) {
      const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
      if (!rawId) continue
      const existing = map.get(rawId)
      // Prefer the one with newer lastModified if present, otherwise the current one (array order assumed chronological)
      if (!existing) {
        map.set(rawId, entry)
      } else {
        const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
        const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
        if (b >= a) map.set(rawId, entry)
      }
    }

    const latest = Array.from(map.values())
    // keep those whose latest status is 'watching' (accept several common variants)
    function isWatchingStatus(s: any) {
      if (!s) return false
      const low = String(s).toLowerCase()
      return low === 'watching' || low === 'viendo' || low === 'in-progress' || low === 'inprogress' || low === 'in_progress'
    }

    // debug helper to trace incoming data when embedded for another user
    try { console.debug('CurrentlyWatching.load: incoming entries', arr.length, 'latestUnique', latest.length) } catch (e) {}

    items.value = latest.filter((x: any) => isWatchingStatus(x.status))
  } catch (err) {
    console.error('Error loading ratings', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  // listen for ratings changes globally
  window.addEventListener('ratingsChanged', load)
})

watch(() => props.userId, () => load())
watch(() => props.ratings, () => {
  if (props.ratings) load()
})
</script>

<style scoped>
</style>
