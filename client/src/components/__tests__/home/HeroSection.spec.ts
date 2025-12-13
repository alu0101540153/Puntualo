import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '../../home/HeroSection.vue'

describe('HeroSection', () => {
  it('renders hero section', () => {
    const wrapper = mount(HeroSection)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays main heading', () => {
    const wrapper = mount(HeroSection)
    const heading = wrapper.find('h1')
    expect(heading.exists()).toBe(true)
    expect(heading.text().length).toBeGreaterThan(0)
  })

  it('displays call to action', () => {
    const wrapper = mount(HeroSection)
    const button = wrapper.find('button')
    expect(button.exists()).toBe(true)
  })

  it('has gradient background', () => {
    const wrapper = mount(HeroSection)
    const html = wrapper.html().toLowerCase()
    expect(html).toMatch(/gradient|bg-/)
  })
})
