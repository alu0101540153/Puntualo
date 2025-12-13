<template>
  <section :class="['friends-grid', gridClass]">
    <h2 class="text-3xl font-bold text-white mb-8">{{ title }}</h2>

    <div :class="gridClass">
      <div
        v-if="friendsToShow.length === 0"
        class="col-span-full text-gray-300"
      >
        No friends yet
      </div>
      <div
        v-else
        v-for="friend in friendsToShow"
        :key="friend._id || friend.id || friend.name"
        class="bg-gray-800 rounded-xl p-4 text-white shadow"
      >
        <p class="font-semibold">{{ friend.name || friend.handle }}</p>
        <p v-if="friend.handle" class="text-sm text-gray-400">@{{ friend.handle }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FriendActivity } from './types'

interface FriendLite {
  _id?: string
  id?: string
  name?: string
  handle?: string
}

interface Props {
  title?: string
  activities?: FriendActivity[]
  friends?: FriendLite[]
  gridClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Mis amigos',
  gridClass: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
  activities: () => [],
  friends: () => []
})

const friendsToShow = computed(() => props.friends && props.friends.length ? props.friends : (props.activities as any[]))
</script>