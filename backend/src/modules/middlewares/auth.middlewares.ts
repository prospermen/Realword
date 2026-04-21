import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';

// 📚 扩展 Express 的 Request 类型，让 req.user 有类型提示
// TypeScript 默认的 Request 没有 user 属性，通过声明合并来添加
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * 必须登录的中间件
 * 从请求头 Authorization: Token <jwt> 中提取并验证 token
 * 验证成功后把解析出的 user 信息挂到 req.user
 */
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // RealWorld 规范：Authorization 头格式是 "Token <jwt>"（不是 Bearer）
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Token ')) {
    return res.status(401).json({ errors: { body: ['未登录或 Token 缺失'] } });
  }

  const token = authHeader.slice(6); // 去掉 "Token " 前缀
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ errors: { body: ['Token 无效或已过期'] } });
  }
}

/**
 * 可选登录的中间件（未登录也能继续，但登录了会注入 req.user）
 * 用于：文章列表、文章详情等接口——未登录可查看，登录后有额外信息（如 favorited）
 */
export function optionalAuthenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Token ')) {
    const token = authHeader.slice(6);
    try {
      req.user = verifyToken(token);
    } catch {
      // token 无效也不报错，当未登录处理
    }
  }
  next();
}
