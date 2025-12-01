<template>
  <aside class="bg-gradient-to-b from-gray-900/60 to-black/50 rounded-2xl p-6 text-white md:sticky md:top-8 mb-6 md:mb-0 shadow-lg border border-white/6">
    <div class="flex items-center gap-4">
      <Avatar :user="displayedUser" size="xl" extraClass="flex-shrink-0 ring-4 ring-black/40" :initials="userInitial" />
      <div class="min-w-0">
        <h2 class="text-xl md:text-2xl font-bold leading-tight break-words">{{ displayName }}</h2>
        <p v-if="atUsername" class="text-sm text-gray-300 break-words">{{ atUsername }}</p>
      </div>
    </div>

    <div class="mt-6 space-y-3" v-if="isOwnProfile">
      <!-- Edit button: prominent green primary action to stand out -->
      <Button class="w-full" variant="primary" @click="$router.push('/profile/edit')">Editar Perfil</Button>
      <Button class="w-full" variant="secondary" @click="$router.push('/my-friends')">Mis amigos</Button>
      <Button class="w-full mt-3" variant="secondary" @click="handleLogout">Cerrar sesión</Button>
    </div>
    <div class="mt-5" v-else>
      <div class="text-sm text-gray-300 mb-3">Perfil público</div>
      <Button 
        class="w-full mb-3" 
        :variant="isFollowing ? 'danger' : hasPendingRequest ? 'secondary' : 'primary'" 
        @click="$emit('toggleFollow')"
        :disabled="followProcessing">
        {{ isFollowing ? 'Dejar de seguir' : hasPendingRequest ? 'Solicitado' : 'Seguir' }}
      </Button>
      <Button class="w-full" variant="secondary" @click="viewUserFriends">Ver amigos de {{ firstName }}</Button>
    </div>

    <div class="mt-6 bg-white/3 p-3 rounded-lg">
      <p class="font-semibold mb-2 text-sm">Descripción</p>
      <div class="text-sm text-gray-200 italic leading-relaxed" v-if="description">{{ description }}</div>
      <div class="text-sm text-gray-500" v-else>Sin descripción.</div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import Button from '@/components/Button.vue'
import Avatar from '@/components/Avatar.vue'
import { defineProps, defineEmits, computed } from 'vue'
import { getUser } from '@/services/auth'
import { useRouter } from 'vue-router'
import { logout } from '@/services/api'

const props = defineProps<{ 
  profileUser?: any
  isFollowing?: boolean
  hasPendingRequest?: boolean
  followProcessing?: boolean
}>()

defineEmits(['toggleFollow'])

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
  if (!user) return ''
  // Prefer the 'handle' field from the server model; fall back to username if present.
  return user.handle ? `@${user.handle}` : (user.username ? `@${user.username}` : '')
})

const description = computed(() => {
  const user = displayedUser.value
  if (!user) return ''
  return user.description || ''
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

function handleLogout() {
  logout()
  router.push('/login')
}
</script>

<style scoped>
/* Scoped small adjustments can go here */
</style>
