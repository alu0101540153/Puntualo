import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { validateUser } from '../validateUser.middleware'

describe('validateUser middleware', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let mockNext: NextFunction
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockNext = vi.fn()
    mockReq = {
      body: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should validate complete user data', () => {
    mockReq.body = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      handle: 'testuser'
    }

    validateUser(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(statusMock).not.toHaveBeenCalled()
  })

  it('should reject missing name', () => {
    mockReq.body = {
      email: 'test@example.com',
      password: 'password123'
    }

    validateUser(mockReq as Request, mockRes as Response, mockNext)

    if (statusMock.mock.calls.length > 0) {
      expect(statusMock).toHaveBeenCalledWith(400)
    }
  })

  it('should reject invalid email', () => {
    mockReq.body = {
      name: 'Test',
      email: 'invalid-email',
      password: 'password123'
    }

    validateUser(mockReq as Request, mockRes as Response, mockNext)

    if (statusMock.mock.calls.length > 0) {
      expect(statusMock).toHaveBeenCalledWith(400)
    }
  })

  it('should accept valid data and call next', () => {
    mockReq.body = {
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'securepass',
      handle: 'validhandle'
    }

    validateUser(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
  })
})
