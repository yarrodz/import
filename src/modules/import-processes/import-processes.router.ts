import { Router } from 'express';

import ImportsProcessesController from './import-processes.controller';

const router = Router();

router.get('/:unitId', ImportsProcessesController.findAll);
router.post('/pause', ImportsProcessesController.pause);
router.post('/reload', ImportsProcessesController.reload);
router.post('/retry', ImportsProcessesController.retry);

export default router;
