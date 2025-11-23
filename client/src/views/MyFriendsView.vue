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
            <li v-for="u in friends" :key="u._id">
              <div class="flex items-center justify-between p-3 rounded-lg bg-gray-900/40">
                <div>
                  <div class="text-white font-semibold">{{ u.name }}</div>
                </div>
                <div class="flex items-center gap-2">
                  <button @click="goToProfile(u._id)" class="px-3 py-1 rounded bg-white/10 text-white">Ver perfil</button>
                  <button @click="removeFriend(u._id)" :disabled="removing[u._id]" class="px-3 py-1 rounded bg-red-600 text-white">{{ removing[u._id] ? 'Eliminando...' : 'Eliminar' }}</button>
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
