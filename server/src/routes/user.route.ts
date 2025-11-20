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

// Follow / unfollow a user (protected)
router.post('/:id/follow', verifyToken, userController.follow);
router.post('/:id/unfollow', verifyToken, userController.unfollow);

// Get all books of a specific user
router.get('/:id/books', userController.getBooks);

// Feed and single user
router.get('/:id/feed', userController.getFeed);
router.get('/:id', userController.getById);

// Rate item with embedded data (no Item document) - protected
router.post('/item', verifyToken, userController.rateEmbedded);

// Rate/unrate item (protected)
router.post('/item/:id/rate', verifyToken, userController.rateItem);
router.delete('/item/:id/rate', verifyToken, userController.unrateItem);

export default router;