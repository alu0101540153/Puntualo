import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Input from '../Input.vue'

describe('Input', () => {
  it('renders with default type text', () => {
    const wrapper = mount(Input)
    expect(wrapper.find('input').attributes('type')).toBe('text')
  })

  it('renders with custom type', () => {
    const wrapper = mount(Input, {
      props: {
        type: 'email'
      }
    })
    expect(wrapper.find('input').attributes('type')).toBe('email')
  })

  it('displays placeholder', () => {
    const wrapper = mount(Input, {
      props: {
        placeholder: 'Enter text'
      }
    })
    expect(wrapper.find('input').attributes('placeholder')).toBe('Enter text')
  })

  it('binds modelValue', () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'test value'
      }
    })
    expect(wrapper.find('input').element.value).toBe('test value')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')
    await input.setValue('new value')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['new value'])
  })

  it('supports v-model binding', async () => {
    const wrapper = mount(Input, {
      props: {
        modelValue: 'initial',
        'onUpdate:modelValue': (e: string) => wrapper.setProps({ modelValue: e })
      }
    })
    await wrapper.find('input').setValue('updated')
    expect(wrapper.props('modelValue')).toBe('updated')
  })

  it('has proper styling classes', () => {
    const wrapper = mount(Input)
    const input = wrapper.find('input')
    expect(input.classes()).toContain('bg-white/5')
    expect(input.classes()).toContain('rounded-lg')
  })
})
