<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    
    <main class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">Recomendados</h1>
        <p class="text-gray-300">Descubre contenido que podría interesarte</p>
      </div>

      <div v-if="loading" class="text-center text-gray-300 py-12">
        <div class="animate-pulse">Cargando recomendaciones...</div>
      </div>

      <div v-else>
        <!-- Filters: Tipo de contenido (siempre visibles cuando no está cargando) -->
        <div class="flex items-center gap-2 mb-6">
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'all' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'all'">Todos</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'movie' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'movie'">🎬 Película</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'series' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'series'">📺 Serie</button>
          <button :class="['px-3 py-1 rounded-full text-sm font-medium transition-all', selectedType === 'book' ? 'bg-emerald-400 text-black' : 'bg-gray-700 text-gray-300 hover:bg-gray-600']" @click="selectedType = 'book'">📖 Libro</button>
        </div>

        <!-- Contenedor con altura mínima para evitar salto de layout cuando no hay resultados -->
        <div class="min-h-[320px]">
          <div v-if="recommendations.length === 0" class="text-left text-gray-300 py-12">
            No hay recomendaciones disponibles en este momento.
          </div>

          <div v-else-if="displayedRecommendations.length === 0" class="text-left text-gray-300 py-12">
            No hay recomendaciones del tipo seleccionado.
          </div>

          <div v-else>
            <RecommendationsGrid 
              :recommendations="paginatedRecommendations"
              @see-more="() => {}"
            />
          </div>
        </div>

        <!-- Pagination controls -->
        <div v-if="displayedRecommendations.length > itemsPerPage" class="flex items-center justify-between mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
          <div class="text-sm text-gray-500 font-medium">
            Mostrando <span class="font-semibold">{{ startIndex + 1 }}-{{ endIndex }}</span> de <span class="font-semibold">{{ displayedRecommendations.length }}</span> recomendaciones
          </div>
          <div class="flex items-center gap-3">
            <button
              @click="prevPage"
              :disabled="currentPage <= 1"
              class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Anterior
            </button>

            <div class="flex items-center gap-2 px-4 bg-white/6 rounded-md py-2">
              <span class="text-gray-500 font-semibold">Página {{ currentPage }} de {{ totalPages }}</span>
            </div>

            <button
              @click="nextPage"
              :disabled="currentPage >= totalPages"
              class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import RecommendationsGrid from '@/components/dashboard/RecommendationsGrid.vue'
import type { Recommendation } from '../components/dashboard/types'
import { getAllItems, getRecommendationsForUser } from '@/services/item'
import { getUser } from '@/services/auth'
import localRecommendations from '@/data/recommendations'

const recommendations = ref<Recommendation[]>([])
const loading = ref(true)
const currentPage = ref(1)
const itemsPerPage = ref(6)
const selectedType = ref<'all' | 'movie' | 'series' | 'book'>('all')

// Computed properties para filtrado y paginación
const displayedRecommendations = computed(() => {
  if (selectedType.value === 'all') return recommendations.value
  return recommendations.value.filter(r => (r as any).type === selectedType.value)
})

const totalPages = computed(() => Math.max(1, Math.ceil(displayedRecommendations.value.length / itemsPerPage.value)))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage.value, displayedRecommendations.value.length))
const paginatedRecommendations = computed(() => 
  displayedRecommendations.value.slice(startIndex.value, endIndex.value)
)

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function mapServerToRecommendation(it: any, allowFallback = false): Recommendation {
  const media = it.itemType || (it.data && it.data.type) || 'book'
  const mediaType = media === 'movie' ? '🎬' : media === 'series' ? '📺' : '📖'
  const mapped = {
    id: it._id || String(it.id || ''),
    title: it.title || (it.data && it.data.title) || 'Sin título',
    description: (it.data && it.data.description) || it.description || '',
    image: (it.data && it.data.cover) || it.cover || '',
    mediaType,
    type: media,
    genres: (it.data && it.data.genres) || [],
    ageRating: ''
  }

  if (allowFallback) {
    if (!mapped.image) mapped.image = '/img/placeholder-book.png'
    if (!mapped.description) mapped.description = 'Sin descripción disponible.'
    return mapped as Recommendation
  }

  if (!mapped.image || !mapped.description) return null as any

  return mapped as Recommendation
}

async function loadRecommendations() {
  loading.value = true
  try {
    const user = getUser()
    let data: any = null
    
    if (user && user._id) {
      data = await getRecommendationsForUser(user._id)
      const items = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : null)
      if (Array.isArray(items) && items.length > 0) {
        recommendations.value = items.map((it: any) => mapServerToRecommendation(it, true)).filter(Boolean)
        loading.value = false
        return
      }
    }

    // Fallback a getAllItems
    if (!data) {
      data = await getAllItems()
    }

    if (Array.isArray(data) && data.length > 0) {
      recommendations.value = data.map((it: any) => mapServerToRecommendation(it, true)).filter(Boolean)
      loading.value = false
      return
    }

    if (data && Array.isArray(data.items) && data.items.length > 0) {
      recommendations.value = data.items.map((it: any) => mapServerToRecommendation(it, true)).filter(Boolean)
      loading.value = false
      return
    }
  } catch (err) {
    console.error('Error al cargar recomendaciones', err)
  }

  // Fallback local
  recommendations.value = localRecommendations as unknown as Recommendation[]
  loading.value = false
}

onMounted(() => {
  loadRecommendations()
})

// Reset page cuando cambia el filtro
watch(selectedType, () => {
  currentPage.value = 1
})
</script>

<style scoped>
</style>
