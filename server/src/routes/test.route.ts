import { Router, Request, Response } from 'express'
import { sendTemplateEmail } from '../services'

const router = Router()

// Endpoint para pruebas: POST /api/v1/puntualo/test/send-template
router.post('/send-template', async (req: Request, res: Response) => {
  try {
    const { to, templateId, data, attachments } = req.body
    if (!to || !templateId) return res.status(400).json({ message: 'to and templateId required' })
    await sendTemplateEmail(to, templateId, data || {}, attachments)
    return res.status(202).json({ message: 'Email queued (if API key configured)' })
  } catch (err: any) {
    const body = err?.response?.data || err?.message || String(err)
    return res.status(500).json({ message: 'Error sending template', body })
  }
})

export default router
