import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';
import { updateUserSchema } from './user.validator';
import { errorBody } from '../utils/response';

export async function getCurrentUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await userService.getCurrentUser(req.user!.userId);
    return res.json({ user });
  } catch (err: any) {
    if (err.message === '用户不存在') {
      return res.status(404).json(errorBody(err.message));
    }
    next(err);
  }
}

export async function updateCurrentUser(req: Request, res: Response, next: NextFunction) {
  const result = updateUserSchema.safeParse(req.body);
  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message);
    return res.status(422).json(errorBody(messages));
  }

  try {
    const user = await userService.updateCurrentUser(req.user!.userId, result.data.user);
    return res.json({ user });
  } catch (err: any) {
    if (err.message === 'Current password is incorrect') {
      return res.status(422).json(errorBody(err.message));
    }
    if (err.code === 'P2002' || /Unique constraint|唯一/.test(err.message)) {
      return res.status(422).json(errorBody('用户名或邮箱已被占用'));
    }
    next(err);
  }
}
