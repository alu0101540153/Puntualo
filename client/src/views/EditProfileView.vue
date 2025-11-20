<template>
  <div class="min-h-screen px-4 py-8">
    <DashboardHeader />

    <main class="max-w-3xl mx-auto bg-white/5 rounded-xl p-6 mt-6 text-white">
      <h2 class="text-2xl font-bold mb-4">Editar perfil</h2>

      <form @submit.prevent="onSubmit" class="space-y-4">
              <div class="flex items-center gap-4">
                <div class="w-24 h-24 rounded-full bg-gray-400 overflow-hidden flex items-center justify-center text-3xl font-bold">
                  {{ initial }}
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

const router = useRouter()
// cargaremos el usuario en onMounted para asegurar que leemos la última versión desde localStorage
const currentUser = ref<any | null>(null)

const form = reactive({
  name: '',
  username: '',
  email: '',
  bio: ''
})

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
})

async function onSubmit() {
  try {
    // El backend actual acepta PATCH /users/:id y ahora también soporta avatar en field 'avatar'
    const id = currentUser.value?._id || currentUser.value?.id
    if (!id) throw new Error('Usuario no identificado')

    const payload = {
      name: form.name,
      handle: form.username,
      description: form.bio || ''
    }
    const data = await updateUser(id, payload)

    // actualizar user en localStorage si backend devuelve el usuario actualizado
    if (data && data.user) {
      saveAuth(data.user, localStorage.getItem('token') || '')
    } else if (data && data._id) {
      // a veces el endpoint devuelve directamente el user
      saveAuth(data, localStorage.getItem('token') || '')
    }

    router.push('/profile')
  } catch (e: any) {
    console.error('Error guardando perfil', e)
    alert(e.message || 'Error guardando perfil')
  }
}

function onCancel() {
  router.back()
}
</script>

<style scoped>
/* pequeños ajustes si necesarios */
</style>
