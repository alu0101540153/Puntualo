import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Avatar from '../Avatar.vue'

describe('Avatar', () => {
  it('renders with default props', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB'
      }
    })
    expect(wrapper.text()).toContain('AB')
  })

  it('uses user avatarBgColor if provided', () => {
    const wrapper = mount(Avatar, {
      props: {
        user: { avatarBgColor: '#FF0000' },
        initials: 'JD'
      }
    })
    const div = wrapper.find('div')
    expect(div.attributes('style')).toContain('background-color: rgb(255, 0, 0)')
  })

  it('uses color prop if no user', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'XY',
        color: '#00FF00'
      }
    })
    const div = wrapper.find('div')
    expect(div.attributes('style')).toContain('background-color: rgb(0, 255, 0)')
  })

  it('applies size classes correctly', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB',
        size: 'lg'
      }
    })
    expect(wrapper.classes()).toContain('w-12')
    expect(wrapper.classes()).toContain('h-12')
  })

  it('applies extra class', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB',
        extraClass: 'custom-class'
      }
    })
    expect(wrapper.classes()).toContain('custom-class')
  })

  it('computes text color based on background luminance', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB',
        color: '#000000'
      }
    })
    const span = wrapper.find('span')
    expect(span.classes()).toContain('text-white')
  })

  it('sets aria-label correctly', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB',
        ariaLabel: 'User avatar'
      }
    })
    expect(wrapper.attributes('aria-label')).toBe('User avatar')
  })

  it('handles invalid hex color gracefully', () => {
    const wrapper = mount(Avatar, {
      props: {
        initials: 'AB',
        color: 'invalid'
      }
    })
    expect(wrapper.exists()).toBe(true)
  })
})
