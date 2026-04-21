import type { AuthSession } from '@/types'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const AUTH_STORAGE_KEY = 'zdravstvo-auth-session'

interface AuthState {
  token: string | null
  session: AuthSession | null
  setToken: (token: string | null) => void
  setSession: (session: AuthSession | null) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      session: null,
      setToken: (token) => set((state) => ({
        token,
        session:
          state.session && token
            ? { ...state.session, accessToken: token }
            : token
              ? state.session
              : null,
      })),
      setSession: (session) =>
        set({
          session,
          token: session?.accessToken ?? null,
        }),
      clearAuth: () => set({ token: null, session: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        session: state.session,
      }),
    },
  ),
)

export const getAuthToken = (): string | null => useAuthStore.getState().token

export const clearAuthState = (): void => {
  useAuthStore.getState().clearAuth()
}
