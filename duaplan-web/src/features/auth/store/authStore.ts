import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  coupleId: string | null;
  setUser: (user: User | null) => void;
  setCoupleId: (coupleId: string | null) => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      coupleId: null,
      setUser: (user) => set({ user, coupleId: user?.couple_id ?? null }),
      setCoupleId: (coupleId) => set({ coupleId }),
      reset: () => set({ user: null, coupleId: null }),
    }),
    {
      name: 'duaplan-auth',
      partialize: (state) => ({ user: state.user, coupleId: state.coupleId }),
    }
  )
);
