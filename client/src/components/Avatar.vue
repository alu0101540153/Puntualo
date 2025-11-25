<template>
  <div :class="[sizeClasses, 'rounded-full flex items-center justify-center overflow-hidden', extraClass]"
       :style="{ backgroundColor: bgColor }"
       role="img"
       :aria-label="ariaLabel">
    <span :class="textClass" :style="{ fontSize: fontSize }">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { defineProps } from 'vue'

const props = defineProps<{
  user?: any
  initials?: string
  color?: string
  size?: 'sm'|'md'|'lg'|'xl'|string
  extraClass?: string
  fontSize?: string
  ariaLabel?: string
}>()

const paletteDefault = '#9CA3AF'

const bgColor = computed(() => {
  return props.user && props.user.avatarBgColor ? props.user.avatarBgColor : (props.color || paletteDefault)
})

// compute readable text color based on bg hex
function hexToRgb(hex: string) {
  try {
    const h = hex.replace('#', '')
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return { r, g, b }
  } catch {
    return { r: 156, g: 163, b: 175 }
  }
}

function luminance(r:number,g:number,b:number): number {
  const a: number[] = [r,g,b].map(v => {
    let vv = v / 255
    return vv <= 0.03928 ? vv / 12.92 : Math.pow((vv + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * (a[0] ?? 0) + 0.7152 * (a[1] ?? 0) + 0.0722 * (a[2] ?? 0)
}

const textClass = computed(() => {
  const rgb = hexToRgb(bgColor.value || paletteDefault)
  const lum = luminance(rgb.r, rgb.g, rgb.b)
  // threshold chosen so dark backgrounds -> white text
  return lum > 0.6 ? 'text-black font-bold' : 'text-white font-bold'
})

const initials = computed(() => {
  if (props.initials) return props.initials
  if (props.user) {
    const n = props.user.name || props.user.username || props.user.handle || props.user.email || 'U'
    return String(n).charAt(0).toUpperCase()
  }
  return 'U'
})

const sizeClasses = computed(() => {
  const s = props.size || 'md'
  if (s === 'sm') return 'w-8 h-8'
  if (s === 'md') return 'w-10 h-10'
  if (s === 'lg') return 'w-20 h-20'
  if (s === 'xl') return 'w-24 h-24'
  return String(s)
})

const fontSize = props.fontSize || (props.size === 'lg' || props.size === 'xl' ? '1.6rem' : '1rem')

const ariaLabel = props.ariaLabel || 'Avatar'
</script>

<style scoped>
/* nothing special */
</style>
