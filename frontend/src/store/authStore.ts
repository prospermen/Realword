import { create } from 'zustand';
import { authApi } from '../api/auth';
import type { User } from '../types/user';
import { getToken, removeToken, setToken } from '../utils/storage';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initAuth: () => Promise<void>;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: !!getToken(),
  isLoading: false,

  initAuth: async () => {
    const token = getToken();

    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });

    try {
      const data = await authApi.getCurrentUser();
      set({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      removeToken();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  login: (token, user) => {
    setToken(token);
    set({
      user,
      isAuthenticated: true,
    });
  },

  logout: () => {
    removeToken();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));