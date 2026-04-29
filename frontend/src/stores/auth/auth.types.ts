import type {
  AuthenticatedAuthResponseDto,
  LoginResponseDto,
  OrganizationUserRole,
} from '@zdravstvo/contracts'

export type AuthUser = NonNullable<LoginResponseDto['user']>

export interface AuthStateSnapshot {
  accessToken: string | null
  user: AuthUser | null
  role: OrganizationUserRole | null
  organizationId: string | null
  orgUserId: string | null
}

export interface AuthStore extends AuthStateSnapshot {
  isAuthenticated: boolean
  setAuth: (auth: AuthenticatedAuthResponseDto) => void
  setAccessToken: (accessToken: string | null) => void
  clearAuth: () => void
}
