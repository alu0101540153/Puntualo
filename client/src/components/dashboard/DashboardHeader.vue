<template>
    <header class="bg-black bg-opacity-30 backdrop-blur-md border border-white/10">
      <div class="max-w-screen-2xl mx-auto w-full px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/dashboard" class="flex items-center" aria-label="Ir al inicio">
            <img src="/Logo_white.svg" alt="Puntúalo" class="h-8 cursor-pointer" />
          </router-link>
        </div>

    <!-- Navegación -->
    <nav class="hidden md:flex gap-8">
      <button 
        v-for="item in navigation" 
        :key="item.name"
        @click="router.push(item.to)"
        :class="[
          'font-semibold pb-1 transition-colors cursor-pointer',
          isActive(item.to) 
            ? 'text-white border-b-2 border-white' 
            : 'text-gray-300 hover:text-white'
        ]"
      >
        {{ item.name }}
      </button>
    </nav>

      <!-- Búsqueda y Usuario -->
      <div class="flex items-center gap-4">
        <div class="relative" role="button" aria-label="Ir a buscar" @click="router.push('/search')">
        <input 
          type="text" 
          placeholder="Buscar..."
          readonly
          class="pl-4 pr-10 py-2 rounded-full bg-white/3 border border-white/6 text-white placeholder-gray-400 cursor-pointer text-sm w-64 md:w-80 lg:w-96 transition hover:shadow-md"
        >
        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-300">🔍</span>
      </div>
          <div role="button" aria-label="Ir al perfil" title="Ver perfil" tabindex="0" @click="router.push('/profile')" @keyup.enter="router.push('/profile')">
            <Avatar :user="user" size="md" extraClass="cursor-pointer ring-2 ring-black/30" :initials="userInitial" />
          </div>
      <Button @click="handleLogout" variant="secondary" size="sm">Cerrar sesión</Button>
        </div>
      </div>
    </header>
</template>

<script setup lang="ts">
interface NavigationItem {
  name: string
  to: string
}

const navigation: NavigationItem[] = [
  { name: 'Inicio', to: '/dashboard' },
  { name: 'Recomendados', to: '/recommendations' }
]

import { useRouter, useRoute } from 'vue-router'
import { computed } from 'vue'
import { getUser } from '@/services/auth'
import { logout } from '@/services/api'

import Button from '@/components/Button.vue'
import Avatar from '@/components/Avatar.vue'
const router = useRouter()
const route = useRoute()

// ruta reactiva actual
const currentPath = computed(() => route.path)

// Consider route prefixes active (so /dashboard and /dashboard/child count as active)
const isActive = (to: string) => {
  try {
    return currentPath.value.startsWith(to)
  } catch {
    return currentPath.value === to
  }
}

const user = getUser()
const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'J'

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>