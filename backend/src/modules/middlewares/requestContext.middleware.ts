import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = req.headers['x-request-id'];
  req.requestId = typeof requestId === 'string' && requestId.trim() ? requestId : randomUUID();
  res.setHeader('x-request-id', req.requestId);

  const startTime = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startTime) / 1_000_000;
    logger.info('request.completed', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      ip: req.ip,
    });
  });

  next();
}
