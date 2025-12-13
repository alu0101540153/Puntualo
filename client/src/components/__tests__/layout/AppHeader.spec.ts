import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '../../layout/AppHeader.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/dashboard', name: 'dashboard', component: { template: '<div>Dashboard</div>' } }
  ]
})

describe('AppHeader', () => {
  it('renders app header', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays navigation links', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })
    const links = wrapper.findAll('a')
    expect(links.length).toBeGreaterThan(0)
  })

  it('has proper header styling', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.element.tagName.toLowerCase()).toBe('header')
  })

  it('shows logo or brand', () => {
    const wrapper = mount(AppHeader, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.text().length).toBeGreaterThan(0)
  })
})
