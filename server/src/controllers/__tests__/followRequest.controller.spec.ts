import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { followRequestController } from '../followRequest.controller'

vi.mock('../../services')

describe('followRequestController', () => {
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
      params: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should have follow request methods', () => {
    expect(followRequestController).toBeDefined()
    expect(typeof followRequestController).toBe('object')
  })

  it('should export controller object', () => {
    expect(followRequestController).toBeTruthy()
  })
})
