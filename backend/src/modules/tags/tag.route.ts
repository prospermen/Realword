import { Router } from 'express';
import { getTags } from './tag.controller';

const router = Router();
router.get('/', getTags);

export default router;
