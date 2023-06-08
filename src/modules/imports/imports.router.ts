import { Router } from 'express';

import * as importsController from './imports.controller';

const router = Router();

router.post('/connect', importsController.connect);
router.post('/setFields', importsController.setFields);
router.post('/start', importsController.start);
router.post('/pause', importsController.pause);
router.post('/reload', importsController.reload);
router.post('/retry', importsController.retry);

export default router;
