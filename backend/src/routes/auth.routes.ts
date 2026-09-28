import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate';
import { registerSchema, loginSchema } from '../validators';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;
