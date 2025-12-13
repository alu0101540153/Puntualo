<template>
  <header :class="[
    'fixed top-0 left-0 right-0 w-full z-50 bg-black bg-opacity-30 backdrop-blur-md border-b border-white/10 transform transition-transform duration-300',
    hiddenHeader ? '-translate-y-full' : 'translate-y-0'
  ]">
    <div class="max-w-7xl mx-auto w-full px-4 md:px-12 h-16 flex items-center justify-between">
      <!-- Logo visible en escritorio -->
      <router-link to="/" class="hidden md:flex items-center" aria-label="Ir al inicio">
        <img src="/Logo_white.svg" alt="Puntúalo" class="h-8" />
      </router-link>

      <!-- Logo y menú hamburguesa en móvil -->
      <div class="flex md:hidden items-center gap-3 flex-1">
        <button 
          @click="toggleMobileMenu" 
          class="text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Abrir menú de navegación"
        >
          <svg v-if="!isMobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <router-link to="/" class="flex items-center" aria-label="Ir al inicio">
          <img src="/Logo_white.svg" alt="Puntúalo" class="h-7" />
        </router-link>
      </div>

      <!-- Navegación desktop -->
      <div class="hidden md:flex items-center gap-4">
        <nav class="flex items-center gap-4 mr-4">
          <a href="/" @click.prevent="goHome" class="text-white hover:underline font-medium">Inicio</a>
          <a href="/#about-us" @click.prevent="scrollToAbout" class="text-white hover:underline font-medium">Sobre nosotros</a>
        </nav>
        <RouterLink to="/login" class="btn-login px-6 py-2 border-2 border-white rounded-full text-white font-semibold text-sm uppercase tracking-wider transition-transform duration-200 hover:bg-white hover:text-gray-800 hover:-translate-y-0.5 shadow-md">
          Iniciar sesión
        </RouterLink>
        <RouterLink to="/register" class="btn-signin px-6 py-2 bg-primary-400 text-black rounded-full font-semibold text-sm uppercase tracking-wider transition-transform duration-200 hover:bg-primary-500 hover:text-white hover:-translate-y-0.5 shadow-md">
          Registrarse
        </RouterLink>
      </div>

      <!-- Botones compactos en móvil -->
      <div class="flex md:hidden items-center gap-2">
        <RouterLink to="/login" class="btn-login px-4 py-1.5 border-2 border-white rounded-full text-white font-semibold text-xs uppercase tracking-wide transition-transform duration-200 hover:bg-white hover:text-gray-800 text-center flex items-center justify-center">
          Entrar
        </RouterLink>
      </div>
    </div>

    <!-- Menú móvil desplegable -->
    <Transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="md:hidden bg-black bg-opacity-95 backdrop-blur-md border-t border-white/10">
        <nav class="flex flex-col py-4 px-6 gap-3">
          <a href="/" @click.prevent="goHomeAndClose" class="text-white hover:text-primary-400 font-medium py-2 transition-colors border-b border-white/10">
            Inicio
          </a>
          <a href="/#about-us" @click.prevent="scrollToAboutAndClose" class="text-white hover:text-primary-400 font-medium py-2 transition-colors border-b border-white/10">
            Sobre nosotros
          </a>
          <RouterLink to="/login" @click="closeMobileMenu" class="text-white hover:text-primary-400 font-medium py-2 transition-colors border-b border-white/10">
            Iniciar sesión
          </RouterLink>
          <RouterLink to="/register" @click="closeMobileMenu" class="bg-primary-400 text-black rounded-lg font-semibold text-sm uppercase tracking-wide px-6 py-3 mt-2 text-center hover:bg-primary-500 hover:text-white transition-colors">
            Registrarse
          </RouterLink>
        </nav>
      </div>
    </Transition>
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

// Estado del menú móvil
const isMobileMenuOpen = ref(false)

const router = useRouter()
const route = useRoute()

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}

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

async function scrollToAboutAndClose() {
  closeMobileMenu()
  await scrollToAbout()
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

async function goHomeAndClose() {
  closeMobileMenu()
  await goHome()
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
          // Cerrar menú móvil al hacer scroll hacia abajo
          if (isMobileMenuOpen.value) {
            isMobileMenuOpen.value = false
          }
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

<style scoped>
/* Animación para el menú desplegable */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>