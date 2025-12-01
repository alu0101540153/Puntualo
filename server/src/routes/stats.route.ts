import { Router } from 'express'
import { statsController } from '../controllers'

const router = Router()

router.get('/', statsController.getStats)

export default router
