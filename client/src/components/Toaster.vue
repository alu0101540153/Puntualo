<template>
  <div class="fixed top-4 right-4 z-50 w-full max-w-sm">
    <Notification />
  </div>
</template>

<script setup lang="ts">
import Notification from './Notification.vue'
import { info } from '@/services/notify'

// Exponemos un método simple para añadir toasts en tests y código heredado
function addToast(payload: { message: string; type?: string }) {
  const type = (payload.type as any) || 'info'
  info(payload.message || '', { dismissible: true })
  return type
}

defineExpose({ addToast })
</script>

<style scoped>
/* contenedor de toasts */
</style>
