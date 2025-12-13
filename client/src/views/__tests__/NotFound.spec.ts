import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import NotFound from '../NotFound.vue'

describe('NotFound', () => {
  it('renders 404 page', () => {
    const wrapper = mount(NotFound)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays 404 message', () => {
    const wrapper = mount(NotFound)
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/404|not found|no encontrado/)
  })

  it('displays link to home', () => {
    const wrapper = mount(NotFound)
    const link = wrapper.find('a[href="/"]')
    expect(link.exists()).toBe(true)
  })
})
