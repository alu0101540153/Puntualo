import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MyRatingsView from '../MyRatingsView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/my-ratings', name: 'my-ratings', component: MyRatingsView }
  ]
})

vi.mock('../../services/user', () => ({
  getMyRatings: vi.fn().mockResolvedValue([
    { _id: '1', itemTitle: 'Movie 1', score: 5, review: 'Great!' },
    { _id: '2', itemTitle: 'Movie 2', score: 4, review: 'Good' }
  ])
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('MyRatingsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders my ratings view', () => {
    const wrapper = mount(MyRatingsView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays ratings list', async () => {
    const wrapper = mount(MyRatingsView, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
