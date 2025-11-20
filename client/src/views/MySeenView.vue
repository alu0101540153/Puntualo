<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-4 py-8 mt-6">
      <h2 class="text-2xl font-bold text-white mb-6">Mis vistos</h2>

      <div v-if="loading" class="text-gray-300">Cargando tus vistos...</div>
      <div v-else-if="items.length === 0" class="text-gray-300">No tienes items marcados como terminados.</div>

      <div class="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        <div v-for="r in items" :key="r._id || r.itemId" class="w-full bg-gray-700 rounded overflow-hidden shadow-sm">
          <div class="relative">
            <img :src="getCover(r)" alt="poster" class="w-full h-56 object-cover" />
            <div class="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">Terminado</div>
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
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getMyRatings } from '@/services/user'
import { getUser } from '@/services/auth'
import { useRouter } from 'vue-router'

const items = ref<any[]>([])
const loading = ref(true)
const router = useRouter()

function getCover(r: any) {
  return (r.itemId && r.itemId.data && r.itemId.data.cover) || r.itemId?.image || r.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || r.itemId.data?.title)) || r.title || 'Sin título'
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId?.id || r.itemId || r._id
  if (id) router.push({ name: 'item-detail', params: { id: String(id) } })
}

async function load() {
  loading.value = true
  const user = getUser()
  if (!user || !user._id) {
    items.value = []
    loading.value = false
    return
  }

  try {
    const data: any[] = await getMyRatings(user._id) || []
    // normalize to latest per item
    const map = new Map<string, any>()
    for (const entry of data) {
      const rawId = entry.itemId?._id || entry.itemId?.id || String(entry.itemId || entry._id || '')
      if (!rawId) continue
      const existing = map.get(rawId)
      if (!existing) map.set(rawId, entry)
      else {
        const a = existing.lastModified ? new Date(existing.lastModified).getTime() : 0
        const b = entry.lastModified ? new Date(entry.lastModified).getTime() : 0
        if (b >= a) map.set(rawId, entry)
      }
    }

    const latest = Array.from(map.values())
    // only completed
    items.value = latest.filter((x: any) => {
      const s = (x.status || '').toString().toLowerCase()
      return s === 'completed' || s === 'terminado' || s === 'finished'
    })
  } catch (e) {
    console.error('Error cargando vistos', e)
    items.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  window.addEventListener('ratingsChanged', load)
})
</script>

<style scoped>
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
</style>
