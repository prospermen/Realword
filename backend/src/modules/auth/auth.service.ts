import * as authRepository from './auth.repository';
import { hashPassword, comparePassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { RegisterInput, LoginInput, AuthUser } from './auth.type';

// 📚 Service 层处理业务逻辑：
// - 检查邮箱/用户名是否已存在
// - 密码哈希
// - 签发 JWT
// 它不关心 HTTP（那是 Controller 的事），也不直接操作数据库（那是 Repository 的事）

/** 把数据库 User 对象 + token 组装成返回给前端的格式 */
function formatAuthUser(user: { username: string; email: string; bio: string | null; image: string | null; id: number }, token: string): AuthUser {
  return {
    username: user.username,
    email: user.email,
    bio: user.bio,
    image: user.image,
    token,
  };
}

export async function register(input: RegisterInput): Promise<AuthUser> {
  // 检查邮箱是否已被注册
  const existingEmail = await authRepository.findUserByEmail(input.email);
  if (existingEmail) throw new Error('该邮箱已被注册');

  // 检查用户名是否已被使用
  const existingUsername = await authRepository.findUserByUsername(input.username);
  if (existingUsername) throw new Error('该用户名已被使用');

  // 密码哈希后存入数据库
  const hashedPassword = await hashPassword(input.password);
  const user = await authRepository.createUser({ ...input, password: hashedPassword });

  const token = signToken({ userId: user.id, username: user.username });
  return formatAuthUser(user, token);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const user = await authRepository.findUserByEmail(input.email);
  // 📚 安全提示：不要区分"邮箱不存在"和"密码错误"，统一返回同一错误
  // 否则攻击者可以枚举出哪些邮箱已注册
  if (!user) throw new Error('邮箱或密码错误');

  const passwordMatch = await comparePassword(input.password, user.password);
  if (!passwordMatch) throw new Error('邮箱或密码错误');

  const token = signToken({ userId: user.id, username: user.username });
  return formatAuthUser(user, token);
}
