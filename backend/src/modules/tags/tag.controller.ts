import { Request, Response, NextFunction } from 'express';
import { findAllTags } from './tag.repository';

export async function getTags(req: Request, res: Response, next: NextFunction) {
  try {
    const tags = await findAllTags();
    return res.json({ tags });
  } catch (err) { next(err); }
}
