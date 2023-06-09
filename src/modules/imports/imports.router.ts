import { Router } from 'express';

import ImportsController from './imports.controller';

const router = Router();

router.post('/connect', ImportsController.connect);
router.post('/setFields', ImportsController.setFields);
router.post('/start', ImportsController.start);
router.post('/pause', ImportsController.pause);
router.post('/reload', ImportsController.reload);
router.post('/retry', ImportsController.retry);

export default router;
