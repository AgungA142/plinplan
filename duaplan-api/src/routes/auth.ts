import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateJWT } from '../middleware/validateJWT';
import { attachUser } from '../middleware/attachUser';

const router = Router();

// Public
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected
router.post('/logout', validateJWT, authController.logout);
router.get('/me', validateJWT, attachUser, authController.me);

export default router;
