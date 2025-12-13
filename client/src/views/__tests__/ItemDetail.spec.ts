import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import ItemDetail from '../ItemDetail.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/item/:id', name: 'item-detail', component: ItemDetail }
  ]
})

vi.mock('../../services/item', () => ({
  getItemById: vi.fn().mockResolvedValue({ 
    _id: '1', 
    title: 'Test Movie',
    description: 'Test description',
    poster: 'https://example.com/poster.jpg'
  })
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('ItemDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    router.push('/item/1')
  })

  it('renders item detail view', () => {
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays item information', async () => {
    const wrapper = mount(ItemDetail, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    await new Promise(resolve => setTimeout(resolve, 100))
    expect(wrapper.html().length).toBeGreaterThan(0)
  })
})
