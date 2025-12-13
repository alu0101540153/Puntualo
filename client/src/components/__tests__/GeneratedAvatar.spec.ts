import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GeneratedAvatar from '../GeneratedAvatar.vue'

describe('GeneratedAvatar', () => {
  it('renders with image URL', () => {
    const wrapper = mount(GeneratedAvatar, {
      props: {
        imageUrl: 'https://example.com/avatar.png'
      }
    })
    expect(wrapper.find('img').exists()).toBe(true)
  })

  it('displays image with correct src', () => {
    const url = 'https://example.com/avatar.png'
    const wrapper = mount(GeneratedAvatar, {
      props: {
        imageUrl: url
      }
    })
    expect(wrapper.find('img').attributes('src')).toBe(url)
  })

  it('applies size prop correctly', () => {
    const wrapper = mount(GeneratedAvatar, {
      props: {
        imageUrl: 'https://example.com/avatar.png',
        size: 'lg'
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('has rounded styling', () => {
    const wrapper = mount(GeneratedAvatar, {
      props: {
        imageUrl: 'https://example.com/avatar.png'
      }
    })
    expect(wrapper.classes()).toContain('rounded-full')
  })
})
