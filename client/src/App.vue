<template>
  <RouterView />
  <Footer />
  <Notification />
</template>

<script setup lang="ts">
// App.vue envuelve el RouterView en `.container` para mantener un ancho consistente entre páginas
import Notification from './components/Notification.vue'
import Footer from './components/Footer.vue'
import { getUser } from './services/auth'

// Update user when localStorage changes (login/logout in other tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'user' || e.key === 'token') {
    const user = getUser()
  }
})
</script>


