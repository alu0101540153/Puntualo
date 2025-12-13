<template>
  <div class="group cursor-pointer bg-gradient-to-br from-dark-800/80 to-black/60 rounded-xl overflow-hidden backdrop-blur-sm border border-primary-500/20 hover:border-primary-500/50 transition-all duration-300 hover:shadow-glow">
    <div class="flex flex-row gap-4">
      <!-- Imagen Rectangular - Clickeable -->
      <div class="relative flex-shrink-0 overflow-hidden cursor-pointer" @click="goToDetails">
        <img :src="recommendation.image" :alt="recommendation.title" class="w-28 h-full sm:w-36 object-cover transform transition-all duration-300 group-hover:scale-105">
        <!-- Hover Overlay (solo desktop) -->
        <div class="hidden sm:flex absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-4">
          <button @click.stop="goToDetails" class="bg-gradient-to-r from-primary-500 to-accent-500 text-black font-bold px-3 py-1 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Ver</button>
        </div>
        <!-- Icono tipo de contenido -->
        <div class="absolute top-2 right-2 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-sm shadow-lg border border-primary-500/30">
          {{ recommendation.mediaType }}
        </div>
      </div>

      <!-- Información al lado -->
      <div class="flex-1 min-w-0 py-3 pr-3">
        <h3 class="text-white font-bold text-base sm:text-xl mb-2 line-clamp-2 leading-tight">{{ recommendation.title }}</h3>
        <p class="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed line-clamp-2">
          {{ truncatedDescription }}
        </p>
        <div class="flex flex-wrap items-center gap-1 text-[10px] sm:text-xs text-gray-400 mb-3">
          <span v-for="(genre, index) in recommendation.genres.slice(0, 2)" :key="genre" class="whitespace-nowrap">
            {{ genre }}<span v-if="index < Math.min(recommendation.genres.length - 1, 1)"> • </span>
          </span>
          <span v-if="recommendation.genres.length > 2" class="whitespace-nowrap">• +{{ recommendation.genres.length - 2 }}</span>
          <span class="whitespace-nowrap">• {{ recommendation.ageRating }}</span>
        </div>
        <button @click="openRatingModal" class="w-full sm:w-auto bg-gradient-to-r from-primary-500 to-accent-500 hover:brightness-110 text-black px-4 py-2 sm:px-5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition shadow-md">
          Puntuar
        </button>
      </div>
    </div>
  </div>

  <!-- Rating Modal -->
  <RatingModal 
    :show="showRatingModal" 
    :item="ratingItem"
    @close="showRatingModal = false"
    @success="handleRatingSuccess"
  />
</template>

<script setup lang="ts">
import type { Recommendation } from './types'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createBookByGoogleId, createMovieByTmdbId, createSeriesByTmdbId } from '@/services/searchCreate'
import RatingModal from '@/components/RatingModal.vue'

const props = defineProps<{
  recommendation: Recommendation
}>()

const router = useRouter()
const showRatingModal = ref(false)

// Map originType to correct itemType for the server
function normalizeItemType(originType?: string): string {
  if (!originType) return 'book'
  const lower = originType.toLowerCase()
  if (lower === 'movies' || lower === 'movie') return 'movie'
  if (lower === 'series') return 'series'
  if (lower === 'books' || lower === 'book') return 'book'
  return 'book'
}

const ratingItem = computed(() => ({
  id: props.recommendation.id,
  _id: props.recommendation.id,
  title: props.recommendation.title,
  image: props.recommendation.image,
  itemType: normalizeItemType(props.recommendation.originType),
  description: props.recommendation.description,
  externalId: props.recommendation.externalId,
  originType: props.recommendation.originType,
  genres: props.recommendation.genres,
  author: '',
  pages: '',
  language: ''
}))

function openRatingModal() {
  showRatingModal.value = true
}

function handleRatingSuccess() {
  // Optionally refresh data or show a notification
  console.log('Rating submitted successfully')
}

function goToDetails() {
  const id = String(props.recommendation?.id ?? '')
  if (!id) return
  // If recommendation is from external search and not yet stored, create it via server
  const external = props.recommendation.externalId && props.recommendation.originType
  if (external) {
    // call the appropriate create endpoint then navigate to the created item's detail if created
    (async () => {
      try {
        let res: any = null
        if (props.recommendation.originType === 'books') {
          res = await createBookByGoogleId(props.recommendation.externalId as string)
        } else if (props.recommendation.originType === 'movies') {
          res = await createMovieByTmdbId(props.recommendation.externalId as string)
        } else if (props.recommendation.originType === 'series') {
          res = await createSeriesByTmdbId(props.recommendation.externalId as string)
        }

        // server returns created item in res.item or the item itself; try to obtain _id
        const created = res?.item || res
        const targetId = created?._id || created?.item?._id || created?.id || id
        router.push({ name: 'item-detail', params: { id: String(targetId) } })
        return
      } catch (e) {
        // fallback: navigate using the current id (could be external id)
        router.push({ name: 'item-detail', params: { id } })
      }
    })()
    return
  }

  router.push({ name: 'item-detail', params: { id } })
}

const truncatedDescription = computed(() => {
  const desc = props.recommendation?.description || ''
  if (desc.length <= 100) return desc
  return desc.slice(0, 100).trimEnd() + '...'
})
</script>
