import { Request, Response } from 'express';

export function notFoundMiddleware(req: Request, res: Response) {
  res.status(404).json({
    requestId: req.requestId,
    errors: {
      body: [`Route ${req.method} ${req.path} was not found`],
    },
  });
}
