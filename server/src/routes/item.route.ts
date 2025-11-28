import {Router} from 'express';

import {itemController, userController} from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router();

router.get('/', itemController.getAllItem);

router.get('/:id', itemController.getById);

// Backwards-compatible endpoint used by client: obtener recomendaciones para un usuario
router.get('/recommendations/:id', userController.getRecommendations);

router.post('/', verifyToken, itemController.create);

router.patch('/:id', verifyToken, itemController.update);

router.delete('/:id', verifyToken, itemController.delete);

export default router;
