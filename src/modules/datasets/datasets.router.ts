import { Router } from 'express';

import * as datasetsController from './datasets.controller';

const router = Router();

router.get('/:id', datasetsController.findOne);
router.post('/', datasetsController.create);

export default router;
