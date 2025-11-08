<template>
  <button
    @click="$emit('click')"
    v-bind="$attrs"
    :style="btnStyle"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
const props = defineProps({})
const emit = defineEmits(['click'])

const btnStyle = {
  width: '100%',
  background: '#1DB954',
  color: '#000',
  border: 'none',
  padding: 'clamp(12px,1.8vw,14px) clamp(16px,2.2vw,20px)',
  borderRadius: '9999px',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 'clamp(14px,1.6vw,16px)',
}
</script>
