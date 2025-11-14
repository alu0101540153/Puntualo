<template>
    <header class="bg-black bg-opacity-30 backdrop-blur-md py-4 px-6 flex justify-between items-center">
    <div class="flex items-center gap-3">
      <div class="text-white text-2xl font-black">
        Puntúalo<span class="text-xl font-normal opacity-90">.com</span>
      </div>
    </div>

    <!-- Navegación -->
    <nav class="hidden md:flex gap-8">
      <button 
        v-for="item in navigation" 
        :key="item.name"
        :class="[
          'font-semibold pb-1 transition-colors',
          item.active 
            ? 'text-white border-b-2 border-white' 
            : 'text-gray-300 hover:text-white'
        ]"
      >
        {{ item.name }}
      </button>
    </nav>

    <!-- Búsqueda y Usuario -->
    <div class="flex items-center gap-4">
      <div class="relative">
        <input 
          type="text" 
          placeholder="Buscar..."
          class="pl-4 pr-10 py-2 rounded-full bg-gray-600 bg-opacity-50 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-40"
        >
        <span class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
      </div>
      <div class="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-semibold">
        {{ userInitial }}
      </div>
      <button
        @click="handleLogout"
        class="ml-3 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
      >
        Cerrar sesión
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
interface NavigationItem {
  name: string
  active: boolean
}

const navigation: NavigationItem[] = [
  { name: 'Inicio', active: true },
  { name: 'Perfil', active: false },
  { name: 'Amigos', active: false }
]

import { useRouter } from 'vue-router'
import { getUser } from '@/services/auth'
import { logout } from '@/services/api'

const router = useRouter()

const user = getUser()
const userInitial = user && user.name ? user.name.charAt(0).toUpperCase() : 'J'

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>