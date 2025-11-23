<template>
  <aside class="bg-white/5 rounded-lg p-6 text-white md:sticky md:top-8 mb-6 md:mb-0">
    <div class="flex items-center gap-4">
      <div class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-400 flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
        <span>{{ userInitial }}</span>
      </div>
      <div class="min-w-0">
        <h2 class="text-lg font-bold break-words">{{ displayName }}</h2>
        <p class="text-sm text-gray-300 break-words">{{ atUsername }}</p>
      </div>
    </div>

    <div class="mt-5 space-y-3" v-if="isOwnProfile">
      <Button class="w-full" @click="$router.push('/profile/edit')">Editar Perfil</Button>
      <Button class="w-full" style="background:#6B7280" @click="$router.push('/my-friends')">Mis amigos</Button>
    </div>
    <div class="mt-5" v-else>
      <!-- Public profile: show simple follow status or a green button to view this user's friends -->
      <div class="text-sm text-gray-300 mb-2">Perfil público</div>
      <Button class="w-full bg-green-600 hover:bg-green-700 text-white" @click="viewUserFriends">Ver amigos de {{ firstName }}</Button>
    </div>

    <div class="mt-6 bg-white/3 p-3 rounded">
      <p class="font-semibold mb-2">Actividad</p>
      <ul class="space-y-2 text-sm text-gray-200">
        <li>• Paula ha empezado a ver Bre...</li>
        <li>• Saray ha puntuado Culpa Tuya</li>
        <li>• Ayoze está viendo Fast and...</li>
      </ul>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import { defineProps, computed } from 'vue'
import { getUser } from '@/services/auth'
import { useRouter } from 'vue-router'

const props = defineProps<{ profileUser?: any }>()

const me = getUser() || {}
const router = useRouter()

// displayedUser: if a profileUser is provided (we're viewing someone else's profile),
// show that user; otherwise show the logged-in user
const displayedUser = computed(() => props.profileUser || me)

const isOwnProfile = computed(() => {
  if (!props.profileUser) return true
  // if profileUser._id matches current user id, treat as own profile
  const pid = props.profileUser && (props.profileUser._id || props.profileUser.id)
  const myid = me && (me._id || me.id)
  return pid && myid && String(pid) === String(myid)
})

const displayName = computed(() => {
  const user = displayedUser.value
  if (!user) return 'Usuario'
  return user.name || user.fullName || user.username || user.email || 'Usuario'
})

const atUsername = computed(() => {
  const user = displayedUser.value
  if (!user) return '@usuario'
  return user.username ? `@${user.username}` : user.email ? user.email : '@usuario'
})

const userInitial = computed(() => {
  const user = displayedUser.value
  const name = user && (user.name || user.username || user.email)
  return name ? String(name).charAt(0).toUpperCase() : 'U'
})

// Extract the first name token for use in button text (e.g. 'Saray' from 'Saray Garcia Campos')
const firstName = computed(() => {
  const user = displayedUser.value
  const name = user && (user.name || user.fullName || user.username || user.email)
  if (!name) return ''
  const parts = String(name).trim().split(/\s+/)
  return parts.length ? parts[0] : String(name)
})

function viewUserFriends() {
  const user = props.profileUser || null
  const id = user && (user._id || user.id)
  if (!id) return
  router.push({ name: 'user-friends', params: { id: String(id) }, query: { name: firstName.value || (user.name || '') } })
}
</script>

<style scoped>
/* Scoped small adjustments can go here */
</style>
