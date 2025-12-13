import { describe, it, expect, vi } from 'vitest'

vi.mock('../config', () => ({ ASSETS_BASE_URL: '' }))

describe('mail_assets.service', () => {
  it('getAssetDataUri returns empty on missing filename', async () => {
    const mod = await import('../services/mail_assets.service')
    const res = await mod.getAssetDataUri('')
    expect(res).toBe('')
  })

  it('getAssetDataUri returns URL when ASSETS_BASE_URL set', async () => {
    vi.resetModules()
    vi.doMock('../config', () => ({ ASSETS_BASE_URL: 'https://cdn.example.com/assets' }))
    const mod = await import('../services/mail_assets.service')
    const res = await mod.getAssetDataUri('image.png')
    expect(res).toBe('https://cdn.example.com/assets/image.png')
  })

  it('getAssetBase64 returns null on missing filename', async () => {
    const mod = await import('../services/mail_assets.service')
    const res = await mod.getAssetBase64('')
    expect(res).toBeNull()
  })
})
