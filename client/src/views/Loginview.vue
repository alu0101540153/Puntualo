<template>
  <!-- Usar el mismo fondo que HomeView -->
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <!-- Centered card (Spotify-like) - compact like Spotify login -->
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold" style="color: #ffffff;">Puntualo</h1>
        <p class="text-sm mt-1" style="color: #c7c7c7">Inicia sesión en Puntualo.com</p>
      </div>

      <div class="flex flex-col mb-8" style="row-gap: clamp(16px,3vw,32px); margin-bottom:24px;">
        <Input v-model="username" placeholder="Usuario" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
      </div>

      <Button @click="login">INICIAR SESIÓN</Button>

      <div class="text-center" style="margin-top:20px">
        <span style="color:#c7c7c7;margin-right:8px">¿No tienes cuenta?</span>
        <RouterLink to="/register" style="color:#1DB954;font-weight:600;">Regístrate</RouterLink>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'

const router = useRouter()
const username = ref('')
const password = ref('')

const login = () => {
  console.log('Login', username.value, password.value)
  // placeholder: no backend integration per request
}
</script>