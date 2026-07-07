import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '@/lib/api';
import type { User, Couple } from '@/types';

interface RegisterData {
  email: string;
  password: string;
  display_name: string;
}

interface AuthState {
  user: User | null;
  couple: Couple | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<{ pairCode: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (accessToken: string, newPassword: string) => Promise<void>;
  pairWithPartner: (code: string) => Promise<void>;
  generateNewCode: () => Promise<string>;
  unpair: () => Promise<void>;
  reset: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      couple: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const data = await api.post<{
          user: User;
          couple: Couple | null;
          access_token: string;
          refresh_token: string;
        }>('/v1/auth/login', { email, password });
        set({
          user: data.user,
          couple: data.couple,
          accessToken: data.access_token,
          isAuthenticated: true,
        });
      },

      register: async ({ email, password, display_name }) => {
        const data = await api.post<{
          user: User;
          couple: Couple;
          access_token: string;
        }>('/v1/auth/register', { email, password, display_name });
        set({
          user: data.user,
          couple: data.couple,
          accessToken: data.access_token,
          isAuthenticated: true,
        });
        return { pairCode: data.couple.pair_code };
      },

      logout: async () => {
        const token = get().accessToken;
        if (token) {
          await api.post('/v1/auth/logout', {}).catch(() => {});
        }
        set({ user: null, couple: null, accessToken: null, isAuthenticated: false });
      },

      forgotPassword: async (email) => {
        await api.post('/v1/auth/forgot-password', { email });
      },

      resetPassword: async (accessToken, newPassword) => {
        await api.post('/v1/auth/reset-password', {
          access_token: accessToken,
          new_password: newPassword,
        });
      },

      pairWithPartner: async (code) => {
        const data = await api.post<Couple>('/v1/couples/pair', { pair_code: code });
        set({ couple: data });
      },

      generateNewCode: async () => {
        const data = await api.post<{ pair_code: string }>('/v1/couples/generate-code', {});
        const { couple } = get();
        if (couple) set({ couple: { ...couple, pair_code: data.pair_code } });
        return data.pair_code;
      },

      unpair: async () => {
        await api.delete<void>('/v1/couples/unpair');
        set({ couple: null });
      },

      reset: () => set({ user: null, couple: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'duaplan-auth',
      partialize: (state) => ({
        user: state.user,
        couple: state.couple,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
