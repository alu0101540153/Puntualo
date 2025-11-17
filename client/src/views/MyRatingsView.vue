<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-900 py-8">
    <DashboardHeader />
    <main class="max-w-5xl mx-auto px-4 mt-6">
      <h2 class="text-2xl font-bold text-white mb-6">Mis puntuados</h2>

      <div v-if="loading" class="text-gray-300">Cargando tus puntuados...</div>
      <div v-else-if="ratings.length === 0" class="text-gray-300">No tienes puntuaciones todavía.</div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="r in ratings" :key="r._id || r.itemId" class="bg-gray-800 bg-opacity-30 rounded-xl p-4 flex gap-4 items-center">
          <img :src="getImage(r)" alt="cover" class="w-24 h-32 object-cover rounded shadow" />
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white">{{ getTitle(r) }}</h3>
            <p class="text-gray-300 text-sm mt-1">{{ getDescription(r) }}</p>
            <div class="mt-3 flex items-center gap-3">
              <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white" :class="ratingClass(r.score)">{{ r.score }}/10</div>
              <button @click="goToDetail(r)" class="bg-white bg-opacity-10 text-gray-100 px-3 py-1 rounded hover:bg-opacity-20">Ver detalle</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getUser } from '@/services/auth'
import { getMyRatings } from '@/services/user'
import { useRouter } from 'vue-router'

const ratings = ref<any[]>([])
const loading = ref(true)
const router = useRouter()

function ratingClass(score: number) {
  if (score >= 9) return 'bg-emerald-600'
  if (score >= 7) return 'bg-emerald-400'
  if (score >= 5) return 'bg-yellow-400'
  return 'bg-rose-500'
}

function getImage(r: any) {
  return (r.itemId && ((r.itemId.data && r.itemId.data.cover) || r.itemId.data?.cover)) || r.itemId?.cover || '/img/placeholder-book.png'
}

function getTitle(r: any) {
  return (r.itemId && (r.itemId.title || (r.itemId.data && r.itemId.data.title))) || r.title || 'Sin título'
}

function getDescription(r: any) {
  return (r.itemId && (r.itemId.data && r.itemId.data.description)) || r.comment || ''
}

function goToDetail(r: any) {
  const id = r.itemId?._id || r.itemId || r.itemId?.id
  if (!id) return
  router.push({ name: 'item-detail', params: { id: String(id) } })
}

onMounted(async () => {
  const user = getUser()
  if (!user || !user._id) {
    loading.value = false
    ratings.value = []
    return
  }

  try {
    const data: any = await getMyRatings(user._id)
    ratings.value = data || []
  } catch (e) {
    console.error('Error cargando mis puntuados', e)
    ratings.value = []
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
/* small visual tweaks handled by Tailwind classes */
</style>
