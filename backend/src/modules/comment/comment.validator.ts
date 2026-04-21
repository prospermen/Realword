import { z } from 'zod';

export const createCommentSchema = z.object({
  comment: z.object({
    body: z.string().min(1, '评论内容不能为空'),
  }),
});
