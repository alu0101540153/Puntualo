import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { aiController } from '../ai.controller'

vi.mock('../../services')

describe('aiController', () => {
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

  it('should have AI methods', () => {
    expect(aiController).toBeDefined()
    expect(typeof aiController).toBe('object')
  })

  it('should export controller object', () => {
    expect(aiController).toBeTruthy()
  })
})
