import { Router } from 'express'
import { statsController, getTopRated, getCombinedStats } from '../controllers'

const router = Router()

router.get('/', statsController.getStats)
router.get('/top-rated', getTopRated)
// Combined payload: all users, all reviews (with item populated) and top-10 lists cached 5 minutes
router.get('/all', getCombinedStats)

export default router
