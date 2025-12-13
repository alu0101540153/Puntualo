import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('axios', () => ({ default: { post: vi.fn() } }))
import axios from 'axios'

// Mock config and assets
vi.mock('../config', () => ({ SENDGRID_API_KEY: 'TEST_KEY', MAIL_SENDER_EMAIL: 'no-reply@example.com', MAIL_SENDER_NAME: 'Test' }))
import sendEmail from '../services/mail.service'

describe('mail.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sendEmail skips when no API key', async () => {
    vi.resetModules()
    vi.doMock('../config', () => ({ SENDGRID_API_KEY: '', MAIL_SENDER_EMAIL: 'no-reply@example.com', MAIL_SENDER_NAME: 'Test' }))
    const mod = await import('../services/mail.service')
    const result = await (mod.default as any)('a@b.com', 'Hi', '<b>Hi</b>')
    expect(result).toBeUndefined()
    expect(axios.post).not.toHaveBeenCalled()
  })

  it('sendEmail posts to SendGrid when API key present', async () => {
    ;(axios.post as any).mockResolvedValue({ status: 202, data: {}, headers: { 'x-message-id': 'mid' } })
    const res = await sendEmail('a@b.com', 'Hi', '<b>Hi</b>')
    expect(axios.post).toHaveBeenCalled()
    expect(res).toBeUndefined()
  })
})
