import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SeenCarousel from '../../profile/SeenCarousel.vue'

describe('SeenCarousel', () => {
  const mockItems = [
    { _id: '1', title: 'Seen 1', poster: 'url1' },
    { _id: '2', title: 'Seen 2', poster: 'url2' },
    { _id: '3', title: 'Seen 3', poster: 'url3' }
  ]

  it('renders carousel', () => {
    const wrapper = mount(SeenCarousel, {
      props: {
        items: mockItems
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays carousel items', () => {
    const wrapper = mount(SeenCarousel, {
      props: {
        items: mockItems
      }
    })
    expect(wrapper.text()).toContain('Seen 1')
  })

  it('has navigation controls', () => {
    const wrapper = mount(SeenCarousel, {
      props: {
        items: mockItems
      }
    })
    const buttons = wrapper.findAll('button')
    expect(buttons.length).toBeGreaterThan(0)
  })

  it('handles empty items', () => {
    const wrapper = mount(SeenCarousel, {
      props: {
        items: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
