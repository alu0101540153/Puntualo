<template>
  <section>
    <h2 class="text-3xl font-bold text-white mb-8">{{ title }}</h2>

    <div :class="gridClass">
      <FriendActivityCard 
        v-for="activity in activities"
        :key="activity.id"
        :activity="activity"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import type { FriendActivity } from './types'
import FriendActivityCard from './FriendActivityCard.vue'

interface Props {
  title?: string
  activities: FriendActivity[]
  gridClass?: string
}

withDefaults(defineProps<Props>(), {
  title: 'Mis amigos',
  gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
})
</script>