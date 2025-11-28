<template>
  <div class="group cursor-pointer bg-gray-900 bg-opacity-40 rounded-2xl p-5 backdrop-blur-sm border border-gray-500 border-opacity-30 hover:border-opacity-50 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:border-emerald-500 flex flex-col h-full">
    <!-- Header: Usuario y tiempo -->
    <div class="flex items-center gap-3 mb-4">
      <template v-if="activity.friendId">
        <router-link :to="{ name: 'profile', query: { userId: activity.friendId } }" class="flex items-center gap-3 no-underline flex-1 min-w-0">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            :class="activity.friendColor"
            :style="avatarStyle"
          >
            {{ activity.friendInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-white font-semibold block truncate">{{ activity.friendName }}</span>
            <span class="text-gray-400 text-xs">{{ activity.time }}</span>
          </div>
        </router-link>
      </template>
      <template v-else>
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            :class="activity.friendColor"
            :style="avatarStyle"
          >
            {{ activity.friendInitial }}
          </div>
          <div class="flex-1 min-w-0">
            <span class="text-white font-semibold block truncate">{{ activity.friendName }}</span>
            <span class="text-gray-400 text-xs">{{ activity.time }}</span>
          </div>
        </div>
      </template>
    </div>

    <!-- Contenido principal: Imagen y acción -->
    <div class="flex gap-4 mb-4">
      <!-- Imagen del contenido con icono -->
      <router-link :to="{ name: 'item-detail', params: { id: activity.contentId } }" class="relative flex-shrink-0 overflow-hidden">
        <img :src="activity.contentImage" :alt="activity.content" class="w-32 h-48 object-cover rounded-xl shadow-lg transform transition-all duration-300 group-hover:scale-105">
        <!-- Hover Overlay similar to UserWatchingView -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button class="bg-gradient-to-r from-emerald-400 to-teal-500 text-black font-bold px-3 py-1 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">Ver</button>
        </div>
        <!-- Icono tipo de contenido -->
        <div class="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center text-base shadow-lg">
          {{ activity.contentMediaType }}
        </div>
      </router-link>

      <!-- Información del contenido -->
      <div class="flex-1 min-w-0 flex flex-col">
        <div>
          <p class="text-gray-300 text-sm mb-2">
            {{ activity.action }} 
          </p>
          <p class="text-white font-semibold text-lg mb-3 line-clamp-3">{{ activity.content }}</p>
        </div>
        
        <!-- Rating -->
        <div v-if="activity.rating" class="flex items-center justify-center flex-1">
          <div 
            class="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
            :class="activity.ratingColor || 'bg-green-500'"
          >
            {{ activity.rating }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Comentario (si existe) -->
    <div v-if="activity.comment" class="bg-gray-700 bg-opacity-50 rounded-xl p-4 mb-3">
      <p class="text-gray-200 text-sm italic line-clamp-4">"{{ activity.comment }}"</p>
    </div>
    
    <!-- Estado de ánimo (si existe) - ELIMINADO PARA SIMPLIFICAR -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FriendActivity } from './types'

const props = defineProps<{
  activity: FriendActivity
}>()

const avatarStyle = computed(() => {
  const c = (props.activity && (props.activity as any).friendColor) || ''
  if (typeof c === 'string' && c.startsWith('#')) return { backgroundColor: c }
  return undefined
})

const moods = [
  { emoji: '😊', color: 'bg-yellow-400' },
  { emoji: '😐', color: 'bg-yellow-400' },
  { emoji: '😕', color: 'bg-yellow-400' },
  { emoji: '😟', color: 'bg-orange-400' },
  { emoji: '😢', color: 'bg-red-400' }
]

const getRatingText = (rating?: string) => {
  if (!rating) return ''
  const parts = rating.split('/')
  const numericRating = parseFloat(parts[0] || '')
  if (Number.isNaN(numericRating)) return ''
  if (numericRating >= 9) return ''
  if (numericRating >= 7) return ''
  if (numericRating >= 5) return ''
  return ''
}
</script>