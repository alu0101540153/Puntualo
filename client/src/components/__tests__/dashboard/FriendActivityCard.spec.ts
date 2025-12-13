import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FriendActivityCard from '../../dashboard/FriendActivityCard.vue'

describe('FriendActivityCard', () => {
  const mockActivity = {
    user: { name: 'Jane Doe', handle: 'janedoe' },
    item: { title: 'Test Movie' },
    action: 'rated',
    rating: 5,
    timestamp: new Date().toISOString()
  }

  it('renders activity card', () => {
    const wrapper = mount(FriendActivityCard, {
      props: {
        activity: mockActivity
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays user name', () => {
    const wrapper = mount(FriendActivityCard, {
      props: {
        activity: mockActivity
      }
    })
    expect(wrapper.text()).toContain('Jane Doe')
  })

  it('displays item title', () => {
    const wrapper = mount(FriendActivityCard, {
      props: {
        activity: mockActivity
      }
    })
    expect(wrapper.text()).toContain('Test Movie')
  })

  it('displays rating when action is rated', () => {
    const wrapper = mount(FriendActivityCard, {
      props: {
        activity: mockActivity
      }
    })
    expect(wrapper.text()).toContain('5')
  })
})
