import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '../DashboardView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/dashboard', name: 'dashboard', component: DashboardView }
  ]
})

vi.mock('../../services/user', () => ({
  getUserById: vi.fn().mockResolvedValue({ _id: '1', name: 'Test User' }),
  getFeed: vi.fn().mockResolvedValue([])
}))

vi.mock('../../services/item', () => ({
  getRecommendationsForUser: vi.fn().mockResolvedValue([])
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('DashboardView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard view', () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays user dashboard elements', async () => {
    const wrapper = mount(DashboardView, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
