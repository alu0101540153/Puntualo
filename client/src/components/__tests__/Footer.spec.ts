import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '../Footer.vue'

describe('Footer', () => {
  it('renders footer component', () => {
    const wrapper = mount(Footer)
    expect(wrapper.exists()).toBe(true)
  })

  it('contains copyright or company info', () => {
    const wrapper = mount(Footer)
    const text = wrapper.text().toLowerCase()
    expect(text.length > 0).toBe(true)
  })

  it('has proper footer styling', () => {
    const wrapper = mount(Footer)
    expect(wrapper.element.tagName.toLowerCase()).toBe('footer')
  })
})
