import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '../Card.vue'

describe('Card', () => {
  it('renders slot content', () => {
    const wrapper = mount(Card, {
      slots: {
        default: '<p>Card content</p>'
      }
    })
    expect(wrapper.html()).toContain('Card content')
  })

  it('has proper styling classes', () => {
    const wrapper = mount(Card)
    expect(wrapper.classes()).toContain('bg-gradient-to-br')
    expect(wrapper.classes()).toContain('rounded-2xl')
    expect(wrapper.classes()).toContain('shadow-2xl')
  })

  it('passes through attributes', () => {
    const wrapper = mount(Card, {
      attrs: {
        'data-testid': 'my-card'
      }
    })
    expect(wrapper.attributes('data-testid')).toBe('my-card')
  })
})
