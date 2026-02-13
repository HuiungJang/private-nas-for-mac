import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (token: string, mustChangePassword?: boolean) => void;
  setMustChangePassword: (mustChange: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
          token: null,
          isAuthenticated: false,
          mustChangePassword: false,
          login: (token, mustChangePassword = false) => set({token, isAuthenticated: true, mustChangePassword}),
          setMustChangePassword: (mustChangePassword) => set({mustChangePassword}),
          logout: () => set({token: null, isAuthenticated: false, mustChangePassword: false}),
        }),
        {
          name: 'auth-storage',
          storage: createJSONStorage(() => localStorage),
          partialize: (state) => ({
            token: state.token,
            isAuthenticated: state.isAuthenticated,
            mustChangePassword: state.mustChangePassword,
          }),
        }
    )
);
