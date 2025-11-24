<template>
  <div class="min-h-screen">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-3xl font-bold text-white mb-2">Amigos de {{ userName }}</h2>
        </div>

        <div v-if="loading" class="text-gray-300">Cargando amigos...</div>
        <div v-else>
          <div v-if="friends.length === 0" class="text-gray-300">No muestra amigos públicos.</div>
          <ul class="space-y-3">
            <li v-for="(u, idx) in friends" :key="u._id">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-900/40">
                <div class="flex items-center gap-3">
                  <div class="flex flex-col">
                    <div class="text-white font-bold text-lg">{{ u.name || u.handle || 'Sin nombre' }}</div>
                    <div class="text-gray-400 text-sm truncate">{{ subtitleFor(u) }}</div>
                  </div>
                </div>
                <div class="flex items-center">
                  <!-- View profile button -->
                  <button @click="goToProfile(u._id)" class="w-10 h-10 mr-2 flex items-center justify-center rounded-full bg-white/10 text-white" title="Ver perfil">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>

                  <div v-if="String(u._id) === String(me?._id || me?.id)" class="w-10 h-10"></div>
                  <button v-else-if="following.includes(String(u._id)) || u.__followed" disabled class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  <button v-else @click="handleFollow(u._id, idx)" class="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-black">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </Card>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import Card from '@/components/Card.vue'
import { getMyFollows } from '@/services/friends'
import { useRoute, useRouter } from 'vue-router'
import { getUser } from '@/services/auth'
import { followUser } from '@/services/user'

const route = useRoute()
const router = useRouter()
const userId = String(route.params.id || '')
const friends = ref<any[]>([])
const loading = ref(true)
const userName = ref('')

// current logged-in user (may be null if not authenticated)
const me = getUser() || null
// list of ids the current user follows (strings)
const following = ref<string[]>((me && Array.isArray(me.follows)) ? Array.from(new Set(me.follows.map((s: any) => String(s)))) : [])

async function load() {
  loading.value = true
  if (!userId) { loading.value = false; return }
  try {
    const res: any[] = await getMyFollows(userId) || []
    // API may return minimal user objects; set list
    friends.value = res || []

    // mark entries followed by current user so UI shows the tick
    try {
      const followedSet = new Set((following.value || []).map((id: string) => String(id)))
      for (const it of friends.value) {
        if (it && it._id && followedSet.has(String(it._id))) it.__followed = true
        else it.__followed = false
      }
    } catch (e) {
      // ignore
    }

    // try to grab a name from route query or from owner info in responses
    userName.value = (route.query.name as string) || (friends.value && friends.value.length && friends.value[0] && friends.value[0].ownerName) || ''
  } catch (e) {
    console.error('Error cargando amigos de usuario', e)
    friends.value = []
  } finally {
    loading.value = false
  }
}

function goToProfile(id: string) {
  router.push({ path: '/profile', query: { userId: id } })
}

function subtitleFor(u: any) {
  // show @handle if available, otherwise try to show the last name (surname)
  if (!u) return ''
  if (u.handle) return `@${u.handle}`
  const n = u.name || u.fullName || ''
  const parts = String(n).trim().split(/\s+/)
  if (parts.length > 1) return parts.slice(1).join(' ')
  return ''
}

async function handleFollow(targetId: string, index: number) {
  try {
    await followUser(targetId)
    // ensure following is unique
    following.value = Array.from(new Set([...(following.value || []), String(targetId)]))

    // mark friends list entries as followed if they match id or handle
    const followedHandle = friends.value[index] && friends.value[index].handle
    for (let i = 0; i < friends.value.length; i++) {
      const r = friends.value[i]
      if (!r) continue
      if (String(r._id) === String(targetId) || (followedHandle && String((r.handle || '')).toLowerCase() === String(followedHandle).toLowerCase())) {
        friends.value[i].__followed = true
      }
    }

    // persist follows in localStorage.user so tick remains after navigation/reload
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (!Array.isArray(user.follows)) user.follows = []
        if (!user.follows.includes(targetId)) {
          user.follows.push(String(targetId))
          user.follows = Array.from(new Set(user.follows.map((id: any) => String(id))))
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
    } catch (e) {
      // ignore localStorage parse errors
    }
  } catch (err) {
    console.error('Follow error', err)
    alert('No se pudo añadir a amigos. Asegúrate de estar logueado e inténtalo de nuevo.')
  }
}

onMounted(() => load())
</script>

<style scoped>
/* minimal styling; layout controlled by Tailwind */
</style>
