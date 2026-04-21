import { prisma } from '../../config/db';
import * as repo from './comment.repository';

export async function getComments(slug: string, currentUserId?: number) {
  const comments = await repo.findCommentsBySlug(slug, currentUserId);
  return comments.map(c => repo.formatComment(c, currentUserId));
}

export async function createComment(slug: string, authorId: number, body: string) {
  if (!body) throw new Error('Comment body cannot be empty');
  const article = await prisma.article.findUnique({ where: { slug } });
  if (!article) throw new Error('Article not found');
  const comment = await repo.createComment(article.id, authorId, body);
  return repo.formatComment(comment, authorId);
}

export async function deleteComment(commentId: number, userId: number) {
  const comment = await repo.findCommentById(commentId);
  if (!comment) throw new Error('Comment not found');
  if (comment.authorId !== userId) throw new Error('Forbidden');
  await repo.deleteComment(commentId);
}
