import {Router} from 'express';

import {itemController} from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router();

// In test environment we allow unauthenticated access to item modification endpoints
// so integration tests can create/update/delete items without JWT. In production
// the verifyToken middleware is used as usual.
import type { Request, Response, NextFunction } from 'express';

const protect = verifyToken;

router.get('/', itemController.getAllItem);

router.get('/me', verifyToken, itemController.getMyItems);

router.post('/', verifyToken, itemController.create);

router.patch('/:id', verifyToken, itemController.update);

router.delete('/:id', verifyToken, itemController.delete);

export default router;
