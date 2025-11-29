<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader :show-back="true" />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-white mb-2">Vistos en común con {{ user?.username || user?.name || 'usuario' }}</h2>
      <p class="text-gray-300 mb-6">Items que ambos habéis completado</p>

      <div v-if="loading" class="text-center text-gray-300 py-12">
        <div class="animate-pulse">Cargando items en común...</div>
      </div>

      <div v-else>
        <!-- Filters: Tipo -->
        <div class="flex items-center gap-4 mb-6 flex-wrap">
          <div class="flex items-center gap-2">
            <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'all' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'all'">Todos</button>
            <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'movie' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'movie'">🎬 Película</button>
            <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'series' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'series'">📺 Serie</button>
            <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'book' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'book'">📖 Libro</button>
          </div>
        </div>

        <div v-if="displayedItems.length === 0" class="text-left text-gray-300 py-12">
          <span v-if="selectedType === 'book'">No hay libros en común que hayáis completado.</span>
          <span v-else-if="selectedType === 'movie'">No hay películas en común que hayáis visto.</span>
          <span v-else-if="selectedType === 'series'">No hay series en común que hayáis visto.</span>
          <span v-else>No hay items en común completados.</span>
        </div>

        <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <div v-for="r in displayedItems" :key="r._id || r.itemId" 
             class="group cursor-pointer transform transition-all duration-300 hover:scale-105"
             @click="goToDetail(r)">
          <!-- Card Container -->
          <div class="relative bg-gray-800 bg-opacity-40 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-700 hover:border-emerald-500 transition-all">
            <!-- Image -->
            <div class="relative aspect-[2/3]">
              <img :src="getCover(r)" :alt="getTitle(r)" class="w-full h-full object-cover" />
              
              <!-- Status Badge -->
              <div class="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                ✓ Completado
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
import { getUserById, getMyRatings } from '@/services/user'
import { getUser } from '@/services/auth'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const user = ref<any | null>(null)
const commons = ref<any[]>([])
const loading = ref(true)

// Filter state
const selectedType = ref<'all' | 'movie' | 'series' | 'book'>('all')

function detectType(r: any): 'movie' | 'series' | 'book' {
  const type = r.itemId?.itemType || r.itemType || r.itemId?.data?.type
  if (type === 'movie') return 'movie'
  if (type === 'series') return 'series'
  return 'book'
}

const displayedItems = computed(() => {
  if (selectedType.value === 'all') return commons.value
  return commons.value.filter(r => detectType(r) === selectedType.value)
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

function isCompletedStatus(s: any) {
  if (!s) return false
  const low = String(s).toLowerCase()
  return low === 'completed' || low === 'terminado' || low === 'finished'
}

onMounted(async () => {
  loading.value = true
  const id = String(route.params.id || '')
  if (!id) { loading.value = false; return }
  try {
    // Load other user
    user.value = await getUserById(id)
    const arr = Array.isArray(user.value?.ratedItems) ? user.value.ratedItems : []
    
    // Get latest version of each item
    const map = new Map<string, any>()
    for (const entry of arr) {
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
    const userCompletedItems = latest.filter((x: any) => isCompletedStatus(x.status))

    // Compute commons with current user
    try {
      const current = getUser()
      if (current && current._id) {
        const myRatings: any[] = await getMyRatings(current._id) || []
        
        // Filter my completed items
        const myCompletedMap = new Map<string, any>()
        for (const entry of myRatings) {
          if (!isCompletedStatus(entry.status)) continue
          const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
          if (!rawId) continue
          const existing = myCompletedMap.get(rawId)
          if (!existing) myCompletedMap.set(rawId, entry)
          else {
            const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
            const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
            if (b >= a) myCompletedMap.set(rawId, entry)
          }
        }
        
        const myCompletedIds = new Set(Array.from(myCompletedMap.keys()))
        
        commons.value = userCompletedItems.filter((x: any) => {
          const idRaw = x.itemId?._id || x.itemId?.id || String(x.itemId || x._id || '')
          return idRaw && myCompletedIds.has(idRaw)
        })
      } else {
        commons.value = []
      }
    } catch (e) {
      console.error('Error computing commons', e)
      commons.value = []
    }
  } catch (e) {
    console.error('Error loading common items', e)
    commons.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
