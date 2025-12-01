<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <DashboardHeader />
    <div class="container mx-auto px-4 max-w-5xl py-8">
      <!-- Header con diseño mejorado -->
      <div class="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl shadow-2xl p-8 mb-8 text-white">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <div class="flex items-center gap-4">
            <div class="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-3xl font-bold">Notificaciones</h1>
              <p class="text-emerald-100 mt-1 flex items-center gap-2">
                <span v-if="unreadCount > 0" class="inline-flex items-center justify-center w-6 h-6 bg-white text-emerald-600 rounded-full text-xs font-bold">
                  {{ unreadCount }}
                </span>
                {{ unreadCount > 0 ? `${unreadCount} ${unreadCount === 1 ? 'sin leer' : 'sin leer'}` : '✨ Todo al día' }}
              </p>
            </div>
          </div>
          <button
            v-if="notifications.length > 0 && unreadCount > 0"
            @click="markAllAsRead"
            class="px-6 py-3 bg-white text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            ✓ Marcar todas como leídas
          </button>
        </div>
      </div>

      <!-- Loading con animación mejorada -->
      <div v-if="loading" class="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-gray-700">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-emerald-500 mx-auto"></div>
          <div class="animate-ping absolute inset-0 rounded-full h-16 w-16 border-4 border-emerald-500 opacity-20 mx-auto"></div>
        </div>
        <p class="text-gray-300 mt-6 text-lg font-medium">Cargando notificaciones...</p>
      </div>

      <!-- Empty State mejorado -->
      <div v-else-if="notifications.length === 0" class="bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 text-center border border-gray-700">
        <div class="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-16 h-16 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">No tienes notificaciones</h3>
        <p class="text-gray-400 text-lg">Cuando alguien te envíe una solicitud de seguimiento, aparecerá aquí</p>
      </div>

      <!-- Notifications List con diseño mejorado -->
      <div v-else class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification._id"
          class="group bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-700"
          :class="{ 
            'ring-2 ring-emerald-500 ring-offset-2 ring-offset-gray-900': !notification.read
          }"
        >
          <div class="p-6">
            <div class="flex items-start gap-4">
              <!-- Avatar mejorado -->
              <router-link
                v-if="notification.sender"
                :to="{ path: '/profile', query: { userId: notification.sender._id } }"
                class="flex-shrink-0 relative"
              >
                <div
                  class="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg ring-4 ring-gray-700 transform transition-transform group-hover:scale-110"
                  :style="{ backgroundColor: notification.sender.avatarBgColor || '#9CA3AF' }"
                >
                  {{ notification.sender.name.charAt(0).toUpperCase() }}
                </div>
                <div v-if="!notification.read" class="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-800"></div>
              </router-link>
              <div v-else class="flex-shrink-0">
                <div class="w-14 h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
                  <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
              </div>

              <!-- Content mejorado -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <p class="text-white font-semibold text-lg leading-snug">
                      {{ notification.message }}
                    </p>
                    <div class="flex items-center gap-3 mt-2">
                      <p v-if="notification.sender" class="text-sm text-emerald-400 font-medium">
                        @{{ notification.sender.handle }}
                      </p>
                      <span class="text-gray-600">•</span>
                      <p class="text-sm text-gray-400 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {{ formatDate(notification.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="deleteNotif(notification._id)"
                    class="text-gray-500 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                    title="Eliminar notificación"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <!-- Actions para follow requests -->
                <div
                  v-if="notification.type === 'follow_request' && notification.sender"
                  class="flex flex-wrap gap-3 mt-5"
                >
                  <button
                    @click="acceptRequest(notification)"
                    class="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    @click="rejectRequest(notification)"
                    class="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    ✕ Rechazar
                  </button>
                  <router-link
                    :to="{ path: '/profile', query: { userId: notification.sender._id } }"
                    class="px-5 py-2.5 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    👤 Ver perfil
                  </router-link>
                </div>

                <!-- Mark as read button mejorado -->
                <button
                  v-if="!notification.read"
                  @click="markAsRead(notification._id)"
                  class="mt-4 text-sm text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  Marcar como leída
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import DashboardHeader from '@/components/dashboard/DashboardHeader.vue'
import {
  getAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  type Notification
} from '../services/notification'
import { acceptFollowRequest, rejectFollowRequest } from '../services/followRequest'
import { success, error } from '../services/notify'

const router = useRouter()
const notifications = ref<Notification[]>([])
const loading = ref(true)

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

async function loadNotifications() {
  try {
    loading.value = true
    notifications.value = await getAllNotifications()
  } catch (err: any) {
    error(err.message || 'Error al cargar notificaciones')
  } finally {
    loading.value = false
  }
}

async function markAsRead(notificationId: string) {
  try {
    await markNotificationAsRead(notificationId)
    const notif = notifications.value.find(n => n._id === notificationId)
    if (notif) {
      notif.read = true
    }
  } catch (err: any) {
    error(err.message || 'Error al marcar como leída')
  }
}

async function markAllAsRead() {
  try {
    await markAllNotificationsAsRead()
    notifications.value.forEach(n => {
      n.read = true
    })
    success('Todas las notificaciones marcadas como leídas')
  } catch (err: any) {
    error(err.message || 'Error al marcar como leídas')
  }
}

async function deleteNotif(notificationId: string) {
  try {
    await deleteNotification(notificationId)
    notifications.value = notifications.value.filter(n => n._id !== notificationId)
    success('Notificación eliminada')
  } catch (err: any) {
    error(err.message || 'Error al eliminar notificación')
  }
}

async function acceptRequest(notification: Notification) {
  if (!notification.relatedId) return
  
  try {
    await acceptFollowRequest(notification.relatedId)
    // Eliminar la notificación de "quiere seguirte"
    await deleteNotif(notification._id)
    success(`Solicitud aceptada`)
    // Recargar notificaciones para ver la nueva de "ha empezado a seguirte"
    await loadNotifications()
  } catch (err: any) {
    console.error('Error completo:', err)
    error(err.message || 'Error al aceptar solicitud')
  }
}

async function rejectRequest(notification: Notification) {
  if (!notification.relatedId) return
  
  try {
    await rejectFollowRequest(notification.relatedId)
    success('Solicitud rechazada')
    // Mark as read and remove from list
    await deleteNotif(notification._id)
  } catch (err: any) {
    error(err.message || 'Error al rechazar solicitud')
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Ahora mismo'
  if (diffMins < 60) return `Hace ${diffMins} min`
  if (diffHours < 24) return `Hace ${diffHours}h`
  if (diffDays < 7) return `Hace ${diffDays}d`
  
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

onMounted(() => {
  loadNotifications()
})
</script>
