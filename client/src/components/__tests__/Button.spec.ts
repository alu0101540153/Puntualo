import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '../Button.vue'

describe('Button', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click me'
      }
    })
    expect(wrapper.text()).toBe('Click me')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('applies primary variant by default', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('from-emerald-400')
  })

  it('applies secondary variant correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'secondary'
      }
    })
    expect(wrapper.classes()).toContain('bg-white/6')
  })

  it('applies danger variant correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'danger'
      }
    })
    expect(wrapper.classes()).toContain('bg-red-600')
  })

  it('applies ghost variant correctly', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'ghost'
      }
    })
    expect(wrapper.classes()).toContain('bg-transparent')
  })

  it('applies small size correctly', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'sm'
      }
    })
    expect(wrapper.classes()).toContain('px-3')
    expect(wrapper.classes()).toContain('py-1')
  })

  it('applies large size correctly', () => {
    const wrapper = mount(Button, {
      props: {
        size: 'lg'
      }
    })
    expect(wrapper.classes()).toContain('px-8')
    expect(wrapper.classes()).toContain('py-4')
  })

  it('applies medium size by default', () => {
    const wrapper = mount(Button)
    expect(wrapper.classes()).toContain('px-5')
    expect(wrapper.classes()).toContain('py-2')
  })

  it('disables button when disabled prop is true', () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    expect(wrapper.attributes('disabled')).toBeDefined()
    expect(wrapper.classes()).toContain('opacity-60')
    expect(wrapper.classes()).toContain('cursor-not-allowed')
  })

  it('does not emit click when disabled', async () => {
    const wrapper = mount(Button, {
      props: {
        disabled: true
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted('click')).toBeFalsy()
  })
})
