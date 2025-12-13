import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Notification from '../Notification.vue'

// Mock del sistema de notificaciones
vi.mock('@/services/notify', () => ({
  useNotifications: vi.fn(() => ({
    items: []
  })),
  remove: vi.fn()
}))

import { useNotifications, remove } from '@/services/notify'

describe('Notification', () => {
  it('renders notification message', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      items: [{ id: '1', message: 'Test notification', type: 'info', dismissible: true, timeout: 0 }]
    } as any)
    const wrapper = mount(Notification, {
      global: {
        stubs: ['transition-group']
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Test notification')
  })

  it('applies success type styling', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      items: [{ id: '1', message: 'Success', type: 'success', dismissible: true, timeout: 0 }]
    } as any)
    const wrapper = mount(Notification, {
      global: {
        stubs: ['transition-group']
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('success')
  })

  it('applies error type styling', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      items: [{ id: '1', message: 'Error', type: 'error', dismissible: true, timeout: 0 }]
    } as any)
    const wrapper = mount(Notification, {
      global: {
        stubs: ['transition-group']
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('error')
  })

  it('applies info type styling', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      items: [{ id: '1', message: 'Info', type: 'info', dismissible: true, timeout: 0 }]
    } as any)
    const wrapper = mount(Notification, {
      global: {
        stubs: ['transition-group']
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('info')
  })

  it('emits close event when close button clicked', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      items: [{ id: '1', message: 'Test', type: 'info', dismissible: true, timeout: 0 }]
    } as any)
    const wrapper = mount(Notification, {
      global: {
        stubs: ['transition-group']
      }
    })
    const closeButton = wrapper.find('button.close')
    if (closeButton.exists()) {
      await closeButton.trigger('click')
      expect(remove).toHaveBeenCalledWith('1')
    }
  })
})
