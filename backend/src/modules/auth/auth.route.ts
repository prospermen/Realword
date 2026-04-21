import { Router } from 'express';
import { register, login } from './auth.controller';

const router = Router();

// POST /api/users → 注册
router.post('/', register);

// POST /api/users/login → 登录
router.post('/login', login);

export default router;
