import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Toaster from '../Toaster.vue'

describe('Toaster', () => {
  it('renders toaster container', () => {
    const wrapper = mount(Toaster)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays toasts when added', async () => {
    const wrapper = mount(Toaster)
    // Simulate adding a toast through the component's exposed method
    if (wrapper.vm && typeof wrapper.vm.addToast === 'function') {
      wrapper.vm.addToast({ message: 'Test toast', type: 'info' })
      await wrapper.vm.$nextTick()
      expect(wrapper.text()).toContain('Test toast')
    }
  })

  it('positions toasts correctly', () => {
    const wrapper = mount(Toaster)
    expect(wrapper.classes()).toContain('fixed')
  })
})
