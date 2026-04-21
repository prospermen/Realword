import client from './client';
import type { AuthResponse } from '../types/user';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

interface UpdateUserPayload {
  email?: string;
  username?: string;
  currentPassword?: string;
  password?: string;
  bio?: string;
  image?: string;
}

export const authApi = {
  async login(payload: LoginPayload) {
    const { data } = await client.post<AuthResponse>('/users/login', {
      user: payload,
    });
    return data;
  },

  async register(payload: RegisterPayload) {
    const { data } = await client.post<AuthResponse>('/users', {
      user: payload,
    });
    return data;
  },

  async getCurrentUser() {
    const { data } = await client.get<AuthResponse>('/user');
    return data;
  },

  async updateCurrentUser(payload: UpdateUserPayload) {
    const { data } = await client.put<AuthResponse>('/user', {
      user: payload,
    });
    return data;
  },

  async uploadAvatar(file: File): Promise<{ url: string }> {
    const form = new FormData();
    form.append('avatar', file);
    // Let the browser set the multipart boundary automatically.
    const { data } = await client.post<{ url: string }>('/user/avatar', form);
    return data;
  },
};
