<template>
  <div class="min-h-screen">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-4 py-8">
      <Card>
        <div class="mb-6">
          <h2 class="text-3xl font-bold text-white mb-4">Conexiones de {{ userName }}</h2>
          
          <!-- Tabs -->
          <div class="flex gap-4 border-b border-gray-700">
            <button
              @click="activeTab = 'following'"
              :class="[
                'px-4 py-2 font-medium transition-colors',
                activeTab === 'following'
                  ? 'text-purple-400 border-b-2 border-purple-400'
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
                  ? 'text-purple-400 border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white'
              ]"
            >
              Seguidores ({{ followers.length }})
            </button>
          </div>
        </div>

        <div v-if="loading" class="text-gray-300 text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p class="mt-4">Cargando...</p>
        </div>

        <div v-else>
          <!-- Siguiendo Tab -->
          <div v-if="activeTab === 'following'">
            <div v-if="following.length === 0" class="text-gray-300 text-center py-8">
              <p>No sigue a nadie aún.</p>
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
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-purple-400">
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
                  </div>
                </div>
              </li>
            </ul>
          </div>

          <!-- Seguidores Tab -->
          <div v-if="activeTab === 'followers'">
            <div v-if="followers.length === 0" class="text-gray-300 text-center py-8">
              <p>No tiene seguidores aún.</p>
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
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-purple-400">
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
import { getFollowers, getFollowing } from '@/services/user'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const userId = String(route.params.id || '')
const loading = ref(true)
const followers = ref<any[]>([])
const following = ref<any[]>([])
const activeTab = ref<'following' | 'followers'>('following')
const userName = ref('')

async function load() {
  loading.value = true
  if (!userId) {
    loading.value = false
    return
  }
  try {
    const [followersRes, followingRes] = await Promise.all([
      getFollowers(userId),
      getFollowing(userId)
    ])
    followers.value = followersRes || []
    following.value = followingRes || []
    
    // Try to get the user name from query or from the first user in the list
    userName.value = (route.query.name as string) || ''
  } catch (e: any) {
    console.error('Error loading connections', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
/* minimal styling; layout controlled by Tailwind */
</style>
