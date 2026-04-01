import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('operis_token', data.access_token);
        set({ user: data.user, token: data.access_token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('operis_token');
        set({ user: null, token: null, isAuthenticated: false });
      },
    }),
    { name: 'operis-auth' }
  )
);
