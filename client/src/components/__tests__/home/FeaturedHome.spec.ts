import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FeaturedHome from '../../home/FeaturedHome.vue'

describe('FeaturedHome', () => {
  it('renders featured section', () => {
    const wrapper = mount(FeaturedHome)
    expect(wrapper.exists()).toBe(true)
  })

  it('displays featured items', () => {
    const wrapper = mount(FeaturedHome, {
      props: {
        items: [
          { _id: '1', title: 'Featured 1' },
          { _id: '2', title: 'Featured 2' }
        ]
      }
    })
    expect(wrapper.text()).toContain('Featured 1')
    expect(wrapper.text()).toContain('Featured 2')
  })

  it('handles empty items array', () => {
    const wrapper = mount(FeaturedHome, {
      props: {
        items: []
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
