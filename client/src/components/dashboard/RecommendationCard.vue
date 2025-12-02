<template>
    <div class="group cursor-pointer bg-gray-800 bg-opacity-30 rounded-2xl p-6 backdrop-blur-sm border border-gray-500 border-opacity-30 hover:border-opacity-50 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500">
    <div class="flex gap-6">
      <!-- Imagen Rectangular - Clickeable -->
      <div class="relative flex-shrink-0 overflow-hidden cursor-pointer" @click="goToDetails">
        <img :src="recommendation.image" :alt="recommendation.title" class="w-32 h-48 object-cover rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-105">
        <!-- Hover Overlay -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button @click.stop="goToDetails" class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold px-3 py-1 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Ver</button>
        </div>
        <!-- Icono tipo de contenido -->
        <div class="absolute top-1 right-1 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-lg shadow-lg">
          {{ recommendation.mediaType }}
        </div>
      </div>

      <!-- Información al lado -->
      <div class="flex-1 min-w-0">
        <h3 class="text-white font-bold text-xl mb-3 truncate">{{ recommendation.title }}</h3>
        <p class="text-gray-300 mb-4 leading-relaxed line-clamp-3">
          {{ truncatedDescription }}
        </p>
        <div class="flex flex-wrap items-center gap-2 text-sm text-gray-200 mb-4">
          <span v-for="(genre, index) in recommendation.genres.slice(0, 3)" :key="genre" class="whitespace-nowrap">
            {{ genre }}<span v-if="index < Math.min(recommendation.genres.length - 1, 2)"> • </span>
          </span>
          <span v-if="recommendation.genres.length > 3" class="whitespace-nowrap">• +{{ recommendation.genres.length - 3 }}</span>
          <span class="whitespace-nowrap">• {{ recommendation.ageRating }}</span>
        </div>
        <div class="flex items-center gap-2">
          <button @click.stop="isAdded ? onRemoveWishlist() : onAddWishlist()" :title="isAdded ? 'Eliminar de tus deseados' : 'Añadir a deseados'" class="w-10 h-10 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 flex items-center justify-center text-white transition">
            <svg v-if="!isAdded" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364 4.318 12.682a4.5 4.5 0 010-6.364z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="white">
              <path d="M12 21.35l-1.1-1.02C5.14 15.36 2 12.28 2 8.5 2 6 4 4 6.5 4c1.74 0 3.41.81 4.5 2.09C12.09 4.81 13.76 4 15.5 4 18 4 20 6 20 8.5c0 3.78-3.14 6.86-8.9 11.83L12 21.35z" />
            </svg>
          </button>

          <button @click="openRatingModal" class="bg-gradient-to-r from-emerald-400 to-teal-500 hover:brightness-95 text-black px-6 py-2 rounded-lg font-bold transition">
            Puntuar
          </button>
        </div>
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
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { createBookByGoogleId, createMovieByTmdbId, createSeriesByTmdbId } from '@/services/searchCreate'
import RatingModal from '@/components/RatingModal.vue'
import { getUser } from '@/services/auth'
import { addItemToUser, getUserById, removeItemFromUser } from '@/services/user'
import { success as notifySuccess, error as notifyError } from '@/services/notify'

const props = defineProps<{
  recommendation: Recommendation
}>()

const router = useRouter()
const showRatingModal = ref(false)
const isAdded = ref(false)
const wishlistSubId = ref<string | null>(null)

onMounted(async () => {
  // try to detect if this item is already in the user's wishlist
  try {
    const me = getUser()
    if (!me || !me._id) return
    const res: any = await getUserById(me._id)
    const items = res && res.items ? res.items : []
    const match = items.find((it: any) => {
      const itemRef = it.itemId && (it.itemId._id || it.itemId.id) ? (it.itemId._id || it.itemId.id) : it.itemId
      return String(itemRef) === String(ratingItem.value.id) || String(it.itemId) === String(ratingItem.value.id)
    })
    if (match) {
      isAdded.value = true
      wishlistSubId.value = match._id || null
    }
  } catch (err) {
    // ignore
  }
})

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

async function onAddWishlist(e?: Event) {
  try {
    const me = getUser()
    if (!me || !me._id) {
      router.push({ name: 'login' })
      return
    }

    const userId = me._id || me.id
    const payload = {
      itemId: ratingItem.value.id || ratingItem.value._id,
      itemType: ratingItem.value.itemType || 'item',
      title: ratingItem.value.title || ''
    }

    const res = await addItemToUser(String(userId), payload)
    // try to get the wishlist entry id from response
    if (res && (res._id || res.item?._id)) {
      wishlistSubId.value = res._id || res.item._id || null
    } else {
      // fallback: fetch user wishlist and find entry
      try {
        const ures: any = await getUserById(userId)
        const items = ures && ures.items ? ures.items : []
        const match = items.find((it: any) => {
          const itemRef = it.itemId && (it.itemId._id || it.itemId.id) ? (it.itemId._id || it.itemId.id) : it.itemId
          return String(itemRef) === String(payload.itemId) || String(it.itemId) === String(payload.itemId)
        })
        if (match) wishlistSubId.value = match._id || null
      } catch {}
    }
    isAdded.value = true
    notifySuccess('Añadido a tus deseados')
  } catch (err: any) {
    console.error('Error añadiendo a wishlist', err)
    notifyError(err?.message || 'No se pudo añadir a deseados')
  }
}

async function onRemoveWishlist() {
  try {
    const me = getUser()
    if (!me || !me._id) {
      router.push({ name: 'login' })
      return
    }
    const userId = me._id || me.id
    // if we have the wishlist sub id, use it
    if (wishlistSubId.value) {
      await removeItemFromUser(String(userId), String(wishlistSubId.value))
    } else {
      // fallback: try to find the wishlist entry and remove it
      const ures: any = await getUserById(userId)
      const items = ures && ures.items ? ures.items : []
      const match = items.find((it: any) => {
        const itemRef = it.itemId && (it.itemId._id || it.itemId.id) ? (it.itemId._id || it.itemId.id) : it.itemId
        return String(itemRef) === String(ratingItem.value.id) || String(it.itemId) === String(ratingItem.value.id)
      })
      if (match && match._id) {
        await removeItemFromUser(String(userId), String(match._id))
      } else {
        throw new Error('No se encontró el item en tus deseados')
      }
    }
    isAdded.value = false
    wishlistSubId.value = null
    notifySuccess('Eliminado de tus deseados')
  } catch (err: any) {
    console.error('Error quitando de wishlist', err)
    notifyError(err?.message || 'No se pudo quitar de deseados')
  }
}

const truncatedDescription = computed(() => {
  const desc = props.recommendation?.description || ''
  if (desc.length <= 100) return desc
  return desc.slice(0, 100).trimEnd() + '...'
})
</script>