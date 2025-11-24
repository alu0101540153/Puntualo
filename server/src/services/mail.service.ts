import axios from 'axios';
import { SENDGRID_API_KEY, MAIL_SENDER_EMAIL, MAIL_SENDER_NAME } from '../config';

if (!SENDGRID_API_KEY) {
  // Not throwing here so tests/environments without keys don't crash unexpectedly.
  // Caller can decide whether to proceed or not.
  // But we warn so developer remembers to set the env var.
  // eslint-disable-next-line no-console
  console.warn('Warning: SENDGRID_API_KEY is not set. Emails will not be sent.');
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!SENDGRID_API_KEY) {
    // If no API key, just log and return.
    // eslint-disable-next-line no-console
    console.info(`[mail.service] Skipping send to ${to} (no API key)`);
    return;
  }

  const payload = {
    personalizations: [
      {
        to: [{ email: to }],
      },
    ],
    from: {
      email: MAIL_SENDER_EMAIL,
      name: MAIL_SENDER_NAME,
    },
    subject,
    content: [
      {
        type: 'text/html',
        value: html,
      },
    ],
  };

  try {
    const res = await axios.post('https://api.sendgrid.com/v3/mail/send', payload, {
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10_000,
    });
    // Log success status and SendGrid message id header when available
    // eslint-disable-next-line no-console
    console.info('[mail.service] Sent email', { to, status: res?.status, messageId: res?.headers?.['x-message-id'] });
  } catch (err) {
    // Log axios response body when available to get SendGrid error details.
    // Print full JSON so we can see SendGrid's `errors` array.
    // eslint-disable-next-line no-console
    if (axios.isAxiosError(err) && err.response) {
      try {
        // eslint-disable-next-line no-console
        console.error('[mail.service] Error sending email', `status=${err.response.status} data=${JSON.stringify(err.response.data, null, 2)}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('[mail.service] Error sending email (failed to stringify response)', err.response.status, err.response.data);
      }
    } else {
      // eslint-disable-next-line no-console
      console.error('[mail.service] Error sending email', err instanceof Error ? err.message : err);
    }

    // Don't rethrow errors from the mail sender to avoid crashing the app
    // when email delivery fails. Sending emails is best-effort in this app.
    return;
  }
}

export default sendEmail;
