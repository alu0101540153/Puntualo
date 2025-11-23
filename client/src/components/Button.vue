<template>
  <button
    @click="$emit('click')"
    v-bind="$attrs"
    :class="[
      'flex items-center justify-center gap-2 transition-shadow duration-200 font-extrabold focus:outline-none',
      variantClass,
      sizeClass,
      { 'opacity-60 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['click'])

import { computed } from 'vue'

const variantClass = computed(() => {
  switch (props.variant) {
    case 'secondary':
      return 'bg-white/6 text-white border border-white/10 hover:bg-white/10'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
    case 'ghost':
      return 'bg-transparent text-white hover:bg-white/5'
    default:
      return 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black shadow-lg hover:shadow-xl hover:brightness-95'
  }
})

const sizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1 text-sm rounded-full'
    case 'lg':
      return 'px-8 py-4 text-lg rounded-full'
    default:
      return 'px-5 py-2 text-base rounded-full'
  }
})
</script>

<style scoped>
/* small extra polish for focus ring when keyboard navigating */
.focus\:outline-none:focus {
  outline: none;
}
</style>
