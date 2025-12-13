import { describe, it, expect, vi, beforeEach } from 'vitest'
import { promises as fs } from 'fs'

vi.mock('fs', () => ({
  promises: {
    readFile: vi.fn(),
  },
}))

const mockedFs = fs as any

beforeEach(() => {
  vi.clearAllMocks()
})

describe('mail_assets service branches', () => {
  it('getAssetDataUri returns ASSETS_BASE_URL when configured', async () => {
    process.env.ASSETS_BASE_URL = 'https://cdn.example.com'
    vi.resetModules()
    const { getAssetDataUri } = await import('../services/mail_assets.service')
    const result = await getAssetDataUri('test.jpg')
    expect(result).toContain('https://cdn.example.com')
    expect(result).toContain('test.jpg')
  })

  it('getAssetDataUri returns empty when filename missing', async () => {
    delete process.env.ASSETS_BASE_URL
    vi.resetModules()
    const { getAssetDataUri } = await import('../services/mail_assets.service')
    const result = await getAssetDataUri('')
    expect(result).toBe('')
  })

  it('getAssetDataUri returns empty on read error', async () => {
    delete process.env.ASSETS_BASE_URL
    vi.resetModules()
    mockedFs.readFile.mockRejectedValueOnce(new Error('ENOENT'))
    const { getAssetDataUri } = await import('../services/mail_assets.service')
    const result = await getAssetDataUri('missing.jpg')
    expect(result).toBe('')
  })

  it('getAssetBase64 returns null when filename missing', async () => {
    const { getAssetBase64 } = await import('../services/mail_assets.service')
    const result = await getAssetBase64('')
    expect(result).toBeNull()
  })

  it('getAssetBase64 returns null on read error', async () => {
    vi.resetModules()
    mockedFs.readFile.mockRejectedValueOnce(new Error('ENOENT'))
    const { getAssetBase64 } = await import('../services/mail_assets.service')
    const result = await getAssetBase64('missing.jpg')
    expect(result).toBeNull()
  })

  it('extToMime handles various extensions', async () => {
    vi.resetModules()
    mockedFs.readFile.mockResolvedValueOnce(Buffer.from('test'))
    const { getAssetDataUri } = await import('../services/mail_assets.service')
    const jpeg = await getAssetDataUri('test.jpeg')
    expect(jpeg).toContain('image/jpeg')
  })
})
