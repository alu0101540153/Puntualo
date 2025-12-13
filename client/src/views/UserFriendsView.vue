<template>
  <div class="min-h-screen">
    <DashboardHeader />
    <main class="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Card>
        <div class="mb-5 sm:mb-6">
          <h2 class="text-3xl sm:text-4xl font-bold text-white mb-4 sm:mb-5">Conexiones de {{ userName }}</h2>
          
          <!-- Tabs -->
          <div class="flex gap-0 border-b-2 border-gray-700/50">
            <button
              @click="activeTab = 'following'"
              :class="[
                'flex-1 px-4 py-3 font-bold transition-all text-base',
                activeTab === 'following'
                  ? 'text-primary-400 border-b-3 border-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              ]"
            >
              Siguiendo ({{ following.length }})
            </button>
            <button
              @click="activeTab = 'followers'"
              :class="[
                'flex-1 px-4 py-3 font-bold transition-all text-base',
                activeTab === 'followers'
                  ? 'text-primary-400 border-b-3 border-primary-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
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
            <div v-if="following.length === 0" class="text-gray-300 text-center py-12">
              <p class="text-lg">No sigue a nadie aún.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="u in following" :key="u._id">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-dark-800/80 to-black/60 border border-primary-500/20 hover:border-primary-500/40 transition-all shadow-md hover:shadow-lg">
                  <div class="flex items-center gap-4 min-w-0 flex-1">
                    <router-link :to="{ path: '/profile', query: { userId: u._id } }">
                      <div
                        class="w-14 h-14 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-lg flex-shrink-0 shadow-lg ring-2 ring-white/10"
                        :style="{ backgroundColor: u.avatarBgColor || '#9CA3AF' }"
                      >
                        {{ u.name?.charAt(0).toUpperCase() || '?' }}
                      </div>
                    </router-link>
                    <div class="flex flex-col min-w-0 flex-1">
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-primary-400 truncate transition-colors">
                        {{ u.name || u.handle || 'Sin nombre' }}
                      </router-link>
                      <div class="text-gray-400 text-sm truncate">@{{ u.handle || 'usuario' }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <router-link
                      :to="{ path: '/profile', query: { userId: u._id } }"
                      class="flex-1 sm:flex-none px-5 py-2.5 rounded-full font-extrabold bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600 transition-all text-center text-sm shadow-md"
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
            <div v-if="followers.length === 0" class="text-gray-300 text-center py-12">
              <p class="text-lg">No tiene seguidores aún.</p>
            </div>
            <ul v-else class="space-y-3">
              <li v-for="u in followers" :key="u._id">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-5 rounded-xl bg-gradient-to-br from-dark-800/80 to-black/60 border border-primary-500/20 hover:border-primary-500/40 transition-all shadow-md hover:shadow-lg">
                  <div class="flex items-center gap-4 min-w-0 flex-1">
                    <router-link :to="{ path: '/profile', query: { userId: u._id } }">
                      <div
                        class="w-14 h-14 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-bold text-xl sm:text-lg flex-shrink-0 shadow-lg ring-2 ring-white/10"
                        :style="{ backgroundColor: u.avatarBgColor || '#9CA3AF' }"
                      >
                        {{ u.name?.charAt(0).toUpperCase() || '?' }}
                      </div>
                    </router-link>
                    <div class="flex flex-col min-w-0 flex-1">
                      <router-link :to="{ path: '/profile', query: { userId: u._id } }" class="text-white font-bold text-lg hover:text-primary-400 truncate transition-colors">
                        {{ u.name || u.handle || 'Sin nombre' }}
                      </router-link>
                      <div class="text-gray-400 text-sm truncate">@{{ u.handle || 'usuario' }}</div>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <router-link
                      :to="{ path: '/profile', query: { userId: u._id } }"
                      class="flex-1 sm:flex-none px-5 py-2.5 rounded-full font-extrabold bg-slate-700/80 border border-slate-600 text-gray-200 hover:bg-slate-600 transition-all text-center text-sm shadow-md"
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
