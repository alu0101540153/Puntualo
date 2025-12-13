<template>
  <div class="min-h-screen bg-gradient-dark">
    <DashboardHeader />
    
    <main class="max-w-6xl mx-auto px-4 py-6 sm:py-8">
      <div class="mb-6 sm:mb-8">
        <h1 class="text-3xl sm:text-4xl font-bold text-white mb-2">Recomendados</h1>
        <p class="text-sm sm:text-base text-gray-300">Descubre contenido que podría interesarte</p>
      </div>

      <div v-if="loading" class="text-center text-gray-300 py-12">
        <div class="animate-pulse">Cargando recomendaciones...</div>
      </div>

      <div v-else>
        <!-- Filters: Tipo de contenido (distribución mejorada para móvil) -->
        <div class="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center sm:justify-start gap-3 mb-6 max-w-md sm:max-w-none mx-auto sm:mx-0">
          <button :class="['px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md', selectedType === 'all' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black' : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600']" @click="selectedType = 'all'">Todos</button>
          <button :class="['px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md', selectedType === 'movie' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black' : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600']" @click="selectedType = 'movie'">🎬 Película</button>
          <button :class="['px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md', selectedType === 'series' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black' : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600']" @click="selectedType = 'series'">📺 Serie</button>
          <button :class="['px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-md', selectedType === 'book' ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-black' : 'bg-gray-700/80 text-gray-200 hover:bg-gray-600']" @click="selectedType = 'book'">📖 Libro</button>
        </div>

        <!-- Contenedor sin altura mínima fija -->
        <div>
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
        <div v-if="displayedRecommendations.length > itemsPerPage" class="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div class="text-xs sm:text-sm text-gray-400 font-medium text-center sm:text-left">
            Mostrando <span class="font-semibold text-primary-400">{{ startIndex + 1 }}-{{ endIndex }}</span> de <span class="font-semibold text-primary-400">{{ displayedRecommendations.length }}</span>
          </div>
          <div class="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div class="flex items-center gap-2 order-2 sm:order-1">
              <button
                @click="prevPage"
                :disabled="currentPage <= 1"
                class="px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-black text-xs sm:text-sm font-semibold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>

              <button
                @click="nextPage"
                :disabled="currentPage >= totalPages"
                class="px-4 py-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-black text-xs sm:text-sm font-semibold hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
            
            <div class="flex items-center gap-2 px-3 bg-white/10 rounded-lg py-1.5 order-1 sm:order-2">
              <span class="text-gray-300 font-semibold text-xs sm:text-sm">Página {{ currentPage }} de {{ totalPages }}</span>
            </div>
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
