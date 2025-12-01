import {Router} from 'express';

import {itemController, userController} from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router();

router.get('/top', itemController.getTop);
router.get('/', itemController.getAllItem);

router.get('/:id', itemController.getById);
// Obtener las puntuaciones que los usuarios que sigo le han dado a este item
router.get('/:id/friends-ratings', verifyToken, itemController.getFriendsRatings);

// Backwards-compatible endpoint used by client: obtener recomendaciones para un usuario
router.get('/recommendations/:id', userController.getRecommendations);

router.post('/', verifyToken, itemController.create);

router.patch('/:id', verifyToken, itemController.update);

router.delete('/:id', verifyToken, itemController.delete);

export default router;
