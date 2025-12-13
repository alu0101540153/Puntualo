import { describe, it, expect, vi, beforeEach } from 'vitest'
import axios from 'axios'

vi.mock('./mail.service')
vi.mock('./mail_template.service')
vi.mock('./mail_assets.service', () => ({
  getAssetDataUri: vi.fn(() => Promise.resolve('data:image/png;base64,mockData')),
  getAssetBase64: vi.fn(() => Promise.resolve(null)),
}))
vi.mock('axios')

const mockedAxios = axios as any

beforeEach(() => {
  vi.clearAllMocks()
})

describe('email service branches', () => {
  it('sendRegisterEmail falls back when attachments unavailable', async () => {
    process.env.SENDGRID_REGISTER_TEMPLATE_ID = ''
    const mailService = await import('../services/mail.service')
    const spy = vi.spyOn(mailService, 'default')
    const { sendRegisterEmail } = await import('../services/email_register.service')
    await sendRegisterEmail('user@test.com', 'User')
    expect(spy).toHaveBeenCalledWith('user@test.com', expect.any(String), expect.any(String))
  })

  it('sendRegisterEmail uses template when ID configured', async () => {
    process.env.SENDGRID_REGISTER_TEMPLATE_ID = 'template-123'
    vi.resetModules()
    const mailTemplateService = await import('../services/mail_template.service')
    const spy = vi.spyOn(mailTemplateService, 'sendTemplateEmail')
    const { sendRegisterEmail } = await import('../services/email_register.service')
    await sendRegisterEmail('user@test.com', 'User')
    expect(spy).toHaveBeenCalledWith('user@test.com', 'template-123', expect.any(Object), expect.any(Array))
  })

  it('sendRegisterEmail falls back on template failure', async () => {
    process.env.SENDGRID_REGISTER_TEMPLATE_ID = 'template-123'
    vi.resetModules()
    const mailTemplateService = await import('../services/mail_template.service')
    vi.spyOn(mailTemplateService, 'sendTemplateEmail').mockRejectedValueOnce(new Error('Template fail'))
    const mailService = await import('../services/mail.service')
    const spy = vi.spyOn(mailService, 'default')
    const { sendRegisterEmail } = await import('../services/email_register.service')
    await sendRegisterEmail('user@test.com', 'User')
    expect(spy).toHaveBeenCalled()
  })

  it('sendFollowEmail uses template when ID configured', async () => {
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = 'template-456'
    vi.resetModules()
    const mailTemplateService = await import('../services/mail_template.service')
    const spy = vi.spyOn(mailTemplateService, 'sendTemplateEmail')
    const { sendFollowEmail } = await import('../services/email_follow.service')
    await sendFollowEmail('target@test.com', 'Target', 'Follower')
    expect(spy).toHaveBeenCalledWith('target@test.com', 'template-456', expect.any(Object), expect.any(Array))
  })

  it('sendFollowEmail falls back on template failure', async () => {
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = 'template-456'
    vi.resetModules()
    const mailTemplateService = await import('../services/mail_template.service')
    vi.spyOn(mailTemplateService, 'sendTemplateEmail').mockRejectedValueOnce(new Error('Template fail'))
    const mailService = await import('../services/mail.service')
    const spy = vi.spyOn(mailService, 'default')
    const { sendFollowEmail } = await import('../services/email_follow.service')
    await sendFollowEmail('target@test.com', 'Target', 'Follower')
    expect(spy).toHaveBeenCalled()
  })

  it('sendEmail skips when no API key', async () => {
    delete process.env.SENDGRID_API_KEY
    vi.resetModules()
    const { sendEmail } = await import('../services/mail.service')
    await sendEmail('test@example.com', 'Subject', '<p>Test</p>')
    expect(mockedAxios.post).not.toHaveBeenCalled()
  })

  it('sendEmail handles axios error', async () => {
    process.env.SENDGRID_API_KEY = 'test-key'
    vi.resetModules()
    mockedAxios.isAxiosError = vi.fn(() => true)
    mockedAxios.post.mockRejectedValueOnce({
      response: { status: 400, data: { errors: ['Bad request'] } },
    })
    const { sendEmail } = await import('../services/mail.service')
    await sendEmail('test@example.com', 'Subject', '<p>Test</p>')
    expect(mockedAxios.post).toHaveBeenCalled()
  })

  it('sendEmail handles non-axios error', async () => {
    process.env.SENDGRID_API_KEY = 'test-key'
    vi.resetModules()
    mockedAxios.isAxiosError = vi.fn(() => false)
    mockedAxios.post.mockRejectedValueOnce(new Error('Network error'))
    const { sendEmail } = await import('../services/mail.service')
    await sendEmail('test@example.com', 'Subject', '<p>Test</p>')
    expect(mockedAxios.post).toHaveBeenCalled()
  })
})
