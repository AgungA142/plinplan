import { Router } from 'express';
import * as routineController from '../controllers/routineController';

const router = Router();

// Specific paths before :id to avoid routing conflicts
router.get('/today',   routineController.today);
router.get('/streaks', routineController.streaks);
router.get('/logs',    routineController.logs);

router.get('/',     routineController.list);
router.post('/',    routineController.create);
router.put('/:id',  routineController.update);
router.delete('/:id', routineController.remove);

router.post('/:id/complete',   routineController.complete);
router.delete('/:id/complete', routineController.uncomplete);

export default router;
