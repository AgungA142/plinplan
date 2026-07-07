import { Router } from 'express';
import * as coupleController from '../controllers/coupleController';

const router = Router();

// Semua route couple membutuhkan auth (validateJWT + attachUser sudah dipasang global di index.ts)
router.post('/pair', coupleController.pair);
router.get('/me', coupleController.getMe);
router.post('/generate-code', coupleController.generateCode);
router.delete('/unpair', coupleController.unpair);

export default router;
