import { Request, Response, NextFunction } from 'express';
import * as commentService from './comment.service';
import { errorBody } from '../utils/response';

function getParamString(param: string | string[] | undefined) {
  return Array.isArray(param) ? param[0] : param ?? '';
}

export async function getComments(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = getParamString(req.params.slug);
    const comments = await commentService.getComments(slug, req.user?.userId);
    return res.json({ comments });
  } catch (err) { next(err); }
}

export async function createComment(req: Request, res: Response, next: NextFunction) {
  const body = req.body?.comment?.body;
  try {
    const slug = getParamString(req.params.slug);
    const comment = await commentService.createComment(slug, req.user!.userId, body);
    return res.status(201).json({ comment });
  } catch (err: any) {
    if (err.message === 'Comment body cannot be empty') return res.status(422).json(errorBody(err.message));
    if (err.message === 'Article not found') return res.status(404).json(errorBody(err.message));
    next(err);
  }
}

export async function deleteComment(req: Request, res: Response, next: NextFunction) {
  try {
    await commentService.deleteComment(Number(req.params.id), req.user!.userId);
    return res.status(204).send();
  } catch (err: any) {
    if (err.message === 'Comment not found') return res.status(404).json(errorBody(err.message));
    if (err.message === 'Forbidden') return res.status(403).json(errorBody(err.message));
    next(err);
  }
}
