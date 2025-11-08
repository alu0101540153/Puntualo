import { Router } from 'express';

import { userController } from '../controllers'
import { validateUser } from '../middlewares/validateUser.middleware'

const router = Router();

router.get('/', userController.getAllUser);

// Validamos el cuerpo antes de crear el usuario
router.post('/', validateUser, userController.create);

router.patch('/:id', userController.update);

router.delete('/:id', userController.delete);

export default router;
