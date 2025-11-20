<template>
  <div class="bg-white/5 rounded-lg p-6 text-white">
    <div class="flex items-start justify-between">
      <div>
        <h3 class="text-2xl font-semibold">Actualmente viendo</h3>
        <p class="text-sm text-gray-300">Sigue lo que estás viendo ahora</p>
      </div>

      <router-link to="/search" class="bg-white/10 text-white px-3 py-1 rounded-full">Añadir</router-link>
    </div>

    <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <div v-if="loading" class="col-span-full text-center text-gray-300">Cargando...</div>
      <div v-if="!loading && items.length === 0" class="col-span-full text-gray-300">No hay elementos en "Actualmente viendo"</div>

      <div v-for="r in items" :key="r._id || r.itemId" class="w-full bg-gray-700 rounded overflow-hidden shadow-sm">
        <div class="relative">
          <img :src="getCover(r)" alt="poster" class="w-full h-56 object-cover" />
          <div class="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">{{ getStatusLabel(r.status) }}</div>
        </div>
        <div class="p-3">
          <h4 class="text-white font-semibold text-sm truncate">{{ getTitle(r) }}</h4>
          <div class="mt-2 flex items-center justify-between">
            <div class="text-yellow-400 font-bold">{{ r.score ?? '-' }}/10</div>
            <div class="flex gap-2">
              <button @click="goToDetail(r)" class="text-sm text-white bg-white/6 px-2 py-1 rounded">Ver detalle</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getMyRatings } from '@/services/user'
import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'

const items = ref<any[]>([])
const loading = ref(false)
const router = useRouter()

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

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId?.id || r.itemId || r._id
  if (id) router.push({ name: 'item-detail', params: { id }, query: { openReview: '1' } })
}

async function load() {
  const user = getUser()
  if (!user || !user._id) return
  loading.value = true
    try {
      const data: any = await getMyRatings(user._id)
      // data is an array of ratedItems. We want the latest rating per itemId
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
      // keep those whose latest status is 'watching'
      items.value = latest.filter((x: any) => (x.status || '').toLowerCase() === 'watching')
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
</script>

<style scoped>
</style>
