import { describe, it, expect, beforeEach, vi } from 'vitest'
import { apiFetch } from '../api'
import { getToken } from '../auth'

vi.mock('../auth', () => ({
  getToken: vi.fn()
}))

global.fetch = vi.fn()

describe('api service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('makes GET request by default', async () => {
    vi.mocked(getToken).mockReturnValue(null)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ data: 'test' }),
      json: async () => ({ data: 'test' })
    } as Response)

    const result = await apiFetch('/test')

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({
        method: 'GET'
      })
    )
    expect(result).toEqual({ data: 'test' })
  })

  it('makes POST request with body', async () => {
    vi.mocked(getToken).mockReturnValue(null)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({ success: true }),
      json: async () => ({ success: true })
    } as Response)

    const payload = { name: 'Test' }
    await apiFetch('/test', { method: 'POST', body: payload })

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(payload),
        headers: expect.objectContaining({
          'Content-Type': 'application/json'
        })
      })
    )
  })

  it('includes auth token in headers', async () => {
    const token = 'my-secret-token'
    vi.mocked(getToken).mockReturnValue(token)
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      text: async () => JSON.stringify({}),
      json: async () => ({})
    } as Response)

    await apiFetch('/test', { auth: true })

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': `Bearer ${token}`
        })
      })
    )
  })

  it('throws error on failed request', async () => {
    vi.mocked(getToken).mockReturnValue('test-token')
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Not found' })
    } as Response)

    await expect(apiFetch('/test')).rejects.toThrow()
  })

  it('handles network errors', async () => {
    vi.mocked(getToken).mockReturnValue('test-token')
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

    await expect(apiFetch('/test')).rejects.toThrow('Network error')
  })
})
