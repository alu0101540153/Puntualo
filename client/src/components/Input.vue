<template>
  <input
    v-bind="$attrs"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
    class="w-full bg-white/5 text-white placeholder-gray-300 px-4 py-3 rounded-lg border border-transparent focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400 focus:ring-opacity-20 transition"
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