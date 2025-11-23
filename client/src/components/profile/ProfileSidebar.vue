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

    <div class="mt-5 space-y-3">
      <Button class="w-full" @click="$router.push('/profile/edit')">Editar Perfil</Button>
      <Button class="w-full" style="background:#6B7280" @click="$router.push('/my-friends')">Mis amigos</Button>
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
import { getUser } from '@/services/auth'
import { computed } from 'vue'

const user = getUser() || {}

const displayName = computed(() => {
  if (!user) return 'Usuario'
  // prefer name, fallback to email or username
  return user.name || user.fullName || user.username || user.email || 'Usuario'
})

const atUsername = computed(() => {
  if (!user) return '@usuario'
  return user.username ? `@${user.username}` : user.email ? user.email : '@usuario'
})

const userInitial = computed(() => {
  const name = user && (user.name || user.username || user.email)
  return name ? String(name).charAt(0).toUpperCase() : 'U'
})
</script>

<style scoped>
/* Scoped small adjustments can go here */
</style>
