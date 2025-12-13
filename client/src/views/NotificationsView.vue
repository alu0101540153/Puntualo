<template>
  <div class="min-h-screen bg-gradient-dark">
    <DashboardHeader />
    <div class="container mx-auto px-3 sm:px-4 max-w-5xl py-6 sm:py-8">
      <!-- Header con diseño mejorado -->
      <div class="bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 mb-6 sm:mb-8 text-white">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center gap-3 sm:gap-4">
            <div class="bg-white/20 backdrop-blur-sm p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex-shrink-0">
              <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </div>
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-extrabold">Notificaciones</h1>
              <p class="text-white/90 mt-1 flex items-center gap-2 text-sm sm:text-base">
                <span v-if="unreadCount > 0" class="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 bg-white text-primary-600 rounded-full text-xs font-bold flex-shrink-0">
                  {{ unreadCount }}
                </span>
                {{ unreadCount > 0 ? `${unreadCount} ${unreadCount === 1 ? 'sin leer' : 'sin leer'}` : '✨ Todo al día' }}
              </p>
            </div>
          </div>
          <button
            v-if="notifications.length > 0 && unreadCount > 0"
            @click="markAllAsRead"
            class="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 bg-white text-primary-600 rounded-full sm:rounded-xl hover:bg-white/90 transition-all duration-300 font-extrabold shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base whitespace-nowrap"
          >
            ✓ Marcar todas como leídas
          </button>
        </div>
      </div>

      <!-- Loading con animación mejorada -->
      <div v-if="loading" class="bg-dark-800/60 backdrop-blur-sm rounded-3xl shadow-cinema p-16 text-center border border-primary-500/20">
        <div class="relative">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-dark-700 border-t-primary-500 mx-auto"></div>
          <div class="animate-ping absolute inset-0 rounded-full h-16 w-16 border-4 border-primary-500 opacity-20 mx-auto"></div>
        </div>
        <p class="text-gray-300 mt-6 text-lg font-medium">Cargando notificaciones...</p>
      </div>

      <!-- Empty State mejorado -->
      <div v-else-if="notifications.length === 0" class="bg-dark-800/60 backdrop-blur-sm rounded-3xl shadow-cinema p-16 text-center border border-primary-500/20">
        <div class="bg-gradient-to-br from-primary-500/20 to-accent-500/20 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg class="w-16 h-16 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
        </div>
        <h3 class="text-2xl font-bold text-white mb-2">No tienes notificaciones</h3>
        <p class="text-gray-400 text-lg">Cuando alguien te envíe una solicitud de seguimiento, aparecerá aquí</p>
      </div>

      <!-- Notifications List con diseño mejorado -->
      <div v-else class="space-y-3 sm:space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification._id"
          class="group bg-gradient-to-br from-dark-800/80 to-black/60 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2"
          :class="{ 
            'border-primary-500/40 shadow-glow': !notification.read,
            'border-primary-500/10': notification.read
          }"
        >
          <div class="p-4 sm:p-6">
            <div class="flex items-start gap-3 sm:gap-4">
              <!-- Avatar mejorado -->
              <router-link
                v-if="notification.sender"
                :to="{ path: '/profile', query: { userId: notification.sender._id } }"
                class="flex-shrink-0 relative"
              >
                <div
                  class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg ring-2 ring-primary-500/30 transform transition-transform group-hover:scale-110"
                  :style="{ backgroundColor: notification.sender.avatarBgColor || '#9CA3AF' }"
                >
                  {{ notification.sender.name.charAt(0).toUpperCase() }}
                </div>
                <div v-if="!notification.read" class="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-primary-500 rounded-full border-2 border-dark-900 shadow-lg animate-pulse"></div>
              </router-link>
              <div v-else class="flex-shrink-0">
                <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
                  <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                  </svg>
                </div>
              </div>

              <!-- Content mejorado -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2 sm:gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-white font-bold text-base sm:text-lg leading-snug">
                      {{ notification.message }}
                    </p>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-2">
                      <p v-if="notification.sender" class="text-xs sm:text-sm text-primary-400 font-semibold truncate">
                        @{{ notification.sender.handle }}
                      </p>
                      <span class="hidden sm:inline text-gray-600">•</span>
                      <p class="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {{ formatDate(notification.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <button
                    @click="deleteNotif(notification._id)"
                    class="flex-shrink-0 text-gray-500 hover:text-red-500 transition-colors p-1.5 sm:p-2 rounded-lg hover:bg-red-500/10"
                    title="Eliminar notificación"
                  >
                    <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>

                <!-- Actions para follow requests -->
                <div
                  v-if="notification.type === 'follow_request' && notification.sender"
                  class="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-5"
                >
                  <button
                    @click="acceptRequest(notification)"
                    class="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-black rounded-full sm:rounded-xl hover:brightness-110 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    ✓ Aceptar
                  </button>
                  <button
                    @click="rejectRequest(notification)"
                    class="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full sm:rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg text-sm sm:text-base"
                  >
                    ✕ Rechazar
                  </button>
                  <router-link
                    :to="{ path: '/profile', query: { userId: notification.sender._id } }"
                    class="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-2.5 bg-slate-700/80 border border-slate-600 text-white rounded-full sm:rounded-xl hover:bg-slate-600 transition-all duration-300 font-extrabold shadow-md hover:shadow-lg text-sm sm:text-base text-center"
                  >
                    👤 Ver perfil
                  </router-link>
                </div>

                <!-- Mark as read button mejorado -->
                <button
                  v-if="!notification.read"
                  @click="markAsRead(notification._id)"
                  class="mt-3 sm:mt-4 text-xs sm:text-sm text-primary-400 hover:text-primary-300 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
