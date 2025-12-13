import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'

const connectSuccess = vi.fn().mockResolvedValue(undefined)
const connectFail = vi.fn().mockRejectedValue(new Error('db fail'))

vi.mock('../database', () => ({ connectDB: connectSuccess }))
vi.mock('../routes', () => ({
  routes: {
    ItemRoute: express.Router(),
    UserRoute: express.Router(),
    AuthRoute: express.Router(),
    SearchRoute: express.Router(),
    TestRoute: express.Router()
  }
}))

const { Server } = await import('../server')

beforeEach(() => {
  vi.clearAllMocks()
  // reset connectDB mock to success by default
  connectSuccess.mockImplementation(() => Promise.resolve())
})

describe('Server class', () => {
  it('configures app and exposes getApp', () => {
    const server = new Server()
    const app = server.getApp()
    expect(app.get('port')).toBeTruthy()
  })

  it('listen resolves when DB connects', async () => {
    const server = new Server()
    const app = server.getApp() as any
    app.listen = vi.fn((port: number, cb: () => void) => { cb(); return app })
    await server.listen()
    expect(app.listen).toHaveBeenCalled()
  })

  it('listen logs error when DB fails', async () => {
    // swap mocked connectDB to failing version
    connectSuccess.mockRejectedValueOnce(new Error('db fail'))
    const server = new Server()
    const app = server.getApp() as any
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    app.listen = vi.fn()
    server.listen()
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })
})
