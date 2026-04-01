import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  companyId?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isSuperAdmin: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
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
      isSuperAdmin: () => get().user?.role === 'super_admin',
      isAdmin: () => ['super_admin', 'admin'].includes(get().user?.role || ''),
    }),
    { name: 'operis-auth' }
  )
);

