import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WelcomeSection from '../../dashboard/WelcomeSection.vue'

describe('WelcomeSection', () => {
  it('renders welcome section', () => {
    const wrapper = mount(WelcomeSection)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays welcome message', () => {
    const wrapper = mount(WelcomeSection)
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/welcome|bienvenid/)
  })

  it('has proper styling', () => {
    const wrapper = mount(WelcomeSection)
    expect(wrapper.classes().length).toBeGreaterThan(0)
  })
})
