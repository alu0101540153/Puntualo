<template>
  <!-- Usar el mismo fondo que HomeView -->
  <div class="min-h-screen bg-gradient-dark flex items-center justify-center p-8">
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
          <RouterLink to="/register" class="ml-2 text-primary-400 font-semibold">Regístrate</RouterLink>
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
    // api.apiFetch throws Error with message = JSON.stringify({ status, body }) for non-ok responses
    const raw = err?.message || 'Error en el inicio de sesión'
    let parsed: any = null
    try {
      parsed = JSON.parse(raw)
    } catch (e) {
      parsed = null
    }

    const extractMessage = (p: any): string => {
      if (!p) return raw
      if (typeof p === 'string') return p
      // common shapes: { message: '...' } or { status: 401, body: { message: '...' } }
      if (p.message && typeof p.message === 'string') return p.message
      if (p.body) return extractMessage(p.body)
      if (Array.isArray(p)) return p.map((e: any) => (e && e.message) ? e.message : String(e)).join(', ')
      if (p.errors && Array.isArray(p.errors)) return p.errors.map((e: any) => e.message || String(e)).join(', ')
      // fallback to stringify a simple value, avoid [object Object]
      try {
        return JSON.stringify(p)
      } catch (e) {
        return String(p)
      }
    }

    error.value = extractMessage(parsed)
  } finally {
    loading.value = false
  }
}
</script>