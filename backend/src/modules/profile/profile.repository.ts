import { prisma } from '../../config/db';

export async function findProfileByUsername(username: string, currentUserId?: number) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      username: true,
      bio: true,
      image: true,
      followers: currentUserId ? { where: { followerId: currentUserId } } : false,
    },
  });
}

export async function followUser(followerId: number, followingId: number) {
  await prisma.follow.upsert({
    where: { followerId_followingId: { followerId, followingId } },
    create: { followerId, followingId },
    update: {},
  });
}

export async function unfollowUser(followerId: number, followingId: number) {
  await prisma.follow.deleteMany({ where: { followerId, followingId } });
}
