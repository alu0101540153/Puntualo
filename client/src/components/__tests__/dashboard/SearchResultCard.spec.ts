import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchResultCard from '../../dashboard/SearchResultCard.vue'

describe('SearchResultCard', () => {
  const mockResult = {
    _id: '1',
    title: 'Search Result',
    type: 'movie',
    image: 'https://example.com/poster.jpg',
    genres: ['Action'],
    description: 'Test description',
    mediaType: '🎬',
    ageRating: 'PG-13'
  }

  it('renders search result card', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        recommendation: mockResult
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays result title', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        recommendation: mockResult
      }
    })
    expect(wrapper.text()).toContain('Search Result')
  })

  it('displays result type', () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        recommendation: mockResult
      }
    })
    expect(wrapper.text().toLowerCase()).toContain('movie')
  })

  it('emits select event when clicked', async () => {
    const wrapper = mount(SearchResultCard, {
      props: {
        recommendation: mockResult
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('select')
  })
})
