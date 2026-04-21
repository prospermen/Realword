import { PrismaClient } from '@prisma/client';

// 📚 单例模式：全局只创建一个 PrismaClient 实例
// 原因：开发时 ts 热重载会反复执行模块，如果每次都 new PrismaClient()
// 会创建大量数据库连接，最终耗尽连接池。
// 使用 globalThis 保存实例，确保复用同一个连接。
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
