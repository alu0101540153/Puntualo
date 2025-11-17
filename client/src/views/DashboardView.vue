<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    
    <main class="max-w-6xl mx-auto px-4 py-8">
      <WelcomeSection />
      
      <!-- Personal recommendations shown above friends when available -->
      <section v-if="personalRecommendations.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Recomendaciones para ti</h2>
        <RecommendationsGrid 
          :recommendations="personalRecommendations"
          @see-more="handleSeeMoreRecommendations"
        />
      </section>

      <!-- Generic recommendations (fallback) -->
      <section v-if="recommendations.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Te podría interesar ...</h2>
        <RecommendationsGrid 
          :recommendations="recommendations"
          @see-more="handleSeeMoreRecommendations"
        />
      </section>

      <!-- Only show friends activities when there are no personal recommendations -->
      <FriendsGrid 
        v-if="personalRecommendations.length === 0"
        :activities="friendActivities"
      />
    </main>
  </div>
</template>

<script setup lang="ts">
// Components
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import WelcomeSection from '@/components/dashboard/WelcomeSection.vue'
import RecommendationsGrid from '@/components/dashboard/RecommendationsGrid.vue'
import FriendsGrid from '@/components/dashboard/FriendsGrid.vue'

// Types
import type { Recommendation, FriendActivity } from '../components/dashboard/types'

import { ref, onMounted, watch } from 'vue'
import { getAllItems, getRecommendationsForUser } from '@/services/item'
import { getUser } from '@/services/auth'
import localRecommendations from '@/data/recommendations'
import breakingBad from '@/assets/imagenes/brekingbad.jpeg'
import fastFurious from '@/assets/imagenes/fastfurios.jpg'
import stragerThings from '@/assets/imagenes/imagen2.jpg.webp'
import alasSangre from '@/assets/imagenes/alasSangre.jpg'
import culpaTuya from '@/assets/imagenes/culpaTuya.jpg'

// Datos de actividades de amigos
const friendActivities: FriendActivity[] = [
  {
    id: 1,
    friendName: 'Paula',
    friendInitial: 'P',
    friendColor: 'bg-pink-500',
    action: 'ha empezado a ver',
    content: 'Breaking Bad',
    contentImage: breakingBad,
    contentMediaType: '📺',
    time: 'Hace 2h',
    comment: 'Por ahora me esta gustando mucho.',
    genres: ['Drama', 'Crimen', '+18']
  },
  {
    id: 2,
    friendName: 'Saray',
    friendInitial: 'S',
    friendColor: 'bg-purple-500',
    action: 'ha puntuado',
    content: 'Culpa Tuya',
    contentImage: culpaTuya,
    contentMediaType: '📖',
    time: 'Hace 1h',
    rating: '9/10',
    ratingColor: 'bg-green-500',
    genres: ['Romance', 'Drama', '+18']
  },
  {
    id: 3,
    friendName: 'Ayoze',
    friendInitial: 'A',
    friendColor: 'bg-amber-500',
    action: 'esta viendo',
    content: 'Fast and Furious',
    contentImage: fastFurious,
    contentMediaType: '🎬',
    time: 'Ahora',
    comment: 'Quiero ser Toretto 🏎️',
    genres: ['Acción', 'Aventura', '+13']
  },
  {
    id: 4,
    friendName: 'Alex',
    friendInitial: 'A',
    friendColor: 'bg-gray-500',
    action: 'ha terminado de ver',
    content: 'Stranger Things',
    contentImage: stragerThings,
    contentMediaType: '🎬',
    time: 'Hace 30m',
    comment: 'No me esperaba para nada ese final...',
    genres: ['Drama', 'Fantasía', '+16']
  },
  {
    id: 5,
    friendName: 'Abian',
    friendInitial: 'A',
    friendColor: 'bg-teal-500',
    action: 'ha puntuado',
    content: 'Alas de Sangre',
    contentImage: alasSangre,
    contentMediaType: '📖',
    time: 'Hace 3h',
    rating: '6/10',
    ratingColor: 'bg-orange-500',
    genres: ['Fantasy', 'Romance', '+16']
  },
    {
    id: 1,
    friendName: 'Paula',
    friendInitial: 'P',
    friendColor: 'bg-pink-500',
    action: 'ha empezado a ver',
    content: 'Breaking Bad',
    contentImage: breakingBad,
    contentMediaType: '📺',
    time: 'Hace 2h',
    comment: 'Por ahora me esta gustando mucho.',
    genres: ['Drama', 'Crimen', '+18']
  },
  {
    id: 2,
    friendName: 'Saray',
    friendInitial: 'S',
    friendColor: 'bg-purple-500',
    action: 'ha puntuado',
    content: 'Culpa Tuya',
    contentImage: culpaTuya,
    contentMediaType: '📖',
    time: 'Hace 1h',
    rating: '9/10',
    ratingColor: 'bg-green-500',
    genres: ['Romance', 'Drama', '+18']
  },
  {
    id: 3,
    friendName: 'Ayoze',
    friendInitial: 'A',
    friendColor: 'bg-amber-500',
    action: 'esta viendo',
    content: 'Fast and Furious',
    contentImage: fastFurious,
    contentMediaType: '🎬',
    time: 'Ahora',
    comment: 'Quiero ser Toretto 🏎️',
    genres: ['Acción', 'Aventura', '+13']
  },
  {
    id: 4,
    friendName: 'Alex',
    friendInitial: 'A',
    friendColor: 'bg-gray-500',
    action: 'ha terminado de ver',
    content: 'Stranger Things',
    contentImage: stragerThings,
    contentMediaType: '🎬',
    time: 'Hace 30m',
    comment: 'No me esperaba para nada ese final...',
    genres: ['Drama', 'Fantasía', '+16']
  },
  {
    id: 5,
    friendName: 'Abian',
    friendInitial: 'A',
    friendColor: 'bg-teal-500',
    action: 'ha puntuado',
    content: 'Alas de Sangre',
    contentImage: alasSangre,
    contentMediaType: '📖',
    time: 'Hace 3h',
    rating: '6/10',
    ratingColor: 'bg-orange-500',
    genres: ['Fantasy', 'Romance', '+16']
  }
]


// Recomendaciones cargadas desde la API (fallback a datos locales)
const recommendations = ref<Recommendation[]>([])
// recomendaciones personalizadas (por usuario)
const personalRecommendations = ref<Recommendation[]>([])

function mapServerToRecommendation(it: any, allowFallback = false): Recommendation {
  const media = it.itemType || (it.data && it.data.type) || 'book'
  const mediaType = media === 'movie' ? '🎬' : media === 'series' ? '📺' : '📖'
  const mapped = {
    id: it._id || String(it.id || ''),
    title: it.title || (it.data && it.data.title) || 'Sin título',
    description: (it.data && it.data.description) || it.description || '',
    image: (it.data && it.data.cover) || it.cover || '',
    mediaType,
    genres: (it.data && it.data.genres) || [],
    ageRating: ''
  }

  // If allowFallback is true, fill missing image/description with placeholders instead of dropping
  if (allowFallback) {
    if (!mapped.image) mapped.image = '/img/placeholder-book.png'
    if (!mapped.description) mapped.description = 'Sin descripción disponible.'
    return mapped as Recommendation
  }

  // Filtrar items sin imagen o sin descripción: devolvemos null para ser filtrados posteriormente
  if (!mapped.image || !mapped.description) return null as any

  return mapped as Recommendation
}

async function loadRecommendations() {
  try {
    const user = getUser()
    let data: any = null
    if (user && user._id) {
      data = await getRecommendationsForUser(user._id)
      // support API returning { items: [...] }
      const items = Array.isArray(data) ? data : (data && Array.isArray(data.items) ? data.items : null)
      // map into personalRecommendations if any (allow fallback placeholders)
      if (Array.isArray(items) && items.length > 0) {
        personalRecommendations.value = items.map((it: any) => mapServerToRecommendation(it, true)).filter(Boolean)
      }
    }

    // si no vino nada para el usuario, caer a getAllItems
    if (!data) {
      data = await getAllItems()
    }

    if (Array.isArray(data) && data.length > 0) {
      // if personalRecommendations already set, keep generic recommendations below
      recommendations.value = data.map((it: any) => mapServerToRecommendation(it)).filter(Boolean)
      return
    }

    // si la API devuelve { items: [...] }
    if (data && Array.isArray(data.items) && data.items.length > 0) {
      recommendations.value = data.items.map((it: any) => mapServerToRecommendation(it)).filter(Boolean)
      return
    }
  } catch (err) {
    // console.warn('Error al cargar recomendaciones desde API, usando fallback local', err)
  }

  // fallback local
  recommendations.value = localRecommendations as unknown as Recommendation[]
}

onMounted(() => {
  loadRecommendations()
})

// Recarga cuando se añade ?refresh=timestamp (ItemDetail redirige con esta query al puntuar)
import { useRoute } from 'vue-router'
const route = useRoute()
watch(() => route.query.refresh, () => {
  if (route.name === 'dashboard') loadRecommendations()
})
// Handlers
const handleSeeMoreRecommendations = () => {
  console.log('Ver más recomendaciones clickeado')
  // Aquí puedes navegar a otra página o cargar más recomendaciones
}
</script>