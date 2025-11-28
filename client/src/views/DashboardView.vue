<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    
    <main class="max-w-6xl mx-auto px-4 py-8">
      <WelcomeSection />
      
      <!-- Generic recommendations (fallback) -->
      <section v-if="recommendations.length > 0" class="mb-8">
        <h2 class="text-2xl font-bold text-white mb-4">Te podría interesar ...</h2>
        <!-- Contenedor con fondo y padding -->
        <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div class="flex flex-col lg:flex-row gap-6 items-center">
            <!-- Mostrar solo 1 recomendación con ancho fijo -->
            <div class="flex-1 w-full max-w-2xl [&>section]:mb-0">
              <RecommendationsGrid 
                :recommendations="recommendations.slice(0, 1)"
                :gridClass="'grid grid-cols-1'"
                @see-more="handleSeeMoreRecommendations"
              />
            </div>
            <!-- Botón grande para ver más con los colores del tema -->
            <div class="flex items-center justify-center lg:justify-start flex-1">
              <button 
                @click="goToRecommendations" 
                class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-95 text-black font-extrabold py-6 px-10 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl whitespace-nowrap text-lg w-full"
              >
                Ver más recomendados
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Friends activities (feed) -->
      <section class="mb-8">
        <div v-if="loading" class="text-center text-gray-300 py-8">Cargando actividad de tus amigos...</div>
        <div v-else>
          <div v-if="friendActivities.length === 0" class="text-center text-gray-300 py-8">No hay actividad de tus amigos.</div>
          <FriendsGrid v-else :activities="friendActivities" />

          <!-- Pagination controls -->
          <div v-if="friendActivities.length > 0" class="flex items-center justify-between mt-8 bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
            <div class="text-sm text-gray-500 font-medium">
              Mostrando página <span class="font-semibold">{{ page }}</span> — <span class="font-semibold">{{ total }}</span> resultados
            </div>
            <div class="flex items-center gap-3">
              <button
                @click="prevPage"
                :disabled="page <= 1"
                class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Anterior
              </button>

              <button
                @click="nextPage"
                :disabled="page * limit >= total"
                class="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-semibold hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Siguiente
              </button>
            </div>
          </div>
        </div>
      </section>
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
import { getFeed } from '@/services/user'
import localRecommendations from '@/data/recommendations'
import breakingBad from '@/assets/imagenes/brekingbad.jpeg'
import fastFurious from '@/assets/imagenes/fastfurios.jpg'
import stragerThings from '@/assets/imagenes/imagen2.jpg.webp'
import alasSangre from '@/assets/imagenes/alasSangre.jpg'
import culpaTuya from '@/assets/imagenes/culpaTuya.jpg'

// Friend activities fetched from backend
const friendActivities = ref<FriendActivity[]>([])

const page = ref(1)
const limit = ref(6)
const total = ref(0)
const loading = ref(false)

function timeAgo(iso?: string) {
  if (!iso) return ''
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff/60)}m`
  if (diff < 86400) return `Hace ${Math.floor(diff/3600)}h`
  return `Hace ${Math.floor(diff/86400)}d`
}

function mapFeedToActivity(it: any, index: number): FriendActivity {
  console.debug('[feed] mapeando item crudo:', it)
  const user = it.user || {}
  const item = it.item || it
  const score = it.score != null ? Number(it.score) : (it.rating != null ? Number(it.rating) : null)
  const rating = (score != null && !Number.isNaN(score)) ? `${score}/10` : undefined
  const ratingColor = score != null ? (score >= 8 ? 'bg-green-500' : score >=5 ? 'bg-orange-500' : 'bg-red-500') : undefined
  const media = it.itemType || (item.data && item.data.type) || 'book'
  const mediaType = media === 'movie' ? '🎬' : media === 'series' ? '📺' : '📖'

  return {
    id: it._id || (Date.now() + index),
    friendName: user.name || user.handle || 'Usuario',
    friendInitial: (user.name && String(user.name).charAt(0)) || (user.handle && String(user.handle).charAt(0)) || '?',
    friendColor: (user.avatarBgColor && String(user.avatarBgColor)) || 'bg-gray-500',
    friendId: user._id || user.id || user.uid || undefined,
    action: it.status === 'watching' ? 'está viendo' : (it.status === 'completed' ? 'ha terminado de ver' : 'ha puntuado'),
    content: item.title || (item.data && item.data.title) || 'Sin título',
    contentId: item._id || item.id || (item.data && item.data._id) || undefined,
    contentImage: (item.data && item.data.cover) || item.cover || '/img/placeholder-book.png',
    contentMediaType: mediaType,
    time: timeAgo(it.lastModified || it.addedAt || it.createdAt),
    comment: it.comment || '',
    rating,
    ratingColor,
    genres: (item.data && item.data.genres) || []
  }
}

async function loadFeed() {
  loading.value = true
  try {
    const user = getUser()
    if (!user) {
      console.debug('[feed] no hay usuario en localStorage')
      return
    }
    const userId = user._id || (user.id && String(user.id)) || (user.uid && String(user.uid))
    if (!userId) {
      console.debug('[feed] usuario sin _id/id/uid en localStorage:', user)
      return
    }
    console.debug(`[feed] solicitando feed para usuario ${userId} page=${page.value} limit=${limit.value}`)
    const data: any = await getFeed(userId, page.value, limit.value)
    console.debug('[feed] respuesta cruda:', data)
    const items = data && Array.isArray(data.items) ? data.items : []
    total.value = data && data.total ? data.total : (items.length || 0)
    const mapped = items.map((it: any, idx: number) => mapFeedToActivity(it, idx))
    console.debug('[feed] items mapeados:', mapped)
    friendActivities.value = mapped
  } catch (err: any) {
    console.error('[feed] error cargando feed', err)
    friendActivities.value = []
  } finally {
    loading.value = false
  }
}

function prevPage() {
  if (page.value <= 1) return
  page.value -= 1
  loadFeed()
}

function nextPage() {
  if (page.value * limit.value >= total.value) return
  page.value += 1
  loadFeed()
}


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
  console.debug('[dashboard] mounted: cargando recomendaciones y feed')
  loadRecommendations()
  loadFeed()
})

// Recarga cuando se añade ?refresh=timestamp (ItemDetail redirige con esta query al puntuar)
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
watch(() => route.query.refresh, () => {
  if (route.name === 'dashboard') {
    loadRecommendations()
    loadFeed()
  }
})
// Handlers
const handleSeeMoreRecommendations = () => {
  console.log('Ver más recomendaciones clickeado')
  // Aquí puedes navegar a otra página o cargar más recomendaciones
}

function goToRecommendations() {
  router.push('/recommendations')
}
</script>