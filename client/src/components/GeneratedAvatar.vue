<template>
  <svg :width="size" :height="size" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" :aria-label="`Avatar ${name}`">
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
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineProps } from 'vue'

const props = defineProps<{
  name: string
  size?: number
  variant?: string
  colors?: string[]
  square?: boolean
}>()

const size = props.size || 80
const variant = props.variant || 'ring'
const colors = (props.colors && props.colors.length >= 3) ? props.colors : ['#92A1C6', '#146A7C', '#F0AB3D']

function initialsFromName(n: string) {
  if (!n) return 'U'
  const parts = String(n).trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length-1].charAt(0)).toUpperCase()
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
  const a = [r,g,b].map(v=>{
    const vv = v/255
    return vv <= 0.03928 ? vv/12.92 : Math.pow((vv+0.055)/1.055,2.4)
  })
  return 0.2126*a[0] + 0.7152*a[1] + 0.0722*a[2]
}

const textColor = computed(() => {
  const rgb = hexToRgb(colors[2] || colors[0])
  return luminance(rgb.r,rgb.g,rgb.b) > 0.6 ? '#000' : '#fff'
})
</script>

<style scoped>
svg { border-radius: 9999px; }
</style>
