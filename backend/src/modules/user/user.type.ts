import type { AuthUser } from '../auth/auth.type';

export interface UpdateUserInput {
  email?: string;
  username?: string;
  password?: string;
  currentPassword?: string;
  bio?: string | null;
  image?: string | null;
}

export type UserResponse = AuthUser;
