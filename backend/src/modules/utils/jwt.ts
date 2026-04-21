import jwt from 'jsonwebtoken';
import { env } from '../../config/env';

// 📚 JWT 的结构：Header.Payload.Signature
// - Header: 算法类型（如 HS256）
// - Payload: 存放数据（如 userId），这部分是 base64 编码，不是加密！不要放密码
// - Signature: 用 JWT_SECRET 签名，防止篡改
//
// 流程：登录 → 服务器签发 token → 客户端存 localStorage → 后续请求带上 token → 服务器验证

export interface JwtPayload {
  userId: number;
  username: string;
}

/**
 * 签发 JWT Token
 * @param payload 要存入 token 的数据（userId、username）
 * @returns JWT 字符串，有效期 7 天
 */
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

/**
 * 验证并解析 JWT Token
 * @param token JWT 字符串
 * @returns 解析出的 payload，验证失败则抛出错误
 */
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
