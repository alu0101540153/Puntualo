import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { checkOwner } from '../owner.middleware'

describe('owner middleware', () => {
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
      params: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should allow access when user is owner', () => {
    mockReq.params = { id: '123' }
    ;(mockReq as any).user = { id: '123' }

    checkOwner(mockReq as Request, mockRes as Response, mockNext)

    expect(mockNext).toHaveBeenCalled()
    expect(statusMock).not.toHaveBeenCalled()
  })

  it('should deny access when user is not owner', () => {
    mockReq.params = { id: '123' }
    ;(mockReq as any).user = { id: '456' }

    checkOwner(mockReq as Request, mockRes as Response, mockNext)

    expect(statusMock).toHaveBeenCalledWith(403)
    expect(jsonMock).toHaveBeenCalledWith({ message: expect.any(String) })
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should deny access when user is not authenticated', () => {
    mockReq.params = { id: '123' }

    checkOwner(mockReq as Request, mockRes as Response, mockNext)

    expect(statusMock).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })

  it('should deny access when id param is missing', () => {
    ;(mockReq as any).user = { id: '123' }

    checkOwner(mockReq as Request, mockRes as Response, mockNext)

    expect(statusMock).toHaveBeenCalled()
    expect(mockNext).not.toHaveBeenCalled()
  })
})
