<template>
  <header :class="[
    'fixed top-0 left-0 right-0 w-full z-50 bg-black bg-opacity-30 backdrop-blur-md border-b border-white/10 transform transition-transform duration-300',
    hiddenHeader ? '-translate-y-full' : 'translate-y-0'
  ]">
    <div class="max-w-7xl mx-auto w-full px-4 md:px-12 h-16 flex items-center justify-between">
      <router-link to="/" class="flex items-center" aria-label="Ir al inicio">
        <img src="/Logo_white.svg" alt="Puntúalo" class="h-8" />
      </router-link>

      <div class="flex items-center gap-4">
        <nav class="hidden md:flex items-center gap-4 mr-4">
          <a href="/" @click.prevent="goHome" class="text-white hover:underline font-medium">Inicio</a>
          <a href="/#about-us" @click.prevent="scrollToAbout" class="text-white hover:underline font-medium">Sobre nosotros</a>
        </nav>
        <RouterLink to="/login" class="btn-login px-6 py-2 border-2 border-white rounded-full text-white font-semibold text-sm uppercase tracking-wider transition-transform duration-200 hover:bg-white hover:text-gray-800 hover:-translate-y-0.5 shadow-md">
          Iniciar sesión
        </RouterLink>
        <RouterLink to="/register" class="btn-signin px-6 py-2 bg-emerald-400 text-black rounded-full font-semibold text-sm uppercase tracking-wider transition-transform duration-200 hover:bg-emerald-500 hover:text-white hover:-translate-y-0.5 shadow-md">
          Registrarse
        </RouterLink>
      </div>
    </div>
  </header>

  <!-- Spacer para que el contenido no quede oculto bajo el header fijo -->
  <div class="h-16" aria-hidden="true"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { nextTick } from 'vue'

// hide header on scroll down, show on scroll up (same behavior as DashboardHeader)
const hiddenHeader = ref(false)
let lastY = 0
let ticking = false

const router = useRouter()
const route = useRoute()

async function scrollToAbout() {
  // If not on home route, navigate first, then scroll
  if (route.path !== '/') {
    await router.push({ path: '/', hash: '#about-us' })
    // small delay to ensure DOM is rendered
    await nextTick()
    setTimeout(() => {
      const el = document.getElementById('about-us')
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  } else {
    const el = document.getElementById('about-us')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

async function goHome() {
  if (route.path !== '/') {
    await router.push({ path: '/' })
    await nextTick()
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 50)
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function onScroll() {
  if (typeof window === 'undefined') return
  const y = window.scrollY || window.pageYOffset
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const delta = y - lastY
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