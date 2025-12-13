<template>
  <input
    v-bind="$attrs"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
    class="w-full bg-dark-800/60 text-white placeholder-gray-400 px-4 py-3 rounded-lg border border-primary-500/20 focus:border-primary-500 focus:ring-2 focus:ring-primary-400 focus:ring-opacity-30 hover:border-primary-500/40 transition-all"
  />
</template>

<script setup lang="ts">
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

function onInput(e: Event) {
  const t = e.target as HTMLInputElement
  emit('update:modelValue', t?.value ?? '')
}
</script>

<style scoped>
/* ensure inputs look crisp on dark backgrounds */
input { font-size: 14px; }
</style>