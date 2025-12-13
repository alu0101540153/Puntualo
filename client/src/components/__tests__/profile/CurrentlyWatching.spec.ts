import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CurrentlyWatching from '../../profile/CurrentlyWatching.vue'

describe('CurrentlyWatching', () => {
  const mockItems = [
    { _id: '1', title: 'Movie 1', type: 'movie' },
    { _id: '2', title: 'Series 1', type: 'series' }
  ]

  it('renders currently watching section', () => {
    const wrapper = mount(CurrentlyWatching, {
      props: {
        items: mockItems
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays items', () => {
    const wrapper = mount(CurrentlyWatching, {
      props: {
        items: mockItems
      }
    })
    expect(wrapper.text()).toContain('Movie 1')
    expect(wrapper.text()).toContain('Series 1')
  })

  it('shows empty state when no items', () => {
    const wrapper = mount(CurrentlyWatching, {
      props: {
        items: []
      }
    })
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/no items|empty|nada/)
  })
})
