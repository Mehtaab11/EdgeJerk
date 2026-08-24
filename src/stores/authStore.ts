import { create } from 'zustand';
import { fetchApi } from '@/lib/api-client';

interface AuthState {
  user: any | null;
  profile: any | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  displayName: string | null;
  defaultAccountSize: number | null;
  checkSession: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  displayName: null,
  defaultAccountSize: null,

  checkSession: async () => {
    const currentState = useAuthStore.getState();
    // Only show loading spinner on the very first check
    if (!currentState.isAuthenticated) {
      set({ isLoading: true });
    }
    const res = await fetchApi('/api/auth/me');
    if (res.success && res.data?.user) {
      set({
        user: res.data.user,
        profile: res.data.profile,
        isAuthenticated: true,
        isLoading: false,
        displayName: res.data.profile?.display_name || null,
        defaultAccountSize: res.data.profile?.default_account_size || null,
      });
    } else {
      set({
        user: null,
        profile: null,
        isAuthenticated: false,
        isLoading: false,
        displayName: null,
        defaultAccountSize: null,
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
      displayName: null,
      defaultAccountSize: null,
    });
  },
}));
