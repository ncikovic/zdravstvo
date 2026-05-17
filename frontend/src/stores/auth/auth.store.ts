import type { AuthenticatedAuthResponseDto } from '@zdravstvo/contracts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthStateSnapshot, AuthStore } from './auth.types'

const AUTH_STORAGE_KEY = 'zdravstvo-auth-store'

const createUnauthenticatedState = (): AuthStateSnapshot => ({
  accessToken: null,
  user: null,
  isSystemAdmin: null,
  role: null,
  organizationId: null,
  orgUserId: null,
})

const mapAuthResponseToState = (
  auth: AuthenticatedAuthResponseDto,
): AuthStateSnapshot => ({
  accessToken: auth.accessToken,
  user: auth.user,
  isSystemAdmin: auth.isSystemAdmin,
  role: auth.role,
  organizationId: auth.organizationId,
  orgUserId: auth.orgUserId,
})

const isAuthenticatedState = (state: Partial<AuthStateSnapshot>): boolean => {
  if (!state.accessToken || !state.user) {
    return false
  }
  if (state.isSystemAdmin) {
    return true
  }
  return Boolean(state.role && state.organizationId && state.orgUserId)
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...createUnauthenticatedState(),
      isAuthenticated: false,
      setAuth: (auth) =>
        set({
          ...mapAuthResponseToState(auth),
          isAuthenticated: true,
        }),
      setAccessToken: (accessToken) =>
        set((state) => ({
          accessToken,
          isAuthenticated: Boolean(accessToken && state.user),
        })),
      clearAuth: () =>
        set({
          ...createUnauthenticatedState(),
          isAuthenticated: false,
        }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        user: state.user,
        isSystemAdmin: state.isSystemAdmin,
        role: state.role,
        organizationId: state.organizationId,
        orgUserId: state.orgUserId,
      }),
      merge: (persistedState, currentState) => {
        const mergedState = {
          ...currentState,
          ...(persistedState as Partial<AuthStateSnapshot> | undefined),
        }

        return {
          ...mergedState,
          isAuthenticated: isAuthenticatedState(mergedState),
        }
      },
    },
  ),
)

export const getAccessToken = (): string | null =>
  useAuthStore.getState().accessToken

export const clearAuthState = (): void => {
  useAuthStore.getState().clearAuth()
}
