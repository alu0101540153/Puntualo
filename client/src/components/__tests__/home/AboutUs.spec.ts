import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutUs from '../../home/AboutUs.vue'

describe('AboutUs', () => {
  it('renders about us section', () => {
    const wrapper = mount(AboutUs)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays about content', () => {
    const wrapper = mount(AboutUs)
    expect(wrapper.text().length).toBeGreaterThan(0)
  })

  it('has proper section structure', () => {
    const wrapper = mount(AboutUs)
    expect(wrapper.element.tagName.toLowerCase()).toMatch(/section|div/)
  })
})
