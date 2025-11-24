import axios from 'axios'
import { SENDGRID_API_KEY, MAIL_SENDER_EMAIL, MAIL_SENDER_NAME } from '../config'

if (!SENDGRID_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('Warning: SENDGRID_API_KEY is not set. Template emails will not be sent.')
}

export async function sendTemplateEmail(
  to: string,
  templateId: string,
  dynamicData: Record<string, any>,
  attachments?: Array<{ content: string; filename: string; type?: string; disposition?: string; content_id?: string }>
) {
  if (!SENDGRID_API_KEY) {
    // eslint-disable-next-line no-console
    console.info(`[mail_template] Skipping template send to ${to} (no API key)`)
    return
  }

  const payload: any = {
    personalizations: [
      {
        to: [{ email: to }],
        dynamic_template_data: dynamicData,
      },
    ],
    from: {
      email: MAIL_SENDER_EMAIL,
      name: MAIL_SENDER_NAME,
    },
    template_id: templateId,
  }

  if (attachments && attachments.length) {
    // SendGrid expects attachments base64 content in `attachments`
    payload.attachments = attachments.map(a => ({
      content: a.content,
      filename: a.filename,
      type: a.type || 'application/octet-stream',
      disposition: a.disposition || 'inline',
      content_id: a.content_id,
    }))
  }

  try {
    const res = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    })
    // Log success (SendGrid typically returns 202). Include message id header when present.
    // eslint-disable-next-line no-console
    console.info('[mail_template] Sent template', { to, templateId, status: res?.status, messageId: res?.headers?.['x-message-id'] })
    return res.data
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('[mail_template] Error sending template email', err?.response?.data || err.message || err)
    throw err
  }
}

export default sendTemplateEmail
