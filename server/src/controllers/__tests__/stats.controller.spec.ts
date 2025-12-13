import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { statsController } from '../stats.controller'

vi.mock('../../services')

describe('statsController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockReq = {
      params: {},
      query: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should have stats methods', () => {
    expect(statsController).toBeDefined()
    expect(typeof statsController).toBe('object')
  })

  it('should export controller object', () => {
    expect(statsController).toBeTruthy()
  })
})
