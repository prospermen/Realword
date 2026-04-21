import { Request } from 'express';

export interface PaginationParams {
  limit: number;
  offset: number;
}

/**
 * 从请求 query 中解析分页参数
 * 默认 limit=20, offset=0（RealWorld 规范）
 */
export function parsePagination(req: Request): PaginationParams {
  const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
  const offset = parseInt(req.query.offset as string) || 0;
  return { limit, offset };
}
