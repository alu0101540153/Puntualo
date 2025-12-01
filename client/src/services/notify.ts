import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'
export type ToastOptions = {
  timeout?: number // ms, 0 = persistent
  dismissible?: boolean
  pauseOnHover?: boolean
  action?: { label: string; callback: (id: number) => void }
}

export type ToastItem = {
  id: number
  type: ToastType
  message: string
  timeout: number
  createdAt: number
  // options
  dismissible: boolean
  pauseOnHover: boolean
  action?: { label: string; callback: (id: number) => void }
}

const state = reactive<{ items: ToastItem[] }>({ items: [] })

function push(type: ToastType, message: string, opts: ToastOptions = {}) {
  const timeout = typeof opts.timeout === 'number' ? opts.timeout : 7000
  const id = Date.now() + Math.floor(Math.random() * 10000)
  const item: ToastItem = {
    id,
    type,
    message,
    timeout,
    createdAt: Date.now(),
    dismissible: opts.dismissible !== false,
    pauseOnHover: opts.pauseOnHover !== false,
    action: opts.action,
  }
  state.items.push(item)
  if (timeout > 0) {
    // removal is handled in the UI for progress accuracy; keep a safety fallback
    setTimeout(() => {
      const idx = state.items.findIndex((t) => t.id === id)
      if (idx !== -1) state.items.splice(idx, 1)
    }, timeout + 1000)
  }
  return id
}

export function success(message: string, opts?: ToastOptions) {
  return push('success', message, opts)
}

export function error(message: string, opts?: ToastOptions) {
  return push('error', message, opts)
}

export function info(message: string, opts?: ToastOptions) {
  return push('info', message, opts)
}

export function warning(message: string, opts?: ToastOptions) {
  return push('warning', message, opts)
}

export function remove(id: number) {
  const idx = state.items.findIndex((t) => t.id === id)
  if (idx !== -1) state.items.splice(idx, 1)
}

export function clear() {
  state.items.splice(0, state.items.length)
}

export function useNotifications() {
  return state
}

export default { success, error, info, warning, remove, clear, useNotifications }
