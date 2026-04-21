import type { AuthUser } from '../auth/auth.type';
import { signToken } from '../utils/jwt';
import { comparePassword, hashPassword } from '../utils/password';
import type { UpdateUserInput } from './user.type';
import * as userRepository from './user.repository';

function formatAuthUser(
  user: { username: string; email: string; bio: string | null; image: string | null; id: number },
  token: string
): AuthUser {
  return {
    username: user.username,
    email: user.email,
    bio: user.bio,
    image: user.image,
    token,
  };
}

export async function getCurrentUser(userId: number): Promise<AuthUser> {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  const token = signToken({ userId: user.id, username: user.username });
  return formatAuthUser(user, token);
}

export async function updateCurrentUser(userId: number, input: UpdateUserInput): Promise<AuthUser> {
  const currentUser = await userRepository.findUserById(userId);
  if (!currentUser) {
    throw new Error('用户不存在');
  }

  const data: UpdateUserInput & { password?: string } = {
    email: input.email,
    username: input.username,
    bio: input.bio,
    image: input.image,
  };

  if (input.password) {
    const passwordMatches = await comparePassword(input.currentPassword || '', currentUser.password);
    if (!passwordMatches) {
      throw new Error('Current password is incorrect');
    }

    data.password = await hashPassword(input.password);
  }

  const user = await userRepository.updateUser(userId, data);
  const token = signToken({ userId: user.id, username: user.username });
  return formatAuthUser(user, token);
}
