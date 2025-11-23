<template>
  <div class="min-h-screen px-4">
    <!-- Mantener la cabecera alineada con el tope de la página -->
    <DashboardHeader />

    <div class="max-w-7xl mx-auto py-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 items-start mt-6">
            <ProfileSidebar class="md:col-span-1" />

            <div class="md:col-span-3 space-y-6">
              <template v-if="!profileUser">
                <CurrentlyWatching />
              </template>

              <template v-else>
                <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                  <h3 class="text-2xl font-semibold text-white mb-4">Perfil público: {{ profileUser.name }}</h3>
                  <div v-if="profileUser.items && profileUser.items.length">
                    <ul class="space-y-3">
                      <li v-for="it in profileUser.items" :key="it._id" class="p-3 rounded bg-gray-900/40">
                        <div class="text-white font-semibold">{{ it.title }}</div>
                        <div class="text-gray-400 text-sm">{{ it.itemType }}</div>
                      </li>
                    </ul>
                  </div>
                  <div v-else class="text-gray-300">No hay items públicos.</div>
                </div>
              </template>

              <!-- Mis vistos: usar contenedor más ligero y que ocupe todo el ancho disponible -->
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Mis vistos</h3>
                    <button @click="goToAllSeen" class="bg-white/10 text-white px-3 py-1 rounded-full">Ver todos mis vistos</button>
                  </div>

                  <SeenCarousel />
                </div>
              </div>

              <!-- Mis puntuados: pequeñas cuentas y botón ver más -->
              <div class="bg-white/6 backdrop-blur-sm rounded-2xl p-6">
                <div class="space-y-4">
                  <div class="flex items-center justify-between">
                    <h3 class="text-2xl font-semibold text-white">Mis puntuados</h3>
                    <button @click="goToAllRatings" class="bg-white/10 text-white px-3 py-1 rounded-full">Ver mis puntuados</button>
                  </div>

                  <div v-if="loadingRatings" class="text-gray-300">Cargando resumen...</div>
                  <div v-else class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Total puntuados</div>
                      <div class="text-2xl font-bold text-white">{{ totalRatings }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Puntuación media</div>
                      <div class="text-2xl font-bold text-white">{{ avgScore }}</div>
                    </div>

                    <div class="bg-gradient-to-b from-gray-800 to-gray-700 p-4 rounded-lg text-center">
                      <div class="text-sm text-gray-300">Último puntuado</div>
                      <div class="text-sm text-white truncate">{{ lastRatedTitle || '—' }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import ProfileSidebar from '@/components/profile/ProfileSidebar.vue'
import CurrentlyWatching from '@/components/profile/CurrentlyWatching.vue'
import SeenCarousel from '@/components/profile/SeenCarousel.vue'
import { getUser } from '@/services/auth'
import { getMyRatings } from '@/services/user'
import { getUserById } from '@/services/user'

const loadingRatings = ref(true)
const totalRatings = ref(0)
const avgScore = ref<string | number>('—')
const lastRatedTitle = ref('')

const router = useRouter()
const route = useRoute()

const profileUser = ref<any | null>(null)

function goToAllSeen() {
  router.push('/my-seen')
}

async function loadRatingsSummary() {
  loadingRatings.value = true
  const user = getUser()
  if (!user || !user._id) {
    totalRatings.value = 0
    avgScore.value = '—'
    lastRatedTitle.value = ''
    loadingRatings.value = false
    return
  }

  try {
    const data: any[] = await getMyRatings(user._id) || []
    totalRatings.value = data.length
    if (data.length === 0) {
      avgScore.value = '—'
      lastRatedTitle.value = ''
    } else {
      const sum = data.reduce((s, r) => s + (Number(r.score) || 0), 0)
      const avg = sum / data.length
      // show one decimal if not integer
      avgScore.value = Number.isInteger(avg) ? avg : avg.toFixed(1)
      // pick the most recent by lastModified or _id timestamp
      const sorted = data.slice().sort((a, b) => {
        const da = a.lastModified ? new Date(a.lastModified).getTime() : 0
        const db = b.lastModified ? new Date(b.lastModified).getTime() : 0
        return db - da
      })
      lastRatedTitle.value = (sorted[0] && ((sorted[0].itemId && (sorted[0].itemId.title || sorted[0].itemId.data?.title)) || sorted[0].title)) || ''
    }
  } catch (e) {
    console.error('Error cargando resumen de puntuados', e)
    totalRatings.value = 0
    avgScore.value = '—'
    lastRatedTitle.value = ''
  } finally {
    loadingRatings.value = false
  }
}

function goToAllRatings() {
  router.push('/my-ratings')
}

onMounted(() => {
  loadRatingsSummary()
  // listen for global ratings changes (other components dispatch this event)
  window.addEventListener('ratingsChanged', loadRatingsSummary)
  // If query param userId is present, load that user's public profile
  const otherId = route.query.userId as string | undefined
  if (otherId) {
    getUserById(otherId).then((u) => {
      profileUser.value = u
    }).catch((e) => {
      console.error('Error loading profile user', e)
    })
  }
})
</script>

<style scoped>
/* pequeños ajustes puntuales si son necesarios */
</style>
