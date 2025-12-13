import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendsGrid from '../../dashboard/FriendsGrid.vue'

describe('FriendsGrid', () => {
  const mockFriends = [
    { _id: '1', name: 'Friend 1', handle: 'friend1' },
    { _id: '2', name: 'Friend 2', handle: 'friend2' }
  ]

  it('renders friends grid', () => {
    const wrapper = mount(FriendsGrid, {
      props: {
        friends: mockFriends
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays all friends', () => {
    const wrapper = mount(FriendsGrid, {
      props: {
        friends: mockFriends
      }
    })
    expect(wrapper.text()).toContain('Friend 1')
    expect(wrapper.text()).toContain('Friend 2')
  })

  it('displays empty state when no friends', () => {
    const wrapper = mount(FriendsGrid, {
      props: {
        friends: []
      }
    })
    const text = wrapper.text().toLowerCase()
    expect(text).toMatch(/no friends|sin amigos|empty/)
  })

  it('uses grid layout', () => {
    const wrapper = mount(FriendsGrid, {
      props: {
        friends: mockFriends
      }
    })
    expect(wrapper.classes()).toContain('grid')
  })
})
