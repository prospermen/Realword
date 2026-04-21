import { prisma } from '../../config/db';
import { RegisterInput } from './auth.type';

// 📚 Repository 层只负责与数据库交互，不包含业务逻辑
// Service 层调用 Repository，Controller 层调用 Service
// 这样分层的好处：如果数据库换了（比如从 SQLite 换 PostgreSQL），只改 Repository 即可

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { username } });
}

export async function createUser(data: RegisterInput & { password: string }) {
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: data.password,
    },
  });
}
