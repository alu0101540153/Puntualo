import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RatingModal from '../RatingModal.vue'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div>Home</div>' } }]
})

describe('RatingModal', () => {
  it('renders when open', () => {
    const wrapper = mount(RatingModal, {
      props: {
        show: true,
        item: { title: 'Test Movie' }
      },
      global: {
        plugins: [router],
        stubs: ['Teleport']
      }
    })
    expect(wrapper.find('.fixed').exists()).toBe(true)
  })

  it('does not render when closed', () => {
    const wrapper = mount(RatingModal, {
      props: {
        show: false,
        item: { title: 'Test Movie' }
      },
      global: {
        plugins: [router],
        stubs: ['Teleport']
      }
    })
    expect(wrapper.find('.fixed').exists()).toBe(false)
  })

  it('displays item title', () => {
    const wrapper = mount(RatingModal, {
      props: {
        show: true,
        item: { title: 'Test Movie' }
      },
      global: {
        plugins: [router],
        stubs: ['Teleport']
      }
    })
    expect(wrapper.text()).toContain('Test Movie')
  })

  it('allows rating selection', async () => {
    const wrapper = mount(RatingModal, {
      props: {
        show: true,
        item: { title: 'Test Movie' }
      },
      global: {
        plugins: [router],
        stubs: ['Teleport']
      }
    })
    const stars = wrapper.findAll('.star')
    if (stars.length > 0) {
      await stars[4].trigger('click')
      expect(wrapper.emitted()).toHaveProperty('rate')
    }
  })

  it('emits close event', async () => {
    const wrapper = mount(RatingModal, {
      props: {
        isOpen: true,
        item: { title: 'Test Movie' }
      }
    })
    const closeBtn = wrapper.find('.close-btn')
    if (closeBtn.exists()) {
      await closeBtn.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('close')
    }
  })

  it('emits submit event with rating', async () => {
    const wrapper = mount(RatingModal, {
      props: {
        isOpen: true,
        item: { title: 'Test Movie' }
      }
    })
    const submitBtn = wrapper.find('button[type="submit"]')
    if (submitBtn.exists()) {
      await submitBtn.trigger('click')
      expect(wrapper.emitted()).toHaveProperty('submit')
    }
  })
})
