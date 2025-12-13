import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProfileSidebar from '../../profile/ProfileSidebar.vue'

describe('ProfileSidebar', () => {
  const mockUser = {
    _id: '1',
    name: 'John Doe',
    handle: 'johndoe',
    email: 'john@example.com',
    bio: 'Test bio'
  }

  it('renders profile sidebar', () => {
    const wrapper = mount(ProfileSidebar, {
      props: {
        user: mockUser
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays user name', () => {
    const wrapper = mount(ProfileSidebar, {
      props: {
        user: mockUser
      }
    })
    expect(wrapper.text()).toContain('John Doe')
  })

  it('displays user handle', () => {
    const wrapper = mount(ProfileSidebar, {
      props: {
        user: mockUser
      }
    })
    expect(wrapper.text()).toContain('johndoe')
  })

  it('displays user bio if available', () => {
    const wrapper = mount(ProfileSidebar, {
      props: {
        user: mockUser
      }
    })
    expect(wrapper.text()).toContain('Test bio')
  })
})
