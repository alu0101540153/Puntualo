<template>
  <input
    v-bind="$attrs"
    :type="type"
    :placeholder="placeholder"
    :value="modelValue"
    @input="onInput"
    class="w-full"
    :style="inputStyle"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const inputStyle = computed(
  () =>
    'width:100%; padding: clamp(12px,2vw,20px) clamp(14px,2.2vw,22px); border-radius:14px; background: rgba(255,255,255,0.04); color:#fff; border:none; outline:none; box-sizing:border-box; font-size: clamp(14px,1.6vw,16px);'
)

function onInput(e: Event) {
  const t = e.target as HTMLInputElement
  emit('update:modelValue', t?.value ?? '')
}
</script>