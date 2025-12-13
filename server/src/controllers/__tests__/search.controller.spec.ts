import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response } from 'express'
import { searchController } from '../search.controller'

vi.mock('../../services')

describe('searchController', () => {
  let mockReq: Partial<Request>
  let mockRes: Partial<Response>
  let jsonMock: ReturnType<typeof vi.fn>
  let statusMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    jsonMock = vi.fn()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock })
    mockReq = {
      query: {},
      params: {}
    }
    mockRes = {
      json: jsonMock,
      status: statusMock
    }
  })

  it('should have search methods', () => {
    expect(searchController).toBeDefined()
    expect(typeof searchController).toBe('object')
  })

  it('should export controller object', () => {
    expect(searchController).toBeTruthy()
  })
})
