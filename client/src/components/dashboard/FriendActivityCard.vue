<template>
    <div class="bg-gray-900 bg-opacity-40 rounded-2xl p-6 backdrop-blur-sm border border-gray-500 border-opacity-30 hover:border-opacity-50 transition-all duration-300">
    <div class="flex gap-4">
      <!-- Imagen del contenido con icono -->
      <router-link :to="{ name: 'item-detail', params: { id: activity.contentId } }" class="relative flex-shrink-0">
        <img :src="activity.contentImage" :alt="activity.content" class="w-24 h-40 object-cover rounded-lg shadow-lg">
        <!-- Icono tipo de contenido -->
        <div class="absolute top-1 right-1 w-6 h-6 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-sm shadow-lg">
          {{ activity.contentMediaType }}
        </div>
      </router-link>

      <!-- Información -->
      <div class="flex-1 min-w-0">
        <template v-if="activity.friendId">
          <router-link :to="{ name: 'profile', query: { userId: activity.friendId } }" class="flex items-center gap-2 mb-3 no-underline">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              :class="activity.friendColor"
              :style="avatarStyle"
            >
              {{ activity.friendInitial }}
            </div>
            <div>
              <span class="text-white font-semibold block">{{ activity.friendName }}</span>
              <span class="text-gray-400 text-xs">{{ activity.time }}</span>
            </div>
          </router-link>
        </template>
        <template v-else>
          <div class="flex items-center gap-2 mb-3">
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm"
              :class="activity.friendColor"
              :style="avatarStyle"
            >
              {{ activity.friendInitial }}
            </div>
            <div>
              <span class="text-white font-semibold block">{{ activity.friendName }}</span>
              <span class="text-gray-400 text-xs">{{ activity.time }}</span>
            </div>
          </div>
        </template>
        
        <p class="text-gray-300 text-sm mb-3">
          {{ activity.action }} <span class="text-white font-semibold">{{ activity.content }}</span>
        </p>
        
        <!-- Comentario -->
        <div v-if="activity.comment" class="bg-gray-700 bg-opacity-50 rounded-lg p-3 mb-3">
          <p class="text-gray-200 text-sm italic">"{{ activity.comment }}"</p>
        </div>
        
        <!-- Rating -->
        <div v-if="activity.rating" class="flex items-center gap-3 mb-3">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg"
            :class="activity.ratingColor || 'bg-green-500'"
          >
            {{ activity.rating }}
          </div>
          <span class="text-gray-300 text-sm"> 
            {{ getRatingText(activity.rating) }}
          </span>
        </div>
        
        <!-- Estado de ánimo -->
        <div v-if="activity.mood" class="bg-gray-700 bg-opacity-50 rounded-lg p-3">
          <p class="text-sm font-semibold text-gray-200 mb-2">Estado de ánimo</p>
          <div class="flex gap-1 justify-center">
            <div 
              v-for="(mood, index) in moods" 
              :key="index"
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs shadow"
              :class="mood.color"
            >
              {{ mood.emoji }}
            </div>
          </div>
        </div>
        
        <!-- géneros ocultos en el feed (no renderizados) -->
      </div>
    </div>
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