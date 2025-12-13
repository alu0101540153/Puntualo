import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import RecommendationsView from '../RecommendationsView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/recommendations', name: 'recommendations', component: RecommendationsView }
  ]
})

vi.mock('../../services/item', () => ({
  getRecommendationsForUser: vi.fn().mockResolvedValue([
    { _id: '1', title: 'Recommended 1' },
    { _id: '2', title: 'Recommended 2' }
  ])
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('RecommendationsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders recommendations view', () => {
    const wrapper = mount(RecommendationsView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays recommendations', async () => {
    const wrapper = mount(RecommendationsView, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
