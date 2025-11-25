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
  avatarBgColor: ''
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
  form.avatarBgColor = u.avatarBgColor || u.avatarBg || ''
})

const palette = ['#EF4444','#F97316','#F59E0B','#FACC15','#10B981','#06B6D4','#3B82F6','#6366F1','#8B5CF6','#EC4899','#9CA3AF']

function selectColor(c: string) {
  form.avatarBgColor = c
}

async function onSubmit() {
  try {
    // El backend actual acepta PATCH /users/:id y ahora también soporta avatar en field 'avatar'
    const id = currentUser.value?._id || currentUser.value?.id
    if (!id) throw new Error('Usuario no identificado')

    const payload = {
      name: form.name,
      handle: form.username,
      description: form.bio || '',
      avatarBgColor: form.avatarBgColor || undefined
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
