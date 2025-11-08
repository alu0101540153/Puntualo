<template>
  <div v-bind="$attrs" class="w-full max-w-2xl md:max-w-3xl lg:max-w-4xl bg-black/80 text-white rounded-2xl p-8 shadow-lg" :style="cardStyle">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const cardStyle = computed(
  () =>
    'width: min(900px, 92vw); padding: clamp(20px, 3.5vw, 44px); border-radius: clamp(12px,1.5vw,16px); background: rgba(0,0,0,0.88); box-shadow: 0 14px 40px rgba(0,0,0,0.55); color:#fff; margin:0 auto; box-sizing:border-box;'
)
</script>