<template>
  <div class="min-h-screen">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-4">Conexiones</h2>
          
          <!-- Tabs -->
          <div class="flex gap-4 border-b border-gray-700">
            <button
              @click="activeTab = 'following'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                activeTab === 'following'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              Siguiendo ({{ following.length }})
            </button>
            <button
              @click="activeTab = 'followers'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                activeTab === 'followers'
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              Seguidores ({{ followers.length }})
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-gray-300 text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto"></div>
          <p class="mt-4">Cargando...</p>
        </div>

        <div v-else>
          <!-- Siguiendo Tab -->
          <div v-if="activeTab === 'following'">
            <div v-if="following.length === 0" class="text-gray-300 text-center py-8">
              <p>No sigues a nadie aún.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="u in following" :key="u._id">
                <div class="flex items-center justify-between p-4 rounded-lg bg-gray-900/40 hover:bg-gray-900/60 transition-colors">
                  <div class="flex items-center gap-4">
                    <router-link :to="{ path: '/profile', query: { userId: u._id } }">
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        :style="{ backgroundColor: u.avatarBgColor || '#9CA3AF' }"
                      >
                        {{ u.name?.charAt(0).toUpperCase() || '?' }}
                      </div>
                    </router-link>
                    <div class="flex flex-col">
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-emerald-400">
                        {{ u.name || u.handle || 'Sin nombre' }}
                      </router-link>
                      <div class="text-gray-400 text-sm">@{{ u.handle || 'usuario' }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <router-link
                      :to="{ path: '/profile', query: { userId: u._id } }"
                      class="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                      Ver perfil
                    </router-link>
                    <button
                      @click="unfollowUserAction(u._id)"
                      :disabled="removing[u._id]"
                      class="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {{ removing[u._id] ? 'Dejando...' : 'Dejar de seguir' }}
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Seguidores Tab -->
          <div v-if="activeTab === 'followers'">
            <div v-if="followers.length === 0" class="text-gray-300 text-center py-8">
              <p>No tienes seguidores aún.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="u in followers" :key="u._id">
                <div class="flex items-center justify-between p-4 rounded-lg bg-gray-900/40 hover:bg-gray-900/60 transition-colors">
                  <div class="flex items-center gap-4">
                    <router-link :to="{ path: '/profile', query: { userId: u._id } }">
                      <div
                        class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg"
                        :style="{ backgroundColor: u.avatarBgColor || '#9CA3AF' }"
                      >
                        {{ u.name?.charAt(0).toUpperCase() || '?' }}
                      </div>
                    </router-link>
                    <div class="flex flex-col">
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-emerald-400">
                        {{ u.name || u.handle || 'Sin nombre' }}
                      </router-link>
                      <div class="text-gray-400 text-sm">@{{ u.handle || 'usuario' }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <router-link
                      :to="{ path: '/profile', query: { userId: u._id } }"
                      class="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                    >
                      Ver perfil
                    </router-link>
                    <button
                      v-if="!isFollowing(u._id)"
                      @click="followUserAction(u._id)"
                      class="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                    >
                      Seguir de vuelta
                    </button>
                    <button
                      v-else
                      disabled
                      class="px-4 py-2 rounded-lg bg-gray-600 text-white cursor-not-allowed"
                    >
                      Siguiendo
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
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
import { getFollowers, getFollowing } from '@/services/user'
import { unfollowUser } from '@/services/user'
import { createFollowRequest } from '@/services/followRequest'
import { success as notifySuccess, error as notifyError } from '@/services/notify'

const loading = ref(true)
const followers = ref<any[]>([])
const following = ref<any[]>([])
const removing = ref<Record<string, boolean>>({})
const activeTab = ref<'following' | 'followers'>('following')

async function load() {
  loading.value = true
  const me = getUser()
  if (!me || !me._id) {
    loading.value = false
    return
  }
  try {
    const [followersRes, followingRes] = await Promise.all([
      getFollowers(me._id),
      getFollowing(me._id)
    ])
    followers.value = followersRes || []
    following.value = followingRes || []
  } catch (e: any) {
    console.error('Error loading connections', e)
    notifyError(e.message || 'Error al cargar conexiones')
  } finally {
    loading.value = false
  }
}

function isFollowing(userId: string) {
  return following.value.some(u => u._id === userId)
}

async function unfollowUserAction(userId: string) {
  if (!confirm('¿Estás seguro de que quieres dejar de seguir a este usuario?')) {
    return
  }
  
  removing.value[userId] = true
  try {
    console.log('Unfollowing user:', userId)
    const result = await unfollowUser(userId)
    console.log('Unfollow result:', result)
    
    // Actualizar localStorage inmediatamente
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (Array.isArray(user.following)) {
          user.following = user.following.filter((id: string) => String(id) !== String(userId))
          localStorage.setItem('user', JSON.stringify(user))
          console.log('Updated localStorage, new following count:', user.following.length)
        }
      } catch (e) {
        console.error('Error updating localStorage:', e)
      }
    }
    
    notifySuccess('Has dejado de seguir a este usuario')
    // Recargar para asegurar consistencia
    await load()
  } catch (e: any) {
    console.error('Error unfollowing user:', e)
    notifyError(e.message || 'Error al dejar de seguir')
  } finally {
    removing.value[userId] = false
  }
}

async function followUserAction(userId: string) {
  try {
    const result = await createFollowRequest(userId)
    if (result.status === 'following') {
      notifySuccess('Ahora sigues a este usuario')
    } else {
      notifySuccess('Solicitud enviada')
    }
    await load()
  } catch (e: any) {
    notifyError(e.message || 'Error al seguir')
  }
}

onMounted(() => {
  load()
})
</script>
