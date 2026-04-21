import { prisma } from '../../config/db';
import * as repo from './profile.repository';

function formatProfile(user: any, currentUserId?: number) {
  return {
    username: user.username,
    bio: user.bio,
    image: user.image,
    following: currentUserId ? (user.followers?.length ?? 0) > 0 : false,
  };
}

export async function getProfile(username: string, currentUserId?: number) {
  const user = await repo.findProfileByUsername(username, currentUserId);
  if (!user) throw new Error('User not found');
  return formatProfile(user, currentUserId);
}

export async function followProfile(username: string, currentUserId: number) {
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw new Error('User not found');
  await repo.followUser(currentUserId, target.id);
  const updated = await repo.findProfileByUsername(username, currentUserId);
  return formatProfile(updated, currentUserId);
}

export async function unfollowProfile(username: string, currentUserId: number) {
  const target = await prisma.user.findUnique({ where: { username } });
  if (!target) throw new Error('User not found');
  await repo.unfollowUser(currentUserId, target.id);
  const updated = await repo.findProfileByUsername(username, currentUserId);
  return formatProfile(updated, currentUserId);
}
