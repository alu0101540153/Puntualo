<template>
    <header :class="[
      'fixed top-0 left-0 right-0 w-full z-50 bg-black bg-opacity-30 backdrop-blur-md border-b border-white/10 transform transition-transform duration-300',
      hiddenHeader ? '-translate-y-full' : 'translate-y-0'
    ]">
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
        <div>
          <button
            aria-label="Buscar"
            title="Buscar"
            @click="router.push('/search')"
            class="w-10 h-10 rounded-full bg-white/3 border border-white/6 flex items-center justify-center text-gray-200 hover:bg-white/5 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 18a7.5 7.5 0 100-15 7.5 7.5 0 000 15z" />
            </svg>
          </button>
        </div>
          <div role="button" aria-label="Ir al perfil" title="Ver perfil" tabindex="0" @click="router.push('/profile')" @keyup.enter="router.push('/profile')">
            <Avatar :user="user" size="md" extraClass="cursor-pointer ring-2 ring-black/30" :initials="userInitial" />
          </div>
        </div>
      </div>
    </header>

    <!-- Spacer to avoid content being hidden under fixed header -->
    <div class="h-16" aria-hidden="true"></div>
</template>

<script setup lang="ts">
interface NavigationItem {
  name: string
  to: string
}

import { computed, ref, onMounted, onUnmounted } from 'vue'
import { getToken, getUser } from '@/services/auth'

// Build navigation dynamically so we can show items only when the user is authenticated
const baseNavigation: NavigationItem[] = [
  { name: 'Inicio', to: '/dashboard' },
  { name: 'Recomendados', to: '/recommendations' }
]

const navigation = computed(() => {
  const items = [...baseNavigation]
  // show 'Sobre Nosotros' a la derecha de 'Recomendados' solo si hay token (usuario logueado)
  if (getToken()) {
    items.push({ name: 'Sobre Nosotros', to: '/about' })
  }
  return items
})

import { useRouter, useRoute } from 'vue-router'

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

// hide header on scroll down, show on scroll up
const hiddenHeader = ref(false)
let lastY = 0
let ticking = false

function onScroll() {
  if (typeof window === 'undefined') return
  const y = window.scrollY || window.pageYOffset
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY
      // small threshold to avoid flicker
      if (Math.abs(delta) > 8) {
        if (delta > 0 && y > 80) {
          hiddenHeader.value = true
        } else if (delta < 0) {
          hiddenHeader.value = false
        }
      }
      lastY = y
      ticking = false
    })
    ticking = true
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  lastY = window.scrollY || window.pageYOffset
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', onScroll)
})
</script>