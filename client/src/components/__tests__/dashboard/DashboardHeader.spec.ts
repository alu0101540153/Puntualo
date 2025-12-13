import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardHeader from '../../dashboard/DashboardHeader.vue'

describe('DashboardHeader', () => {
  it('renders header component', () => {
    const wrapper = mount(DashboardHeader, {
      props: {
        user: { name: 'John Doe', handle: 'johndoe' }
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays user name', () => {
    const wrapper = mount(DashboardHeader, {
      props: {
        user: { name: 'John Doe', handle: 'johndoe' }
      }
    })
    expect(wrapper.text()).toContain('John Doe')
  })

  it('displays welcome message', () => {
    const wrapper = mount(DashboardHeader, {
      props: {
        user: { name: 'John Doe', handle: 'johndoe' }
      }
    })
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/welcome|bienvenid/)
  })
})
