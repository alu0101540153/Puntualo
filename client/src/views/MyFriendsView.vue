<template>
  <div class="min-h-screen">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-2">Mis amigos</h2>
        </div>

        <div v-if="loading" class="text-gray-300">Cargando...</div>
        <div v-else>
          <div v-if="friends.length === 0" class="text-gray-300">No tienes amigos aún.</div>
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

                  <!-- Already followed (you) -->
                  <button disabled class="w-10 h-10 flex items-center justify-center rounded-full bg-gray-600 text-white mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Remove friend button (trash icon) -->
                  <button @click="removeFriend(u._id)" :disabled="removing[u._id]" class="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 text-white" title="Eliminar amigo">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
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
import { getUser } from '@/services/auth'
import { getMyFollows } from '@/services/friends'
import { useRouter } from 'vue-router'
import { unfollowUser } from '@/services/user'

const loading = ref(true)
const friends = ref<any[]>([])
const removing = ref<Record<string, boolean>>({})
const router = useRouter()

async function load() {
  loading.value = true
  const me = getUser()
  if (!me || !me._id) {
    loading.value = false
    return
  }
  try {
    const res = await getMyFollows(me._id)
    friends.value = res || []
  } catch (e) {
    console.error('Error loading follows', e)
    friends.value = []
  } finally {
    loading.value = false
  }
}

function goToProfile(id: string) {
  // navigate to profile view with query userId
  router.push({ path: '/profile', query: { userId: id } })
}

function subtitleFor(u: any) {
  if (!u) return ''
  if (u.handle) return `@${u.handle}`
  const n = u.name || u.fullName || ''
  const parts = String(n).trim().split(/\s+/)
  if (parts.length > 1) return parts.slice(1).join(' ')
  return ''
}

async function removeFriend(targetId: string) {
  const me = getUser()
  if (!me || !me._id) return
  const ok = window.confirm('¿Eliminar a este usuario de tus amigos?')
  if (!ok) return
  try {
    removing.value[targetId] = true
    await unfollowUser(targetId)
    // remove from local list
    friends.value = friends.value.filter((f: any) => f._id !== targetId)
    // update localStorage user follows if present
    try {
      const raw = localStorage.getItem('user')
      if (raw) {
        const user = JSON.parse(raw)
        if (Array.isArray(user.follows)) {
          user.follows = user.follows.filter((id: string) => id !== targetId)
          localStorage.setItem('user', JSON.stringify(user))
        }
      }
    } catch (e) {
      // ignore localStorage parse errors
    }
  } catch (err) {
    console.error('Error unfollowing user', err)
    alert('No se pudo eliminar al amigo. Intenta de nuevo.')
  } finally {
    removing.value[targetId] = false
  }
}

onMounted(() => load())
</script>
