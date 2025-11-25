import sendEmail from './mail.service';
import { sendTemplateEmail } from './mail_template.service';
import { SENDGRID_REGISTER_TEMPLATE_ID } from '../config';
import { getAssetDataUri, getAssetBase64 } from './mail_assets.service';

export async function sendRegisterEmail(toEmail: string, userName: string) {
  // Friendly display name fallback: use provided userName, otherwise derive from email local-part
  const effectiveName = userName && userName.trim() ? userName.trim() : (toEmail ? toEmail.split('@')[0] : 'Usuario')
  const subject = `Bienvenido a Puntualo, ${effectiveName}!`;

  // embed some recommendation images from client assets to avoid broken remote URLs
  const img1 = await getAssetDataUri('alasSangre.jpg')
  const img2 = await getAssetDataUri('juegoTronos.jpg.avif')
  const img3 = await getAssetDataUri('culpaTuya.jpg')

  const html = `
  <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f5f7fb; margin:0; padding:24px;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,0.06);">
        <tr>
          <td style="padding:24px; text-align:center; background: linear-gradient(90deg,#4f46e5,#06b6d4); color:#fff;">
            <h1 style="margin:0; font-size:20px;">Bienvenido a Puntualo</h1>
            <div style="margin-top:8px; opacity:0.95; font-size:13px;">Tu nueva comunidad para valorar y compartir</div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px; color:#0f172a;">
            <p style="font-size:16px; margin:0 0 12px 0;">Hola ${effectiveName},</p>
            <p style="margin:0 0 12px 0; color:#475569;">Gracias por registrarte en Puntualo. Ya puedes comenzar a descubrir, puntuar y compartir tus gustos con otros usuarios.</p>
            <p style="margin:0 0 20px 0;">Aquí tienes algunas sugerencias para empezar:</p>
            <ul style="color:#475569;">
              <li>Completa tu perfil</li>
              <li>Sigue a usuarios afines</li>
              <li>Explora recomendaciones personalizadas</li>
            </ul>

            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-top:18px;">
              <tr>
                <td style="width:72px; vertical-align:top;">
                  <img src="${img1 || 'https://assets.puntualo.app/default-avatar.png'}" alt="El gran libro" style="width:64px; height:64px; object-fit:cover; border-radius:6px; display:block;" />
                </td>
                <td style="padding-left:12px; vertical-align:top;">
                  <strong>El gran libro</strong><br/><span style="color:#64748b; font-size:13px;">Libro · 2022 · Autor Ejemplo</span>
                </td>
              </tr>
              <tr style="height:12px"></tr>
              <tr>
                <td style="width:72px; vertical-align:top;">
                  <img src="${img2 || 'https://assets.puntualo.app/default-avatar.png'}" alt="La serie top" style="width:64px; height:64px; object-fit:cover; border-radius:6px; display:block;" />
                </td>
                <td style="padding-left:12px; vertical-align:top;">
                  <strong>La serie top</strong><br/><span style="color:#64748b; font-size:13px;">Serie · 3 temporadas</span>
                </td>
              </tr>
              <tr style="height:12px"></tr>
              <tr>
                <td style="width:72px; vertical-align:top;">
                  <img src="${img3 || 'https://assets.puntualo.app/default-avatar.png'}" alt="Película destacada" style="width:64px; height:64px; object-fit:cover; border-radius:6px; display:block;" />
                </td>
                <td style="padding-left:12px; vertical-align:top;">
                  <strong>Película destacada</strong><br/><span style="color:#64748b; font-size:13px;">Película · 2024</span>
                </td>
              </tr>
            </table>

            <div style="text-align:center; margin-top:22px;">
              <a href="https://puntualo.app/login" style="background:#4f46e5; color:#fff; padding:10px 18px; border-radius:6px; text-decoration:none; display:inline-block; font-weight:600;">Ir a mi cuenta</a>
            </div>
            <p style="color:#94a3b8; font-size:13px; margin-top:20px;">Si no te registraste, ignora este correo.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:12px 24px; text-align:center; font-size:12px; color:#94a3b8; background:#f8fafc;">
            © ${new Date().getFullYear()} Puntualo — Todos los derechos reservados
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;

  // If a SendGrid dynamic template ID is configured, prefer sending the template
  if (SENDGRID_REGISTER_TEMPLATE_ID) {
    const dynamicData = {
      userName: effectiveName,
      siteName: 'Puntualo',
      loginUrl: 'https://puntualo.app/login',
      currentYear: new Date().getFullYear(),
      // subject for template (if template uses {{subject}})
      subject: `Bienvenido a Puntualo, ${effectiveName}!`,
      // provide images to the template; templates should reference these variables with triple mustache
      // We'll prefer inline attachments (cid:) so images reliably render in mail clients.
      img1: undefined,
      img2: undefined,
      img3: undefined,
      // include logo (data URI or cid)
      logo: undefined,
    };
    // Build attachments for first images (if available). Use content_id 'img1','img2','img3','logo'
    const attachments: Array<{ content: string; filename: string; type?: string; disposition?: string; content_id?: string }> = []

    const attach1 = await getAssetBase64('alasSangre.jpg')
    if (attach1) {
      attachments.push({ content: attach1.base64, filename: attach1.filename, type: attach1.mime, disposition: 'inline', content_id: 'img1' })
      dynamicData.img1 = `cid:img1`
    } else if (img1) {
      dynamicData.img1 = img1
    }

    const attach2 = await getAssetBase64('juegoTronos.jpg.avif')
    if (attach2) {
      attachments.push({ content: attach2.base64, filename: attach2.filename, type: attach2.mime, disposition: 'inline', content_id: 'img2' })
      dynamicData.img2 = `cid:img2`
    } else if (img2) {
      dynamicData.img2 = img2
    }

    const attach3 = await getAssetBase64('culpaTuya.jpg')
    if (attach3) {
      attachments.push({ content: attach3.base64, filename: attach3.filename, type: attach3.mime, disposition: 'inline', content_id: 'img3' })
      dynamicData.img3 = `cid:img3`
    } else if (img3) {
      dynamicData.img3 = img3
    }

    const attachLogo = await getAssetBase64('puntualo.jpeg')
    if (attachLogo) {
      attachments.push({ content: attachLogo.base64, filename: attachLogo.filename, type: attachLogo.mime, disposition: 'inline', content_id: 'logo' })
      // set logo to cid so template can use <img src="cid:logo">
      dynamicData.logo = `cid:logo`
    } else {
      dynamicData.logo = (await getAssetDataUri('puntualo.jpeg')) || undefined
    }

    try {
      await sendTemplateEmail(toEmail, SENDGRID_REGISTER_TEMPLATE_ID, dynamicData, attachments)
      return
    } catch (e) {
      // If template send fails, fall back to HTML send
      // eslint-disable-next-line no-console
      console.warn('[email_register] sendTemplateEmail failed, falling back to HTML send', e?.message || e)
    }
  }

  await sendEmail(toEmail, subject, html);
}

export default sendRegisterEmail;
