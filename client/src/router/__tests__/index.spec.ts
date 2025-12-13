import { describe, it, expect, beforeEach } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'
import routes from '../index'

describe('Router', () => {
  let router: ReturnType<typeof createRouter>

  beforeEach(() => {
    router = createRouter({
      history: createMemoryHistory(),
      routes: routes.options?.routes || []
    })
  })

  it('has home route', () => {
    const homeRoute = router.resolve('/')
    expect(homeRoute.name).toBeTruthy()
  })

  it('has dashboard route', () => {
    const dashboardRoute = router.resolve('/dashboard')
    expect(dashboardRoute.matched.length).toBeGreaterThan(0)
  })

  it('has login route', () => {
    const loginRoute = router.resolve('/login')
    expect(loginRoute.matched.length).toBeGreaterThan(0)
  })

  it('has profile route', () => {
    const profileRoute = router.resolve('/profile/123')
    expect(profileRoute.matched.length).toBeGreaterThan(0)
  })

  it('has 404 route for unknown paths', () => {
    const unknownRoute = router.resolve('/unknown-path-123456')
    expect(unknownRoute.matched.length).toBeGreaterThan(0)
  })

  it('navigates to dashboard', async () => {
    await router.push('/dashboard')
    expect(router.currentRoute.value.path).toBe('/dashboard')
  })

  it('navigates to profile with id param', async () => {
    await router.push('/profile/123')
    expect(router.currentRoute.value.params.id).toBe('123')
  })
})
