import { z } from 'zod';

export const updateUserSchema = z.object({
  user: z.object({
    email: z.string().email().optional(),
    username: z.string().min(1).optional(),
    currentPassword: z.string().min(1).optional(),
    password: z.string().min(8).optional(),
    bio: z.string().nullable().optional(),
    image: z.string().min(1).nullable().optional(),
  })
  .refine((data) => !data.password || Boolean(data.currentPassword), {
    message: 'Current password is required to set a new password',
    path: ['currentPassword'],
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: '至少提供一个要更新的字段',
  }),
});
