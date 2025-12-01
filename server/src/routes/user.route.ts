import { Router } from 'express';

import { userController } from '../controllers'
import { validateUser } from '../middlewares/validateUser.middleware'
import { verifyToken } from '../middlewares/auth.middleware'
import { checkOwnership } from '../middlewares/owner.middleware'

// Este archivo define las rutas de usuario (sin manejo de archivos)

const router = Router();

router.get('/', userController.getAllUser);

// Obtener usuario por id (public info)
router.get('/:id', userController.getUserById);

// Public access to a user's friends (follows) so others can view someone's friends list
router.get('/:id/friends', userController.getFollows);

// Obtener seguidores de un usuario (público)
router.get('/:id/followers', userController.getFollowers);

// Obtener usuarios seguidos por un usuario (público)
router.get('/:id/following', userController.getFollowing);

// Obtener el feed de un usuario (items puntuados por sus follows), paginado
// La ruta requiere token (verifyToken). validateUser validaba el body y provocaba 400 en GET.
router.get('/:id/feed', verifyToken, userController.getFeed);

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

// Obtener la lista de follows del usuario (solo propietario)
router.get('/:id/follows', verifyToken, checkOwnership, userController.getFollows);

// Obtener recomendaciones personalizadas para un usuario
// Nota: por ahora recalculamos en cada petición. En el futuro cachear y recalcular cada X items añadidos.
router.get('/:id/recommendations', verifyToken, userController.getRecommendations);

// Follow/unfollow another user (authenticated user acts on themselves following target id)
router.post('/:id/follow', verifyToken, userController.follow);
router.delete('/:id/follow', verifyToken, userController.unfollow);

// Manage personal items list (only owner)
router.post('/:id/items', verifyToken, checkOwnership, userController.addItem);
router.delete('/:id/items/:itemId', verifyToken, checkOwnership, userController.deleteItem);

export default router;
