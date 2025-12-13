import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { notificationController } from '../notification.controller'

vi.mock('../../services')

describe('notificationController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockReq = {
      body: {},
      params: {},
      query: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should have notification methods', () => {
    expect(notificationController).toBeDefined()
    expect(typeof notificationController).toBe('object')
  })

  it('should export controller object', () => {
    expect(notificationController).toBeTruthy()
  })
})
