'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/user-types';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated';

type AuthStoreState = {
  authUser: AuthUser | null;
  authStatus: AuthStatus;
};

type AuthStoreActions = {
  setAuthUser: (authUser: AuthUser | null) => void;
  setAuthStatus: (authStatus: AuthStatus) => void;
  clearAuthUser: () => void;
};

type AuthStore = AuthStoreState & AuthStoreActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      authUser: null,
      authStatus: 'idle',
      setAuthUser: (authUser) =>
        set({
          authUser,
          authStatus: authUser ? 'authenticated' : 'unauthenticated',
        }),
      setAuthStatus: (authStatus) => set({ authStatus }),
      clearAuthUser: () =>
        set({
          authUser: null,
          authStatus: 'unauthenticated',
        }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
