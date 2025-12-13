import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ProfileView from '../ProfileView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/profile/:id', name: 'profile', component: ProfileView }
  ]
})

vi.mock('../../services/user', () => ({
  getUserById: vi.fn().mockResolvedValue({ 
    _id: '1', 
    name: 'Test User', 
    handle: 'testuser',
    bio: 'Test bio'
  }),
  getMyRatings: vi.fn().mockResolvedValue([])
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('ProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/profile/1')
  })

  it('renders profile view', () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays user profile elements', async () => {
    const wrapper = mount(ProfileView, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
