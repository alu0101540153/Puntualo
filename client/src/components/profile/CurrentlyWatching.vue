<template>
  <div class="bg-white/5 rounded-lg p-6 text-white">
    <div v-if="!hideHeader" class="flex items-start justify-between">
      <div>
        <h3 class="text-2xl font-semibold">{{ userName ? `Actualmente viendo de ${userName}` : 'Actualmente viendo' }}</h3>
        <p class="text-sm text-gray-300">Sigue lo que estás viendo ahora</p>
      </div>

      <!-- If this is a friend's profile view, show 'Ver más' and navigate to the user's watching page.
           Otherwise keep the original 'Añadir' link for the current user. -->
      <div>
        <button v-if="friendView && userId" @click="goToUserWatching" class="bg-white/10 text-white px-3 py-1 rounded-full">Ver más</button>
        <router-link v-else to="/search" class="bg-white/10 text-white px-3 py-1 rounded-full">Añadir</router-link>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-if="loading" class="col-span-full text-center text-gray-300">Cargando...</div>
      <div v-if="!loading && items.length === 0" class="col-span-full text-gray-300">No hay elementos en "Actualmente viendo"</div>

      <div v-for="r in items" :key="r._id || r.itemId" class="w-full rounded-lg overflow-hidden shadow-lg bg-gray-800 relative">
        <!-- Poster -->
        <img :src="getCover(r)" alt="poster" class="w-full h-64 object-cover" />

        <!-- Dark gradient overlay to improve text contrast -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

        <!-- Top-left status pill -->
        <div class="absolute top-3 left-3">
          <span v-if="isWatchingStatus(r.status)" class="bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">{{ getWatchingLabel(r) }}</span>
          <span v-else class="bg-black/60 text-white text-xs px-3 py-1 rounded-full">{{ getStatusLabel(r.status) }}</span>
        </div>

        <!-- Top-right media icon -->
        <div class="absolute top-3 right-3">
          <div class="bg-white/90 p-2 rounded-full shadow-sm flex items-center justify-center" :title="getMediaLabel(r)">
            <span class="text-sm">{{ getMediaIcon(r) }}</span>
          </div>
        </div>

        <!-- Title placed near bottom -->
        <div class="absolute left-4 right-4 bottom-12">
          <h4 class="text-white font-semibold text-lg truncate drop-shadow-md">{{ getTitle(r) }}</h4>
        </div>

        <!-- Bottom-left: ver detalle -->
        <div class="absolute bottom-3 left-3">
          <button @click="goToDetail(r)" class="text-sm text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-lg">Ver detalle</button>
        </div>

        <!-- Bottom-right: score -->
        <div class="absolute bottom-3 right-3">
          <div class="bg-black/80 text-yellow-400 font-extrabold px-3 py-1 rounded-full">{{ r.score ?? '-' }}/10</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { getMyRatings } from '@/services/user'
import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'

const props = defineProps<{ userId?: string; ratings?: any[]; hideHeader?: boolean; friendView?: boolean; userName?: string }>()
const { userId, ratings, hideHeader, friendView, userName } = props

const items = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

function goToUserWatching() {
  if (!userId) return
  router.push({ name: 'user-watching', params: { id: String(userId) } })
}

function getCover(r: any) {
  return (r.itemId && r.itemId.data && r.itemId.data.cover) || r.itemId?.image || r.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || r.itemId.data?.title)) || r.title || r.itemId?.data?.title || 'Sin título'
}

function getStatusLabel(s: string) {
  if (!s) return ''
  if (s === 'watching') return 'Viéndolo'
  if (s === 'completed') return 'Terminado'
  return s
}

function isWatchingStatus(s: any) {
  if (!s) return false
  const low = String(s).toLowerCase()
  return low === 'watching' || low === 'viendo' || low === 'in-progress' || low === 'inprogress' || low === 'in_progress'
}

function getMediaIcon(r: any) {
  const media = r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book'
  if (media === 'movie') return '🎬'
  if (media === 'series') return '📺'
  return '📖'
}

function getMediaLabel(r: any) {
  const media = r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book'
  if (media === 'movie') return 'Película'
  if (media === 'series') return 'Serie'
  return 'Libro'
}

// Determine the proper label when the user is currently consuming something.
// For books we want to show "Leyéndolo" instead of "Viéndolo".
function getWatchingLabel(r: any) {
  const media = (r.itemType || (r.itemId && r.itemId.itemType) || (r.itemId && r.itemId.data && r.itemId.data.type) || 'book')
  const low = String(media).toLowerCase()
  if (low === 'book' || low === 'libro') return 'Leyéndolo'
  // default uses the existing wording for visual media
  return 'Viéndolo'
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId?.id || r.itemId || r._id
  if (id) router.push({ name: 'item-detail', params: { id }, query: { openReview: '1' } })
}

async function load() {
  // allow passing ratings array via props.ratings
  loading.value = true
  try {
    const data: any = ratings && Array.isArray(ratings) ? ratings : (userId ? await getMyRatings(userId) : (getUser() ? await getMyRatings(getUser()._id) : []))
    const arr = Array.isArray(data) ? data : []

    // normalize item id and compute latest per item
    const map = new Map<string, any>()
    for (const entry of arr) {
      const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
      if (!rawId) continue
      const existing = map.get(rawId)
      // Prefer the one with newer lastModified if present, otherwise the current one (array order assumed chronological)
      if (!existing) {
        map.set(rawId, entry)
      } else {
        const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
        const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
        if (b >= a) map.set(rawId, entry)
      }
    }

    const latest = Array.from(map.values())
    // keep those whose latest status is 'watching' (accept several common variants)
    function isWatchingStatus(s: any) {
      if (!s) return false
      const low = String(s).toLowerCase()
      return low === 'watching' || low === 'viendo' || low === 'in-progress' || low === 'inprogress' || low === 'in_progress'
    }

    // debug helper to trace incoming data when embedded for another user
    try { console.debug('CurrentlyWatching.load: incoming entries', arr.length, 'latestUnique', latest.length) } catch (e) {}

    items.value = latest.filter((x: any) => isWatchingStatus(x.status))
  } catch (err) {
    console.error('Error loading ratings', err)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  // listen for ratings changes globally
  window.addEventListener('ratingsChanged', load)
})

watch(() => props.userId, () => load())
watch(() => props.ratings, () => {
  if (props.ratings) load()
})
</script>

<style scoped>
</style>
