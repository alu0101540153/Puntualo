import sendEmail from './mail.service';
import { sendTemplateEmail } from './mail_template.service';
import { SENDGRID_FOLLOW_TEMPLATE_ID } from '../config';
import { getAssetDataUri, getAssetBase64 } from './mail_assets.service';

export async function sendFollowEmail(targetEmail: string, targetName: string, followerName: string) {
  const effectiveFollower = followerName && followerName.trim() ? followerName.trim() : 'Alguien';
  const subject = `${effectiveFollower} te acaba de seguir en Puntualo`;

  const html = `
  <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; margin:0; padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <tr>
          <td style="padding:20px; text-align:center; background:linear-gradient(90deg,#06b6d4,#4f46e5); color:#fff;">
            <h2 style="margin:0; font-size:18px;">Tienes un nuevo seguidor</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:20px; color:#0f172a;">
            <p style="font-size:15px; margin:0 0 12px 0;">Hola ${targetName},</p>
            <p style="margin:0 0 12px 0; color:#475569;">${effectiveFollower} ha empezado a seguirte. Visita tu perfil para ver más detalles y responderle.</p>
            <div style="text-align:center; margin-top:18px;">
              <a href="https://puntualo.app/profile" style="background:#06b6d4; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:600;">Ver perfil</a>
            </div>
            <p style="color:#94a3b8; font-size:13px; margin-top:20px;">Recibes este correo porque estás registrado en Puntualo.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 20px; text-align:center; font-size:12px; color:#94a3b8; background:#f8fafc;">
            © ${new Date().getFullYear()} Puntualo
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  // If a SendGrid dynamic template ID is configured, prefer sending the template
  if (SENDGRID_FOLLOW_TEMPLATE_ID) {
    const avatarData = await getAssetDataUri('puntualo.jpeg')
    const logoData = await getAssetDataUri('puntualo.jpeg')
    const dynamicData: any = {
      targetName,
      followerName: effectiveFollower,
      followerAvatar: undefined,
      profileUrl: 'https://puntualo.app/profile',
      siteName: 'Puntualo',
      currentYear: new Date().getFullYear(),
      // subject and logo for template
      subject: `${effectiveFollower} te acaba de seguir en Puntualo`,
      logo: undefined,
    };

    const attachments: Array<{ content: string; filename: string; type?: string; disposition?: string; content_id?: string }> = []
    const avatarAttach = await getAssetBase64('puntualo.jpeg')
    if (avatarAttach) {
      attachments.push({ content: avatarAttach.base64, filename: avatarAttach.filename, type: avatarAttach.mime, disposition: 'inline', content_id: 'followerAvatar' })
      dynamicData.followerAvatar = `cid:followerAvatar`
    } else {
      dynamicData.followerAvatar = avatarData || undefined
    }

    const logoAttach = await getAssetBase64('puntualo.jpeg')
    if (logoAttach) {
      attachments.push({ content: logoAttach.base64, filename: logoAttach.filename, type: logoAttach.mime, disposition: 'inline', content_id: 'logo' })
      dynamicData.logo = `cid:logo`
    } else {
      dynamicData.logo = logoData || undefined
    }

    try {
      await sendTemplateEmail(targetEmail, SENDGRID_FOLLOW_TEMPLATE_ID, dynamicData, attachments)
      return;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[email_follow] sendTemplateEmail failed, falling back to HTML send', e?.message || e);
    }
  }
  // If follower avatar is not provided externally, embed default from client assets
  const fallbackAvatar = await getAssetDataUri('puntualo.jpeg')
  const htmlWithAvatar = html.replace('src="https://assets.puntualo.app/default-avatar.png"', `src="${fallbackAvatar || 'https://assets.puntualo.app/default-avatar.png'}"`)

  await sendEmail(targetEmail, subject, htmlWithAvatar);
}

export default sendFollowEmail;
