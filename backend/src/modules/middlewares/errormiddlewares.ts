import { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger';

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('request.failed', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: err.message,
  });

  res.status(500).json({
    requestId: req.requestId,
    errors: {
      body: ['Internal server error'],
    },
  });
}
