import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RecommendationCard from '../../dashboard/RecommendationCard.vue'

describe('RecommendationCard', () => {
  const mockRecommendation = {
    _id: '1',
    title: 'Test Movie',
    type: 'movie',
    image: 'https://example.com/poster.jpg',
    genres: ['Action', 'Drama'],
    description: 'Test description',
    mediaType: '🎬',
    ageRating: 'PG-13',
    score: 8.5
  }

  it('renders recommendation card', () => {
    const wrapper = mount(RecommendationCard, {
      props: {
        recommendation: mockRecommendation
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays item title', () => {
    const wrapper = mount(RecommendationCard, {
      props: {
        recommendation: mockRecommendation
      }
    })
    expect(wrapper.text()).toContain('Test Movie')
  })

  it('displays item type', () => {
    const wrapper = mount(RecommendationCard, {
      props: {
        recommendation: mockRecommendation
      }
    })
    expect(wrapper.text().toLowerCase()).toContain('movie')
  })

  it('displays poster image', () => {
    const wrapper = mount(RecommendationCard, {
      props: {
        recommendation: mockRecommendation
      }
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(mockRecommendation.image)
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(RecommendationCard, {
      props: {
        recommendation: mockRecommendation
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })
})
