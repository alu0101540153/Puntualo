import {Router} from 'express';

import {itemController} from '../controllers'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router();

router.get('/', itemController.getAllItem);

router.post('/', verifyToken, itemController.create);

router.patch('/:id', verifyToken, itemController.update);

router.delete('/:id', verifyToken, itemController.delete);

export default router;
