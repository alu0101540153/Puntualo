import { Router } from 'express'
import { chat, recommendations } from '../controllers/ai.controller'

const router = Router()

router.post('/chat', chat)
router.get('/recommendations', recommendations)

export default router
