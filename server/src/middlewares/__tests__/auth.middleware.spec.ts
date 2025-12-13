import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../auth.middleware'
import jwt from 'jsonwebtoken'

vi.mock('jsonwebtoken')

describe('auth middleware', () => {
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
      headers: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      mockReq.headers = { authorization: 'Bearer valid-token' }
      const decoded = { id: '123', email: 'test@example.com' }
      vi.mocked(jwt.verify).mockReturnValue(decoded as any)

      verifyToken(mockReq as Request, mockRes as Response, mockNext)

      expect((mockReq as any).user).toEqual(decoded)
      expect(mockNext).toHaveBeenCalled()
    })

    it('should reject missing token', () => {
      verifyToken(mockReq as Request, mockRes as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(jsonMock).toHaveBeenCalledWith({ message: expect.any(String) })
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should reject invalid token', () => {
      mockReq.headers = { authorization: 'Bearer invalid-token' }
      vi.mocked(jwt.verify).mockImplementation(() => {
        throw new Error('Invalid token')
      })

      verifyToken(mockReq as Request, mockRes as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })

    it('should handle malformed authorization header', () => {
      mockReq.headers = { authorization: 'InvalidFormat' }

      verifyToken(mockReq as Request, mockRes as Response, mockNext)

      expect(statusMock).toHaveBeenCalledWith(401)
      expect(mockNext).not.toHaveBeenCalled()
    })
  })
})
