import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/auth.middlewares';
import { getComments, createComment, deleteComment } from './comment.controller';

// 注意：这个 router 挂载在 /api/articles 下
const router = Router({ mergeParams: true });

router.get('/:slug/comments', optionalAuthenticate, getComments);
router.post('/:slug/comments', authenticate, createComment);
router.delete('/:slug/comments/:id', authenticate, deleteComment);

export default router;
