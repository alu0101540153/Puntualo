<template>
  <div :class="['rounded-full overflow-hidden inline-block', sizeClass]">
    <img
      v-if="imageUrl"
      :src="imageUrl"
      :alt="`Avatar ${name}`"
      class="w-full h-full object-cover"
    />
    <svg
      v-else
      :width="numericSize"
      :height="numericSize"
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      :aria-label="`Avatar ${name}`"
      class="w-full h-full"
    >
      <defs />
      <g v-if="variant === 'ring'">
        <rect width="80" height="80" :fill="colors[0]" />
        <circle cx="40" cy="30" r="22" :fill="colors[1]" />
        <circle cx="40" cy="30" r="18" :fill="colors[2]" />
        <text x="40" y="48" text-anchor="middle" :fill="textColor" font-weight="700" :font-size="28">{{ initials }}</text>
      </g>
      <g v-else-if="variant === 'bauhaus'">
        <rect width="80" height="40" :fill="colors[0]" />
        <rect y="40" width="40" height="40" :fill="colors[1]" />
        <rect x="40" y="40" width="40" height="40" :fill="colors[2]" />
        <text x="40" y="52" text-anchor="middle" :fill="textColor" font-weight="700" :font-size="28">{{ initials }}</text>
      </g>
      <g v-else>
        <rect width="80" height="80" :fill="colors[0]" />
        <rect x="0" y="0" width="80" height="20" :fill="colors[1]" />
        <text x="40" y="48" text-anchor="middle" :fill="textColor" font-weight="700" :font-size="28">{{ initials }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineProps } from 'vue'

const props = defineProps<{
  name?: string
  imageUrl?: string
  size?: number | 'sm' | 'md' | 'lg' | 'xl'
  variant?: string
  colors?: string[]
  square?: boolean
}>()

const variant = props.variant || 'ring'
const colors = (props.colors && props.colors.length >= 3) ? props.colors : ['#92A1C6', '#146A7C', '#F0AB3D']

const numericSize = computed(() => {
  if (typeof props.size === 'number') return props.size
  if (props.size === 'sm') return 48
  if (props.size === 'md' || props.size === undefined) return 64
  if (props.size === 'lg') return 80
  if (props.size === 'xl') return 96
  return 64
})

const sizeClass = computed(() => {
  if (typeof props.size === 'number') return ''
  if (props.size === 'sm') return 'w-12 h-12'
  if (props.size === 'md' || props.size === undefined) return 'w-16 h-16'
  if (props.size === 'lg') return 'w-20 h-20'
  if (props.size === 'xl') return 'w-24 h-24'
  return ''
})

function initialsFromName(n: string) {
  if (!n) return 'U'
  const parts = String(n).trim().split(/\s+/).filter(p => p.length > 0)
  if (!parts || parts.length === 0) return 'U'
  if (parts.length === 1) return (parts[0] ?? '').charAt(0).toUpperCase()
  const first = (parts[0] ?? '').charAt(0)
  const last = (parts[parts.length - 1] ?? '').charAt(0)
  return (first + last).toUpperCase()
}

const initials = computed(() => initialsFromName(props.name || 'User'))

// simple luminance to pick white/black text
function hexToRgb(hex: string) {
  const h = hex.replace('#','')
  const bigint = parseInt(h.length===3 ? h.split('').map(c=>c+c).join('') : h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return { r, g, b }
}

function luminance(r:number,g:number,b:number){
  const a: number[] = [r,g,b].map((v) => {
    const vv = v/255
    return vv <= 0.03928 ? vv/12.92 : Math.pow((vv+0.055)/1.055,2.4)
  })
  const [ar = 0, ag = 0, ab = 0] = a
  return 0.2126 * ar + 0.7152 * ag + 0.0722 * ab
}

const textColor = computed(() => {
  const hex = (colors[2] ?? colors[0]) || '#000'
  const rgb = hexToRgb(hex)
  return luminance(rgb.r, rgb.g, rgb.b) > 0.6 ? '#000' : '#fff'
})

const imageUrl = computed(() => props.imageUrl)
const name = computed(() => props.name || 'User')
</script>

<style scoped>
svg { border-radius: 9999px; }
</style>
