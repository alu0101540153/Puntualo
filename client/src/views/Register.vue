<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <img src="/Logo_white.svg" alt="Puntúalo" class="h-20 mb-6" />
      </div>

      <div class="flex flex-col mb-8" style="row-gap: clamp(16px,3vw,32px);">
        <Input v-model="fullName" placeholder="Nombre completo" />
        <Input v-model="username" placeholder="Nombre de usuario" />
        <div>
          <Input v-model="email" type="email" placeholder="Correo electrónico" :class="emailClass" />
          <p v-if="showEmailError" class="text-sm" style="color:#ff9b9b; margin-top:8px">Introduce un correo válido</p>
        </div>
        <Input v-model="password" type="password" placeholder="Contraseña" />
      </div>

      <div style="margin-top:18px">
        <Button @click="register" :disabled="showEmailError || loading">{{ loading ? 'CREANDO...' : 'CREAR CUENTA' }}</Button>
      </div>

      <div v-if="error" class="text-center mt-4" style="color:#ff9b9b">{{ error }}</div>

      <div class="text-center" style="margin-top:20px">
        <span style="color:#c7c7c7;margin-right:8px">¿Ya tienes cuenta?</span>
        <RouterLink to="/login" style="color:#1DB954;font-weight:600;">Inicia sesión</RouterLink>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import { registerUser, saveAuth } from '@/services/auth'

const router = useRouter()
const username = ref('')
const fullName = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)

const isEmailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email.value))
})

const showEmailError = computed(() => !!email.value && !isEmailValid.value)

const emailClass = computed(() => (showEmailError.value ? 'border border-red-500 rounded' : ''))

const register = async () => {
  error.value = null
  if (showEmailError.value) return
  loading.value = true
  try {
    // map fields to backend shape: name, handle, email, password
    const payload = {
      name: fullName.value,
      handle: username.value,
      email: email.value,
      password: password.value
    }
    const res = await registerUser(payload)
    // backend returns { user, token }
    if (res?.token) {
      saveAuth(res.user, res.token)
      // Redirect a dashboard o inicio
      router.push('/dashboard')
    } else {
      router.push('/login')
    }
  } catch (err: any) {
    error.value = err?.message || 'Error al registrar'
  } finally {
    loading.value = false
  }
}
</script>