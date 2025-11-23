<template>
  <!-- Usar el mismo fondo que HomeView -->
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <!-- Centered card (Spotify-like) - compact like Spotify login -->
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <RouterLink to="/">
          <img src="/Logo_white.svg" alt="Puntúalo" class="h-20 mb-6" />
        </RouterLink>
      </div>

      <div class="flex flex-col mb-8" style="row-gap: clamp(16px,3vw,32px); margin-bottom:24px;">
        <Input v-model="email" type="email" placeholder="Correo electrónico" />
        <Input v-model="password" type="password" placeholder="Contraseña" />
      </div>

      <div class="w-full flex flex-col items-center gap-4">
        <Button @click="login" :disabled="loading" size="lg" class="w-full">
          {{ loading ? 'CARGANDO...' : 'INICIAR SESIÓN' }}
        </Button>

        <div class="text-center mt-4 w-full">
          <span class="text-sm text-gray-300">¿No tienes cuenta?</span>
          <RouterLink to="/register" class="ml-2 text-emerald-400 font-semibold">Regístrate</RouterLink>
        </div>

        <div v-if="error" class="text-center mt-2" style="color:#ff9b9b">{{ error }}</div>
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
    // api.apiFetch throws Error with message possibly JSON
    const raw = err?.message || 'Error en el inicio de sesión'
    try {
      const parsed = JSON.parse(raw)
      // parsed can be { message } or { errors }
      if (parsed?.message) error.value = parsed.message
      else if (Array.isArray(parsed)) error.value = parsed.map((e: any) => e.message || e).join(', ')
      else if (parsed?.errors) error.value = (parsed.errors.map ? parsed.errors.map((e: any) => e.message).join(', ') : String(parsed.errors))
      else error.value = String(parsed)
    } catch (e) {
      error.value = raw
    }
  } finally {
    loading.value = false
  }
}
</script>