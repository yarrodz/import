import { Router } from 'express';

import ImportsController from './imports.controller';

const router = Router();

router.get('/:unitId', ImportsController.findAll);
router.post('/', ImportsController.create);
router.put('/', ImportsController.update);
router.delete('/:id', ImportsController.delete);
router.post('/connect', ImportsController.connect);
router.post('/setFields', ImportsController.setFields);
router.post('/start', ImportsController.start);

export default router;
