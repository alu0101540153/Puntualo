import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import HomeView from '../HomeView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView }
  ]
})

describe('HomeView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders home view', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays hero section', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router],
        stubs: {
          HeroSection: { template: '<div class="hero-section">Hero</div>' }
        }
      }
    })
    expect(wrapper.find('.hero-section').exists()).toBe(true)
  })

  it('displays features or sections', () => {
    const wrapper = mount(HomeView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.html().length).toBeGreaterThan(100)
  })
})
