import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middlewares';
import { getCurrentUser, updateCurrentUser } from './user.controller';

const router = Router();

router.get('/', authenticate, getCurrentUser);
router.put('/', authenticate, updateCurrentUser);

export default router;
