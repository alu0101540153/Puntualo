import { describe, it, expect, beforeEach, vi } from 'vitest'

const sendTemplateEmail = vi.hoisted(() => vi.fn())
const sendEmail = vi.hoisted(() => vi.fn())
const getAssetDataUri = vi.hoisted(() => vi.fn(async () => 'data:image/png;base64,AAA'))
const getAssetBase64 = vi.hoisted(() => vi.fn(async () => ({ base64: 'QQ==', mime: 'image/png', filename: 'f.png' })))

vi.mock('../services/mail_template.service', () => ({ sendTemplateEmail }))
vi.mock('../services/mail.service', () => ({ __esModule: true, default: sendEmail, sendEmail }))
vi.mock('../services/mail_assets.service', () => ({ getAssetDataUri, getAssetBase64 }))

describe('email_follow.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = ''
    vi.resetModules()
  })

  it('uses template when template id is set', async () => {
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = 'tpl-follow'
    const { sendFollowEmail } = await import('../services/email_follow.service')
    await sendFollowEmail('to@example.com', 'Target', 'Follower')
    expect(sendTemplateEmail).toHaveBeenCalledTimes(1)
    expect(sendEmail).not.toHaveBeenCalled()
  })

  it('falls back to HTML send when template fails', async () => {
    process.env.SENDGRID_FOLLOW_TEMPLATE_ID = 'tpl-follow'
    sendTemplateEmail.mockRejectedValueOnce(new Error('fail'))

    const { sendFollowEmail } = await import('../services/email_follow.service')
    await sendFollowEmail('to@example.com', 'Target', '')

    expect(sendTemplateEmail).toHaveBeenCalled()
    expect(sendEmail).toHaveBeenCalledTimes(1)
    expect(getAssetDataUri).toHaveBeenCalled()
    expect(getAssetBase64).toHaveBeenCalled()
  })
})
