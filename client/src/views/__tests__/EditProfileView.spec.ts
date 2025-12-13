import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import EditProfileView from '../EditProfileView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/edit-profile', name: 'edit-profile', component: EditProfileView }
  ]
})

vi.mock('../../services/user', () => ({
  getUserById: vi.fn().mockResolvedValue({ 
    _id: '1', 
    name: 'Test User',
    handle: 'testuser',
    email: 'test@example.com',
    bio: 'Test bio'
  }),
  updateUser: vi.fn().mockResolvedValue({ success: true })
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('EditProfileView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders edit profile view', () => {
    const wrapper = mount(EditProfileView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays form inputs', () => {
    const wrapper = mount(EditProfileView, {
      global: {
        plugins: [router]
      }
    })
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('displays save button', () => {
    const wrapper = mount(EditProfileView, {
      global: {
        plugins: [router]
      }
    })
    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
  })
})
