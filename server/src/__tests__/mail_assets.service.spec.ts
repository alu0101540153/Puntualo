import { describe, it, expect, beforeEach, vi } from 'vitest'
import { promises as fs } from 'fs'
import { resolve } from 'path'

vi.mock('fs', () => ({ promises: { readFile: vi.fn() } }))

const mockedRead = fs.readFile as unknown as ReturnType<typeof vi.fn>

const resetEnv = () => {
  delete process.env.ASSETS_BASE_URL
}

describe('mail_assets.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetEnv()
  })

  it('returns remote URL when ASSETS_BASE_URL set', async () => {
    process.env.ASSETS_BASE_URL = 'https://cdn.example.com/assets'
    vi.resetModules()
    const assets = await import('../services/mail_assets.service')
    const url = await assets.getAssetDataUri('image.png')
    expect(url).toBe('https://cdn.example.com/assets/image.png')
    expect(mockedRead).not.toHaveBeenCalled()
  })

  it('returns data uri when file exists locally', async () => {
    const buf = Buffer.from('abc')
    mockedRead.mockResolvedValue(buf)
    vi.resetModules()
    const assets = await import('../services/mail_assets.service')
    const dataUri = await assets.getAssetDataUri('pic.jpg')
    expect(dataUri.startsWith('data:image/jpeg;base64,')).toBe(true)
    const expectedPath = resolve(process.cwd(), '..', 'client', 'src', 'assets', 'imagenes', 'pic.jpg')
    expect(mockedRead).toHaveBeenCalledWith(expectedPath)
  })

  it('getAssetBase64 returns null when file missing', async () => {
    mockedRead.mockRejectedValue(new Error('not found'))
    vi.resetModules()
    const assets = await import('../services/mail_assets.service')
    const res = await assets.getAssetBase64('missing.png')
    expect(res).toBeNull()
  })
})
