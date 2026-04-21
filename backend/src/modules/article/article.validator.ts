import { z } from 'zod';

const articleBaseSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  body: z.string().trim().optional(),
  tagList: z.array(z.string().trim()).optional(),
  isDraft: z.boolean().optional(),
});

export const createArticleSchema = z.object({
  article: articleBaseSchema,
});

export const updateArticleSchema = z.object({
  article: articleBaseSchema.refine((data) => Object.keys(data).length > 0, {
    message: 'At least one article field is required',
  }),
});
