import { create } from 'zustand';
import { fetchApi } from '@/lib/api-client';

interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  checkSession: async () => {
    set({ isLoading: true });
    const res = await fetchApi('/api/auth/me');
    if (res.success && res.data?.user) {
      set({
        user: res.data.user,
        profile: res.data.profile,
        isAuthenticated: true,
        isLoading: false,
      });
    } else {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  logout: async () => {
    await fetchApi('/api/auth/logout', { method: 'POST' });
    set({
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));
