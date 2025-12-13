import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import Loginview from '../Loginview.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/login', name: 'login', component: Loginview },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
})

vi.mock('../../services/auth', () => ({
  loginUser: vi.fn().mockResolvedValue({ user: { _id: '1' }, token: 'test-token' }),
  registerUser: vi.fn().mockResolvedValue({ user: { _id: '1' }, token: 'test-token' }),
  saveAuth: vi.fn(),
  getUser: vi.fn().mockReturnValue(null),
  getToken: vi.fn().mockReturnValue(null)
}))

describe('Loginview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders login view', () => {
    const wrapper = mount(Loginview, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays email and password inputs', () => {
    const wrapper = mount(Loginview, {
      global: {
        plugins: [router]
      }
    })
    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBeGreaterThanOrEqual(2)
  })

  it('displays submit button', () => {
    const wrapper = mount(Loginview, {
      global: {
        plugins: [router]
      }
    })
    const button = wrapper.find('button[type="submit"]')
    expect(button.exists()).toBe(true)
  })

  it('has login form', () => {
    const wrapper = mount(Loginview, {
      global: {
        plugins: [router]
      }
    })
    const form = wrapper.find('form')
    expect(form.exists()).toBe(true)
  })
})
