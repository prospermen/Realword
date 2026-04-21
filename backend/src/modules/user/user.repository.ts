import { prisma } from '../../config/db';
import type { UpdateUserInput } from './user.type';

export async function findUserById(id: number) {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUser(userId: number, data: UpdateUserInput & { password?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
  });
}
