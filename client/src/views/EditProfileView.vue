<template>
  <div class="min-h-screen px-4 py-8">
    <DashboardHeader />

    <main class="max-w-3xl mx-auto bg-white/5 rounded-xl p-6 mt-6 text-white">
      <h2 class="text-2xl font-bold mb-4">Editar perfil</h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
                    <div class="flex items-center gap-4">
                      <Avatar :user="{ avatarBgColor: form.avatarBgColor }" size="xl" extraClass="flex-shrink-0" :initials="initial" />
                      <div class="flex flex-col">
                        <div class="text-sm text-gray-300">Color fondo avatar</div>
                        <div class="flex items-center gap-2 mt-2">
                          <template v-for="c in palette" :key="c">
                            <button type="button" @click="() => selectColor(c)" :style="{ backgroundColor: c }" :class="['w-8 h-8 rounded', (form.avatarBgColor === c) ? 'ring-2 ring-white' : 'ring-1 ring-black/20']" aria-hidden="true"></button>
                          </template>
                          <input type="color" v-model="form.avatarBgColor" class="w-10 h-8 p-0 border-none bg-transparent" />
                        </div>
                      </div>
                    </div>

        <div>
          <label class="block text-sm text-gray-300">Nombre completo</label>
          <input v-model="form.name" type="text" class="w-full mt-2 p-2 rounded bg-white/6 text-gray-900 placeholder-gray-500" />
        </div>

        <div>
          <label class="block text-sm text-gray-300">Nombre de usuario (handle)</label>
          <input v-model="form.username" type="text" class="w-full mt-2 p-2 rounded bg-white/6 text-gray-900 placeholder-gray-500" />
        </div>

        <div>
          <label class="block text-sm text-gray-300">Email</label>
          <input v-model="form.email" type="email" class="w-full mt-2 p-2 rounded bg-white/6 text-gray-900 placeholder-gray-500" disabled />
        </div>

        <div>
          <label class="block text-sm text-gray-300">Bio (description)</label>
          <textarea v-model="form.bio" rows="3" class="w-full mt-2 p-2 rounded bg-white/6 text-gray-900 placeholder-gray-500"></textarea>
        </div>

        <!-- Privacidad de la cuenta -->
        <div class="bg-white/10 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div class="flex-1 mr-4">
              <label class="block text-base font-semibold text-white mb-1">Cuenta privada</label>
              <p class="text-sm text-gray-100">
                Cuando tu cuenta es privada, solo las personas que apruebas pueden ver tu contenido
              </p>
            </div>
            <button
              type="button"
              @click="form.isPrivate = !form.isPrivate"
              :class="[
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0',
                form.isPrivate ? 'bg-emerald-500' : 'bg-gray-400'
              ]"
            >
              <span
                :class="[
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  form.isPrivate ? 'translate-x-6' : 'translate-x-1'
                ]"
              />
            </button>
          </div>
        </div>

        <!-- Cambiar contraseña -->
        <div class="bg-white/10 rounded-lg overflow-hidden">
          <button
            type="button"
            @click="showPasswordForm = !showPasswordForm"
            class="w-full px-4 py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div>
              <h3 class="text-base font-semibold text-white">Cambiar contraseña</h3>
              <p class="text-sm text-gray-300 mt-1">
                Actualiza tu contraseña de acceso
              </p>
            </div>
            <svg
              :class="['w-5 h-5 text-gray-400 transition-transform', showPasswordForm ? 'rotate-180' : '']"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <transition
            enter-active-class="transition-all duration-300 ease-out"
            leave-active-class="transition-all duration-200 ease-in"
            enter-from-class="opacity-0 max-h-0"
            enter-to-class="opacity-100 max-h-[600px]"
            leave-from-class="opacity-100 max-h-[600px]"
            leave-to-class="opacity-0 max-h-0"
          >
            <div
              v-show="showPasswordForm"
              class="px-4 pb-4 space-y-4 border-t border-white/10 overflow-hidden"
            >
            <p class="text-sm text-gray-200 mt-4">
              Introduce tu contraseña actual y la nueva contraseña
            </p>
            
            <div>
              <label class="block text-sm text-gray-300">Contraseña actual</label>
              <input 
                v-model="passwordForm.currentPassword" 
                type="password" 
                class="w-full mt-2 p-2 rounded bg-white/6 text-black placeholder-gray-500"
                placeholder="Introduce tu contraseña actual"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-300">Nueva contraseña</label>
              <input 
                v-model="passwordForm.newPassword" 
                type="password" 
                class="w-full mt-2 p-2 rounded bg-white/6 text-black placeholder-gray-500"
                placeholder="Introduce tu nueva contraseña"
              />
            </div>

            <div>
              <label class="block text-sm text-gray-300">Confirmar nueva contraseña</label>
              <input 
                v-model="passwordForm.confirmPassword" 
                type="password" 
                class="w-full mt-2 p-2 rounded bg-white/6 text-black placeholder-gray-500"
                placeholder="Confirma tu nueva contraseña"
              />
            </div>

            <div v-if="passwordError" class="text-red-400 text-sm bg-red-900/20 p-3 rounded">
              {{ passwordError }}
            </div>
            <div v-if="passwordSuccess" class="text-emerald-400 text-sm bg-emerald-900/20 p-3 rounded">
              {{ passwordSuccess }}
            </div>
          </div>
          </transition>
        </div>

        <div class="flex gap-3 justify-end">
          <button type="button" @click="onCancel" class="px-4 py-2 bg-white/10 rounded">Cancelar</button>
          <button type="submit" class="px-4 py-2 bg-emerald-500 rounded">Guardar cambios</button>
        </div>
      </form>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import { getUser, saveAuth } from '@/services/auth'
import { updateUser } from '@/services/user'
import { useRouter } from 'vue-router'
import Avatar from '@/components/Avatar.vue'

const router = useRouter()
// cargaremos el usuario en onMounted para asegurar que leemos la última versión desde localStorage
const currentUser = ref<any | null>(null)

const form = reactive({
  name: '',
  username: '',
  email: '',
  bio: '',
  avatarBgColor: '',
  isPrivate: false
})

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const passwordError = ref('')
const passwordSuccess = ref('')
const showPasswordForm = ref(false)

// helper para normalizar distintos shapes que pueda tener "user" en localStorage/backend
function resolveUser(raw: any) {
  if (!raw) return null
  // si la respuesta viene envuelta { user: {...} }
  if (raw.user) return raw.user
  // si viene en data
  if (raw.data && raw.data.user) return raw.data.user
  // si ya es el objeto usuario
  return raw
}

const initial = computed(() => {
  const n = form.name || form.username || form.email || 'U'
  return String(n).charAt(0).toUpperCase()
})

onMounted(() => {
  const u = resolveUser(getUser()) || {}
  currentUser.value = u
  // mapear campos comunes (name, fullName, handle, username, email, bio, avatar/image)
  form.name = u.name || u.fullName || ''
  form.username = u.username || u.handle || ''
  form.email = u.email || ''
  form.bio = u.bio || u.description || ''
  form.avatarBgColor = u.avatarBgColor || u.avatarBg || ''
  form.isPrivate = u.isPrivate || false
})

const palette = ['#EF4444','#F97316','#F59E0B','#FACC15','#10B981','#06B6D4','#3B82F6','#6366F1','#8B5CF6','#EC4899','#9CA3AF']

function selectColor(c: string) {
  form.avatarBgColor = c
}

async function onSubmit() {
  try {
    passwordError.value = ''
    passwordSuccess.value = ''

    // Validar cambio de contraseña si se proporcionaron datos
    if (passwordForm.currentPassword || passwordForm.newPassword || passwordForm.confirmPassword) {
      if (!passwordForm.currentPassword) {
        passwordError.value = 'Debes introducir tu contraseña actual'
        return
      }
      if (!passwordForm.newPassword) {
        passwordError.value = 'Debes introducir una nueva contraseña'
        return
      }
      if (passwordForm.newPassword.length < 6) {
        passwordError.value = 'La nueva contraseña debe tener al menos 6 caracteres'
        return
      }
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        passwordError.value = 'Las contraseñas no coinciden'
        return
      }
    }

    // El backend actual acepta PATCH /users/:id y ahora también soporta avatar en field 'avatar'
    const id = currentUser.value?._id || currentUser.value?.id
    if (!id) throw new Error('Usuario no identificado')

    const payload: any = {
      name: form.name,
      handle: form.username,
      description: form.bio || '',
      avatarBgColor: form.avatarBgColor || undefined,
      isPrivate: form.isPrivate
    }

    // Añadir campos de contraseña si se proporcionaron
    if (passwordForm.currentPassword) {
      payload.currentPassword = passwordForm.currentPassword
      payload.newPassword = passwordForm.newPassword
    }

    const data = await updateUser(id, payload)

    // actualizar user en localStorage si backend devuelve el usuario actualizado
    if (data && data.user) {
      saveAuth(data.user, localStorage.getItem('token') || '')
    } else if (data && data._id) {
      // a veces el endpoint devuelve directamente el user
      saveAuth(data, localStorage.getItem('token') || '')
    }

    // Limpiar formulario de contraseña
    if (passwordForm.currentPassword) {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordSuccess.value = 'Contraseña actualizada correctamente'
      
      // Redirigir después de mostrar el mensaje
      setTimeout(() => {
        router.push('/profile')
      }, 1500)
    } else {
      router.push('/profile')
    }
  } catch (e: any) {
    console.error('Error guardando perfil', e)
    
    // Intentar parsear el error que viene como JSON string
    let errorMessage = ''
    try {
      const errorData = JSON.parse(e.message)
      errorMessage = errorData.body?.message || errorData.body || e.message
    } catch {
      errorMessage = e.message
    }

    // Si es un error relacionado con la contraseña, mostrarlo en passwordError
    if (errorMessage && (
      errorMessage.toLowerCase().includes('contraseña') || 
      errorMessage.toLowerCase().includes('password') ||
      errorMessage.toLowerCase().includes('unauthorized')
    )) {
      passwordError.value = errorMessage
    } else {
      alert(errorMessage || 'Error guardando perfil')
    }
  }
}

function onCancel() {
  router.back()
}
</script>

<style scoped>
/* pequeños ajustes si necesarios */
</style>
