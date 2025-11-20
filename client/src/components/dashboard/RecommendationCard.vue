<template>
    <div class="bg-gray-800 bg-opacity-30 rounded-2xl p-6 backdrop-blur-sm border border-gray-500 border-opacity-30 hover:border-opacity-50 transition-all duration-300">
    <div class="flex gap-6">
      <!-- Imagen Rectangular -->
      <div class="relative flex-shrink-0">
        <img :src="recommendation.image" :alt="recommendation.title" class="w-32 h-48 object-cover rounded-xl shadow-lg">
        <!-- Icono tipo de contenido -->
        <div class="absolute top-1 right-1 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-lg shadow-lg">
          {{ recommendation.mediaType }}
        </div>
      </div>

      <!-- Información al lado -->
      <div class="flex-1">
        <h3 class="text-white font-bold text-xl mb-3">{{ recommendation.title }}</h3>
        <p class="text-gray-300 mb-4 leading-relaxed">
          {{ truncatedDescription }}
        </p>
        <div class="flex items-center gap-4 text-sm text-gray-200 mb-4">
          <span v-for="(genre, index) in recommendation.genres" :key="genre">
            {{ genre }}<span v-if="index < recommendation.genres.length - 1"> • </span>
          </span>
          <span>•</span>
          <span>{{ recommendation.ageRating }}</span>
        </div>
        <button @click="goToDetails" class="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Ver detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Recommendation } from './types'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { createBookByGoogleId, createMovieByTmdbId, createSeriesByTmdbId } from '@/services/searchCreate'

const props = defineProps<{
  recommendation: Recommendation
}>()

const router = useRouter()

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