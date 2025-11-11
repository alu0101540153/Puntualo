import { Router } from 'express';

import { userController } from '../controllers'
import { validateUser } from '../middlewares/validateUser.middleware'
import { verifyToken } from '../middlewares/auth.middleware'
import { checkOwnership } from '../middlewares/owner.middleware'

const router = Router();

router.get('/', userController.getAllUser);

// Validamos el cuerpo antes de crear el usuario
router.post('/', validateUser, userController.create);

// Proteger actualización y eliminación — sólo el usuario propietario puede hacerlo
router.patch('/:id', verifyToken, checkOwnership, userController.update);

router.delete('/:id', verifyToken, checkOwnership, userController.delete);

export default router;
