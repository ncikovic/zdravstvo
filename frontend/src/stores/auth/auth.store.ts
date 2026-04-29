import type { AuthenticatedAuthResponseDto } from '@zdravstvo/contracts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthStateSnapshot, AuthStore } from './auth.types'

const AUTH_STORAGE_KEY = 'zdravstvo-auth-store'

const createUnauthenticatedState = (): AuthStateSnapshot => ({
  accessToken: null,
  user: null,
  role: null,
  organizationId: null,
  orgUserId: null,
})

const mapAuthResponseToState = (
  auth: AuthenticatedAuthResponseDto,
): AuthStateSnapshot => ({
  accessToken: auth.accessToken,
  user: auth.user,
  role: auth.role,
  organizationId: auth.organizationId,
  orgUserId: auth.orgUserId,
})

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
          isAuthenticated: Boolean(
            mergedState.accessToken &&
              mergedState.user &&
              mergedState.role &&
              mergedState.organizationId &&
              mergedState.orgUserId,
          ),
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
