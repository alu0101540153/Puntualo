<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader :show-back="true" />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <h2 class="text-3xl font-bold text-white mb-6">Mis deseados</h2>

      <div v-if="loading" class="text-center text-gray-300 py-12">
        <div class="animate-pulse">Cargando tus deseados...</div>
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
          <span v-if="selectedType === 'book'">No tienes libros deseados todavía.</span>
          <span v-else-if="selectedType === 'movie'">No tienes películas deseadas todavía.</span>
          <span v-else-if="selectedType === 'series'">No tienes series deseadas todavía.</span>
          <span v-else>No tienes items deseados todavía.</span>
        </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <div v-for="r in displayedItems" :key="r._id || r.itemId" class="group transform transition-all duration-300 hover:scale-105">
          <div class="relative bg-gray-800 bg-opacity-40 rounded-xl overflow-hidden shadow-lg border border-gray-700 transition-all">
            <div class="relative aspect-[2/3]">
              <img :src="getCover(r)" :alt="getTitle(r)" class="w-full h-full object-cover" />

              <!-- Badge: Deseado -->
              <div class="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                Deseado
              </div>

              <!-- Remove button (top-right) -->
              <button @click.stop="removeItem(r._id)" class="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg text-sm text-rose-600">
                ✕
              </button>

              <!-- Hover overlay -->
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                <button @click.stop="goToDetail(r)" class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold px-4 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  Ver detalles
                </button>
              </div>
            </div>

            <div class="p-3">
              <h4 class="text-white font-bold text-sm line-clamp-2 mb-2 min-h-[2.5rem]">{{ getTitle(r) }}</h4>
              <div class="text-gray-300 text-sm">Añadido: <span class="text-gray-400">{{ formatDate(r.addedAt) }}</span></div>
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
import { getUser } from '@/services/auth'
import { getUserById, removeItemFromUser } from '@/services/user'
import { useRouter } from 'vue-router'

const loading = ref(true)
const items = ref<any[]>([])
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

function formatDate(d: any) {
  if (!d) return ''
  try { return new Date(d).toLocaleString() } catch (e) { return '' }
}

function getCover(it: any) {
  return (it.itemId && it.itemId.data && it.itemId.data.cover) || it.itemId?.image || it.itemId?.cover || it.cover || '/img/placeholder-book.png'
}

function getTitle(it: any) {
  return (it.itemId && (it.itemId.title || it.itemId.data?.title)) || it.title || 'Sin título'
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
    const res: any = await getUserById(user._id)
    items.value = (res && res.items) ? res.items : []
  } catch (err) {
    console.error('Error cargando wishlist', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

async function removeItem(itemSubId: string) {
  const user = getUser()
  if (!user || !user._id) return
  try {
    await removeItemFromUser(user._id, itemSubId)
    // reload list
    await load()
  } catch (err) {
    console.error('Error quitando item', err)
  }
}

onMounted(() => {
  load()
  window.addEventListener('wishlistChanged', load)
})
</script>

<style scoped>
/* small style tweaks if needed */
</style>
