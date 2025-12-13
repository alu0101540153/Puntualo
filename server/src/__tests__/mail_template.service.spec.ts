import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'

type MockAxios = typeof axios & { post: ReturnType<typeof vi.fn>, isAxiosError: (e:any)=>boolean }
const mockedAxios = axios as MockAxios

vi.mock('axios', () => {
  const post = vi.fn()
  return {
    default: { post },
    post,
    isAxiosError: (e: any) => Boolean(e?.isAxiosError)
  }
})

const baseEnv = () => {
  delete process.env.SENDGRID_API_KEY
  process.env.MAIL_SENDER_EMAIL = 'no-reply@example.com'
  process.env.MAIL_SENDER_NAME = 'Puntualo'
}

describe('mail_template.service sendTemplateEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    baseEnv()
  })

  it('skips send when no API key', async () => {
    const mailTemplate = await import('../services/mail_template.service')
    await mailTemplate.sendTemplateEmail('a@test.com', 'tpl', { a: 1 })
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('sends template and returns response data', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    mockedAxios.post.mockResolvedValue({ status: 202, data: { ok: true }, headers: { 'x-message-id': 'm1' } })

    vi.resetModules()
    const mailTemplate = await import('../services/mail_template.service')
    const res = await mailTemplate.sendTemplateEmail('a@test.com', 'tpl', { name: 'A' }, [{ content: 'YQ==', filename: 'a.txt' }])

    expect(mockedAxios.post).toHaveBeenCalledTimes(1)
    expect(res).toEqual({ ok: true })
    const [, payload] = mockedAxios.post.mock.calls[0]
    expect(payload.template_id).toBe('tpl')
    expect(payload.attachments[0].filename).toBe('a.txt')
  })

  it('propagates axios errors', async () => {
    process.env.SENDGRID_API_KEY = 'key'
    const err: any = new Error('fail')
    err.isAxiosError = true
    err.response = { status: 500, data: { errors: ['x'] } }
    mockedAxios.post.mockRejectedValue(err)

    vi.resetModules()
    const mailTemplate = await import('../services/mail_template.service')
    await expect(mailTemplate.sendTemplateEmail('a@test.com', 'tpl', {})).rejects.toBe(err)
  })
})
