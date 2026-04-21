import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { registerSchema, loginSchema } from './auth.validator';
import { errorBody } from '../utils/response';

/**
 * POST /api/users — 注册
 * 请求体：{ user: { username, email, password } }
 * 响应：{ user: { username, email, token, bio, image } }
 */
export async function register(req: Request, res: Response, next: NextFunction) {
  // 📚 safeParse 不会抛出异常，而是返回 { success, data/error }
  // 这比 try/catch 更优雅，且能拿到所有字段的验证错误
  const result = registerSchema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map(issue => issue.message);
    return res.status(422).json(errorBody(messages));
  }

  try {
    const user = await authService.register(result.data.user);
    return res.status(201).json({ user });
  } catch (err: any) {
    if (err.message.includes('已被')) {
      return res.status(422).json(errorBody(err.message));
    }
    next(err);
  }
}

/**
 * POST /api/users/login — 登录
 * 请求体：{ user: { email, password } }
 * 响应：{ user: { username, email, token, bio, image } }
 */
export async function login(req: Request, res: Response, next: NextFunction) {
  const result = loginSchema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map(issue => issue.message);
    return res.status(422).json(errorBody(messages));
  }

  try {
    const user = await authService.login(result.data.user);
    return res.json({ user });
  } catch (err: any) {
    if (err.message === '邮箱或密码错误') {
      return res.status(401).json(errorBody(err.message));
    }
    next(err);
  }
}
