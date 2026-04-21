import { prisma } from '../../config/db';

const commentInclude = (currentUserId?: number) => ({
  author: {
    select: {
      username: true, bio: true, image: true,
      followers: currentUserId ? { where: { followerId: currentUserId } } : false,
    },
  },
});

export function formatComment(c: any, currentUserId?: number) {
  return {
    id: c.id,
    body: c.body,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    author: {
      username: c.author.username,
      bio: c.author.bio,
      image: c.author.image,
      following: currentUserId ? (c.author.followers?.length ?? 0) > 0 : false,
    },
  };
}

export async function findCommentsBySlug(slug: string, currentUserId?: number) {
  return prisma.comment.findMany({
    where: { article: { slug } },
    include: commentInclude(currentUserId) as any,
    orderBy: { createdAt: 'desc' },
  });
}

export async function createComment(articleId: number, authorId: number, body: string) {
  return prisma.comment.create({
    data: { body, articleId, authorId },
    include: commentInclude(authorId) as any,
  });
}

export async function findCommentById(id: number) {
  return prisma.comment.findUnique({ where: { id } });
}

export async function deleteComment(id: number) {
  return prisma.comment.delete({ where: { id } });
}
