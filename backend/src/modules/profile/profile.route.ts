import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middlewares';
import { getProfile, followUser, unfollowUser } from './profile.controller';

const router = Router();

router.get('/:username', optionalAuthenticate, getProfile);
router.post('/:username/follow', authenticate, followUser);
router.delete('/:username/follow', authenticate, unfollowUser);

export default router;
