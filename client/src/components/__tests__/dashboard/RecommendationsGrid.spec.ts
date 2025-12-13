import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendationsGrid from '../../dashboard/RecommendationsGrid.vue'

describe('RecommendationsGrid', () => {
  const mockRecommendations = [
    { _id: '1', title: 'Movie 1', type: 'movie', image: '/img1.jpg', genres: ['Action'], description: 'Desc 1', mediaType: '🎬', ageRating: 'PG-13' },
    { _id: '2', title: 'Book 1', type: 'book', image: '/img2.jpg', genres: ['Fiction'], description: 'Desc 2', mediaType: '📚', ageRating: 'All' }
  ]

  it('renders recommendations grid', () => {
    const wrapper = mount(RecommendationsGrid, {
      props: {
        recommendations: mockRecommendations
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays all recommendations', () => {
    const wrapper = mount(RecommendationsGrid, {
      props: {
        recommendations: mockRecommendations
      }
    })
    expect(wrapper.text()).toContain('Movie 1')
    expect(wrapper.text()).toContain('Book 1')
  })

  it('displays empty state when no recommendations', () => {
    const wrapper = mount(RecommendationsGrid, {
      props: {
        recommendations: []
      }
    })
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/no recommendations|sin recomendaciones|empty/)
  })
})
