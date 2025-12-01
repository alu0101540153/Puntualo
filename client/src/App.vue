<template>
  <RouterView />
  <Footer />
  <Notification />
  <ChatBot v-if="isLogged" />
</template>

<script setup lang="ts">
// App.vue envuelve el RouterView en `.container` para mantener un ancho consistente entre páginas
import Notification from './components/Notification.vue'
import Footer from './components/Footer.vue'
import { ref, computed } from 'vue'
import ChatBot from './components/ui/ChatBot.vue'
import { getUser } from './services/auth'

const user = ref(getUser())
const isLogged = computed(() => !!user.value)
// Update user when localStorage changes (login/logout in other tabs)
window.addEventListener('storage', (e) => {
  if (e.key === 'user' || e.key === 'token') {
    user.value = getUser()
  }
})
</script>


