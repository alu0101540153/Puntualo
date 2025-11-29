<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader :show-back="true" />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-white mb-6">Mis vistos</h2>

      <div v-if="loading" class="text-center text-gray-300 py-12">
        <div class="animate-pulse">Cargando tus vistos...</div>
      </div>

      <div v-else>
        <!-- Filters: Tipo -->
        <div class="flex items-center gap-2 mb-6">
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'all' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'all'">Todos</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'movie' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'movie'">🎬 Película</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'series' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'series'">📺 Serie</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'book' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'book'">📖 Libro</button>
        </div>

        <div v-if="displayedItems.length === 0" class="text-left text-gray-300 py-12">
          <span v-if="selectedType === 'book'">No tienes libros marcados como terminados todavía.</span>
          <span v-else-if="selectedType === 'movie'">No tienes películas marcadas como terminadas todavía.</span>
          <span v-else-if="selectedType === 'series'">No tienes series marcadas como terminadas todavía.</span>
          <span v-else>No tienes items marcados como terminados todavía.</span>
        </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="r in displayedItems" :key="r._id || r.itemId" 
             class="group cursor-pointer transform transition-all duration-300 hover:scale-105"
             @click="goToDetail(r)">
          <!-- Card Container -->
          <div class="relative bg-gray-800 bg-opacity-40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-700 hover:border-teal-500 transition-all">
            <!-- Image -->
            <div class="relative aspect-[2/3]">
              <img :src="getCover(r)" :alt="getTitle(r)" class="w-full h-full object-cover" />
              
              <!-- Status Badge -->
              <div class="absolute top-2 left-2 bg-teal-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Terminado
              </div>
              
              <!-- Media Type Icon -->
              <div class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                <span class="text-lg">{{ getMediaIcon(r) }}</span>
              </div>
              
              <!-- Hover Overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <button class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Ver detalles
                </button>
              </div>
            </div>
            
            <!-- Info Section -->
            <div class="p-3">
              <h4 class="text-white font-bold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{{ getTitle(r) }}</h4>
              
              <!-- Score -->
              <div v-if="r.score" class="flex items-center gap-2">
                <div class="flex items-center gap-1">
                  <span class="text-yellow-400 text-lg">⭐</span>
                  <span class="text-yellow-400 font-bold text-base">{{ r.score }}</span>
                  <span class="text-gray-400 text-sm">/10</span>
                </div>
              </div>
              <div v-else class="text-gray-400 text-sm italic">
                Sin puntuar
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getMyRatings } from '@/services/user'
import { getUser } from '@/services/auth'
import { useRouter } from 'vue-router'

const items = ref<any[]>([])
const loading = ref(true)
const router = useRouter()

// Filter state
const selectedType = ref<'all' | 'movie' | 'series' | 'book'>('all')

function detectType(r: any): 'movie' | 'series' | 'book' {
  const type = r.itemId?.itemType || r.itemType || r.itemId?.data?.type
  if (type === 'movie') return 'movie'
  if (type === 'series') return 'series'
  return 'book'
}

const displayedItems = computed(() => {
  if (selectedType.value === 'all') return items.value
  return items.value.filter(r => detectType(r) === selectedType.value)
})

function getCover(r: any) {
  return (r.itemId && r.itemId.data && r.itemId.data.cover) || r.itemId?.image || r.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || r.itemId.data?.title)) || r.title || 'Sin título'
}

function getMediaIcon(r: any) {
  const type = r.itemId?.itemType || r.itemType || r.itemId?.data?.type || 'book'
  if (type === 'movie') return '🎬'
  if (type === 'series') return '📺'
  return '📖'
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId?.id || r.itemId || r._id
  if (id) router.push({ name: 'item-detail', params: { id: String(id) } })
}

async function load() {
  loading.value = true
  const user = getUser()
  if (!user || !user._id) {
    items.value = []
    loading.value = false
    return
  }

  try {
    const data: any[] = await getMyRatings(user._id) || []
    // normalize to latest per item
    const map = new Map<string, any>()
    for (const entry of data) {
      const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
      if (!rawId) continue
      const existing = map.get(rawId)
      if (!existing) map.set(rawId, entry)
      else {
        const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
        const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
        if (b >= a) map.set(rawId, entry)
      }
    }

    const latest = Array.from(map.values())
    // only completed
    items.value = latest.filter((x: any) => {
      const s = (x.status || '').toString().toLowerCase()
      return s === 'completed' || s === 'terminado' || s === 'finished'
    })
  } catch (e) {
    console.error('Error cargando vistos', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('ratingsChanged', load)
})
</script>

<style scoped>
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
