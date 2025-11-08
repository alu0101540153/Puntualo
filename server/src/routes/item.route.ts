import {Router} from 'express';

import {itemController} from '../controllers'

const router = Router();

router.get('/', itemController.getAllItem);

router.post('/', itemController.create);

router.patch('/:id', itemController.update);

router.delete('/:id', itemController.delete);

export default router;
