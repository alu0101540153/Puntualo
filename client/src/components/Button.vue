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
      return 'bg-dark-800/60 text-white border border-primary-500/20 hover:bg-dark-700 hover:border-primary-500/40'
    case 'danger':
      return 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
    case 'ghost':
      return 'bg-transparent text-white hover:bg-dark-800/40'
    default:
      return 'bg-gradient-to-r from-primary-500 to-accent-500 text-black shadow-glow hover:shadow-glow-lg hover:brightness-110 hover:scale-105'
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
