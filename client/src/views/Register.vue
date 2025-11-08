<template>
  <div class="min-h-screen bg-gradient-to-b from-gray-700 to-gray-300 flex items-center justify-center p-8">
    <Card>
      <div class="flex flex-col items-center mb-8" style="text-align:center">
        <h1 class="text-2xl md:text-3xl lg:text-4xl font-bold" style="color: #ffffff;">Puntualo</h1>
        <p class="text-sm mt-1" style="color: #c7c7c7">Crea tu cuenta en Puntualo.com</p>
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
        <Button @click="register" :disabled="showEmailError">CREAR CUENTA</Button>
      </div>

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

const router = useRouter()
const username = ref('')
const fullName = ref('')
const email = ref('')
const password = ref('')

const isEmailValid = computed(() => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email.value))
})

const showEmailError = computed(() => !!email.value && !isEmailValid.value)

const emailClass = computed(() => (showEmailError.value ? 'border border-red-500 rounded' : ''))

const register = () => {
  if (showEmailError.value) return
  console.log('Register:', fullName.value, username.value, email.value, password.value)
}
</script>