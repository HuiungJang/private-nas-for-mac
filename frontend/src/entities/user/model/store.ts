import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
          token: null,
          isAuthenticated: false,
          login: (token) => set({token, isAuthenticated: true}),
          logout: () => set({token: null, isAuthenticated: false}),
        }),
        {
          name: 'auth-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({token: state.token, isAuthenticated: state.isAuthenticated}),
        }
    )
);
