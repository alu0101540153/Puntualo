import { Router } from 'express';

import { userController } from '../controllers'
import { validateUser } from '../middlewares/validateUser.middleware'
import { verifyToken } from '../middlewares/auth.middleware'
import { checkOwnership } from '../middlewares/owner.middleware'

// Este archivo define las rutas de usuario (sin manejo de archivos)

const router = Router();

router.get('/', userController.getAllUser);

// Validamos el cuerpo antes de crear el usuario
router.post('/', validateUser, userController.create);

// Proteger actualización y eliminación — sólo el usuario propietario puede hacerlo
// Permitimos subida de avatar en el campo 'avatar' (multipart/form-data)
router.patch('/:id', verifyToken, checkOwnership, userController.update);

router.delete('/:id', verifyToken, checkOwnership, userController.delete);

// Añadir una puntuación (solo el propio usuario puede añadirla)
router.post('/:id/rate', verifyToken, checkOwnership, userController.addRating);

// Obtener las puntuaciones del usuario (solo el propio usuario puede verlas)
router.get('/:id/ratings', verifyToken, checkOwnership, userController.getRatings);

// Eliminar una puntuación específica del usuario
router.delete('/:id/ratings/:ratingId', verifyToken, checkOwnership, userController.deleteRating);

export default router;
