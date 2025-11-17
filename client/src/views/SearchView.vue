<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <!-- Reuse the dashboard header for consistency -->
    <DashboardHeader />

    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">Buscar</h2>
          <p class="text-gray-300">Busca películas, libros o series. Selecciona el tipo y usa la paginación.</p>
        </div>

        <div class="grid gap-4">
          <div class="flex flex-col md:flex-row gap-4 items-stretch">
            <Input v-model="query" placeholder="Introduce un título..." class="flex-1" />

            <div class="flex gap-3 w-full md:w-auto">
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
            </div>
          </div>

          <div class="flex gap-3">
            <button @click="onSearch" class="flex-1 bg-green-500 text-black py-3 rounded-full font-bold transition transform hover:-translate-y-1 hover:scale-105">Buscar</button>
            <button @click="clear" class="flex-1 bg-gray-700 text-white py-3 rounded-full transition transform hover:-translate-y-1 hover:scale-105">Limpiar</button>
          </div>

          <div v-if="loading" class="text-gray-300">Buscando...</div>

          <div v-if="!loading && results.length === 0 && searched" class="text-gray-300">No se han encontrado resultados.</div>

          <!-- Use RecommendationsGrid to display mapped results -->
          <RecommendationsGrid v-if="recommendationsList.length" :recommendations="recommendationsList" :gridClass="gridClass" />

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
import { ref, computed } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import RecommendationsGrid from '@/components/dashboard/RecommendationsGrid.vue'
import { searchBooks, searchMovies, searchSeries } from '@/services/search'

import type { Recommendation } from '@/components/dashboard/types'

const query = ref('')
const selectedType = ref<'movies' | 'books' | 'series'>('movies')
const loading = ref(false)
const results = ref<any[]>([])
const total = ref(0)
const page = ref(1)
const searched = ref(false)

function selectType(t: 'movies' | 'books' | 'series') {
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
  if (!query.value.trim()) return
  loading.value = true
  searched.value = true
  try {
    let res: any = null
    if (selectedType.value === 'books') {
      res = await searchBooks(query.value, page.value)
    } else if (selectedType.value === 'movies') {
      res = await searchMovies(query.value, page.value)
    } else {
      res = await searchSeries(query.value, page.value)
    }

    results.value = res.items || []
    total.value = res.total || results.value.length
  } catch (e: any) {
    console.error('Search error', e)
    results.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

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
  return results.value.map((r: any, idx: number) => ({
    id: String(r.id || idx),
    title: r.title || r.name || 'Sin título',
    description: r.overview || r.description || '',
    image: r.thumbnail || r.cover || '',
    mediaType: selectedType.value === 'movies' ? '🎬' : selectedType.value === 'books' ? '📖' : '📺',
    genres: r.genres || r.categories || [],
    ageRating: r.ageRating || '',
    externalId: String(r.id || idx),
    originType: selectedType.value
  }))
})

function buttonClass(type: 'movies' | 'books' | 'series') {
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
