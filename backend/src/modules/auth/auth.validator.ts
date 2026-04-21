import { z } from 'zod';

// 📚 Zod 是运行时类型验证库
// TypeScript 的类型检查只在编译时生效，用户发来的请求数据在运行时是 any
// Zod 的 safeParse 会验证数据，返回 { success: true, data } 或 { success: false, error }

export const registerSchema = z.object({
  user: z.object({
    username: z.string().min(1, '用户名不能为空').max(20, '用户名最多20个字符'),
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(6, '密码至少6位'),
  }),
});

export const loginSchema = z.object({
  user: z.object({
    email: z.string().email('邮箱格式不正确'),
    password: z.string().min(1, '密码不能为空'),
  }),
});
