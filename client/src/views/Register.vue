<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <RouterLink to="/">
          <img src="/Logo_white.svg" alt="Puntúalo" class="h-20 mb-6" />
        </RouterLink>
      </div>

      <div class="flex flex-col mb-8" style="row-gap: clamp(16px,3vw,32px);">
        <Input v-model="fullName" placeholder="Nombre completo" />
        <Input v-model="username" placeholder="Nombre de usuario" />
        <div>
          <Input v-model="email" type="email" placeholder="Correo electrónico" :class="emailClass" />
          <p v-if="showEmailError" class="text-sm" style="color:#ff9b9b; margin-top:8px">Introduce un correo válido</p>
          <p v-if="emailFieldError" class="text-sm" style="color:#ff9b9b; margin-top:8px">{{ emailFieldError }}</p>
        </div>
        <Input v-model="password" type="password" placeholder="Contraseña" />
      </div>

      <div class="w-full flex flex-col items-center gap-4" style="margin-top:18px">
        <Button @click="register" :disabled="showEmailError || loading" size="lg" class="w-full">{{ loading ? 'CREANDO...' : 'CREAR CUENTA' }}</Button>

        <div class="text-center mt-4 w-full">
          <span class="text-sm text-gray-300">¿Ya tienes cuenta?</span>
          <RouterLink to="/login" class="ml-2 text-emerald-400 font-semibold">Inicia sesión</RouterLink>
        </div>

        <div v-if="error" class="text-center mt-2" style="color:#ff9b9b">{{ error }}</div>
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
const emailFieldError = ref<string | null>(null)

const isEmailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email.value))
})

const showEmailError = computed(() => !!email.value && !isEmailValid.value)

const emailClass = computed(() => (showEmailError.value ? 'border border-red-500 rounded' : ''))

const register = async () => {
  error.value = null
  emailFieldError.value = null
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
    // Mejor extracción de mensajes de error para distintos formatos
    // Log raw error for debugging in browser console
    // eslint-disable-next-line no-console
    console.error('register error (raw):', err)
    let out = 'Error al registrar'
    try {
      if (err == null) out = 'Error al registrar'
      else if (typeof err === 'string') out = err
      else if (err?.response && err.response.data) {
        // axios-style
        out = err.response.data.message || JSON.stringify(err.response.data)
      } else if (err?.message) {
        const raw = err.message
        try {
          const parsed = JSON.parse(raw)
          // support formats: { message }, { errors }, or { status, body: { message } }
          if (parsed?.message) out = parsed.message
          else if (parsed?.errors) out = Array.isArray(parsed.errors) ? parsed.errors.map((e: any) => e.message).join(', ') : String(parsed.errors)
          else if (parsed?.body && parsed.body.message) out = parsed.body.message
          else if (parsed?.body && parsed?.body.errors) out = Array.isArray(parsed.body.errors) ? parsed.body.errors.map((e: any) => e.message).join(', ') : String(parsed.body.errors)
          else out = String(parsed)
        } catch (e) {
          // If message is '[object Object]' or similar, try stringify the original error
          if (raw === '[object Object]') {
            try { out = JSON.stringify(err) } catch { out = raw }
          } else {
            out = raw
          }
        }
      } else {
        out = String(err)
      }
    } catch (e) {
      out = 'Error al registrar'
    }
    // If the backend included a `field` property, show it near the related input
    try {
      const maybe = typeof out === 'string' ? out : String(out)
      // try to parse original err.message for { field } in several possible shapes
      if (err?.message) {
        try {
          const parsedMsg = JSON.parse(String(err.message))
          // possible shapes: { message, field } or { status, body: { message, field } }
          const field = parsedMsg?.field || parsedMsg?.body?.field
          const msg = parsedMsg?.message || parsedMsg?.body?.message || maybe
          if (field === 'email') {
            emailFieldError.value = msg
          } else {
            error.value = msg
          }
        } catch {
          error.value = maybe
        }
      } else {
        error.value = out
      }
    } catch {
      error.value = out
    }
  } finally {
    loading.value = false
  }
}
</script>