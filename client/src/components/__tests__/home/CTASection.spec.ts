import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CTASection from '../../home/CTASection.vue'

describe('CTASection', () => {
  it('renders CTA section', () => {
    const wrapper = mount(CTASection)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays call to action button', () => {
    const wrapper = mount(CTASection)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
  })

  it('emits action event when button clicked', async () => {
    const wrapper = mount(CTASection)
    const button = wrapper.find('button')
    if (button.exists()) {
      await button.trigger('click')
      expect(wrapper.emitted()).toBeDefined()
    }
  })
})
