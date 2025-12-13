import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import NotificationsView from '../NotificationsView.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/notifications', name: 'notifications', component: NotificationsView }
  ]
})

vi.mock('../../services/notification', () => ({
  getAllNotifications: vi.fn().mockResolvedValue([
    { _id: '1', message: 'Test notification 1', read: false },
    { _id: '2', message: 'Test notification 2', read: true }
  ]),
  markNotificationAsRead: vi.fn().mockResolvedValue({ success: true }),
  markAllNotificationsAsRead: vi.fn().mockResolvedValue({ success: true }),
  deleteNotification: vi.fn().mockResolvedValue({ success: true })
}))

vi.mock('../../services/auth', () => ({
  getUser: vi.fn().mockReturnValue({ _id: '1', name: 'Test User' }),
  getToken: vi.fn().mockReturnValue('test-token')
}))

describe('NotificationsView', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders notifications view', () => {
    const wrapper = mount(NotificationsView, {
      global: {
        plugins: [router]
      }
    })
    expect(wrapper.exists()).toBe(true)
  })

  it('displays notification list', async () => {
    const wrapper = mount(NotificationsView, {
      global: {
        plugins: [router]
      }
    })
    await wrapper.vm.$nextTick()
    expect(wrapper.html()).toContain('notification')
  })
})
