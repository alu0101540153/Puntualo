<template>
  <div class="notification-root" aria-live="polite" aria-atomic="true">
    <transition-group name="toast" tag="div">
      <div v-for="t in notifications.items" :key="t.id" class="toast-wrap">
        <div
          class="toast"
          :class="t.type"
          role="status"
          :aria-label="t.type + ' notification'"
          tabindex="0"
          @mouseenter="onMouseEnter(t.id)"
          @mouseleave="onMouseLeave(t.id)"
          @keydown.escape.prevent="close(t.id)"
        >
          <div class="left">
            <span class="icon" v-html="iconFor(t.type)"></span>
          </div>
          <div class="body">
            <div class="message">{{ t.message }}</div>
            <div v-if="t.action" class="action-row">
              <button class="action-btn" @click="onAction(t)">{{ t.action.label }}</button>
            </div>
            <div v-if="t.timeout > 0" class="progress">
              <div class="bar" :style="{ width: progressFor(t.id) + '%' }"></div>
            </div>
          </div>
          <button v-if="t.dismissible" class="close" @click="close(t.id)" aria-label="Cerrar">×</button>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotifications, remove, ToastItem } from '@/services/notify'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const notifications = useNotifications()

// track per-toast remaining time and paused state
const remaining = ref<Record<number, number>>({})
const paused = ref<Record<number, boolean>>({})
let tickHandle: number | null = null

function close(id: number) {
  remove(id)
  delete remaining.value[id]
  delete paused.value[id]
}

function onAction(t: ToastItem) {
  try {
    if (t.action && typeof t.action.callback === 'function') t.action.callback(t.id)
  } catch (e) {
    // ignore
  }
  if (t.dismissible) close(t.id)
}

function onMouseEnter(id: number) {
  paused.value[id] = true
}

function onMouseLeave(id: number) {
  paused.value[id] = false
}

function ensureTimers() {
  // initialize remaining for new items
  for (const t of notifications.items) {
    if (!(t.id in remaining.value)) {
      remaining.value[t.id] = t.timeout
      paused.value[t.id] = false
    }
  }
  if (tickHandle == null) {
    tickHandle = window.setInterval(() => {
      for (const t of [...notifications.items]) {
        if (!t) continue
        if (t.timeout <= 0) continue
        if (paused.value[t.id]) continue
        remaining.value[t.id] = Math.max(0, (remaining.value[t.id] || t.timeout) - 100)
        if (remaining.value[t.id] <= 0) {
          close(t.id)
        }
      }
      // cleanup if no items
      if (notifications.items.length === 0 && tickHandle != null) {
        clearInterval(tickHandle)
        tickHandle = null
        remaining.value = {}
        paused.value = {}
      }
    }, 100)
  }
}

onMounted(() => {
  ensureTimers()
})

onBeforeUnmount(() => {
  if (tickHandle != null) clearInterval(tickHandle)
})

function progressFor(id: number) {
  const t = notifications.items.find((x: any) => x.id === id)
  if (!t) return 0
  if (t.timeout <= 0) return 0
  const rem = remaining.value[id]
  if (typeof rem !== 'number') return 100
  return Math.max(0, Math.min(100, (rem / t.timeout) * 100))
}

function iconFor(type: string) {
  if (type === 'success') return `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='svg'>
      <path fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414L8.414 15 5 11.586a1 1 0 111.414-1.414L8.414 12.172l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd' />
    </svg>`
  if (type === 'error') return `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='svg'>
      <path fill-rule='evenodd' d='M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9V6a1 1 0 112 0v3a1 1 0 11-2 0zm0 4a1 1 0 112 0 1 1 0 01-2 0z' clip-rule='evenodd'/>
    </svg>`
  if (type === 'info') return `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='svg'>
      <path d='M2 10a8 8 0 1116 0A8 8 0 012 10zm9-4a1 1 0 10-2 0 1 1 0 002 0zM9 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z'/>
    </svg>`
  if (type === 'warning') return `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='currentColor' class='svg'>
      <path fill-rule='evenodd' d='M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59c.75 1.334-.213 2.98-1.742 2.98H3.48c-1.53 0-2.492-1.646-1.742-2.98L8.257 3.1zM9 7a1 1 0 112 0v4a1 1 0 11-2 0V7zm1 8a1.5 1.5 0 100-3 1.5 1.5 0 000 3z' clip-rule='evenodd'/>
    </svg>`
  return ''
}
</script>

<style scoped>
.notification-root {
  position: fixed;
  top: 4rem;
  right: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  z-index: 9999;
  pointer-events: none;
}
.toast-wrap { pointer-events: auto; }
.toast {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  min-width: 240px;
  max-width: 420px;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  color: #031226;
  box-shadow: 0 10px 30px rgba(2,6,23,0.45);
  transform-origin: top right;
}
.toast .left { display:flex; align-items:center }
.toast .svg { width: 20px; height: 20px }
.toast .body { flex: 1 }
.message { font-weight: 600; margin-bottom: 0.2rem }
.action-row { margin-top: 0.4rem }
.action-btn { background: transparent; border: none; color: inherit; font-weight: 700; cursor: pointer }
.close { background: transparent; border: none; color: inherit; font-size: 1.1rem; cursor: pointer }
.progress { height: 4px; background: rgba(0,0,0,0.06); margin-top: 0.5rem; border-radius: 999px; overflow:hidden }
.bar { height: 100%; background: rgba(0,0,0,0.12); transform-origin: left }
.toast.success { background: linear-gradient(90deg,#ecfccb,#bbf7d0); }
.toast.error { background: linear-gradient(90deg,#fee2e2,#fecaca); }
.toast.info { background: linear-gradient(90deg,#dbeafe,#bfdbfe); }
.toast.warning { background: linear-gradient(90deg,#fff7ed,#fde68a); }

/* transitions */
.toast-enter-from { opacity: 0; transform: translateY(-10px) scale(0.98) }
.toast-enter-active { transition: all 200ms cubic-bezier(.2,.8,.2,1) }
.toast-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98) }
.toast-leave-active { transition: all 180ms cubic-bezier(.2,.8,.2,1) }
</style>
