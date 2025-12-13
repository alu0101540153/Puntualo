import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MediaShowcase from '../../home/MediaShowcase.vue'

describe('MediaShowcase', () => {
  it('renders media showcase', () => {
    const wrapper = mount(MediaShowcase)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays media items', () => {
    const wrapper = mount(MediaShowcase, {
      props: {
        title: 'Test Showcase',
        items: [
          { _id: '1', title: 'Media 1', image: 'url1' },
          { _id: '2', title: 'Media 2', image: 'url2' }
        ]
      }
    })
    const images = wrapper.findAll('img')
    expect(images.length).toBeGreaterThan(0)
  })

  it('handles empty items', () => {
    const wrapper = mount(MediaShowcase, {
      props: {
        items: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
