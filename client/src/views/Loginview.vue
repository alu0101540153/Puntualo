<template>
  <!-- Usar el mismo fondo que HomeView -->
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <!-- Centered card (Spotify-like) - compact like Spotify login -->
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <img src="/Logo_white.svg" alt="Puntúalo" class="h-20 mb-6" />
      </div>

      <div class="flex flex-col mb-8" style="row-gap: clamp(16px,3vw,32px); margin-bottom:24px;">
        <Input v-model="email" type="email" placeholder="Correo electrónico" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
      </div>

      <Button @click="login" :disabled="loading">{{ loading ? 'CARGANDO...' : 'INICIAR SESIÓN' }}</Button>

      <div v-if="error" class="text-center mt-4" style="color:#ff9b9b">{{ error }}</div>

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
import { loginUser, saveAuth } from '@/services/auth'

const router = useRouter()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const login = async () => {
  error.value = null
  loading.value = true
  try {
    const res = await loginUser({ email: email.value, password: password.value })
    if (res?.token) {
      saveAuth(res.user, res.token)
      router.push('/dashboard')
    }
  } catch (err: any) {
    error.value = err?.message || 'Error en el inicio de sesión'
  } finally {
    loading.value = false
  }
}
</script>