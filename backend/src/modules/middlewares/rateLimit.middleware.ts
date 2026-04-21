import { NextFunction, Request, Response } from 'express';
import { env } from '../../config/env';
import { errorBody } from '../utils/response';

interface RateLimitEntry {
  count: number;
  expiresAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getClientKey(req: Request) {
  return `${req.ip}:${req.path}`;
}

export function createRateLimitMiddleware(maxRequests = env.RATE_LIMIT_MAX_REQUESTS) {
  return function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
    const key = getClientKey(req);
    const now = Date.now();
    const current = store.get(key);

    if (!current || current.expiresAt <= now) {
      store.set(key, {
        count: 1,
        expiresAt: now + env.RATE_LIMIT_WINDOW_MS,
      });
      return next();
    }

    if (current.count >= maxRequests) {
      res.setHeader('retry-after', Math.ceil((current.expiresAt - now) / 1000));
      return res.status(429).json(errorBody('Too many requests, please try again later'));
    }

    current.count += 1;
    store.set(key, current);
    return next();
  };
}
