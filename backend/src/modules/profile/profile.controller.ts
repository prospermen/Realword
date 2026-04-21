import { Request, Response, NextFunction } from 'express';
import * as profileService from './profile.service';
import { errorBody } from '../utils/response';

function getParamString(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param ?? '';
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.getProfile(getParamString(req.params.username), req.user?.userId);
    return res.json({ profile });
  } catch (err: any) {
    if (err.message === 'User not found') return res.status(404).json(errorBody(err.message));
    next(err);
  }
}

export async function followUser(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.followProfile(getParamString(req.params.username), req.user!.userId);
    return res.json({ profile });
  } catch (err: any) {
    if (err.message === 'User not found') return res.status(404).json(errorBody(err.message));
    next(err);
  }
}

export async function unfollowUser(req: Request, res: Response, next: NextFunction) {
  try {
    const profile = await profileService.unfollowProfile(getParamString(req.params.username), req.user!.userId);
    return res.json({ profile });
  } catch (err: any) {
    if (err.message === 'User not found') return res.status(404).json(errorBody(err.message));
    next(err);
  }
}
