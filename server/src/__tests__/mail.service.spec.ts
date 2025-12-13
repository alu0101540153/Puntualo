import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

type MockAxios = typeof axios & { post: ReturnType<typeof vi.fn>, isAxiosError: (e: any) => boolean }
const mockedAxios = axios as MockAxios

vi.mock('axios', () => {
  const post = vi.fn()
  const isAxiosError = (e: any) => Boolean(e?.isAxiosError)
  return {
    default: { post, isAxiosError },
    post,
    isAxiosError
  }
})

const resetEnv = () => {
  delete process.env.SENDGRID_API_KEY
  process.env.MAIL_SENDER_EMAIL = 'no-reply@example.com'
  process.env.MAIL_SENDER_NAME = 'Puntualo'
}

describe('mail.service sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetEnv()
  })

  it('no SENDGRID_API_KEY => no-op and no axios call', async () => {
    const mailService = await import('../services/mail.service')
    await mailService.sendEmail('a@test.com', 'Hi', '<p>Hi</p>')
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('sends email when API key is set', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    mockedAxios.post.mockResolvedValue({ status: 202, headers: { 'x-message-id': 'msg-1' } })

    vi.resetModules()
    const mailService = await import('../services/mail.service')
    await mailService.sendEmail('a@test.com', 'Hi', '<p>Hi</p>')

    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    const [url, payload] = mockedAxios.post.mock.calls[0]
    expect(url).toContain('sendgrid')
    expect(payload.subject).toBe('Hi')
    expect(payload.personalizations[0].to[0].email).toBe('a@test.com')
  })

  it('handles axios error without throwing', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    const err: any = new Error('boom')
    err.isAxiosError = true
    err.response = { status: 400, data: { errors: ['bad'] } }
    mockedAxios.post.mockRejectedValue(err)

    vi.resetModules()
    const mailService = await import('../services/mail.service')
    await expect(mailService.sendEmail('a@test.com', 'Hi', '<p>Hi</p>')).resolves.toBeUndefined()
  })
})
