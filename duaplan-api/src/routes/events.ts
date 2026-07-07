// duaplan-api/src/routes/events.ts
import { Router } from 'express';
import * as eventController from '../controllers/eventController';

const router = Router();

router.get('/upcoming', eventController.upcoming);
router.get('/', eventController.list);
router.post('/', eventController.create);
router.get('/:id', eventController.getById);
router.put('/:id', eventController.update);
router.delete('/:id', eventController.remove);

export default router;
